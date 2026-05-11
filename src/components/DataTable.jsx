import React, { useState, useRef, useEffect } from 'react'
import {
  Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle,
  CheckCircle2, Clock, AlertTriangle, Plus, Minus, X, Save, Search
} from 'lucide-react'
import { NHOM_VAT_TU, LOAI_HOP_DONG, CATALOG_VATTU_KEY, TABLES } from '../constants'
import { calcKhoiLuongConThieu, calcPcuDeadline, isPcuOverdue, genId } from '../utils'
import { getSupabase } from '../lib/supabase'

// ── Inline Date Input ────────────────────────────────────────────
function DateInput({ value, onChange, className = '' }) {
  const toInputVal = (v) => {
    if (!v || !v.trim()) return ''
    const parts = v.trim().split('/')
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
    return ''
  }
  const fromInputVal = (v) => {
    if (!v) return ''
    const parts = v.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
    return ''
  }
  return (
    <input type="date" value={toInputVal(value)} onChange={e => onChange(fromInputVal(e.target.value))}
      className={`px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-royal-400 focus:ring-1 focus:ring-royal-100 cursor-pointer bg-white ${className}`} />
  )
}

// ── VatTu SearchDropdown ─────────────────────────────────────────
function VattuDropdown({ value, onChange, options, placeholder, fieldKey }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (value) {
      const m = options.find(o => o.ma_vattu_sap === value || o.ten_vattu === value)
      setDisplayText(m ? (fieldKey === 'maVattu' ? m.ma_vattu_sap : m.ten_vattu) : value)
    } else setDisplayText('')
  }, [value, options, fieldKey])

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = query.trim()
    ? options.filter(o => (o.ma_vattu_sap||'').toLowerCase().includes(query.toLowerCase()) || (o.ten_vattu||'').toLowerCase().includes(query.toLowerCase())).slice(0,40)
    : options.slice(0,40)

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input type="text" value={open ? query : displayText}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setOpen(true); setQuery('') }}
          placeholder={placeholder}
          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-royal-400 focus:ring-1 focus:ring-royal-100 pr-6 bg-white" />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {open ? <Search className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>
      {open && (
        <div className="absolute z-[200] left-0 top-full mt-1 bg-white border border-royal-200 rounded-xl shadow-2xl min-w-[260px] max-h-48 overflow-y-auto">
          {filtered.length === 0
            ? <div className="px-3 py-2 text-xs text-slate-400 text-center">Không tìm thấy</div>
            : filtered.map((item, i) => (
              <button key={item.id||i} type="button" onClick={() => { onChange(item); setOpen(false) }}
                className="w-full text-left px-3 py-2 hover:bg-royal-50 transition-colors border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-royal-600 bg-royal-50 px-1.5 py-0.5 rounded shrink-0">{item.ma_vattu_sap||'—'}</span>
                  <span className="text-xs text-slate-700 truncate">{item.ten_vattu}</span>
                </div>
                {item.dvt && <div className="text-[10px] text-slate-400 ml-1">ĐVT: {item.dvt}</div>}
              </button>
            ))
          }
        </div>
      )}
    </div>
  )
}

// ── Inline Add Main Row Form ─────────────────────────────────────
function InlineAddMainForm({ projectId, projects, vattuList, onSave, onCancel, currentUser }) {
  const [form, setForm] = useState({ maVattu:'', tenVattu:'', dvt:'', nhom:'', soLuongGiaoThuc:'', khoiLuong:'', quyCachKyThuat:'', projectId: projectId !== 'ALL' ? projectId : '' })
  const [errors, setErrors] = useState({})
  const set = (k, v) => { setForm(p => ({...p, [k]: v})); if (errors[k]) setErrors(p => ({...p, [k]: null})) }

  const handleVattuSelect = (item) => {
    setForm(p => ({ ...p, maVattu: item.ma_vattu_sap||'', tenVattu: item.ten_vattu||'', dvt: item.dvt||p.dvt||'', quyCachKyThuat: item.thong_so_ky_thuat||p.quyCachKyThuat||'' }))
    setErrors(p => ({...p, maVattu:null, tenVattu:null}))
  }

  const validate = () => {
    const e = {}
    if (!form.tenVattu?.trim()) e.tenVattu = 'Bắt buộc'
    setErrors(e); return Object.keys(e).length === 0
  }

  const inputCls = (k) => `w-full px-2 py-1 border rounded-lg text-xs outline-none focus:ring-1 transition-all bg-white ${errors[k] ? 'border-rose-400 bg-rose-50 focus:ring-rose-200' : 'border-slate-200 focus:border-royal-400 focus:ring-royal-100'}`

  return (
    <tr className="bg-blue-50/80 border-y-2 border-royal-300">
      <td colSpan={100} className="px-4 py-4">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0 pt-4">
            <div className="w-7 h-7 bg-royal-600 rounded-lg flex items-center justify-center text-white text-xs font-black">+</div>
            <span className="text-xs font-black text-royal-700 uppercase tracking-wide">Thêm vật tư</span>
          </div>
          <div className="flex-1 grid grid-cols-7 gap-2 min-w-0">
            {projectId === 'ALL' && (
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Dự án</label>
                <select value={form.projectId} onChange={e => set('projectId', e.target.value)} className={inputCls('projectId')}>
                  <option value="">-- Chọn dự án --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.khoiVietTat ? `${p.khoiVietTat}. ${p.ten}` : p.ten}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Mã Vật tư</label>
              <VattuDropdown value={form.maVattu} onChange={handleVattuSelect} options={vattuList} placeholder="Tìm mã..." fieldKey="maVattu" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-royal-600 mb-0.5">Tên vật tư <span className="text-rose-500">*</span></label>
              <VattuDropdown value={form.tenVattu} onChange={handleVattuSelect} options={vattuList} placeholder="Tên vật tư..." fieldKey="tenVattu" />
              {errors.tenVattu && <p className="text-[10px] text-rose-500 mt-0.5">{errors.tenVattu}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ĐVT</label>
              <input type="text" value={form.dvt} onChange={e => set('dvt', e.target.value)} placeholder="Cái, Kg..." className={inputCls('dvt')} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nhóm</label>
              <select value={form.nhom} onChange={e => set('nhom', e.target.value)} className={inputCls('nhom')}>
                <option value="">-- Nhóm --</option>
                {NHOM_VAT_TU.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">SL Giao thực</label>
              <input type="text" value={form.soLuongGiaoThuc} onChange={e => set('soLuongGiaoThuc', e.target.value)} placeholder="Số lượng..." className={inputCls('soLuongGiaoThuc')} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Khối lượng</label>
              <input type="text" value={form.khoiLuong} onChange={e => set('khoiLuong', e.target.value)} placeholder="KL..." className={inputCls('khoiLuong')} />
            </div>
            <div className="col-span-3">
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Quy cách kỹ thuật</label>
              <input type="text" value={form.quyCachKyThuat} onChange={e => set('quyCachKyThuat', e.target.value)} placeholder="Mô tả quy cách..." className={inputCls('quyCachKyThuat')} />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-4">
            <button onClick={() => { if (validate()) onSave({...form, tenChuyenVienKqlvt: currentUser||''}) }}
              className="flex items-center gap-1.5 px-4 h-8 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95">
              <Save className="w-3.5 h-3.5" />Lưu
            </button>
            <button onClick={onCancel}
              className="flex items-center gap-1.5 px-3 h-8 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all">
              <X className="w-3.5 h-3.5" />Hủy
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── Sub Row Panel ────────────────────────────────────────────────
function SubRowPanel({ parentRow, subRows, onAddSub, onEditSub, onDeleteSub, onClose }) {
  const [showForm, setShowForm] = useState(false)
  const [editingIdx, setEditingIdx] = useState(null)
  const emptyForm = () => ({ tenNcc:'', loaiHd:'', dot:'', ngayKyHd:'', ngayTamUng:'', ngayGuiPcu:'', ngayPcuTra:'', ngayVeDuKienBatDau:'', ngayVeDuKienKetThuc:'', dotNhapTay:'', ngayTheoNhuCauBch:'', ngayVeThucTe:'', khoiLuongNhapTay:'', tenChuyenVienKqlvt:'', tenCvpcuThucHien:'', ghiChu:'' })
  const [form, setForm] = useState(emptyForm())
  const set = (k, v) => setForm(p => ({...p, [k]: v}))

  const openNew = () => { setForm(emptyForm()); setEditingIdx(null); setShowForm(true) }
  const openEdit = (idx) => { setForm({...subRows[idx]}); setEditingIdx(idx); setShowForm(true) }
  const cancel = () => { setShowForm(false); setEditingIdx(null) }
  const save = () => {
    if (editingIdx !== null) onEditSub(editingIdx, form)
    else onAddSub(form)
    setShowForm(false); setEditingIdx(null)
  }

  const parentIdx = parentRow._mainIdx
  const inputCls = "w-full px-2 py-1 border border-slate-200 rounded-lg text-xs outline-none focus:border-royal-400 focus:ring-1 focus:ring-royal-100 bg-white"
  const lbl = "block text-[10px] font-bold text-slate-500 mb-0.5 uppercase tracking-wide"

  return (
    <tr className="bg-slate-50/80">
      <td colSpan={100} className="px-0 py-0">
        <div className="border-l-4 border-royal-400 bg-white mx-4 my-2 rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-royal-700 to-royal-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center text-[10px] font-black text-white">{parentIdx}</div>
              <span className="text-white font-bold text-sm">Dòng phụ #{parentIdx}: {parentRow.tenVattu || '—'}</span>
              <span className="text-royal-200 text-xs">({subRows.length} dòng phụ)</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={openNew} className="flex items-center gap-1.5 px-3 h-7 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all">
                <Plus className="w-3.5 h-3.5" />Thêm dòng phụ
              </button>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form nhập */}
          {showForm && (
            <div className="border-b border-slate-200 bg-blue-50/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-black text-royal-700 uppercase tracking-wide">
                  {editingIdx !== null ? `✎ Sửa dòng phụ ${parentIdx}.${editingIdx+1}` : `+ Thêm dòng phụ ${parentIdx}.${subRows.length+1}`}
                </span>
              </div>
              <div className="space-y-3">
                {/* Nhà cung cấp */}
                <div className="rounded-xl border border-royal-200 overflow-hidden">
                  <div className="bg-royal-600 px-3 py-1.5 text-white font-bold text-xs">🏢 Nhà cung cấp & Hợp đồng</div>
                  <div className="p-3 grid grid-cols-6 gap-2">
                    <div className="col-span-2"><label className={lbl}>Tên NCC</label><input type="text" value={form.tenNcc} onChange={e => set('tenNcc',e.target.value)} placeholder="Nhà cung cấp..." className={inputCls} /></div>
                    <div><label className={lbl}>Loại HĐ</label>
                      <select value={form.loaiHd} onChange={e => set('loaiHd',e.target.value)} className={inputCls}>
                        <option value="">-- Chọn --</option>
                        {LOAI_HOP_DONG.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div><label className={lbl}>Đợt</label><input type="text" value={form.dot} onChange={e => set('dot',e.target.value)} placeholder="Đợt 1..." className={inputCls} /></div>
                    <div><label className={lbl}>Ngày ký HĐ</label><DateInput value={form.ngayKyHd} onChange={v => set('ngayKyHd',v)} className="w-full" /></div>
                    <div><label className={lbl}>Ngày tạm ứng</label><DateInput value={form.ngayTamUng} onChange={v => set('ngayTamUng',v)} className="w-full" /></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* PCU */}
                  <div className="rounded-xl border border-blue-200 overflow-hidden">
                    <div className="bg-blue-600 px-3 py-1.5 text-white font-bold text-xs">📋 Thông tin PCU</div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                      <div><label className={lbl}>Ngày gửi PCU</label><DateInput value={form.ngayGuiPcu} onChange={v => set('ngayGuiPcu',v)} className="w-full" /></div>
                      <div><label className={lbl}>Ngày PCU trả</label><DateInput value={form.ngayPcuTra} onChange={v => set('ngayPcuTra',v)} className="w-full" /></div>
                    </div>
                  </div>
                  {/* Thực tế */}
                  <div className="rounded-xl border border-teal-200 overflow-hidden">
                    <div className="bg-teal-600 px-3 py-1.5 text-white font-bold text-xs">✅ Thực tế & Kết quả</div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                      <div><label className={lbl}>Ngày về TT</label><DateInput value={form.ngayVeThucTe} onChange={v => set('ngayVeThucTe',v)} className="w-full" /></div>
                      <div><label className={lbl}>KL thực tế</label><input type="text" value={form.khoiLuongNhapTay} onChange={e => set('khoiLuongNhapTay',e.target.value)} placeholder="KL..." className={inputCls} /></div>
                    </div>
                  </div>
                </div>
                {/* Kế hoạch */}
                <div className="rounded-xl border border-emerald-200 overflow-hidden">
                  <div className="bg-emerald-600 px-3 py-1.5 text-white font-bold text-xs">📅 Kế hoạch về hàng</div>
                  <div className="p-3 grid grid-cols-4 gap-2">
                    <div><label className={lbl}>DK Bắt đầu <span className="text-rose-300">*</span></label><DateInput value={form.ngayVeDuKienBatDau} onChange={v => set('ngayVeDuKienBatDau',v)} className="w-full" /></div>
                    <div><label className={lbl}>DK Kết thúc <span className="text-rose-300">*</span></label><DateInput value={form.ngayVeDuKienKetThuc} onChange={v => set('ngayVeDuKienKetThuc',v)} className="w-full" /></div>
                    <div><label className={lbl}>Đợt (nhập tay)</label><input type="text" value={form.dotNhapTay} onChange={e => set('dotNhapTay',e.target.value)} placeholder="Đợt..." className={inputCls} /></div>
                    <div><label className={lbl}>Ngày NC BCH</label><DateInput value={form.ngayTheoNhuCauBch} onChange={v => set('ngayTheoNhuCauBch',v)} className="w-full" /></div>
                  </div>
                </div>
                {/* Phân chia Ghi chú */}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-600 px-3 py-1.5 text-white font-bold text-xs">👤 Phân chia & Ghi chú</div>
                  <div className="p-3 grid grid-cols-3 gap-2">
                    <div><label className={lbl}>CV K.QLVT</label><input type="text" value={form.tenChuyenVienKqlvt} onChange={e => set('tenChuyenVienKqlvt',e.target.value)} placeholder="Tên CV..." className={inputCls} /></div>
                    <div><label className={lbl}>CVPCU thực hiện</label><input type="text" value={form.tenCvpcuThucHien} onChange={e => set('tenCvpcuThucHien',e.target.value)} placeholder="Tên CVPCU..." className={inputCls} /></div>
                    <div><label className={lbl}>Ghi chú</label><input type="text" value={form.ghiChu} onChange={e => set('ghiChu',e.target.value)} placeholder="Ghi chú..." className={inputCls} /></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={cancel} className="px-4 h-8 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-all">Hủy</button>
                <button onClick={save} className="flex items-center gap-1.5 px-4 h-8 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95">
                  <Save className="w-3.5 h-3.5" />{editingIdx !== null ? 'Lưu thay đổi' : 'Thêm dòng phụ'}
                </button>
              </div>
            </div>
          )}

          {/* Sub rows list */}
          {subRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" style={{fontSize:'12px'}}>
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    {['STT','Nhà cung cấp','Loại HĐ / Đợt','Ngày gửi PCU','PCU trả','DK Bắt đầu','DK Kết thúc','Về TT','KL TT','CV K.QLVT','Ghi chú','Thao tác'].map(h => (
                      <th key={h} className="px-3 py-2 font-bold text-slate-600 text-center border-r border-slate-200 last:border-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subRows.map((sub, idx) => (
                    <tr key={sub.id||idx} className="hover:bg-royal-50/40 transition-colors group">
                      <td className="px-3 py-2 text-center font-mono font-bold text-royal-600 border-r border-slate-100 whitespace-nowrap">{parentIdx}.{idx+1}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800 border-r border-slate-100"><div className="max-w-[140px] truncate" title={sub.tenNcc}>{sub.tenNcc||'—'}</div></td>
                      <td className="px-3 py-2 border-r border-slate-100 text-slate-700">
                        <div>{sub.loaiHd||'—'}</div>
                        {sub.dot && <div className="text-[10px] text-slate-400">Đợt: {sub.dot}</div>}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600 border-r border-slate-100 font-mono whitespace-nowrap">{sub.ngayGuiPcu||'—'}</td>
                      <td className="px-3 py-2 text-center border-r border-slate-100 font-mono whitespace-nowrap">
                        {sub.ngayPcuTra ? <span className="text-emerald-600 font-semibold">{sub.ngayPcuTra}</span> : '—'}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600 border-r border-slate-100 font-mono whitespace-nowrap">
                        {sub.ngayVeDuKienBatDau||<span className="text-rose-400 italic text-[10px]">Chưa nhập</span>}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600 border-r border-slate-100 font-mono whitespace-nowrap">
                        {sub.ngayVeDuKienKetThuc||<span className="text-rose-400 italic text-[10px]">Chưa nhập</span>}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-slate-100 font-mono whitespace-nowrap">
                        {sub.ngayVeThucTe ? <span className="text-emerald-600 font-semibold">{sub.ngayVeThucTe}</span> : '—'}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-slate-700 border-r border-slate-100 font-mono">{sub.khoiLuongNhapTay||'—'}</td>
                      <td className="px-3 py-2 text-slate-700 border-r border-slate-100"><div className="max-w-[100px] truncate" title={sub.tenChuyenVienKqlvt}>{sub.tenChuyenVienKqlvt||'—'}</div></td>
                      <td className="px-3 py-2 text-slate-500 border-r border-slate-100"><div className="max-w-[130px] truncate" title={sub.ghiChu}>{sub.ghiChu||'—'}</div></td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEdit(idx)} className="w-6 h-6 flex items-center justify-center bg-royal-100 hover:bg-royal-200 text-royal-700 rounded-md transition-all" title="Sửa"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => onDeleteSub(idx)} className="w-6 h-6 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-md transition-all" title="Xóa"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !showForm && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <Plus className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-medium">Chưa có dòng phụ</p>
              <p className="text-xs">Nhấn "Thêm dòng phụ" để thêm thông tin NCC, PCU, kế hoạch...</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    'Đã xử lý': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
    'Quá hạn':  { cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-400' },
    'Chờ xử lý':{ cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  }
  const c = cfg[status] || { cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${c.cls} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />{status}
    </span>
  )
}

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 opacity-25" />
  if (sortDir === 'asc') return <ChevronUp className="w-3 h-3 text-blue-200" />
  return <ChevronDown className="w-3 h-3 text-blue-200" />
}

const MAIN_COLS = [
  { key:'stt',             label:'STT',           width:50,  center:true },
  { key:'expand',          label:'',              width:36,  center:true },
  { key:'maVattu',         label:'Mã Vật tư',     width:110 },
  { key:'tenVattu',        label:'Tên vật tư',    width:200 },
  { key:'khoiThiCong',     label:'Khối TC',       width:120, center:true },
  { key:'projectName',     label:'Dự án',         width:180 },
  { key:'dvt',             label:'Đvt',           width:70,  center:true },
  { key:'nhom',            label:'Nhóm',          width:120 },
  { key:'soLuongGiaoThuc', label:'SL Giao thực',  width:110, center:true },
  { key:'khoiLuong',       label:'Khối lượng',    width:100, center:true },
  { key:'quyCachKyThuat',  label:'Quy cách KT',   width:200 },
  { key:'trangThai',       label:'Trạng thái',    width:120, center:true, computed:true },
  { key:'subCount',        label:'Dòng phụ',      width:80,  center:true, computed:true },
  { key:'actions',         label:'Thao tác',      width:80,  center:true },
]

// ── Main Export ───────────────────────────────────────────────────
export default function DataTable({ rows, projects=[], onEdit, onDelete, onUpdateSubRows, pcuDays, currentUser, sortKey, sortDir, onSort, showAddForm, onAddFormSave, onAddFormCancel, selectedProjectId }) {
  const [expandedRows, setExpandedRows] = useState({})
  const [vattuList, setVattuList] = useState([])

  useEffect(() => {
    async function load() {
      const supabase = getSupabase()
      if (supabase) {
        try { const { data } = await supabase.from(TABLES.DM_VATTU).select('*'); if (data) { setVattuList(data); return } } catch (_) {}
      }
      try { const local = localStorage.getItem(CATALOG_VATTU_KEY); if (local) setVattuList(JSON.parse(local)) } catch (_) {}
    }
    load()
  }, [])

  const getProjectInfo = (id) => {
    if (!id) return { label:'Chưa phân bổ', khoiTen:'—', khoiVietTat:'' }
    const p = projects.find(proj => proj.id === id)
    if (!p) return { label:'Chưa phân bổ', khoiTen:'—', khoiVietTat:'' }
    return { label: `${p.khoiVietTat ? p.khoiVietTat+'. ' : ''}${p.ten}`, khoiTen: p.khoiTen||'—', khoiVietTat: p.khoiVietTat||'' }
  }

  const toggleExpand = (id) => setExpandedRows(p => ({...p, [id]: !p[id]}))

  const handleAddSub = (rowId, formData) => {
    const row = rows.find(r => r.id === rowId)
    if (!row) return
    const updated = [...(row.subRows||[]), { id:genId(), ...formData, parentId:rowId, createdAt:new Date().toISOString() }]
    onUpdateSubRows(rowId, updated)
  }
  const handleEditSub = (rowId, idx, formData) => {
    const row = rows.find(r => r.id === rowId)
    if (!row) return
    onUpdateSubRows(rowId, (row.subRows||[]).map((s,i) => i===idx ? {...s,...formData} : s))
  }
  const handleDeleteSub = (rowId, idx) => {
    if (!confirm('Xóa dòng phụ này?')) return
    const row = rows.find(r => r.id === rowId)
    if (!row) return
    onUpdateSubRows(rowId, (row.subRows||[]).filter((_,i) => i!==idx))
  }

  const thCls = "px-2 py-2.5 text-center text-[13px] font-bold text-royal-900 tracking-wide whitespace-nowrap border-r border-royal-200 last:border-r-0 cursor-pointer select-none transition-colors hover:bg-royal-200/50"

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <table className="border-collapse min-w-max w-full text-sm">
        <thead className="sticky-header">
          <tr className="bg-royal-100 backdrop-blur-sm shadow-sm">
            {MAIN_COLS.map(col => (
              <th key={col.key} className={thCls} style={{minWidth:col.width, width:col.width}}
                onClick={() => !col.computed && !['actions','expand','subCount','stt'].includes(col.key) && onSort(col.key)}>
                <div className="flex items-center justify-center gap-1">
                  <span>{col.label}</span>
                  {!col.computed && !['actions','stt','expand'].includes(col.key) && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showAddForm && (
            <InlineAddMainForm projectId={selectedProjectId} projects={projects} vattuList={vattuList}
              onSave={onAddFormSave} onCancel={onAddFormCancel} currentUser={currentUser} />
          )}

          {rows.length === 0 && !showAddForm ? (
            <tr>
              <td colSpan={MAIN_COLS.length} className="text-center py-20 text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-royal-50 border-2 border-royal-100 rounded-2xl flex items-center justify-center"><AlertCircle className="w-8 h-8 text-royal-300" /></div>
                  <div><p className="font-bold text-slate-500 text-base">Chưa có dữ liệu</p><p className="text-sm text-slate-400 mt-1">Nhấn &quot;+ Thêm mới&quot; để bắt đầu hoặc Import Excel</p></div>
                </div>
              </td>
            </tr>
          ) : rows.map((row, idx) => {
            const info = getProjectInfo(row.projectId)
            const isEven = idx % 2 === 0
            const isExpanded = expandedRows[row.id]
            const subRows = row.subRows || []
            const hasThucTe = subRows.some(s => s.ngayVeThucTe)
            const displayStatus = hasThucTe ? 'Đã xử lý' : row.trangThai

            return (
              <React.Fragment key={row.id}>
                <tr className={`group transition-colors hover:bg-royal-50/70 ${isEven ? 'bg-white' : 'bg-slate-50/60'} ${isExpanded ? 'border-l-4 border-l-royal-400' : ''}`}>
                  <td className="px-2 py-2 text-center text-slate-400 font-mono font-bold border-b border-slate-100 text-[12px]">{idx+1}</td>
                  <td className="px-1 py-2 text-center border-b border-slate-100">
                    <button onClick={() => toggleExpand(row.id)} title={isExpanded ? 'Thu gọn' : 'Mở dòng phụ'}
                      className={`w-6 h-6 flex items-center justify-center rounded-md transition-all mx-auto font-bold text-xs
                        ${isExpanded ? 'bg-royal-600 text-white shadow-sm' : 'bg-royal-100 hover:bg-royal-200 text-royal-600'}
                        ${subRows.length > 0 ? 'ring-1 ring-royal-400' : ''}`}>
                      {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="px-2 py-2 border-b border-slate-100 whitespace-nowrap">
                    <span className="font-mono font-bold text-royal-600 bg-royal-50 px-1.5 py-0.5 rounded text-[12px]">{row.maVattu||'—'}</span>
                  </td>
                  <td className="px-2 py-2 font-medium text-slate-800 border-b border-slate-100"><div className="max-w-[190px] truncate" title={row.tenVattu}>{row.tenVattu||'—'}</div></td>
                  <td className="px-2 py-2 text-center border-b border-slate-100 text-[12px]">
                    {info.khoiVietTat ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-royal-100 text-royal-700 font-bold text-[11px] border border-royal-200 whitespace-nowrap">
                        {info.khoiVietTat}<span className="text-slate-400 font-normal">·</span>
                        <span className="max-w-[70px] truncate text-slate-600 font-normal" title={info.khoiTen}>{info.khoiTen}</span>
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-2 py-2 border-b border-slate-100 text-[12px]">
                    <div className="max-w-[170px] truncate flex items-center gap-1" title={info.label}>
                      {info.khoiVietTat && <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-700 text-white">{info.khoiVietTat}.</span>}
                      <span className="truncate text-slate-600 italic">{info.label.replace(`${info.khoiVietTat}. `, '')}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-slate-500 border-b border-slate-100 whitespace-nowrap">{row.dvt||'—'}</td>
                  <td className="px-2 py-2 border-b border-slate-100 whitespace-nowrap">
                    {row.nhom ? <span className="px-1.5 py-0.5 bg-royal-100 text-royal-700 rounded text-[12px] font-semibold">{row.nhom}</span> : '—'}
                  </td>
                  <td className="px-2 py-2 text-center font-semibold text-slate-700 border-b border-slate-100 font-mono text-[12px]">{row.soLuongGiaoThuc||'—'}</td>
                  <td className="px-2 py-2 text-center font-semibold text-slate-700 border-b border-slate-100 font-mono text-[12px]">{row.khoiLuong||'—'}</td>
                  <td className="px-2 py-2 text-slate-500 border-b border-slate-100"><div className="max-w-[190px] truncate text-[12px]" title={row.quyCachKyThuat}>{row.quyCachKyThuat||'—'}</div></td>
                  <td className="px-2 py-2 text-center border-b border-slate-100 whitespace-nowrap"><StatusBadge status={displayStatus} /></td>
                  <td className="px-2 py-2 text-center border-b border-slate-100">
                    <button onClick={() => toggleExpand(row.id)}
                      className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-all
                        ${subRows.length > 0 ? 'bg-royal-600 text-white border-royal-500 hover:bg-royal-700' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`}>
                      {subRows.length > 0 && <span>{subRows.length}</span>}
                      {isExpanded ? <Minus className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                    </button>
                  </td>
                  <td className="px-2 py-2 text-center border-b border-slate-100 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(row)} className="w-6 h-6 flex items-center justify-center bg-royal-100 hover:bg-royal-200 text-royal-700 rounded-md transition-all shadow-sm" title="Sửa"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => onDelete(row.id)} className="w-6 h-6 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-md transition-all shadow-sm" title="Xóa"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <SubRowPanel
                    parentRow={{...row, _mainIdx: idx+1}}
                    subRows={subRows}
                    onAddSub={(formData) => handleAddSub(row.id, formData)}
                    onEditSub={(subIdx, formData) => handleEditSub(row.id, subIdx, formData)}
                    onDeleteSub={(subIdx) => handleDeleteSub(row.id, subIdx)}
                    onClose={() => toggleExpand(row.id)}
                    projects={projects}
                  />
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
