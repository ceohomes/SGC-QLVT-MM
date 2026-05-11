import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Briefcase, Plus, Trash2, Edit2, Check, X,
  RefreshCw, Search, GripVertical, FolderPlus, Save, Loader2, AlertTriangle
} from 'lucide-react'
import { TABLES } from '../../constants'
import { getSupabase } from '../../lib/supabase'
import { toCamelCase, toSnakeCase } from '../../utils'

// ─── Storage ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sgc_cau_hinh_du_an_v2'

const PALETTE = [
  { bg: '#fff7ed', border: '#fdba74', badge: '#f97316' },
  { bg: '#fefce8', border: '#fde047', badge: '#ca8a04' },
  { bg: '#f0fdf4', border: '#86efac', badge: '#16a34a' },
  { bg: '#eff6ff', border: '#93c5fd', badge: '#2563eb' },
  { bg: '#fdf4ff', border: '#e879f9', badge: '#a21caf' },
  { bg: '#fff1f2', border: '#fda4af', badge: '#e11d48' },
  { bg: '#f0fdfa', border: '#5eead4', badge: '#0d9488' },
  { bg: '#f8fafc', border: '#94a3b8', badge: '#475569' },
]

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function load() {
  try {
    const d = localStorage.getItem(STORAGE_KEY)
    if (d) return JSON.parse(d)
  } catch {}
  return [
    { id: genId(), ten: 'Khối thi công chưa phân bổ', vietTat: 'NO', paletteIdx: 7,
      duAn: [{ id: genId(), ten: 'Kỳ Anh - Hà Tĩnh' }, { id: genId(), ten: 'Nhiều dự án' }] },
    { id: genId(), ten: 'San Lấp - Hạ Tầng', vietTat: 'SLHT', paletteIdx: 0,
      duAn: [{ id: genId(), ten: 'Cần Giờ - HTGT' }, { id: genId(), ten: 'Cần Giờ - San lấp' }, { id: genId(), ten: 'Cổ Loa' }, { id: genId(), ten: 'Dương Kinh' }, { id: genId(), ten: 'Đan Phượng' }, { id: genId(), ten: 'Hậu Nghĩa' }] },
    { id: genId(), ten: 'Đường Sắt Tốc Độ Cao', vietTat: 'DS', paletteIdx: 4,
      duAn: [{ id: genId(), ten: 'Bến Thành - Cần Giờ' }, { id: genId(), ten: 'Hà Nội - Quảng Ninh' }] },
    { id: genId(), ten: 'Thi Công Hầm', vietTat: 'HAM', paletteIdx: 6, duAn: [] },
    { id: genId(), ten: 'Cọc Khoan Nhồi', vietTat: 'CKN', paletteIdx: 3,
      duAn: [{ id: genId(), ten: 'Cần Giờ' }, { id: genId(), ten: 'Điện Gió Vũng Áng' }, { id: genId(), ten: 'Gia Bình' }, { id: genId(), ten: 'Hạ Long Xanh' }, { id: genId(), ten: 'KTC Cọc Khoan Nhồi' }] },
  ]
}

function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

// ─── Modal xác nhận trùng tên ─────────────────────────────────────────────
function DuplicateModal({ duAnTen, targetKhoiTen, onConfirm, onCancel }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">Trùng tên dự án!</h3>
            <p className="text-xs text-slate-500 mt-0.5">Phát hiện tên dự án đã tồn tại</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-slate-700">
          <p>Dự án <strong className="text-amber-700">"{duAnTen}"</strong> đã tồn tại trong khối <strong>"{targetKhoiTen}"</strong>.</p>
          <p className="mt-2 text-slate-500 text-xs">Nếu bạn tiếp tục, hai dự án trùng tên sẽ được <strong>gộp thành một</strong> và dữ liệu Chi tiết công việc sẽ được cập nhật theo.</p>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-all"
          >
            <Check className="w-4 h-4" /> OK – Tiếp tục gộp
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold transition-all"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal thêm/sửa Khối ─────────────────────────────────────────────────────
function KhoiModal({ khoi, onClose, onSave }) {
  const isEdit = !!khoi
  const [ten, setTen] = useState(khoi?.ten || '')
  const [vietTat, setVietTat] = useState(khoi?.vietTat || '')
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const [paletteIdx, setPaletteIdx] = useState(khoi?.paletteIdx ?? 0)

  const submit = () => {
    if (!ten.trim() || !vietTat.trim()) return
    onSave({ ten: ten.trim(), vietTat: vietTat.trim().toUpperCase(), paletteIdx })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-800 text-base">{isEdit ? 'Sửa Khối thi công' : 'Thêm Khối thi công mới'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Tên khối <span className="text-rose-500">*</span></label>
            <input autoFocus className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: San Lấp - Hạ Tầng" value={ten} onChange={e => setTen(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Viết tắt <span className="text-rose-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: SLHT" value={vietTat} onChange={e => setVietTat(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Màu sắc</label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map((p, i) => (
                <button key={i} onClick={() => setPaletteIdx(i)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${paletteIdx === i ? 'scale-125 ring-2 ring-offset-1 ring-blue-500' : 'hover:scale-110'}`}
                  style={{ background: p.badge, borderColor: p.border }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={submit} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all">
            <Check className="w-5 h-5" />{isEdit ? 'Lưu thay đổi' : 'Thêm khối'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold transition-all">Hủy</button>
        </div>
      </div>
    </div>
  )
}

// ─── Dự án row (draggable) ────────────────────────────────────────────────────
function DuAnRow({ duAn, badge, badgeColor, onDelete, onRename, khoiId, onDragStart, onDragEnd, isDragging }) {
  const [hover, setHover] = useState(false)
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(duAn.ten)
  const inputRef = useRef()
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => { setVal(duAn.ten) }, [duAn.ten])

  const commit = () => { if (val.trim()) onRename(val.trim()); setEditing(false) }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group select-none ${isDragging ? 'opacity-40 scale-95' : ''}`}
      draggable={!editing}
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', duAn.id)
        onDragStart({ duAn, sourceKhoiId: khoiId })
      }}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <GripVertical className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-slate-400 cursor-grab active:cursor-grabbing" />
      <span className="text-[12px] font-black px-2 py-0.5 rounded-md text-white shrink-0 min-w-[38px] text-center" style={{ background: badgeColor }}>{badge}</span>
      {editing ? (
        <input ref={inputRef} className="flex-1 text-sm bg-blue-50 rounded px-1 outline-none ring-1 ring-blue-400 min-w-0"
          value={val} onChange={e => setVal(e.target.value)}
          onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setVal(duAn.ten) } }} />
      ) : (
        <span className="flex-1 text-sm text-slate-700 font-semibold truncate min-w-0 cursor-text" onDoubleClick={() => setEditing(true)} title={duAn.ten}>{duAn.ten}</span>
      )}
      {hover && !editing && (
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setEditing(true)} className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-blue-500 transition-all"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  )
}

// ─── Cột Khối (drop target) ─────────────────────────────────────────────────────
function KhoiColumn({ khoi, searchQ, onDelete, onEdit, onAddDuAn, onDeleteDuAn, onRenameDuAn, onDrop, draggedItem, onDragStart, onDragEnd, onColumnDragStart, onColumnDragOver, onColumnDrop, onColumnDragEnd, isColumnDragging, isColumnDropTarget, dropSide }) {
  const [adding, setAdding] = useState(false)
  const [newTen, setNewTen] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [localDraggingId, setLocalDraggingId] = useState(null)
  const inputRef = useRef()
  const p = PALETTE[khoi.paletteIdx ?? 0]

  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  const submit = () => {
    if (newTen.trim()) { onAddDuAn(newTen.trim()); setNewTen('') }
    setAdding(false)
  }

  const filtered = searchQ ? khoi.duAn.filter(d => d.ten.toLowerCase().includes(searchQ.toLowerCase())) : khoi.duAn

  // Phân biệt drag dự án vs drag cột
  const isDuAnDrag = draggedItem && draggedItem.sourceKhoiId !== khoi.id
  const isDropTarget = isDuAnDrag && !isColumnDragging

  const handleDragOver = (e) => {
    // Nếu đang kéo cột, ưu tiên xử lý reorder
    if (isColumnDragging) {
      e.preventDefault()
      onColumnDragOver(khoi.id, e)
      return
    }
    if (!isDropTarget) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (isColumnDragging) {
      onColumnDrop(khoi.id)
      return
    }
    if (draggedItem && draggedItem.sourceKhoiId !== khoi.id) {
      onDrop(draggedItem, khoi.id)
    }
  }

  // Indicator line for column reorder
  const showLeftLine = isColumnDropTarget && dropSide === 'left'
  const showRightLine = isColumnDropTarget && dropSide === 'right'

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 shrink-0 w-[290px] overflow-visible shadow-sm transition-all duration-150
        ${isColumnDragging ? 'opacity-0 scale-95 pointer-events-none' : ''}
        ${isDragOver && isDropTarget ? 'ring-2 ring-blue-400 scale-[1.01]' : ''}
      `}
      style={{ background: isDragOver && isDropTarget ? '#eff6ff' : p.bg, borderColor: isDragOver && isDropTarget ? '#3b82f6' : p.border, maxHeight: 'calc(100vh - 160px)', overflow: 'hidden' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop indicator lines for column reorder */}
      {showLeftLine && (
        <div className="absolute -left-[3px] top-0 bottom-0 w-[4px] rounded-full bg-blue-500 z-50 pointer-events-none" style={{ boxShadow: '0 0 8px #3b82f6' }} />
      )}
      {showRightLine && (
        <div className="absolute -right-[3px] top-0 bottom-0 w-[4px] rounded-full bg-blue-500 z-50 pointer-events-none" style={{ boxShadow: '0 0 8px #3b82f6' }} />
      )}

      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 shrink-0">
        {/* Drag handle for column reorder */}
        <div
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors shrink-0 -ml-1 pr-0.5"
          draggable
          onDragStart={e => {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', 'column:' + khoi.id)
            onColumnDragStart(khoi.id)
          }}
          onDragEnd={onColumnDragEnd}
          title="Kéo để thay đổi vị trí khối"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <span className="flex-1 text-[12px] font-black uppercase tracking-wider text-slate-700 truncate">{khoi.ten}</span>
        <span className="text-[11px] font-bold text-slate-400">{filtered.length}</span>
        <span className="text-[12px] font-black px-2.5 py-0.5 rounded-lg text-white" style={{ background: p.badge }}>{khoi.vietTat}</span>
        <button onClick={() => onEdit(khoi)} className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white/60 transition-all"><Edit2 className="w-4 h-4" /></button>
        <button onClick={() => onDelete(khoi.id)} className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white/60 transition-all"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="h-px mx-2 shrink-0" style={{ background: p.border + '99' }} />

      {/* Drop hint for du an */}
      {isDragOver && isDropTarget && (
        <div className="mx-2 mt-2 px-3 py-2 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 text-blue-500 text-xs font-bold text-center animate-pulse">
          ↓ Thả dự án vào đây
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {filtered.length === 0 && !adding && !isDragOver && (
          <div className="flex items-center justify-center h-16 text-slate-300 text-xs font-semibold select-none">Kéo dự án vào đây</div>
        )}
        {filtered.map(da => (
          <DuAnRow
            key={da.id}
            duAn={da}
            khoiId={khoi.id}
            badge={khoi.vietTat}
            badgeColor={p.badge}
            onDelete={() => onDeleteDuAn(da.id)}
            onRename={ten => onRenameDuAn(da.id, ten)}
            isDragging={localDraggingId === da.id}
            onDragStart={(item) => {
              setLocalDraggingId(da.id)
              onDragStart(item)
            }}
            onDragEnd={() => {
              setLocalDraggingId(null)
              onDragEnd()
            }}
          />
        ))}
        {adding && (
          <div className="flex items-center gap-2 px-2 py-2 bg-white rounded-xl border-2 border-blue-400 shadow">
            <input ref={inputRef} className="flex-1 text-sm outline-none bg-transparent" placeholder="Tên dự án..."
              value={newTen} onChange={e => setNewTen(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setNewTen('') } }} />
            <button onClick={submit} className="text-blue-500 hover:text-blue-700 shrink-0"><Check className="w-5 h-5" /></button>
            <button onClick={() => { setAdding(false); setNewTen('') }} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-5 h-5" /></button>
          </div>
        )}
      </div>

      {/* Footer add button */}
      <div className="shrink-0 px-2 pb-2 pt-1">
        <button onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-white/70 hover:text-slate-700 text-xs font-semibold transition-all">
          <Plus className="w-4 h-4" /> Thêm dự án
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CauHinhDuAn({ branding, onOpenSidebar }) {
  const [khois, setKhois] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [modalKhoi, setModalKhoi] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)

  // Drag state (dự án)
  const [draggedItem, setDraggedItem] = useState(null) // { duAn, sourceKhoiId }
  // Pending move waiting for dup-confirm
  const pendingMoveRef = useRef(null)
  // Duplicate confirm modal state
  const [dupModal, setDupModal] = useState(null) // { duAnTen, targetKhoiTen }

  // Drag state (cột khối - reorder)
  const [draggingKhoiId, setDraggingKhoiId] = useState(null)
  const [colDropTarget, setColDropTarget] = useState(null) // { targetId, side: 'left'|'right' }

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800) }

  useEffect(() => {
    let channel = null

    async function fetchData() {
      setIsLoading(true)
      const supabase = getSupabase()
      if (supabase) {
        try {
          const { data, error } = await supabase.from(TABLES.DU_AN).select('*')
          if (!error && data && data.length > 0) setKhois(data.map(toCamelCase))
          else setKhois(load())
        } catch (err) { console.error('Supabase fetch failed', err); setKhois(load()) }
        setIsLoading(false)

        channel = supabase
          .channel('realtime-du-an')
          .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.DU_AN }, async () => {
            const { data } = await supabase.from(TABLES.DU_AN).select('*')
            if (data) setKhois(data.map(toCamelCase))
          })
          .subscribe()
        return
      }
      setKhois(load())
      setIsLoading(false)
    }

    fetchData()
    return () => {
      const supabase = getSupabase()
      if (channel && supabase) supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => { if (dirty) saveData(khois) }, [khois, dirty])

  const mark = fn => { setKhois(fn); setDirty(true) }

  // ─── Core move logic ──────────────────────────────────────────────────────
  const doMove = useCallback((duAn, sourceKhoiId, targetKhoiId, mergeExistingId) => {
    mark(prev => {
      return prev.map(k => {
        if (k.id === sourceKhoiId) {
          // Xóa khỏi khối nguồn (nếu merge, giữ tên gốc ở đích)
          return { ...k, duAn: k.duAn.filter(d => d.id !== duAn.id) }
        }
        if (k.id === targetKhoiId) {
          if (mergeExistingId) {
            // Gộp: xóa bản trùng, thêm dự án nguồn vào
            const filtered = k.duAn.filter(d => d.id !== mergeExistingId)
            return { ...k, duAn: [...filtered, { ...duAn }] }
          } else {
            return { ...k, duAn: [...k.duAn, { ...duAn }] }
          }
        }
        return k
      })
    })
  }, [])

  // Cập nhật chi tiết công việc trên Supabase khi project_id thay đổi (merge)
  const updateChiTietMerge = async (fromId, toId) => {
    const supabase = getSupabase()
    if (!supabase || !fromId || !toId) return
    try {
      await supabase.from(TABLES.CHI_TIET_CONG_VIEC).update({ project_id: toId }).eq('project_id', fromId)
    } catch (err) { console.error('Merge chi_tiet error:', err) }
  }

  // ─── Kéo thả handler ─────────────────────────────────────────────────────
  const handleDropToKhoi = useCallback((item, targetKhoiId) => {
    if (!item || item.sourceKhoiId === targetKhoiId) return

    setKhois(prev => {
      const targetKhoi = prev.find(k => k.id === targetKhoiId)
      if (!targetKhoi) return prev

      const duplicate = targetKhoi.duAn.find(d => d.ten.trim().toLowerCase() === item.duAn.ten.trim().toLowerCase())

      if (duplicate) {
        // Lưu lại pending move và hiện modal
        pendingMoveRef.current = { duAn: item.duAn, sourceKhoiId: item.sourceKhoiId, targetKhoiId, existingId: duplicate.id }
        setDupModal({ duAnTen: item.duAn.ten, targetKhoiTen: targetKhoi.ten })
        return prev // chưa thay đổi
      }

      return prev // sẽ thay đổi bên ngoài
    })

    // Nếu không có duplicate (sẽ check lại sau setKhois resolve)
    setKhois(prev => {
      const targetKhoi = prev.find(k => k.id === targetKhoiId)
      if (!targetKhoi) return prev
      const duplicate = targetKhoi.duAn.find(d => d.ten.trim().toLowerCase() === item.duAn.ten.trim().toLowerCase())
      if (duplicate) return prev // đã hiện modal ở trên
      // Thực hiện di chuyển
      return prev.map(k => {
        if (k.id === item.sourceKhoiId) return { ...k, duAn: k.duAn.filter(d => d.id !== item.duAn.id) }
        if (k.id === targetKhoiId) return { ...k, duAn: [...k.duAn, { ...item.duAn }] }
        return k
      })
    })
    setDirty(true)
    showToast(`Đã chuyển dự án sang khối mới ✓`)
  }, [])

  // OK trên modal trùng tên
  const handleDupConfirm = () => {
    const pm = pendingMoveRef.current
    if (!pm) return
    doMove(pm.duAn, pm.sourceKhoiId, pm.targetKhoiId, pm.existingId)
    updateChiTietMerge(pm.existingId, pm.duAn.id)
    pendingMoveRef.current = null
    setDupModal(null)
    showToast(`Đã gộp dự án "${pm.duAn.ten}" vào khối mới`, 'info')
  }

  const handleDupCancel = () => {
    pendingMoveRef.current = null
    setDupModal(null)
    showToast('Đã hủy thao tác kéo thả', 'info')
  }

  // ─── Column reorder handlers ─────────────────────────────────────────────
  const handleColumnDragStart = useCallback((khoiId) => {
    setDraggingKhoiId(khoiId)
    setColDropTarget(null)
  }, [])

  const handleColumnDragOver = useCallback((targetId, e) => {
    if (!draggingKhoiId || draggingKhoiId === targetId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const midX = rect.left + rect.width / 2
    const side = e.clientX < midX ? 'left' : 'right'
    setColDropTarget(prev => {
      if (prev?.targetId === targetId && prev?.side === side) return prev
      return { targetId, side }
    })
  }, [draggingKhoiId])

  const handleColumnDrop = useCallback((targetId) => {
    if (!draggingKhoiId || draggingKhoiId === targetId) {
      setColDropTarget(null)
      return
    }
    const side = colDropTarget?.side || 'right'
    mark(prev => {
      const srcIdx = prev.findIndex(k => k.id === draggingKhoiId)
      const tgtIdx = prev.findIndex(k => k.id === targetId)
      if (srcIdx < 0 || tgtIdx < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(srcIdx, 1)
      const insertAt = next.findIndex(k => k.id === targetId)
      const finalIdx = side === 'left' ? insertAt : insertAt + 1
      next.splice(finalIdx, 0, moved)
      return next
    })
    setColDropTarget(null)
    showToast('Đã thay đổi vị trí khối thi công')
  }, [draggingKhoiId, colDropTarget])

  const handleColumnDragEnd = useCallback(() => {
    setDraggingKhoiId(null)
    setColDropTarget(null)
  }, [])

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true)
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { error: delError } = await supabase.from(TABLES.DU_AN).delete().neq('id', '_')
        if (delError) {
          if (delError.code === '404') throw new Error('Bảng "du_an" không tồn tại trên Supabase.')
          throw delError
        }
        const dbKhois = khois.map(toSnakeCase)
        const { error: insError } = await supabase.from(TABLES.DU_AN).insert(dbKhois)
        if (insError) throw insError
        setDirty(false)
        showToast('Đã lưu dữ liệu lên Supabase')
      } catch (err) {
        console.error('Supabase save failed', err)
        showToast('Lỗi lưu: ' + err.message, 'error')
      }
    } else {
      showToast('Chưa cấu hình Supabase - Đã lưu nháp cục bộ', 'info')
      setDirty(false)
    }
    saveData(khois)
    setIsSaving(false)
  }

  const handleDiscard = () => { setKhois(load()); setDirty(false) }

  const handleSync = async () => {
    setIsLoading(true)
    const supabase = getSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase.from(TABLES.DU_AN).select('*')
        if (error) throw error
        if (data) {
          setKhois(data.map(toCamelCase))
          saveData(data.map(toCamelCase))
          setDirty(false)
          showToast('Đã đồng bộ từ hệ thống')
        }
      } catch (err) {
        console.error('Supabase sync failed', err)
        showToast('Lỗi đồng bộ: ' + err.message, 'error')
      }
    } else {
      showToast('Chưa cấu hình Supabase', 'info')
    }
    setIsLoading(false)
  }

  const addKhoi = upd => { mark(p => [...p, { id: genId(), ...upd, duAn: [] }]); showToast(`Đã thêm khối "${upd.ten}"`) }
  const editKhoi = (id, upd) => { mark(p => p.map(k => k.id === id ? { ...k, ...upd } : k)); showToast('Đã cập nhật khối') }
  const deleteKhoi = id => {
    if (!confirm('Xóa khối này? Toàn bộ dự án trong khối cũng sẽ bị xóa.')) return
    mark(p => p.filter(k => k.id !== id)); showToast('Đã xóa khối')
  }
  const addDuAn = (kid, ten) => mark(p => p.map(k => k.id === kid ? { ...k, duAn: [...k.duAn, { id: genId(), ten }] } : k))
  const deleteDuAn = (kid, did) => mark(p => p.map(k => k.id === kid ? { ...k, duAn: k.duAn.filter(d => d.id !== did) } : k))
  const renameDuAn = (kid, did, ten) => mark(p => p.map(k => k.id === kid ? { ...k, duAn: k.duAn.map(d => d.id === did ? { ...d, ten } : d) } : k))

  const total = khois.reduce((s, k) => s + k.duAn.length, 0)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">

      {/* Top bar */}
      <div className="shrink-0 flex items-center h-16 bg-white border-b border-slate-200 shadow-sm flex-wrap px-0">
        <div
          onMouseEnter={onOpenSidebar}
          className="h-full flex items-center justify-center pl-2 pr-4 cursor-pointer group"
        >
          <div className={`h-[54px] ${branding?.logoUrl ? 'px-4' : 'w-[54px]'} bg-white flex items-center justify-center border-2 border-slate-200/50 rounded-2xl shadow-sm z-10 shrink-0 overflow-hidden group-hover:scale-[1.02] group-active:scale-95 transition-all`}>
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-11 w-auto object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Briefcase className="w-7 h-7 text-amber-500" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 px-2 py-2 flex-wrap">
          <span className="font-black text-slate-800 text-lg whitespace-nowrap">CẤU HÌNH DỰ ÁN</span>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-[200px] max-w-xs flex-1 ml-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
              placeholder="Tìm kiếm dự án..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>

          <button onClick={handleSync} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Đồng bộ dữ liệu
          </button>

          <div className="flex-1" />

          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">{khois.length} khối · {total} dự án</span>

          <button onClick={() => setModalKhoi('new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all">
            <FolderPlus className="w-4 h-4" /> Thêm Khối mới
          </button>

          <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold whitespace-nowrap">
            "+ Thêm dự án" bên trong từng cột khối
          </span>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-5 py-4 h-full items-start" style={{ minWidth: 'max-content' }}>
          {khois.map(khoi => (
            <KhoiColumn
              key={khoi.id}
              khoi={khoi}
              searchQ={searchQ}
              onDelete={deleteKhoi}
              onEdit={k => setModalKhoi(k)}
              onAddDuAn={ten => addDuAn(khoi.id, ten)}
              onDeleteDuAn={did => deleteDuAn(khoi.id, did)}
              onRenameDuAn={(did, ten) => renameDuAn(khoi.id, did, ten)}
              draggedItem={draggedItem}
              onDrop={handleDropToKhoi}
              onDragStart={(item) => setDraggedItem(item)}
              onDragEnd={() => setDraggedItem(null)}
              onColumnDragStart={handleColumnDragStart}
              onColumnDragOver={handleColumnDragOver}
              onColumnDrop={handleColumnDrop}
              onColumnDragEnd={handleColumnDragEnd}
              isColumnDragging={draggingKhoiId === khoi.id}
              isColumnDropTarget={colDropTarget?.targetId === khoi.id}
              dropSide={colDropTarget?.targetId === khoi.id ? colDropTarget.side : null}
            />
          ))}

          {/* Ghost add column */}
          <button onClick={() => setModalKhoi('new')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/60 transition-all shrink-0 w-[220px] h-[140px] text-slate-400 hover:text-blue-500">
            <Plus className="w-7 h-7" />
            <span className="text-xs font-bold">Thêm khối mới</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-3.5 bg-white border-t border-slate-200">
        <button onClick={handleDiscard} disabled={!dirty}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Hủy bỏ
        </button>
        <button onClick={handleSave} disabled={!dirty || isSaving}
          className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-sm">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>

      {/* Modals */}
      {modalKhoi === 'new' && (
        <KhoiModal onClose={() => setModalKhoi(null)} onSave={addKhoi} />
      )}
      {modalKhoi && modalKhoi !== 'new' && (
        <KhoiModal khoi={modalKhoi} onClose={() => setModalKhoi(null)} onSave={upd => { editKhoi(modalKhoi.id, upd); setModalKhoi(null) }} />
      )}

      {/* Duplicate confirm modal */}
      {dupModal && (
        <DuplicateModal
          duAnTen={dupModal.duAnTen}
          targetKhoiTen={dupModal.targetKhoiTen}
          onConfirm={handleDupConfirm}
          onCancel={handleDupCancel}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-20 right-6 z-[400] flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-semibold transition-all ${
          toast.type === 'error' ? 'bg-rose-500 text-white border-rose-400/50'
          : toast.type === 'info' ? 'bg-blue-500 text-white border-blue-400/50'
          : 'bg-white text-slate-800 border-slate-200'}`}>
          <span>{toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
