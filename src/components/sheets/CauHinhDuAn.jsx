import React, { useState, useEffect, useRef, useCallback } from 'react'
import ConfirmModal from '../ConfirmModal'
import {
  Briefcase, Plus, Trash2, Edit2, Check, X,
  RefreshCw, Search, GripVertical, FolderPlus, Save, Loader2, AlertTriangle
} from 'lucide-react'
import { TABLES, PALETTE } from '../../constants'
import { getSupabase, fetchAll } from '../../lib/supabase'
import { toCamelCase, toSnakeCase, genId } from '../../utils'

// ─── Modals section ──────────────────────────────────────────────────────────
// SyncConfirmModal and DuplicateModal are now replaced by the unified ConfirmModal component

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
            <label className="text-xs font-bold text-slate-600 block mb-2 px-1 flex justify-between items-center">
              <span>Màu sắc khối</span>
              <span className="text-[10px] font-medium text-slate-400 italic">Chọn màu định danh cho khối</span>
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner max-h-[160px] overflow-y-auto custom-scrollbar">
              {PALETTE.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPaletteIdx(i)}
                  className={`relative aspect-square rounded-full transition-all duration-200 group
                    ${paletteIdx === i 
                      ? 'ring-4 ring-blue-100 scale-110 shadow-md transform' 
                      : 'hover:scale-105 hover:shadow-sm'
                    }`}
                  style={{ backgroundColor: p.badge, border: paletteIdx === i ? `2px solid ${p.badge}` : '2px solid white' }}
                >
                  {paletteIdx === i && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 dark:bg-white bg-black transition-opacity`} />
                </button>
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
function KhoiColumn({ khoi, searchQ, onDelete, onEdit, onAddDuAn, onDeleteDuAn, onRenameDuAn, onDrop, draggedItem, onDragStart, onDragEnd, onColumnDragStart, onColumnDragOver, onColumnDrop, onColumnDragEnd, isColumnDragging, isAnyColumnDragging, isColumnDropTarget, dropSide }) {
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
  const isDropTarget = isDuAnDrag && !isAnyColumnDragging

  const handleDragOver = (e) => {
    e.preventDefault()
    // Nếu đang kéo cột, ưu tiên xử lý reorder
    if (isAnyColumnDragging) {
      e.dataTransfer.dropEffect = 'move'
      onColumnDragOver(khoi.id, e)
      return
    }
    if (!isDropTarget) return
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }
  const handleDragEnter = (e) => {
    e.preventDefault()
    if (isAnyColumnDragging) {
      onColumnDragOver(khoi.id, e)
    }
  }
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (isAnyColumnDragging) {
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
        ${isColumnDragging ? 'opacity-30 scale-95' : ''}
        ${isDragOver && isDropTarget ? 'ring-2 ring-blue-400 scale-[1.01]' : ''}
        ${isColumnDropTarget ? 'ring-2 ring-blue-400/50' : ''}
      `}
      style={{ background: isDragOver && isDropTarget ? '#eff6ff' : p.bg, borderColor: isDragOver && isDropTarget ? '#3b82f6' : p.border, maxHeight: 'calc(100vh - 160px)', overflow: 'hidden' }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
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
      <div className="flex flex-col px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-start gap-1.5 min-h-[32px]">
          {/* Drag handle area (Grip + Badge + Title) */}
          <div
            className="flex-1 flex items-start gap-1.5 cursor-grab active:cursor-grabbing group/handle select-none"
            draggable
            onDragStart={e => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', 'column:' + khoi.id)
              onColumnDragStart(khoi.id)
            }}
            onDragEnd={onColumnDragEnd}
            title="Kéo để thay đổi vị trí khối"
          >
            <div className="text-slate-300 group-hover/handle:text-blue-500 transition-colors shrink-0 -ml-1 pr-0.5 mt-0.5">
              <GripVertical className="w-5 h-5" />
            </div>
            
            <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-md text-white shadow-sm mt-0.5" style={{ background: p.badge }}>
              {khoi.vietTat}
            </span>

            <span className="flex-1 text-[13px] font-black uppercase tracking-tight text-slate-800 leading-[1.3] whitespace-normal break-words py-0.5 group-hover/handle:text-blue-700 transition-colors">
              {khoi.ten}
            </span>
          </div>
          
          <div className="flex items-center gap-0.5 shrink-0 ml-1">
            <button onClick={() => onEdit(khoi)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white/60 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => onDelete(khoi.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white/60 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400/80 tracking-tighter uppercase">{filtered.length} dự án</span>
          <span className="text-[9px] text-slate-300 italic">• Kéo tiêu đề để đổi vị trí</span>
        </div>
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

const STORAGE_KEY = 'vt_cau_hinh_du_an'
const load = () => {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : []
  } catch (err) { console.error('Load failed', err); return [] }
}
const saveData = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (err) { console.error('Save failed', err) }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CauHinhDuAn({ branding, onOpenSidebar }) {
  const [khois, setKhois] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [modalKhoi, setModalKhoi] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [toast, setToast] = useState(null)
  const [alertInfo, setAlertInfo] = useState(null) // { title, message, type, icon }
  const [dirty, setDirty] = useState(false)

  const showAlert = (title, message, type = 'danger', icon = AlertTriangle) => {
    setAlertInfo({ title, message, type, icon })
  }

  // Sync confirmation state
  const [syncConfirm, setSyncConfirm] = useState(null) // { title, message, count, onConfirm }
  const [isSyncing, setIsSyncing] = useState(false)

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
          const data = await fetchAll(supabase, TABLES.DU_AN)
          if (data && data.length > 0) {
            const camelData = data.map(toCamelCase)
            
            // Phân loại Khối (có du_an là mảng JSON)
            const dbKhois = camelData.filter(item => Array.isArray(item.duAn))
            
            console.log('[CauHinhDuAn] Data fetched from DB:', dbKhois.length, 'groups')
            setKhois(dbKhois.length > 0 ? dbKhois : load())
          } else {
            setKhois(load())
          }
        } catch (err) { console.error('Supabase fetch failed', err); setKhois(load()) }

        channel = supabase
          .channel(`rt-du-an-${Date.now()}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.DU_AN }, async () => {
            try {
              const data = await fetchAll(supabase, TABLES.DU_AN)
              if (data) {
                const camel = data.map(toCamelCase)
                const dbK = camel.filter(i => Array.isArray(i.duAn))
                setKhois(dbK)
              }
            } catch (err) { console.error(err) }
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

  // Cập nhật chi tiết công việc trên Supabase khi project_id thay đổi (move/merge)
  const syncProjectMove = async (duAn, sourceKhoiId, targetKhoiId, isMerge = false) => {
    const supabase = getSupabase()
    if (!supabase) return

    const sourceKhoi = khois.find(k => k.id === sourceKhoiId)
    const targetKhoi = khois.find(k => k.id === targetKhoiId)
    if (!targetKhoi) return

    try {
      setIsSyncing(true)

      const oldMatch = sourceKhoi?.vietTat ? `${sourceKhoi.vietTat}. ${duAn.ten}` : duAn.ten
      const newMatch = targetKhoi.vietTat ? `${targetKhoi.vietTat}. ${duAn.ten}` : duAn.ten

      // Tìm tất cả các dòng thuộc dự án cũ ở khối cũ
      // Lưu ý: Nếu sourceKhoiId null (trường hợp hy hữu), có thể bỏ qua check project_id
      const query = supabase.from(TABLES.CHI_TIET_CONG_VIEC).update({
        project_id: targetKhoiId,
        du_an: newMatch,
        khoi_ten: targetKhoi.ten,
        khoi_viet_tat: targetKhoi.vietTat
      })
      
      if (sourceKhoiId) query.eq('project_id', sourceKhoiId)
      query.eq('du_an', oldMatch)

      const { error } = await query
      if (error) throw error

      if (isMerge) {
        showToast(`Đã gộp dữ án "${duAn.ten}" và đồng bộ dữ liệu`)
      } else {
        showToast(`Đã chuyển dự án sang khối "${targetKhoi.ten}" và đồng bộ dữ liệu`)
      }
    } catch (err) {
      console.error('Project move sync error:', err)
      showToast('Lỗi đồng bộ dữ liệu: ' + err.message, 'error')
    } finally {
      setIsSyncing(false)
      setSyncConfirm(null)
    }
  }

  // ─── Kéo thả handler ─────────────────────────────────────────────────────
  const handleDropToKhoi = useCallback(async (item, targetKhoiId) => {
    if (!item || item.sourceKhoiId === targetKhoiId) return

    const targetKhoi = khois.find(k => k.id === targetKhoiId)
    if (!targetKhoi) return

    const duplicate = targetKhoi.duAn.find(d => d.ten.trim().toLowerCase() === item.duAn.ten.trim().toLowerCase())

    if (duplicate) {
      // Lưu lại pending move và hiện modal
      pendingMoveRef.current = { duAn: item.duAn, sourceKhoiId: item.sourceKhoiId, targetKhoiId, existingId: duplicate.id }
      setDupModal({ duAnTen: item.duAn.ten, targetKhoiTen: targetKhoi.ten })
      return
    }

    // Nếu không có trùng tên, kiểm tra xem có dữ liệu cần đồng bộ không
    const supabase = getSupabase()
    if (supabase) {
      const sourceKhoi = khois.find(k => k.id === item.sourceKhoiId)
      const matchName = sourceKhoi?.vietTat ? `${sourceKhoi.vietTat}. ${item.duAn.ten}` : item.duAn.ten
      
      const { count, error } = await supabase
        .from(TABLES.CHI_TIET_CONG_VIEC)
        .select('*', { count: 'exact', head: true })
        .eq('project_id', item.sourceKhoiId)
        .eq('du_an', matchName)
      
      if (!error && count > 0) {
        setSyncConfirm({
          title: 'Di chuyển dự án',
          message: `Dự án "${item.duAn.ten}" có ${count} dòng dữ liệu. Bạn có muốn di chuyển tất cả sang khối "${targetKhoi.ten}"?`,
          count,
          onConfirm: () => {
            doMove(item.duAn, item.sourceKhoiId, targetKhoiId)
            syncProjectMove(item.duAn, item.sourceKhoiId, targetKhoiId)
          }
        })
        return
      }
    }

    // Thực hiện di chuyển bình thường
    doMove(item.duAn, item.sourceKhoiId, targetKhoiId)
    setDirty(true)
    showToast(`Đã chuyển dự án sang khối mới ✓`)
  }, [khois, doMove])

  // OK trên modal trùng tên (Gộp)
  const handleDupConfirm = async () => {
    const pm = pendingMoveRef.current
    if (!pm) return
    
    const supabase = getSupabase()
    if (supabase) {
      // Đếm tổng số dòng bị ảnh hưởng (cả bản nguồn và bản đích sẽ được gộp chung)
      // Thực tế ta chỉ cần biết có bao nhiêu dòng ở bản NGUỒN sẽ bị thay đổi thông tin khối
      const sourceKhoi = khois.find(k => k.id === pm.sourceKhoiId)
      const matchName = sourceKhoi?.vietTat ? `${sourceKhoi.vietTat}. ${pm.duAn.ten}` : pm.duAn.ten

      const { count, error } = await supabase
        .from(TABLES.CHI_TIET_CONG_VIEC)
        .select('*', { count: 'exact', head: true })
        .eq('project_id', pm.sourceKhoiId)
        .eq('du_an', matchName)

      if (!error && count > 0) {
        setSyncConfirm({
          title: 'Gộp dữ liệu dự án',
          message: `Phát hiện có dữ liệu của dự án "${pm.duAn.ten}" tại khối cũ. Bạn có đồng ý gộp chúng vào dự án tại khối "${khois.find(k => k.id === pm.targetKhoiId)?.ten}"?`,
          count,
          onConfirm: () => {
            doMove(pm.duAn, pm.sourceKhoiId, pm.targetKhoiId, pm.existingId)
            syncProjectMove(pm.duAn, pm.sourceKhoiId, pm.targetKhoiId, true)
            pendingMoveRef.current = null
            setDupModal(null)
          }
        })
        return
      }
    }

    doMove(pm.duAn, pm.sourceKhoiId, pm.targetKhoiId, pm.existingId)
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
      const moved = prev.find(k => k.id === draggingKhoiId)
      if (!moved) return prev
      const remaining = prev.filter(k => k.id !== draggingKhoiId)
      const targetIdx = remaining.findIndex(k => k.id === targetId)
      if (targetIdx < 0) return prev
      const finalIdx = side === 'left' ? targetIdx : targetIdx + 1
      const next = [...remaining]
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
        // Lưu Khối và các Dự án nằm trong cột du_an của Khối
        const rowsToSave = khois.map(k => ({
          id: k.id,
          ten: k.ten,
          viet_tat: k.vietTat,
          palette_idx: k.paletteIdx,
          parent_id: null,
          du_an: k.duAn || [] // Đây là mảng JSON chứa các dự án
        }))

        console.log('[CauHinhDuAn] Saving nested JSON. Rows:', rowsToSave.length)
        
        // 1. Dọn dẹp các dòng "phẳng" cũ nếu có (dòng có du_an = null)
        await supabase.from(TABLES.DU_AN).delete().is('du_an', null)

        // 2. Xóa các Khối không còn tồn tại trong danh sách mới
        const currentIds = rowsToSave.map(r => r.id)
        const { data: dbCurrent } = await supabase.from(TABLES.DU_AN).select('id').not('du_an', 'is', null)
        if (dbCurrent && dbCurrent.length > 0) {
          const idsToDelete = dbCurrent.map(d => d.id).filter(id => !currentIds.includes(id))
          if (idsToDelete.length > 0) {
            console.log('[CauHinhDuAn] Deleting orphan groups:', idsToDelete)
            await supabase.from(TABLES.DU_AN).delete().in('id', idsToDelete)
          }
        }

        // 3. Upsert dữ liệu Khối
        const { error: saveError } = await supabase.from(TABLES.DU_AN).upsert(rowsToSave)
        
        if (saveError) {
          console.error('[Supabase] Upsert error:', JSON.stringify(saveError))
          throw saveError
        }
        
        setDirty(false)
        showToast('Đã lưu cấu hình (Dạng JSON lồng nhau)')
      } catch (err) {
        console.error('Supabase save failed:', err)
        showAlert('Lỗi lưu dữ liệu', 'Không thể lưu cấu hình dự án vào hệ thống. Chi tiết: ' + err.message)
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
        const data = await fetchAll(supabase, TABLES.DU_AN)
        if (data) {
          const camelData = data.map(toCamelCase)
          // Chỉ lấy các Khối (có du_an là mảng JSON)
          const dbKhois = camelData.filter(i => Array.isArray(i.duAn))
          const finalData = dbKhois.length > 0 ? dbKhois : load()
          setKhois(finalData)
          saveData(finalData)
          setDirty(false)
          showToast('Đã đồng bộ từ hệ thống (Dạng JSON)')
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
  
  const editKhoi = async (id, upd) => {
    const original = khois.find(k => k.id === id)
    if (!original) return

    const isRenamed = original.ten !== upd.ten || original.vietTat !== upd.vietTat
    const supabase = getSupabase()

    const performanceSync = async () => {
      setIsSyncing(true)
      try {
        // Cập nhật thông tin khối trong vt_chi_tiet_cong_viec
        const { error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .update({
            khoi_ten: upd.ten,
            khoi_viet_tat: upd.vietTat
          })
          .eq('project_id', id)

        if (error) throw error

        // Cập nhật lại cột du_an (chuỗi gộp) cho tất cả dự án trong khối này
        // Vì vietTat thay đổi nên du_an (ví dụ: "HN. Project A" -> "QN. Project A") cũng phải đổi
        for (const da of original.duAn) {
          const oldName = original.vietTat ? `${original.vietTat}. ${da.ten}` : da.ten
          const newName = upd.vietTat ? `${upd.vietTat}. ${da.ten}` : da.ten
          if (oldName !== newName) {
            await supabase
              .from(TABLES.CHI_TIET_CONG_VIEC)
              .update({ du_an: newName })
              .eq('project_id', id)
              .eq('du_an', oldName)
          }
        }

        mark(p => p.map(k => k.id === id ? { ...k, ...upd } : k))
        showToast('Đã cập nhật khối và đồng bộ dữ liệu')
      } catch (err) {
        console.error('Sync block error:', err)
        showToast('Lỗi đồng bộ: ' + err.message, 'error')
      } finally {
        setIsSyncing(false)
        setSyncConfirm(null)
      }
    }

    if (isRenamed && supabase) {
      const { count, error } = await supabase
        .from(TABLES.CHI_TIET_CONG_VIEC)
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id)
      
      if (!error && count > 0) {
        setSyncConfirm({
          title: 'Đồng bộ tên khối',
          message: `Bạn đang đổi tên khối "${original.ten}" thành "${upd.ten}". Hệ thống sẽ cập nhật thông tin này cho toàn bộ dữ liệu liên quan.`,
          count: count,
          onConfirm: performanceSync
        })
        return
      }
    }

    mark(p => p.map(k => k.id === id ? { ...k, ...upd } : k))
    showToast('Đã cập nhật khối')
  }

  const deleteKhoi = async id => {
    const original = khois.find(k => k.id === id)
    if (!original) return

    const supabase = getSupabase()

    const performanceSync = async () => {
      setIsSyncing(true)
      try {
        const { error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .delete()
          .eq('project_id', id)
        
        if (error) throw error

        mark(p => p.filter(k => k.id !== id))
        showToast('Đã xóa khối và toàn bộ dữ liệu liên quan')
      } catch (err) {
        console.error('Delete block sync error:', err)
        showToast('Lỗi đồng bộ: ' + err.message, 'error')
      } finally {
        setIsSyncing(false)
        setSyncConfirm(null)
      }
    }

    if (supabase) {
      const { count, error } = await supabase
        .from(TABLES.CHI_TIET_CONG_VIEC)
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id)
      
      if (!error && count > 0) {
        setSyncConfirm({
          title: 'Xóa khối thi công',
          message: `Bạn sắp xóa khối "${original.ten}". HÀNH ĐỘNG NÀY SẼ XÓA TOÀN BỘ dữ liệu chi tiết công việc thuộc khối này.`,
          count: count,
          onConfirm: performanceSync
        })
        return
      }
    }

    setSyncConfirm({
      title: 'Xóa khối thi công',
      subtitle: 'Xác nhận xóa dữ liệu',
      message: `Xóa khối "${original.ten}"? Toàn bộ dự án trong khối cũng sẽ bị xóa.`,
      icon: Trash2,
      type: 'danger',
      onConfirm: () => {
        mark(p => p.filter(k => k.id !== id))
        showToast('Đã xóa khối')
        setSyncConfirm(null)
      }
    })
  }

  const addDuAn = (kid, ten) => mark(p => p.map(k => k.id === kid ? { ...k, duAn: [...k.duAn, { id: genId(), ten }] } : k))

  const deleteDuAn = async (kid, did) => {
    const targetKhoi = khois.find(k => k.id === kid)
    if (!targetKhoi) return
    const targetDa = targetKhoi.duAn.find(d => d.id === did)
    if (!targetDa) return

    const supabase = getSupabase()

    const performanceSync = async () => {
      setIsSyncing(true)
      try {
        const matchName = targetKhoi.vietTat ? `${targetKhoi.vietTat}. ${targetDa.ten}` : targetDa.ten
        const { error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .delete()
          .eq('project_id', kid)
          .eq('du_an', matchName)
        
        if (error) throw error

        mark(p => p.map(k => k.id === kid ? { ...k, duAn: k.duAn.filter(d => d.id !== did) } : k))
        showToast(`Đã xóa dự án "${targetDa.ten}" và dữ liệu liên quan`)
      } catch (err) {
        console.error('Delete project sync error:', err)
        showToast('Lỗi đồng bộ: ' + err.message, 'error')
      } finally {
        setIsSyncing(false)
        setSyncConfirm(null)
      }
    }

    if (supabase) {
      const matchName = targetKhoi.vietTat ? `${targetKhoi.vietTat}. ${targetDa.ten}` : targetDa.ten
      const { count, error } = await supabase
        .from(TABLES.CHI_TIET_CONG_VIEC)
        .select('*', { count: 'exact', head: true })
        .eq('project_id', kid)
        .eq('du_an', matchName)
      
      if (!error && count > 0) {
        setSyncConfirm({
          title: 'Xóa dự án',
          message: `Bạn sắp xóa dự án "${targetDa.ten}". Hành động này sẽ xóa dữ liệu chi tiết công việc của dự án này.`,
          count: count,
          onConfirm: performanceSync
        })
        return
      }
    }

    mark(p => p.map(k => k.id === kid ? { ...k, duAn: k.duAn.filter(d => d.id !== did) } : k))
  }

  const renameDuAn = async (kid, did, newTen) => {
    const targetKhoi = khois.find(k => k.id === kid)
    if (!targetKhoi) return
    const targetDa = targetKhoi.duAn.find(d => d.id === did)
    if (!targetDa || targetDa.ten === newTen) return

    const supabase = getSupabase()

    const performanceSync = async () => {
      setIsSyncing(true)
      try {
        const oldMatch = targetKhoi.vietTat ? `${targetKhoi.vietTat}. ${targetDa.ten}` : targetDa.ten
        const newMatch = targetKhoi.vietTat ? `${targetKhoi.vietTat}. ${newTen}` : newTen
        
        const { error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .update({ du_an: newMatch })
          .eq('project_id', kid)
          .eq('du_an', oldMatch)
        
        if (error) throw error

        mark(p => p.map(k => k.id === kid ? { ...k, duAn: k.duAn.map(d => d.id === did ? { ...d, ten: newTen } : d) } : k))
        showToast(`Đã đổi tên dự án và đồng bộ dữ liệu`)
      } catch (err) {
        console.error('Rename project sync error:', err)
        showToast('Lỗi đồng bộ: ' + err.message, 'error')
      } finally {
        setIsSyncing(false)
        setSyncConfirm(null)
      }
    }

    if (supabase) {
      const matchName = targetKhoi.vietTat ? `${targetKhoi.vietTat}. ${targetDa.ten}` : targetDa.ten
      const { count, error } = await supabase
        .from(TABLES.CHI_TIET_CONG_VIEC)
        .select('*', { count: 'exact', head: true })
        .eq('project_id', kid)
        .eq('du_an', matchName)
      
      if (!error && count > 0) {
        setSyncConfirm({
          title: 'Đổi tên dự án',
          message: `Bạn đang đổi tên dự án "${targetDa.ten}" thành "${newTen}". Dữ liệu trong bảng chi tiết công việc sẽ được cập nhật tên mới.`,
          count: count,
          onConfirm: performanceSync
        })
        return
      }
    }

    mark(p => p.map(k => k.id === kid ? { ...k, duAn: k.duAn.map(d => d.id === did ? { ...d, ten: newTen } : d) } : k))
  }

  const total = khois.reduce((s, k) => s + k.duAn.length, 0)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">

      {/* Top bar */}
      <div className="shrink-0 flex items-center h-16 bg-slate-50 border-b border-slate-200 shadow-sm flex-wrap px-0">
        <div
          onMouseEnter={onOpenSidebar}
          className="h-full flex items-center justify-center pl-4 pr-4 cursor-pointer group transition-all"
        >
          <div className={`h-[50px] ${branding?.logoUrl ? 'px-4' : 'w-[50px]'} bg-white flex items-center justify-center border border-slate-200 rounded-2xl shadow-sm z-10 shrink-0 overflow-hidden group-hover:shadow-md transition-all`}>
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Briefcase className="w-7 h-7 text-amber-500" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 px-2 py-2 flex-wrap min-w-0">
          <h2 className="text-[24px] font-black text-slate-800 uppercase tracking-widest leading-none pr-4 border-r border-slate-200">Cấu hình dự án</h2>

          <div className="flex items-center gap-4 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-1.5 transition-all ml-2 max-w-sm flex-1 group">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input className="bg-transparent border-none p-0 focus:ring-0 text-sm text-slate-600 placeholder:text-slate-300 w-full outline-none"
                placeholder="Tìm kiếm dự án..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <button onClick={handleSync} disabled={isLoading} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-blue-600 uppercase tracking-wider transition-colors disabled:opacity-50 whitespace-nowrap">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Đồng bộ dữ liệu
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-4 px-6 border-l border-slate-200 h-full">
             <div className="flex flex-col items-end">
                <span className="text-[13px] text-slate-900 font-extrabold tracking-tight">{khois.length} KHỐI</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{total} DỰ ÁN</span>
             </div>
          </div>
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
              isAnyColumnDragging={!!draggingKhoiId}
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
        <ConfirmModal
          isOpen={!!dupModal}
          title="Trùng tên dự án!"
          subtitle="Phát hiện tên dự án đã tồn tại"
          type="warning"
          icon={AlertTriangle}
          message={`Dự án "${dupModal.duAnTen}" đã tồn tại trong khối "${dupModal.targetKhoiTen}".\n\nNếu bạn tiếp tục, hai dự án trùng tên sẽ được gộp thành một và dữ liệu Chi tiết công việc sẽ được cập nhật theo.`}
          confirmText="OK – Tiếp tục gộp"
          cancelText="Hủy"
          onConfirm={handleDupConfirm}
          onClose={handleDupCancel}
        />
      )}

      {/* Sync syncConfirm modal */}
      {syncConfirm && (
        <ConfirmModal
          isOpen={!!syncConfirm}
          title={syncConfirm.title}
          subtitle="Yêu cầu xác nhận đồng bộ dữ liệu"
          message={syncConfirm.message}
          count={syncConfirm.count}
          isLoading={isSyncing}
          onConfirm={syncConfirm.onConfirm}
          onClose={() => setSyncConfirm(null)}
        />
      )}

      {alertInfo && (
        <ConfirmModal
          isOpen={!!alertInfo}
          title={alertInfo.title}
          subtitle="Thông báo hệ thống"
          message={alertInfo.message}
          type={alertInfo.type}
          icon={alertInfo.icon}
          confirmText="Đã hiểu"
          onConfirm={() => setAlertInfo(null)}
          onClose={() => setAlertInfo(null)}
          cancelText="Đóng"
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
