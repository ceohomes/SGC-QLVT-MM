import React, { useState, useEffect, useRef } from 'react'
import {
  Briefcase, Plus, Trash2, Edit2, Check, X,
  RefreshCw, Search, GripVertical, FolderPlus
} from 'lucide-react'

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

// ─── Modal thêm/sửa Khối ─────────────────────────────────────────────────────
// Font tăng: text-base→text-lg (title), text-sm→text-base (input/label/button)
function KhoiModal({ khoi, onClose, onSave }) {
  const isEdit = !!khoi
  const [ten, setTen] = useState(khoi?.ten || '')
  const [vietTat, setVietTat] = useState(khoi?.vietTat || '')
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
          {/* text-base → text-lg */}
          <h3 className="font-black text-slate-800 text-lg">{isEdit ? 'Sửa Khối thi công' : 'Thêm Khối thi công mới'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            {/* text-xs → text-sm */}
            <label className="text-sm font-bold text-slate-600 block mb-1">Tên khối <span className="text-rose-500">*</span></label>
            {/* text-sm → text-base */}
            <input autoFocus className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: San Lấp - Hạ Tầng" value={ten} onChange={e => setTen(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-1">Viết tắt <span className="text-rose-500">*</span></label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="VD: SLHT" value={vietTat} onChange={e => setVietTat(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-2">Màu sắc</label>
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
          {/* text-sm → text-base, py-2 → py-2.5 */}
          <button onClick={submit} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-bold transition-all">
            <Check className="w-5 h-5" />{isEdit ? 'Lưu thay đổi' : 'Thêm khối'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-base font-semibold transition-all">Hủy</button>
        </div>
      </div>
    </div>
  )
}

// ─── Dự án row ────────────────────────────────────────────────────────────────
// badge: text-[11px]→text-[13px], tên: text-sm→text-base, icon: w-3→w-4
function DuAnRow({ duAn, badge, badgeColor, onDelete, onRename }) {
  const [hover, setHover] = useState(false)
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(duAn.ten)
  const inputRef = useRef()
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = () => { if (val.trim()) onRename(val.trim()); setEditing(false) }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >
      <GripVertical className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-slate-400 cursor-grab" />
      {/* badge font: text-[11px] → text-[13px], min-w: 32→38px */}
      <span className="text-[13px] font-black px-2 py-0.5 rounded-md text-white shrink-0 min-w-[38px] text-center" style={{ background: badgeColor }}>{badge}</span>
      {editing ? (
        <input ref={inputRef} className="flex-1 text-base bg-blue-50 rounded px-1 outline-none ring-1 ring-blue-400 min-w-0"
          value={val} onChange={e => setVal(e.target.value)}
          onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setVal(duAn.ten) } }} />
      ) : (
        /* text-sm → text-base */
        <span className="flex-1 text-base text-slate-700 font-semibold truncate min-w-0 cursor-text" onDoubleClick={() => setEditing(true)} title={duAn.ten}>{duAn.ten}</span>
      )}
      {hover && !editing && (
        /* button: w-5→w-6 h-5→h-6, icon: w-3→w-4 */
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setEditing(true)} className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-blue-500 transition-all"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onDelete} className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  )
}

// ─── Cột Khối ─────────────────────────────────────────────────────────────────
// Column width: 260→290px, header font up, icon buttons bigger
function KhoiColumn({ khoi, searchQ, onDelete, onEdit, onAddDuAn, onDeleteDuAn, onRenameDuAn }) {
  const [adding, setAdding] = useState(false)
  const [newTen, setNewTen] = useState('')
  const inputRef = useRef()
  const p = PALETTE[khoi.paletteIdx ?? 0]

  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  const submit = () => {
    if (newTen.trim()) { onAddDuAn(newTen.trim()); setNewTen('') }
    setAdding(false)
  }

  const filtered = searchQ ? khoi.duAn.filter(d => d.ten.toLowerCase().includes(searchQ.toLowerCase())) : khoi.duAn

  return (
    /* w-[260px] → w-[290px] */
    <div className="flex flex-col rounded-2xl border-2 shrink-0 w-[290px] overflow-hidden shadow-sm" style={{ background: p.bg, borderColor: p.border, maxHeight: 'calc(100vh - 160px)' }}>
      {/* Header: text-[11px]→text-[13px], count text-[10px]→text-[12px], badge text-[11px]→text-[13px], buttons w-6→w-7 */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 shrink-0">
        <span className="flex-1 text-[13px] font-black uppercase tracking-wider text-slate-700 truncate">{khoi.ten}</span>
        <span className="text-[12px] font-bold text-slate-400">{filtered.length}</span>
        <span className="text-[13px] font-black px-2.5 py-0.5 rounded-lg text-white" style={{ background: p.badge }}>{khoi.vietTat}</span>
        <button onClick={() => onEdit(khoi)} className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white/60 transition-all"><Edit2 className="w-4 h-4" /></button>
        <button onClick={() => onDelete(khoi.id)} className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white/60 transition-all"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="h-px mx-2 shrink-0" style={{ background: p.border + '99' }} />

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        {filtered.length === 0 && !adding && (
          /* text-xs → text-sm */
          <div className="flex items-center justify-center h-16 text-slate-300 text-sm font-semibold select-none">Kéo dự án vào đây</div>
        )}
        {filtered.map(da => (
          <DuAnRow key={da.id} duAn={da} badge={khoi.vietTat} badgeColor={p.badge}
            onDelete={() => onDeleteDuAn(da.id)} onRename={ten => onRenameDuAn(da.id, ten)} />
        ))}
        {adding && (
          /* input: text-sm → text-base */
          <div className="flex items-center gap-2 px-2 py-2 bg-white rounded-xl border-2 border-blue-400 shadow">
            <input ref={inputRef} className="flex-1 text-base outline-none bg-transparent" placeholder="Tên dự án..."
              value={newTen} onChange={e => setNewTen(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setNewTen('') } }} />
            <button onClick={submit} className="text-blue-500 hover:text-blue-700 shrink-0"><Check className="w-5 h-5" /></button>
            <button onClick={() => { setAdding(false); setNewTen('') }} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-5 h-5" /></button>
          </div>
        )}
      </div>

      {/* Footer add button: text-xs → text-sm, icon w-3.5→w-4 */}
      <div className="shrink-0 px-2 pb-2 pt-1">
        <button onClick={() => setAdding(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-white/70 hover:text-slate-700 text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" /> Thêm dự án
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CauHinhDuAn() {
  const [khois, setKhois] = useState(load)
  const [modalKhoi, setModalKhoi] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500) }
  const mark = fn => { setKhois(fn); setDirty(true) }

  const handleSave = () => { saveData(khois); setDirty(false); showToast('Đã lưu cấu hình') }
  const handleDiscard = () => { setKhois(load()); setDirty(false) }
  const handleSync = () => { saveData(khois); setDirty(false); showToast('Đã đồng bộ dữ liệu') }

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

      {/* Top bar — font: text-sm→text-base, text-xs→text-sm; icons: w-3.5→w-4; buttons: py-1.5→py-2, px-3→px-4 */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-200 shadow-sm flex-wrap">
        <div className="flex items-center gap-2.5 mr-1">
          {/* icon container: w-7→w-8 h-7→h-8, icon: w-4→w-5 */}
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          {/* text-sm → text-base */}
          <span className="font-black text-slate-800 text-base whitespace-nowrap">CẤU HÌNH DỰ ÁN</span>
        </div>

        {/* Search: text-sm → text-base */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-[200px] max-w-xs flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input className="flex-1 text-base bg-transparent outline-none text-slate-700 placeholder-slate-400"
            placeholder="Tìm kiếm tên dự án..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          {searchQ && <button onClick={() => setSearchQ('')}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>}
        </div>

        {/* Đồng bộ: text-xs→text-sm, py-1.5→py-2, icon w-3.5→w-4 */}
        <button onClick={handleSync} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold transition-all">
          <RefreshCw className="w-4 h-4" /> Đồng bộ dữ liệu
        </button>

        <div className="flex-1" />

        {/* Stats: text-xs → text-sm */}
        <span className="text-sm text-slate-400 font-semibold whitespace-nowrap">{khois.length} khối · {total} dự án</span>

        {/* Thêm nhóm: text-xs→text-sm, py-1.5→py-2, icon w-3.5→w-4 */}
        <button onClick={() => setModalKhoi('new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold transition-all">
          <FolderPlus className="w-4 h-4" /> Thêm nhóm dự án mới...
        </button>

        {/* Thêm dự án: text-xs→text-sm, py-1.5→py-2, icon w-3.5→w-4 */}
        <button
          onClick={() => showToast('Dùng nút "+ Thêm dự án" bên trong từng cột khối', 'info')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Thêm dự án mới...
        </button>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-5 py-4 h-full items-start" style={{ minWidth: 'max-content' }}>
          {khois.map(khoi => (
            <KhoiColumn key={khoi.id} khoi={khoi} searchQ={searchQ}
              onDelete={deleteKhoi}
              onEdit={k => setModalKhoi(k)}
              onAddDuAn={ten => addDuAn(khoi.id, ten)}
              onDeleteDuAn={did => deleteDuAn(khoi.id, did)}
              onRenameDuAn={(did, ten) => renameDuAn(khoi.id, did, ten)}
            />
          ))}
          {/* Ghost add column: text-xs→text-sm, icon w-6→w-7, h-[120px]→h-[140px] */}
          <button onClick={() => setModalKhoi('new')}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/60 transition-all shrink-0 w-[220px] h-[140px] text-slate-400 hover:text-blue-500">
            <Plus className="w-7 h-7" />
            <span className="text-sm font-bold">Thêm khối mới</span>
          </button>
        </div>
      </div>

      {/* Footer — text-sm→text-base, py-2→py-2.5, px-5→px-6 */}
      <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-3.5 bg-white border-t border-slate-200">
        <button onClick={handleDiscard} disabled={!dirty}
          className="px-6 py-2.5 rounded-xl text-base font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Hủy bỏ
        </button>
        <button onClick={handleSave} disabled={!dirty}
          className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-base font-bold transition-all shadow-sm">
          <Check className="w-5 h-5" /> Lưu cấu hình
        </button>
      </div>

      {/* Modals */}
      {modalKhoi === 'new' && (
        <KhoiModal onClose={() => setModalKhoi(null)} onSave={addKhoi} />
      )}
      {modalKhoi && modalKhoi !== 'new' && (
        <KhoiModal khoi={modalKhoi} onClose={() => setModalKhoi(null)} onSave={upd => { editKhoi(modalKhoi.id, upd); setModalKhoi(null) }} />
      )}

      {/* Toast: text-sm → text-base */}
      {toast && (
        <div className={`fixed bottom-20 right-6 z-[400] flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-2xl border text-base font-semibold transition-all ${
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
