import React, { useState, useMemo, useEffect } from 'react'
import { Database, Package, Truck, Upload, Download, Search, Trash2, AlertCircle, Pencil, X, Save, CheckCircle, SkipForward } from 'lucide-react'
import { CATALOG_VATTU_KEY, CATALOG_NCC_KEY, TABLES } from '../../constants'
import { genId, toCamelCase, toSnakeCase } from '../../utils'
import { getSupabase } from '../../lib/supabase'

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
  const labels = ['Mã Vật Tư (SAP)','Mã nhóm','Tên nhóm','Tên vật tư','ĐVT','Loại','Thông số KT','Ghi chú']
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden flex flex-col" style={{maxHeight:'90vh'}}>
        {/* Header */}
        <div className="bg-gradient-to-r from-royal-700 to-royal-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white font-black text-sm">Xem trước dữ liệu Import — Danh mục Vật tư</span>
          </div>
          <button onClick={onCancel} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {/* Thông báo thống kê */}
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
        {/* Table preview */}
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
                  <th className="px-3 py-2 font-bold text-royal-900 text-center w-10 border-r border-slate-300">STT</th>
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
        {/* Footer */}
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
                  <th className="px-3 py-2 font-bold text-royal-900 text-center w-10 border-r border-slate-300">STT</th>
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

// ── Main Component ─────────────────────────────────────────────
export default function DataVatTuNCC({ branding, onOpenSidebar }) {
  const [activeTab, setActiveTab] = useState('vattu')
  const [isLoading, setIsLoading] = useState(false)

  // ── Vật tư state
  const [vattuList, setVattuList] = useState([])
  const [vattuSearch, setVattuSearch] = useState('')
  const [editVattu, setEditVattu] = useState(null)
  const [previewVattu, setPreviewVattu] = useState(null)
  const [saiForm, setSaiForm] = useState(null)

  // ── NCC state
  const [nccList, setNccList] = useState([])
  const [nccSearch, setNccSearch] = useState('')
  const [editNcc, setEditNcc] = useState(null)
  const [previewNcc, setPreviewNcc] = useState(null)

  // Fetch Logic
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const supabase = getSupabase()
      
      if (supabase) {
        try {
          const [vattuRes, nccRes] = await Promise.all([
            supabase.from(TABLES.DM_VATTU).select('*'),
            supabase.from(TABLES.DM_NCC).select('*')
          ])
          
          if (!vattuRes.error && vattuRes.data) setVattuList(vattuRes.data)
          if (!nccRes.error && nccRes.data) setNccList(nccRes.data)
          
          if (!vattuRes.error && !nccRes.error) {
             setIsLoading(false)
             return
          }
        } catch (err) { console.error('Supabase fetch failed', err) }
      }

      // LocalStorage Fallback
      try {
        const v = localStorage.getItem(CATALOG_VATTU_KEY)
        const n = localStorage.getItem(CATALOG_NCC_KEY)
        if (v) setVattuList(JSON.parse(v))
        if (n) setNccList(JSON.parse(n))
      } catch {}
      setIsLoading(false)
    }
    fetchData()
  }, [])

  // LocalStorage backups
  useEffect(() => { localStorage.setItem(CATALOG_VATTU_KEY, JSON.stringify(vattuList)) }, [vattuList])
  useEffect(() => { localStorage.setItem(CATALOG_NCC_KEY, JSON.stringify(nccList)) }, [nccList])

  const filteredVattu = useMemo(() => {
    if (!vattuSearch.trim()) return vattuList
    const q = vattuSearch.toLowerCase()
    return vattuList.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q)))
  }, [vattuList, vattuSearch])

  const filteredNcc = useMemo(() => {
    if (!nccSearch.trim()) return nccList
    const q = nccSearch.toLowerCase()
    return nccList.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q)))
  }, [nccList, nccSearch])

  // ── Import/Export Vật tư
  const REQUIRED_VATTU_HEADERS = ['Mã Vật Tư (Mã SAP)', 'Mã nhóm Vật tư', 'Tên nhóm Vật tư', 'Tên vật tư', 'Đơn vị tính', 'Loại vật tư', 'Thông số kỹ thuật', 'Ghi chú']
  const handleImportVattu = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 1) { alert('File Excel trống!'); e.target.value = ''; return }
      const fileHeaders = raw[0].map(h => String(h).trim()).filter(Boolean)
      const missingHeaders = REQUIRED_VATTU_HEADERS.filter(h => !fileHeaders.includes(h))
      if (missingHeaders.length > 0) {
        setSaiForm({ loai: 'Danh mục Vật tư', missingHeaders, fileHeaders })
        e.target.value = ''; return
      }
      if (raw.length < 2) { alert('File không có dữ liệu!'); e.target.value = ''; return }
      const headerMap = {
        'Mã Vật Tư (Mã SAP)': 'ma_vattu_sap', 'Mã nhóm Vật tư': 'ma_nhom_vattu',
        'Tên nhóm Vật tư': 'ten_nhom_vattu', 'Tên vật tư': 'ten_vattu',
        'Đơn vị tính': 'dvt', 'Loại vật tư': 'loai_vattu', 'Thông số kỹ thuật': 'thong_so_ky_thuat', 'Ghi chú': 'ghi_chu',
      }
      const colMap = {}
      fileHeaders.forEach((h, i) => { if (headerMap[h]) colMap[i] = headerMap[h] })
      const allItems = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => {
        const obj = { id: genId() }
        Object.entries(colMap).forEach(([i, key]) => { obj[key] = String(r[i] || '').trim() })
        return obj
      })
      const existingMa = new Set(vattuList.map(i => i.ma_vattu_sap).filter(Boolean))
      const newItems = allItems.filter(i => !i.ma_vattu_sap || !existingMa.has(i.ma_vattu_sap))
      const skipped = allItems.length - newItems.length
      setPreviewVattu({ newItems, skipped, total: allItems.length })
    } catch (err) { console.error(err); alert('Lỗi khi import file Excel') }
    e.target.value = ''
  }

  const handleExportVattu = async () => {
    const XLSX = await loadXLSX()
    const headers = [['Mã Vật Tư (Mã SAP)', 'Mã nhóm Vật tư', 'Tên nhóm Vật tư', 'Tên vật tư', 'Đơn vị tính', 'Loại vật tư', 'Thông số kỹ thuật', 'Ghi chú']]
    const data = filteredVattu.map(i => [i.ma_vattu_sap, i.ma_nhom_vattu, i.ten_nhom_vattu, i.ten_vattu, i.dvt, i.loai_vattu, i.thong_so_ky_thuat, i.ghi_chu])
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh mục Vật tư')
    XLSX.writeFile(wb, `DanhMucVatTu_${Date.now()}.xlsx`)
  }

  const handleDeleteVattu = async (id) => {
    if (confirm('Xóa vật tư này khỏi danh mục?')) {
      const supabase = getSupabase()
      if (supabase) {
        const { error } = await supabase.from(TABLES.DM_VATTU).delete().eq('id', id)
        if (error) { alert('Lỗi Supabase: ' + error.message); return }
      }
      setVattuList(prev => prev.filter(i => i.id !== id))
    }
  }

  const handleSaveVattu = async (updated) => {
    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase.from(TABLES.DM_VATTU).update(updated).eq('id', updated.id)
      if (error) { alert('Lỗi Supabase: ' + error.message); return }
    }
    setVattuList(prev => prev.map(i => i.id === updated.id ? updated : i))
    setEditVattu(null)
  }

  const handleConfirmImportVattu = async () => {
    const supabase = getSupabase()
    if (supabase && previewVattu.newItems.length > 0) {
      const { error } = await supabase.from(TABLES.DM_VATTU).insert(previewVattu.newItems)
      if (error) { alert('Lỗi Supabase: ' + error.message); return }
    }
    setVattuList(prev => [...prev, ...previewVattu.newItems])
    setPreviewVattu(null)
  }

  // ── Import/Export NCC
  const REQUIRED_NCC_HEADERS = ['Nhà cung cấp', 'Mã số thuế', 'Mã vendor/Mã SAP', 'Địa chỉ', 'Người đại diện', 'Số điện thoại']
  const handleImportNcc = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 1) { alert('File Excel trống!'); e.target.value = ''; return }
      const fileHeaders = raw[0].map(h => String(h).trim()).filter(Boolean)
      const missingHeaders = REQUIRED_NCC_HEADERS.filter(h => !fileHeaders.includes(h))
      if (missingHeaders.length > 0) {
        setSaiForm({ loai: 'Danh mục NCC', missingHeaders, fileHeaders })
        e.target.value = ''; return
      }
      if (raw.length < 2) { alert('File không có dữ liệu!'); e.target.value = ''; return }
      const headerMap = {
        'Nhà cung cấp': 'nha_cung_cap', 'Mã số thuế': 'ma_so_thue',
        'Mã vendor/Mã SAP': 'ma_vendor_sap', 'Địa chỉ': 'dia_chi',
        'Người đại diện': 'nguoi_dai_dien', 'Số điện thoại': 'so_dien_thoai',
      }
      const colMap = {}
      fileHeaders.forEach((h, i) => { if (headerMap[h]) colMap[i] = headerMap[h] })
      const allItems = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => {
        const obj = { id: genId() }
        Object.entries(colMap).forEach(([i, key]) => { obj[key] = String(r[i] || '').trim() })
        return obj
      })
      const existingMa = new Set(nccList.map(i => i.ma_vendor_sap).filter(Boolean))
      const newItems = allItems.filter(i => !i.ma_vendor_sap || !existingMa.has(i.ma_vendor_sap))
      const skipped = allItems.length - newItems.length
      setPreviewNcc({ newItems, skipped, total: allItems.length })
    } catch (err) { console.error(err); alert('Lỗi khi import file Excel') }
    e.target.value = ''
  }

  const handleExportNcc = async () => {
    const XLSX = await loadXLSX()
    const headers = [['Nhà cung cấp', 'Mã số thuế', 'Mã vendor/Mã SAP', 'Địa chỉ', 'Người đại diện', 'Số điện thoại']]
    const data = filteredNcc.map(i => [i.nha_cung_cap, i.ma_so_thue, i.ma_vendor_sap, i.dia_chi, i.nguoi_dai_dien, i.so_dien_thoai])
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh mục NCC')
    XLSX.writeFile(wb, `DanhMucNCC_${Date.now()}.xlsx`)
  }

  const handleDeleteNcc = async (id) => {
    if (confirm('Xóa nhà cung cấp này khỏi danh mục?')) {
      const supabase = getSupabase()
      if (supabase) {
        const { error } = await supabase.from(TABLES.DM_NCC).delete().eq('id', id)
        if (error) { alert('Lỗi Supabase: ' + error.message); return }
      }
      setNccList(prev => prev.filter(i => i.id !== id))
    }
  }

  const handleSaveNcc = async (updated) => {
    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase.from(TABLES.DM_NCC).update(updated).eq('id', updated.id)
      if (error) { alert('Lỗi Supabase: ' + error.message); return }
    }
    setNccList(prev => prev.map(i => i.id === updated.id ? updated : i))
    setEditNcc(null)
  }

  const handleConfirmImportNcc = async () => {
    const supabase = getSupabase()
    if (supabase && previewNcc.newItems.length > 0) {
      const { error } = await supabase.from(TABLES.DM_NCC).insert(previewNcc.newItems)
      if (error) { alert('Lỗi Supabase: ' + error.message); return }
    }
    setNccList(prev => [...prev, ...previewNcc.newItems])
    setPreviewNcc(null)
  }

  // ── Shared Toolbar
  const Toolbar = ({ searchValue, onSearch, placeholder, onImport, onExport, inputId }) => (
    <div className="bg-white px-6 py-3 border-b border-royal-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={searchValue} onChange={e => onSearch(e.target.value)} placeholder={placeholder}
            className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 h-9 bg-royal-50 border border-royal-200 text-royal-700 rounded-lg font-bold text-xs hover:bg-royal-100 transition-all cursor-pointer whitespace-nowrap">
            <Upload className="w-3.5 h-3.5" /><span>Import Excel</span>
            <input id={inputId} type="file" accept=".xlsx,.xls" onChange={onImport} className="hidden" />
          </label>
          <button onClick={onExport} className="flex items-center gap-2 px-3 h-9 bg-royal-50 border border-royal-200 text-royal-700 rounded-lg font-bold text-xs hover:bg-royal-100 transition-all whitespace-nowrap">
            <Download className="w-3.5 h-3.5" /><span>Xuất Excel</span>
          </button>
        </div>
      </div>
      <div className="text-[10px] text-slate-400 font-medium italic hidden md:block">* Cần đúng định dạng file Excel mẫu để import dữ liệu</div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-royal-50">
      {/* Modals */}
      {editVattu && <ModalSuaVattu item={editVattu} onClose={() => setEditVattu(null)} onSave={handleSaveVattu} />}
      {editNcc   && <ModalSuaNcc   item={editNcc}   onClose={() => setEditNcc(null)}   onSave={handleSaveNcc}   />}
      {saiForm && <ModalSaiForm {...saiForm} onClose={() => setSaiForm(null)} />}
      {previewVattu && (
        <ModalPreviewVattu
          newItems={previewVattu.newItems}
          skipped={previewVattu.skipped}
          total={previewVattu.total}
          onConfirm={handleConfirmImportVattu}
          onCancel={() => setPreviewVattu(null)}
        />
      )}
      {previewNcc && (
        <ModalPreviewNcc
          newItems={previewNcc.newItems}
          skipped={previewNcc.skipped}
          total={previewNcc.total}
          onConfirm={handleConfirmImportNcc}
          onCancel={() => setPreviewNcc(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-royal-700 via-royal-600 to-royal-500 shadow-xl flex items-center h-16 shrink-0 px-0">
        <div 
          onMouseEnter={onOpenSidebar}
          className="h-full flex items-center justify-center pl-2 pr-4 cursor-pointer group"
        >
          <div className={`h-[54px] ${branding?.logoUrl ? 'px-4' : 'w-[54px]'} bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30 z-10 shrink-0 overflow-hidden group-hover:scale-[1.02] group-active:scale-95 transition-all`}>
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center scale-90">
                <Database className="w-7 h-7 text-royal-600" />
              </div>
            )}
          </div>
        </div>
        <div className="px-2">
          <h1 className="text-white font-black text-xl leading-none tracking-tight">Data Vật Tư & NCC</h1>
          <p className="text-royal-100 text-sm font-medium mt-0.5 opacity-80 uppercase tracking-wider text-[11px] font-bold">Danh mục hệ thống</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-royal-100 px-6 pt-2">
        <div className="flex gap-4 justify-center">
          <button onClick={() => setActiveTab('vattu')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'vattu' ? 'border-royal-600 text-royal-700' : 'border-transparent text-slate-400 hover:text-royal-500'}`}>
            <Package className="w-4 h-4" />Danh mục Vật tư ({vattuList.length})
          </button>
          <button onClick={() => setActiveTab('ncc')} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'ncc' ? 'border-royal-600 text-royal-700' : 'border-transparent text-slate-400 hover:text-royal-500'}`}>
            <Truck className="w-4 h-4" />Danh mục NCC ({nccList.length})
          </button>
        </div>
      </div>

      {/* TAB TIỂU ĐỀ VÀ BẢNG */ }
      <div className="flex-1 flex flex-col min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-royal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-royal-600">Đang tải dữ liệu danh mục...</span>
            </div>
          </div>
        )}
        {activeTab === 'vattu' ? (
          <div className="flex-1 flex flex-col min-h-0">
          <Toolbar searchValue={vattuSearch} onSearch={setVattuSearch} placeholder="Tìm kiếm mã, tên vật tư, nhóm..." onImport={handleImportVattu} onExport={handleExportVattu} inputId="import-vattu" />
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse border border-slate-400" style={{fontSize:'13px'}}>
              <thead className="sticky top-0 z-10 bg-royal-100 border-b-2 border-slate-500 shadow-sm" style={{fontSize:'13px'}}>
                <tr>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide w-12 text-center border-r border-slate-400">STT</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[140px] border-r border-slate-400 text-center">Mã Vật Tư (Mã SAP)</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[120px] border-r border-slate-400 text-center">Mã nhóm Vật tư</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[160px] border-r border-slate-400 text-center">Tên nhóm Vật tư</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[160px] border-r border-slate-400 text-center">Tên vật tư</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide border-r border-slate-400 text-center">Đơn vị tính</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide border-r border-slate-400 text-center">Loại vật tư</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[200px] border-r border-slate-400 text-center">Thông số kỹ thuật</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[160px] border-r border-slate-400 text-center">Ghi chú</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {filteredVattu.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-10 h-10 text-slate-300" />
                      <p className="font-medium">Chưa có dữ liệu vật tư</p>
                      <p className="text-[11px]">Vui lòng Import Excel để nạp dữ liệu danh mục</p>
                    </div>
                  </td></tr>
                ) : filteredVattu.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-royal-50/50 transition-colors group">
                    <td className="px-4 py-2.5 text-center text-slate-800 font-mono border-r border-slate-300">{idx + 1}</td>
                    <td className="px-4 py-2.5 border-r border-slate-300"><span className="font-mono font-bold text-royal-600">{item.ma_vattu_sap || '—'}</span></td>
                    <td className="px-4 py-2.5 border-r border-slate-300"><span className="font-mono text-slate-800">{item.ma_nhom_vattu || '—'}</span></td>
                    <td className="px-4 py-2.5 font-medium text-slate-800 border-r border-slate-300">{item.ten_nhom_vattu || '—'}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 border-r border-slate-300">{item.ten_vattu || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-300 text-center text-slate-800">{item.dvt || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-300"><span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold">{item.loai_vattu || '—'}</span></td>
                    <td className="px-4 py-2.5 text-slate-800 italic max-w-xs truncate border-r border-slate-300" title={item.thong_so_ky_thuat}>{item.thong_so_ky_thuat || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-800 max-w-xs truncate border-r border-slate-300" title={item.ghi_chu}>{item.ghi_chu || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditVattu(item)} className="p-1.5 text-royal-400 hover:text-royal-600 hover:bg-royal-50 rounded-lg transition-all" title="Sửa">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteVattu(item.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Xóa">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
      /* ── TAB NCC ── */
        <div className="flex-1 flex flex-col min-h-0">
          <Toolbar searchValue={nccSearch} onSearch={setNccSearch} placeholder="Tìm kiếm tên NCC, mã số thuế, mã SAP..." onImport={handleImportNcc} onExport={handleExportNcc} inputId="import-ncc" />
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse border border-slate-400" style={{fontSize:'13px'}}>
              <thead className="sticky top-0 z-10 bg-royal-100 border-b-2 border-slate-500 shadow-sm" style={{fontSize:'13px'}}>
                <tr>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide w-12 text-center border-r border-slate-400">STT</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[220px] border-r border-slate-400 text-center">Nhà cung cấp</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[130px] border-r border-slate-400 text-center">Mã số thuế</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[140px] border-r border-slate-400 text-center">Mã vendor/Mã SAP</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[220px] border-r border-slate-400 text-center">Địa chỉ</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[150px] border-r border-slate-400 text-center">Người đại diện</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[120px] border-r border-slate-400 text-center">Số điện thoại</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {filteredNcc.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-10 h-10 text-slate-300" />
                      <p className="font-medium">Chưa có dữ liệu nhà cung cấp</p>
                      <p className="text-[11px]">Vui lòng Import Excel để nạp dữ liệu danh mục</p>
                    </div>
                  </td></tr>
                ) : filteredNcc.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-royal-50/50 transition-colors group">
                    <td className="px-4 py-2.5 text-center text-slate-800 font-mono border-r border-slate-300">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 border-r border-slate-300">{item.nha_cung_cap || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-800 border-r border-slate-300">{item.ma_so_thue || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-300"><span className="font-mono font-bold text-royal-600">{item.ma_vendor_sap || '—'}</span></td>
                    <td className="px-4 py-2.5 text-slate-800 border-r border-slate-300 max-w-xs truncate" title={item.dia_chi}>{item.dia_chi || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-800 border-r border-slate-300">{item.nguoi_dai_dien || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-800 border-r border-slate-300">{item.so_dien_thoai || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditNcc(item)} className="p-1.5 text-royal-400 hover:text-royal-600 hover:bg-royal-50 rounded-lg transition-all" title="Sửa">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteNcc(item.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Xóa">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  </div>
  )
}
