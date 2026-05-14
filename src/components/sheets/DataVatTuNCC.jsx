import React, { useState, useMemo, useEffect } from 'react'
import ConfirmModal from '../ConfirmModal'
import { Database, Package, Truck, Upload, Download, Search, Trash2, AlertCircle, Pencil, X, Save, CheckCircle, SkipForward, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { CATALOG_VATTU_KEY, CATALOG_NCC_KEY, TABLES } from '../../constants'
import { genId, toCamelCase, toSnakeCase } from '../../utils'
import { getSupabase, fetchAll } from '../../lib/supabase'

async function loadXLSX() { return import('xlsx') }

// ── Modal Báo Lỗi Sai Form ─────────────────────────────────────
function ModalSaiForm({ loai, missingHeaders, fileHeaders, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-white" />
            <span className="text-white font-black text-sm">File Excel không đúng định dạng</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-700 text-sm">File upload không khớp với form chuẩn của <span className="uppercase">{loai}</span></p>
              <p className="text-rose-600 text-xs mt-1">Vui lòng kiểm tra lại file và đảm bảo đúng định dạng tiêu đề cột theo yêu cầu.</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Tiêu đề bị thiếu trong file:</p>
            <div className="flex flex-wrap gap-2">
              {missingHeaders.map(h => (
                <span key={h} className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200">✗ {h}</span>
              ))}
            </div>
          </div>
          {fileHeaders.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Tiêu đề hệ thống nhận được trong file:</p>
              <div className="flex flex-wrap gap-2">
                {fileHeaders.map(h => (
                  <span key={h} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs border border-slate-200">{h}</span>
                ))}
              </div>
            </div>
          )}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            💡 <strong>Gợi ý:</strong> Dùng chức năng <strong>"Xuất Excel"</strong> để tải file mẫu đúng định dạng, sau đó điền dữ liệu và import lại.
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all">Đã hiểu, đóng lại</button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Sửa Vật tư ───────────────────────────────────────────
function ModalSuaVattu({ item, onClose, onSave }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])
  const [form, setForm] = useState({ ...item })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const fields = [
    { key: 'ma_vattu_sap', label: 'Mã Vật Tư (Mã SAP)' },
    { key: 'ma_nhom_vattu', label: 'Mã nhóm Vật tư' },
    { key: 'ten_nhom_vattu', label: 'Tên nhóm Vật tư' },
    { key: 'ten_vattu', label: 'Tên vật tư' },
    { key: 'dvt', label: 'Đơn vị tính' },
    { key: 'loai_vattu', label: 'Loại vật tư' },
    { key: 'thong_so_ky_thuat', label: 'Thông số kỹ thuật', multiline: true },
    { key: 'ghi_chu', label: 'Ghi chú', multiline: true },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-royal-700 to-royal-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">Chỉnh sửa Vật tư</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{f.label}</label>
              {f.multiline
                ? <textarea rows={3} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 resize-none" />
                : <input type="text" value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100" />
              }
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">Hủy</button>
          <button onClick={() => onSave(form)} className="flex items-center gap-2 px-4 py-2 text-sm bg-royal-600 text-white rounded-lg font-bold hover:bg-royal-700 transition-all">
            <Save className="w-3.5 h-3.5" />Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Sửa NCC ──────────────────────────────────────────────
function ModalSuaNcc({ item, onClose, onSave }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])
  const [form, setForm] = useState({ ...item })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const fields = [
    { key: 'nha_cung_cap', label: 'Nhà cung cấp' },
    { key: 'ma_so_thue', label: 'Mã số thuế' },
    { key: 'ma_vendor_sap', label: 'Mã vendor/Mã SAP' },
    { key: 'dia_chi', label: 'Địa chỉ', multiline: true },
    { key: 'nguoi_dai_dien', label: 'Người đại diện' },
    { key: 'so_dien_thoai', label: 'Số điện thoại' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-royal-700 to-royal-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">Chỉnh sửa Nhà cung cấp</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-slate-500 mb-1">{f.label}</label>
              {f.multiline
                ? <textarea rows={3} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 resize-none" />
                : <input type="text" value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100" />
              }
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">Hủy</button>
          <button onClick={() => onSave(form)} className="flex items-center gap-2 px-4 py-2 text-sm bg-royal-600 text-white rounded-lg font-bold hover:bg-royal-700 transition-all">
            <Save className="w-3.5 h-3.5" />Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Preview Import Vật tư ────────────────────────────────
function ModalPreviewVattu({ newItems, skipped, total, onConfirm, onCancel }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCancel])
  const cols = ['ma_vattu_sap','ma_nhom_vattu','ten_nhom_vattu','ten_vattu','dvt','loai_vattu','thong_so_ky_thuat','ghi_chu']
  const labels = ['Mã Vật Tư (SAP)','Mã nhóm','Tên nhóm','Tên vật tư','ĐVT','Loại vật tư','Thông số kỹ thuật','Ghi chú']
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden flex flex-col" style={{maxHeight:'90vh'}}>
        <div className="bg-gradient-to-r from-royal-700 to-royal-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white font-black text-sm">Xem trước dữ liệu Import — Danh mục Vật tư</span>
          </div>
          <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-shrink-0 px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-semibold">
            <CheckCircle className="w-4 h-4" /> Tổng trong file: <strong>{total}</strong> dòng
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold">
            <Save className="w-4 h-4" /> Sẽ thêm mới: <strong>{newItems.length}</strong> dòng
          </span>
          {skipped > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 font-semibold">
              <SkipForward className="w-4 h-4" /> Bỏ qua trùng Mã SAP: <strong>{skipped}</strong> / {total} dòng
            </span>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {newItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="font-semibold text-amber-600">Tất cả dòng đều trùng Mã SAP — không có dữ liệu mới để thêm</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" style={{fontSize:'12px'}}>
              <thead className="sticky top-0 bg-royal-100 border-b-2 border-slate-400 z-10">
                <tr>
                  <th className="px-3 py-2 font-bold text-royal-900 text-center w-10 border-r border-slate-300">Stt</th>
                  {labels.map((l,i) => <th key={i} className="px-3 py-2 font-bold text-royal-900 border-r border-slate-300 text-center">{l}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {newItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-royal-50/40">
                    <td className="px-3 py-2 text-center text-slate-500 border-r border-slate-200">{idx+1}</td>
                    {cols.map(c => (
                      <td key={c} className="px-3 py-2 text-slate-800 border-r border-slate-200 max-w-[160px] truncate" title={item[c]}>{item[c] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button onClick={onCancel} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-semibold">Huỷ bỏ</button>
          <button onClick={onConfirm} disabled={newItems.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-royal-600 text-white rounded-lg font-bold hover:bg-royal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Save className="w-3.5 h-3.5" />Lưu {newItems.length} dòng vào hệ thống
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Preview Import NCC ────────────────────────────────────
function ModalPreviewNcc({ newItems, skipped, total, onConfirm, onCancel }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onCancel])
  const cols = ['nha_cung_cap','ma_so_thue','ma_vendor_sap','dia_chi','nguoi_dai_dien','so_dien_thoai']
  const labels = ['Nhà cung cấp','Mã số thuế','Mã vendor/SAP','Địa chỉ','Người đại diện','Số điện thoại']
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col" style={{maxHeight:'90vh'}}>
        <div className="bg-gradient-to-r from-royal-700 to-royal-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white font-black text-sm">Xem trước dữ liệu Import — Danh mục NCC</span>
          </div>
          <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-shrink-0 px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 items-center text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-semibold">
            <CheckCircle className="w-4 h-4" /> Tổng trong file: <strong>{total}</strong> dòng
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold">
            <Save className="w-4 h-4" /> Sẽ thêm mới: <strong>{newItems.length}</strong> dòng
          </span>
          {skipped > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 font-semibold">
              <SkipForward className="w-4 h-4" /> Bỏ qua trùng Mã số thuế / SAP: <strong>{skipped}</strong> / {total} dòng
            </span>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          {newItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="font-semibold text-amber-600">Tất cả đều trùng Mã số thuế hoặc Mã SAP — không có dữ liệu mới để thêm</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse" style={{fontSize:'12px'}}>
              <thead className="sticky top-0 bg-royal-100 border-b-2 border-slate-400 z-10">
                <tr>
                  <th className="px-3 py-2 font-bold text-royal-900 text-center w-10 border-r border-slate-300">Stt</th>
                  {labels.map((l,i) => <th key={i} className="px-3 py-2 font-bold text-royal-900 border-r border-slate-300 text-center">{l}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {newItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-royal-50/40">
                    <td className="px-3 py-2 text-center text-slate-500 border-r border-slate-200">{idx+1}</td>
                    {cols.map(c => (
                      <td key={c} className="px-3 py-2 text-slate-800 border-r border-slate-200 max-w-[180px] truncate" title={item[c]}>{item[c] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button onClick={onCancel} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-semibold">Huỷ bỏ</button>
          <button onClick={onConfirm} disabled={newItems.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-royal-600 text-white rounded-lg font-bold hover:bg-royal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <Save className="w-3.5 h-3.5" />Lưu {newItems.length} dòng vào hệ thống
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Toolbar & Pagination Components ───────────────────────────
const Toolbar = ({ value, onSearch, placeholder, onImport, onExport, id }) => {
  const [localValue, setLocalValue] = useState(value || '')
  
  // Only sync if value is reset from outside
  useEffect(() => {
    if (value === '' && localValue !== '') {
      setLocalValue('')
    }
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localValue)
    }, 400)
    return () => clearTimeout(timer)
  }, [localValue, onSearch])

  return (
    <div className="bg-white px-6 py-4 border-b border-royal-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={localValue} 
            onChange={e => setLocalValue(e.target.value)} 
            placeholder={placeholder}
            className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold outline-none focus:border-royal-400 focus:ring-4 focus:ring-royal-100/50 transition-all shadow-inner" 
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-6 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[14px] cursor-pointer shadow-lg transition-all active:scale-95 uppercase tracking-tight">
            <Upload className="w-5 h-5" /><span>Import</span>
            <input id={id} type="file" onChange={onImport} className="hidden" />
          </label>
          <button onClick={onExport} className="flex items-center gap-2 px-6 h-11 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-[14px] shadow-lg transition-all active:scale-95 uppercase tracking-tight">
            <Download className="w-5 h-5" /><span>Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const PaginationBar = ({ total, currentPage, onPageChange, pageSize, setPageSize }) => {
  const totalPages = Math.ceil(total / pageSize)
  if (total === 0) return null
  return (
    <div className="bg-slate-50 border-t border-[#010b17] px-6 py-3 flex items-center justify-between shrink-0 rounded-b-2xl">
      <div className="flex items-center gap-6">
        <div className="text-[14px] text-slate-500">
          Hiển thị <span className="font-bold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-bold text-slate-700">{Math.min(currentPage * pageSize, total)}</span> trong <span className="font-bold text-slate-700">{total}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-slate-500">Dòng mỗi trang:</span>
          <select 
            value={pageSize} 
            onChange={e => setPageSize(Number(e.target.value))}
            className="bg-white border border-[#010b17] rounded-lg px-2 py-1 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          >
            {[20, 50, 100, 200, 500].map(sz => (
              <option key={sz} value={sz}>{sz}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button disabled={currentPage === 1} onClick={() => onPageChange(1)} className="p-2 hover:bg-white hover:border-[#010b17] border border-transparent rounded-lg disabled:opacity-30 transition-all"><ChevronsLeft className="w-5 h-5 text-slate-600" /></button>
        <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="p-2 hover:bg-white hover:border-[#010b17] border border-transparent rounded-lg disabled:opacity-30 transition-all"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
        <div className="flex items-center gap-2 mx-4">
          <span className="text-[14px] text-slate-500">Trang</span>
          <input type="number" value={currentPage} onChange={e => { const v = Number(e.target.value); if (v >= 1 && v <= totalPages) onPageChange(v) }}
            className="w-14 text-center bg-white border border-[#010b17] rounded-lg py-1 text-[14px] font-black focus:outline-none focus:ring-2 focus:ring-royal-500/20" />
          <span className="text-[14px] text-slate-500">/ {totalPages}</span>
        </div>
        <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="p-2 hover:bg-white hover:border-[#010b17] border border-transparent rounded-lg disabled:opacity-30 transition-all"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
        <button disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} className="p-2 hover:bg-white hover:border-[#010b17] border border-transparent rounded-lg disabled:opacity-30 transition-all"><ChevronsRight className="w-5 h-5 text-slate-600" /></button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function DataVatTuNCC({ branding, onOpenSidebar }) {
  const [activeTab, setActiveTab] = useState('vattu')
  const [isLoading, setIsLoading] = useState(false)

  // ── Phân trang chung
  const [pageSize, setPageSize] = useState(50)
  const [vattuPage, setVattuPage] = useState(1)
  const [nccPage, setNccPage] = useState(1)

  // ── Vật tư state
  const [vattuList, setVattuList] = useState([])
  const [vattuSearch, setVattuSearch] = useState('')
  const [editVattu, setEditVattu] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [previewVattu, setPreviewVattu] = useState(null)
  const [saiForm, setSaiForm] = useState(null)

  // ── NCC state
  const [nccList, setNccList] = useState([])
  const [nccSearch, setNccSearch] = useState('')
  const [editNcc, setEditNcc] = useState(null)
  const [previewNcc, setPreviewNcc] = useState(null)
  const [alertInfo, setAlertInfo] = useState(null)

  const showAlert = (title, message, type = 'danger', icon = AlertCircle) => {
    setAlertInfo({ title, message, type, icon })
  }

  useEffect(() => {
    let chVattu = null
    let chNcc = null
    async function fetchData() {
      setIsLoading(true)
      const supabase = getSupabase()
      if (supabase) {
        try {
          const [vattuData, nccData] = await Promise.all([
            fetchAll(supabase, TABLES.DM_VATTU),
            fetchAll(supabase, TABLES.DM_NCC)
          ])
          setVattuList(vattuData)
          setNccList(nccData)
        } catch (err) { console.error(err) }
        setIsLoading(false)
        chVattu = supabase.channel(`vattu-rt-${Date.now()}`).on('postgres_changes', { event: '*', schema: 'public', table: TABLES.DM_VATTU }, async () => {
          try {
            const data = await fetchAll(supabase, TABLES.DM_VATTU)
            setVattuList(data)
          } catch (err) { console.error(err) }
        }).subscribe()
        chNcc = supabase.channel(`ncc-rt-${Date.now()}`).on('postgres_changes', { event: '*', schema: 'public', table: TABLES.DM_NCC }, async () => {
          try {
            const data = await fetchAll(supabase, TABLES.DM_NCC)
            setNccList(data)
          } catch (err) { console.error(err) }
        }).subscribe()
        return
      }
      try {
        const v = localStorage.getItem(CATALOG_VATTU_KEY); if (v) setVattuList(JSON.parse(v))
        const n = localStorage.getItem(CATALOG_NCC_KEY); if (n) setNccList(JSON.parse(n))
      } catch {}
      setIsLoading(false)
    }
    fetchData()
    return () => {
      const supabase = getSupabase()
      if (chVattu && supabase) supabase.removeChannel(chVattu)
      if (chNcc && supabase) supabase.removeChannel(chNcc)
    }
  }, [])

  useEffect(() => { localStorage.setItem(CATALOG_VATTU_KEY, JSON.stringify(vattuList)) }, [vattuList])
  useEffect(() => { localStorage.setItem(CATALOG_NCC_KEY, JSON.stringify(nccList)) }, [nccList])

  const filteredVattu = useMemo(() => {
    if (!vattuSearch.trim()) return vattuList
    const q = vattuSearch.toLowerCase()
    return vattuList.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q)))
  }, [vattuList, vattuSearch])

  const paginatedVattu = useMemo(() => {
    const start = (vattuPage - 1) * pageSize
    return filteredVattu.slice(start, start + pageSize)
  }, [filteredVattu, vattuPage, pageSize])

  const filteredNcc = useMemo(() => {
    if (!nccSearch.trim()) return nccList
    const q = nccSearch.toLowerCase()
    return nccList.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q)))
  }, [nccList, nccSearch])

  const paginatedNcc = useMemo(() => {
    const start = (nccPage - 1) * pageSize
    return filteredNcc.slice(start, start + pageSize)
  }, [filteredNcc, nccPage, pageSize])

  // Reset trang khi search hoặc change size
  useEffect(() => { setVattuPage(1) }, [vattuSearch, pageSize])
  useEffect(() => { setNccPage(1) }, [nccSearch, pageSize])

  const handleImportVattu = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 1) { showAlert('Dữ liệu trống', 'File không có nội dung.'); e.target.value = ''; return }
      const headers = raw[0].map(h => String(h).trim())
      const REQUIRED = ['Mã Vật Tư (SAP)', 'Mã nhóm', 'Tên nhóm', 'Tên vật tư', 'ĐVT', 'Loại vật tư', 'Thông số kỹ thuật', 'Ghi chú']
      const missing = REQUIRED.filter(h => !headers.includes(h))
      if (missing.length > 0) { setSaiForm({ loai: 'Vật tư', missingHeaders: missing, fileHeaders: headers }); e.target.value = ''; return }
      const map = { 'Mã Vật Tư (SAP)': 'ma_vattu_sap', 'Mã nhóm': 'ma_nhom_vattu', 'Tên nhóm': 'ten_nhom_vattu', 'Tên vật tư': 'ten_vattu', 'ĐVT': 'dvt', 'Loại vật tư': 'loai_vattu', 'Thông số kỹ thuật': 'thong_so_ky_thuat', 'Ghi chú': 'ghi_chu' }
      const colMap = {}; headers.forEach((h, i) => { if (map[h]) colMap[i] = map[h] })
      const all = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => {
        const obj = { id: genId() }; Object.entries(colMap).forEach(([i, k]) => { obj[k] = String(r[i] || '').trim() }); return obj
      })
      const ex = new Set(vattuList.map(i => String(i.ma_vattu_sap || '').trim().toLowerCase()).filter(v => v))
      const fileSAPs = new Set()
      const news = all.filter(item => {
        const sap = String(item.ma_vattu_sap || '').trim().toLowerCase()
        if (!sap) return true
        if (ex.has(sap)) return false
        if (fileSAPs.has(sap)) return false
        fileSAPs.add(sap)
        return true
      })
      setPreviewVattu({ newItems: news, skipped: all.length - news.length, total: all.length })
    } catch (err) { showAlert('Lỗi', 'Không thể đọc file.') }
    e.target.value = ''
  }

  const handleExportVattu = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default || await import('exceljs');
      const { saveAs } = await import('file-saver');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Vật tư');

      const headers = ['Mã Vật Tư (SAP)', 'Mã nhóm', 'Tên nhóm', 'Tên vật tư', 'ĐVT', 'Loại vật tư', 'Thông số kỹ thuật', 'Ghi chú'];
      const headerRow = worksheet.addRow(headers);
      
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F51CC' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      filteredVattu.forEach(i => {
        const row = worksheet.addRow([i.ma_vattu_sap, i.ma_nhom_vattu, i.ten_nhom_vattu, i.ten_vattu, i.dvt, i.loai_vattu, i.thong_so_ky_thuat, i.ghi_chu]);
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
      });

      worksheet.columns = [
        { width: 15 }, { width: 15 }, { width: 20 }, { width: 30 }, { width: 10 }, { width: 15 }, { width: 40 }, { width: 20 }
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `VatTu_${Date.now()}.xlsx`);
    } catch (err) {
      console.error(err);
      showAlert('Lỗi', 'Không thể xuất Excel: ' + err.message);
    }
  }

  const handleSaveVattu = async (u) => {
    const supabase = getSupabase()
    if (supabase) {
      // Tìm mã SAP cũ để phục vụ việc đồng bộ
      const oldItem = vattuList.find(i => i.id === u.id)
      const oldMaSap = oldItem?.ma_vattu_sap

      const { error } = await supabase.from(TABLES.DM_VATTU).update(u).eq('id', u.id)
      if (error) { showAlert('Lỗi', error.message); return }

      // Đồng bộ sang bảng Chi tiết công việc
      // Note: Theo yêu cầu, không đồng bộ quy cách kỹ thuật vì đó là trường nhập tay của chuyên viên
      if (oldMaSap) {
        const syncData = {
          ma_vattu: u.ma_vattu_sap,
          ten_vattu: u.ten_vattu,
          dvt: u.dvt,
          nhom: u.loai_vattu
        }
        const { error: syncError } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .update(syncData)
          .eq('ma_vattu', oldMaSap)
        
        if (syncError) {
          console.error('[Sync] Lỗi đồng bộ sang Chi tiết công việc:', syncError)
        }
      }
    }
    setVattuList(prev => prev.map(i => i.id === u.id ? u : i))
    setEditVattu(null)
  }

  const handleConfirmImportVattu = async () => {
    const supabase = getSupabase()
    if (supabase && previewVattu.newItems.length > 0) {
      const { error } = await supabase.from(TABLES.DM_VATTU).insert(previewVattu.newItems)
      if (error) { showAlert('Lỗi', error.message); return }
    }
    setVattuList(prev => [...prev, ...previewVattu.newItems])
    setPreviewVattu(null)
  }

  const handleImportNcc = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      const headers = raw[0].map(h => String(h).trim())
      const REQUIRED = ['Nhà cung cấp', 'Mã số thuế', 'Mã vendor/Mã SAP', 'Địa chỉ', 'Người đại diện', 'Số điện thoại']
      const missing = REQUIRED.filter(h => !headers.includes(h))
      if (missing.length > 0) { setSaiForm({ loai: 'NCC', missingHeaders: missing, fileHeaders: headers }); e.target.value = ''; return }
      const map = { 'Nhà cung cấp': 'nha_cung_cap', 'Mã số thuế': 'ma_so_thue', 'Mã vendor/Mã SAP': 'ma_vendor_sap', 'Địa chỉ': 'dia_chi', 'Người đại diện': 'nguoi_dai_dien', 'Số điện thoại': 'so_dien_thoai' }
      const colMap = {}; headers.forEach((h, i) => { if (map[h]) colMap[i] = map[h] })
      const all = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => {
        const obj = { id: genId() }; Object.entries(colMap).forEach(([i, k]) => { obj[k] = String(r[i] || '').trim() }); return obj
      })
      
      const exMST = new Set(nccList.map(i => String(i.ma_so_thue || '').trim().toLowerCase()).filter(v => v))
      const exSAP = new Set(nccList.map(i => String(i.ma_vendor_sap || '').trim().toLowerCase()).filter(v => v))
      
      const fileMSTs = new Set()
      const fileSAPs = new Set()
      
      const news = all.filter(item => {
        const mst = String(item.ma_so_thue || '').trim().toLowerCase()
        const sap = String(item.ma_vendor_sap || '').trim().toLowerCase()
        
        // 1. Kiểm tra trùng lặp với dữ liệu đã có trong hệ thống (DB)
        const isDuplicateDB_MST = mst && exMST.has(mst)
        const isDuplicateDB_SAP = sap && exSAP.has(sap)
        
        // 2. Kiểm tra trùng lặp nội bộ ngay trong file Excel đang upload
        const isDuplicateFile_MST = mst && fileMSTs.has(mst)
        const isDuplicateFile_SAP = sap && fileSAPs.has(sap)
        
        if (isDuplicateDB_MST || isDuplicateDB_SAP || isDuplicateFile_MST || isDuplicateFile_SAP) {
          return false
        }
        
        // Đánh dấu để kiểm tra các dòng tiếp theo trong file
        if (mst) fileMSTs.add(mst)
        if (sap) fileSAPs.add(sap)
        
        return true
      })
      setPreviewNcc({ newItems: news, skipped: all.length - news.length, total: all.length })
    } catch (err) { showAlert('Lỗi', 'Không thể đọc file.') }
    e.target.value = ''
  }

  const handleExportNcc = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default || await import('exceljs');
      const { saveAs } = await import('file-saver');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('NCC');

      const headers = ['Nhà cung cấp', 'Mã số thuế', 'Mã vendor/SAP', 'Địa chỉ', 'Người đại diện', 'Số điện thoại'];
      const headerRow = worksheet.addRow(headers);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F51CC' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      filteredNcc.forEach(i => {
        const row = worksheet.addRow([i.nha_cung_cap, i.ma_so_thue, i.ma_vendor_sap, i.dia_chi, i.nguoi_dai_dien, i.so_dien_thoai]);
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
      });

      worksheet.columns = [
        { width: 30 }, { width: 20 }, { width: 20 }, { width: 40 }, { width: 25 }, { width: 20 }
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `NCC_${Date.now()}.xlsx`);
    } catch (err) {
      console.error(err);
      showAlert('Lỗi', 'Không thể xuất Excel: ' + err.message);
    }
  }

  const handleSaveNcc = async (u) => {
    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase.from(TABLES.DM_NCC).update(u).eq('id', u.id)
      if (error) { showAlert('Lỗi', error.message); return }
    }
    setNccList(prev => prev.map(i => i.id === u.id ? u : i))
    setEditNcc(null)
  }

  const handleConfirmImportNcc = async () => {
    const supabase = getSupabase()
    if (supabase && previewNcc.newItems.length > 0) {
      const { error } = await supabase.from(TABLES.DM_NCC).insert(previewNcc.newItems)
      if (error) { showAlert('Lỗi', error.message); return }
    }
    setNccList(prev => [...prev, ...previewNcc.newItems])
    setPreviewNcc(null)
  }

  const performDelete = async () => {
    const { id, type } = confirmDelete
    const supabase = getSupabase()
    if (supabase) {
      const table = type === 'vattu' ? TABLES.DM_VATTU : TABLES.DM_NCC
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) { showAlert('Lỗi', error.message); setConfirmDelete(null); return }
    }
    if (type === 'vattu') setVattuList(p => p.filter(i => i.id !== id))
    else setNccList(p => p.filter(i => i.id !== id))
    setConfirmDelete(null)
  }


  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-royal-50">
      {editVattu && <ModalSuaVattu item={editVattu} onClose={() => setEditVattu(null)} onSave={handleSaveVattu} />}
      {editNcc && <ModalSuaNcc item={editNcc} onClose={() => setEditNcc(null)} onSave={handleSaveNcc} />}
      {saiForm && <ModalSaiForm {...saiForm} onClose={() => setSaiForm(null)} />}
      {previewVattu && <ModalPreviewVattu {...previewVattu} onConfirm={handleConfirmImportVattu} onCancel={() => setPreviewVattu(null)} />}
      {previewNcc && <ModalPreviewNcc {...previewNcc} onConfirm={handleConfirmImportNcc} onCancel={() => setPreviewNcc(null)} />}
      {confirmDelete && <ConfirmModal isOpen title={confirmDelete.title} subtitle="Xóa dữ liệu" message={confirmDelete.message} type="danger" icon={Trash2} onConfirm={performDelete} onClose={() => setConfirmDelete(null)} />}
      {alertInfo && <ConfirmModal isOpen title={alertInfo.title} subtitle="Thông báo" message={alertInfo.message} type={alertInfo.type} icon={alertInfo.icon} onConfirm={() => setAlertInfo(null)} onClose={() => setAlertInfo(null)} confirmText="OK" />}

      {/* Header */}
      <div className="bg-gradient-to-r from-royal-700 to-royal-500 shadow-xl flex items-center h-16 shrink-0 px-0">
        <div onMouseEnter={onOpenSidebar} className="h-full flex items-center justify-center pl-2 pr-4 cursor-pointer">
          <div className={`h-[54px] ${branding?.logoUrl ? 'px-4' : 'w-[54px]'} bg-white rounded-[20px] flex items-center justify-center shadow-lg border-2 border-white/30 z-10 overflow-hidden`}>
            {branding?.logoUrl ? <img src={branding.logoUrl} className="h-12 w-auto" /> : <Database className="w-7 h-7 text-royal-600" />}
          </div>
        </div>
        <div className="px-2">
          <h1 className="text-white font-black text-3xl leading-tight tracking-widest drop-shadow-md uppercase font-roboto">
            DATA VẬT TƯ & NCC
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-royal-100 px-6 pt-2">
        <div className="flex gap-4 justify-center">
          <button onClick={() => setActiveTab('vattu')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'vattu' ? 'border-royal-600 text-royal-700' : 'border-transparent text-slate-400 hover:text-royal-500'}`}>
            <Package className="w-4 h-4" />Vật tư ({vattuList.length})
          </button>
          <button onClick={() => setActiveTab('ncc')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'ncc' ? 'border-royal-600 text-royal-700' : 'border-transparent text-slate-400 hover:text-royal-500'}`}>
            <Truck className="w-4 h-4" />NCC ({nccList.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {isLoading && <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center font-bold">Loading...</div>}
        
        {activeTab === 'vattu' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <Toolbar value={vattuSearch} onSearch={setVattuSearch} placeholder="Tìm vật tư..." onImport={handleImportVattu} onExport={handleExportVattu} id="im-v" />
            <div className="flex-1 min-h-0 px-4 pb-4">
              <div className="h-full border border-[#010b17] rounded-2xl overflow-hidden shadow-2xl bg-white flex flex-col">
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse" style={{fontSize:'13px'}}>
                    <thead className="sticky top-0 z-10 bg-royal-100">
                      <tr>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center w-12 text-[14px] uppercase tracking-tight">Stt</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center min-w-[140px] text-[14px] uppercase tracking-tight">Mã SAP</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center min-w-[200px] text-[14px] uppercase tracking-tight">Tên vật tư</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center text-[14px] uppercase tracking-tight">ĐVT</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center text-[14px] uppercase tracking-tight">Mã nhóm</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center text-[14px] uppercase tracking-tight">Tên nhóm</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center text-[14px] uppercase tracking-tight">Loại vật tư</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center min-w-[250px] text-[14px] uppercase tracking-tight">Thông số kỹ thuật</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-b border-[#010b17] text-center w-28 text-[14px] uppercase tracking-tight">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="italic">
                      {paginatedVattu.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-10 opacity-50 border-b border-[#010b17]">Không có dữ liệu</td></tr>
                      ) : paginatedVattu.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-royal-50/50 group">
                          <td className="px-4 py-3 text-center border-r border-b border-[#010b17] font-mono text-[14px] font-bold">{(vattuPage - 1) * pageSize + idx + 1}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] font-bold text-royal-600 font-mono text-[14px]">{item.ma_vattu_sap}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] font-bold text-[14px]">{item.ten_vattu}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] text-center text-[14px] font-medium">{item.dvt}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] text-center font-mono text-[14px] font-bold">{item.ma_nhom_vattu}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] text-center text-[14px] font-medium">{item.ten_nhom_vattu}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] text-center"><span className="px-3 py-1 bg-royal-50 border border-royal-100 rounded-full text-[13px] uppercase font-black text-royal-600">{item.loai_vattu}</span></td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] text-[14px] max-w-xs truncate" title={item.thong_so_ky_thuat}>{item.thong_so_ky_thuat}</td>
                          <td className="px-4 py-3 text-center border-b border-[#010b17]">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                              <button onClick={() => setEditVattu(item)} className="p-1.5 hover:bg-royal-50 rounded text-royal-600 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setConfirmDelete({ id: item.id, type: 'vattu', title: 'Xóa vật tư', message: 'Xóa vật tư này khỏi danh mục?' })} className="p-1.5 hover:bg-rose-50 rounded text-rose-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationBar total={filteredVattu.length} currentPage={vattuPage} onPageChange={setVattuPage} pageSize={pageSize} setPageSize={setPageSize} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <Toolbar value={nccSearch} onSearch={setNccSearch} placeholder="Tìm NCC..." onImport={handleImportNcc} onExport={handleExportNcc} id="im-n" />
            <div className="flex-1 min-h-0 px-4 pb-4">
              <div className="h-full border border-[#010b17] rounded-2xl overflow-hidden shadow-2xl bg-white flex flex-col">
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse" style={{fontSize:'13px'}}>
                    <thead className="sticky top-0 z-10 bg-royal-100">
                      <tr>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center w-12 text-[14px] uppercase tracking-tight">Stt</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center min-w-[250px] text-[14px] uppercase tracking-tight">Nhà cung cấp</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center text-[14px] uppercase tracking-tight">Mã số thuế</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center text-[14px] uppercase tracking-tight">Mã SAP</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center min-w-[200px] text-[14px] uppercase tracking-tight">Người đại diện</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-r border-b border-[#010b17] text-center min-w-[160px] text-[14px] uppercase tracking-tight">Số điện thoại</th>
                        <th className="px-4 py-4 font-black text-royal-950 border-b border-[#010b17] text-center w-28 text-[14px] uppercase tracking-tight">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedNcc.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-10 opacity-50 border-b border-[#010b17]">Không có dữ liệu</td></tr>
                      ) : paginatedNcc.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-royal-50/50 group">
                          <td className="px-4 py-3 text-center border-r border-b border-[#010b17] font-mono text-[14px] font-bold">{(nccPage - 1) * pageSize + idx + 1}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] font-bold text-[14px]">{item.nha_cung_cap}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] font-mono text-[14px] font-bold">{item.ma_so_thue || '—'}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] font-bold text-royal-600 font-mono text-[14px]">{item.ma_vendor_sap || '—'}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] text-[14px] font-medium">{item.nguoi_dai_dien || '—'}</td>
                          <td className="px-4 py-3 border-r border-b border-[#010b17] font-mono text-[14px] text-center font-black text-royal-600">{item.so_dien_thoai || '—'}</td>
                          <td className="px-4 py-3 text-center border-b border-[#010b17]">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all justify-center">
                              <button onClick={() => setEditNcc(item)} className="p-1.5 hover:bg-royal-50 rounded text-royal-600 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setConfirmDelete({ id: item.id, type: 'ncc', title: 'Xóa nhà cung cấp', message: 'Xóa NCC này khỏi danh mục?' })} className="p-1.5 hover:bg-rose-50 rounded text-rose-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationBar total={filteredNcc.length} currentPage={nccPage} onPageChange={setNccPage} pageSize={pageSize} setPageSize={setPageSize} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
