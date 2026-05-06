import React, { useState, useMemo, useEffect } from 'react'
import { Database, Package, Truck, Upload, Download, Search, Trash2, AlertCircle, Pencil, X, Save, CheckCircle, SkipForward } from 'lucide-react'
import { CATALOG_VATTU_KEY, CATALOG_NCC_KEY } from '../../constants'
import { genId } from '../../utils'

async function loadXLSX() { return import('xlsx') }

// ── Modal Sửa Vật tư ───────────────────────────────────────────
function ModalSuaVattu({ item, onClose, onSave }) {
  const [form, setForm] = useState({ ...item })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const fields = [
    { key: 'maVattuSap', label: 'Mã Vật Tư (Mã SAP)' },
    { key: 'maNhomVattu', label: 'Mã nhóm Vật tư' },
    { key: 'tenNhomVattu', label: 'Tên nhóm Vật tư' },
    { key: 'tenVattu', label: 'Tên vật tư' },
    { key: 'dvt', label: 'Đơn vị tính' },
    { key: 'loaiVattu', label: 'Loại vật tư' },
    { key: 'thongSoKyThuat', label: 'Thông số kỹ thuật', multiline: true },
    { key: 'ghiChu', label: 'Ghi chú', multiline: true },
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
  const [form, setForm] = useState({ ...item })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const fields = [
    { key: 'nhaCungCap', label: 'Nhà cung cấp' },
    { key: 'maSoThue', label: 'Mã số thuế' },
    { key: 'maVendorSap', label: 'Mã vendor/Mã SAP' },
    { key: 'diaChi', label: 'Địa chỉ', multiline: true },
    { key: 'nguoiDaiDien', label: 'Người đại diện' },
    { key: 'soDienThoai', label: 'Số điện thoại' },
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
  const cols = ['maVattuSap','maNhomVattu','tenNhomVattu','tenVattu','dvt','loaiVattu','thongSoKyThuat','ghiChu']
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
  const cols = ['nhaCungCap','maSoThue','maVendorSap','diaChi','nguoiDaiDien','soDienThoai']
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
export default function DataVatTuNCC() {
  const [activeTab, setActiveTab] = useState('vattu')

  // ── Vật tư state
  const [vattuList, setVattuList] = useState(() => {
    try { const d = localStorage.getItem(CATALOG_VATTU_KEY); return d ? JSON.parse(d) : [] } catch { return [] }
  })
  const [vattuSearch, setVattuSearch] = useState('')
  const [editVattu, setEditVattu] = useState(null) // item đang sửa
  const [previewVattu, setPreviewVattu] = useState(null) // { newItems, skipped, total }

  useEffect(() => { localStorage.setItem(CATALOG_VATTU_KEY, JSON.stringify(vattuList)) }, [vattuList])

  const filteredVattu = useMemo(() => {
    if (!vattuSearch.trim()) return vattuList
    const q = vattuSearch.toLowerCase()
    return vattuList.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q)))
  }, [vattuList, vattuSearch])

  // ── NCC state
  const [nccList, setNccList] = useState(() => {
    try { const d = localStorage.getItem(CATALOG_NCC_KEY); return d ? JSON.parse(d) : [] } catch { return [] }
  })
  const [nccSearch, setNccSearch] = useState('')
  const [editNcc, setEditNcc] = useState(null)
  const [previewNcc, setPreviewNcc] = useState(null) // { newItems, skipped, total }

  useEffect(() => { localStorage.setItem(CATALOG_NCC_KEY, JSON.stringify(nccList)) }, [nccList])

  const filteredNcc = useMemo(() => {
    if (!nccSearch.trim()) return nccList
    const q = nccSearch.toLowerCase()
    return nccList.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(q)))
  }, [nccList, nccSearch])

  // ── Import/Export Vật tư
  const handleImportVattu = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 2) return
      const headerMap = {
        'Mã Vật Tư (Mã SAP)': 'maVattuSap', 'Mã nhóm Vật tư': 'maNhomVattu',
        'Tên nhóm Vật tư': 'tenNhomVattu', 'Tên vật tư': 'tenVattu',
        'Đơn vị tính': 'dvt', 'Loại vật tư': 'loaiVattu', 'Thông số kỹ thuật': 'thongSoKyThuat', 'Ghi chú': 'ghiChu',
      }
      const headers = raw[0].map(h => String(h).trim())
      const colMap = {}
      headers.forEach((h, i) => { if (headerMap[h]) colMap[i] = headerMap[h] })
      const allItems = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => {
        const obj = { id: genId() }
        Object.entries(colMap).forEach(([i, key]) => { obj[key] = String(r[i] || '').trim() })
        return obj
      })
      const existingMa = new Set(vattuList.map(i => i.maVattuSap).filter(Boolean))
      const newItems = allItems.filter(i => !i.maVattuSap || !existingMa.has(i.maVattuSap))
      const skipped = allItems.length - newItems.length
      setPreviewVattu({ newItems, skipped, total: allItems.length })
    } catch (err) { console.error(err); alert('Lỗi khi import file Excel') }
    e.target.value = ''
  }

  const handleExportVattu = async () => {
    const XLSX = await loadXLSX()
    const headers = [['Mã Vật Tư (Mã SAP)', 'Mã nhóm Vật tư', 'Tên nhóm Vật tư', 'Tên vật tư', 'Đơn vị tính', 'Loại vật tư', 'Thông số kỹ thuật', 'Ghi chú']]
    const data = filteredVattu.map(i => [i.maVattuSap, i.maNhomVattu, i.tenNhomVattu, i.tenVattu, i.dvt, i.loaiVattu, i.thongSoKyThuat, i.ghiChu])
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh mục Vật tư')
    XLSX.writeFile(wb, `DanhMucVatTu_${Date.now()}.xlsx`)
  }

  const handleDeleteVattu = (id) => {
    if (confirm('Xóa vật tư này khỏi danh mục?')) setVattuList(prev => prev.filter(i => i.id !== id))
  }

  const handleSaveVattu = (updated) => {
    setVattuList(prev => prev.map(i => i.id === updated.id ? updated : i))
    setEditVattu(null)
  }

  // ── Import/Export NCC
  const handleImportNcc = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 2) return
      const headerMap = {
        'Nhà cung cấp': 'nhaCungCap', 'Mã số thuế': 'maSoThue',
        'Mã vendor/Mã SAP': 'maVendorSap', 'Địa chỉ': 'diaChi',
        'Người đại diện': 'nguoiDaiDien', 'Số điện thoại': 'soDienThoai',
      }
      const headers = raw[0].map(h => String(h).trim())
      const colMap = {}
      headers.forEach((h, i) => { if (headerMap[h]) colMap[i] = headerMap[h] })
      const allItems = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => {
        const obj = { id: genId() }
        Object.entries(colMap).forEach(([i, key]) => { obj[key] = String(r[i] || '').trim() })
        return obj
      })
      const existingMa = new Set(nccList.map(i => i.maVendorSap).filter(Boolean))
      const newItems = allItems.filter(i => !i.maVendorSap || !existingMa.has(i.maVendorSap))
      const skipped = allItems.length - newItems.length
      setPreviewNcc({ newItems, skipped, total: allItems.length })
    } catch (err) { console.error(err); alert('Lỗi khi import file Excel') }
    e.target.value = ''
  }

  const handleExportNcc = async () => {
    const XLSX = await loadXLSX()
    const headers = [['Nhà cung cấp', 'Mã số thuế', 'Mã vendor/Mã SAP', 'Địa chỉ', 'Người đại diện', 'Số điện thoại']]
    const data = filteredNcc.map(i => [i.nhaCungCap, i.maSoThue, i.maVendorSap, i.diaChi, i.nguoiDaiDien, i.soDienThoai])
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh mục NCC')
    XLSX.writeFile(wb, `DanhMucNCC_${Date.now()}.xlsx`)
  }

  const handleDeleteNcc = (id) => {
    if (confirm('Xóa nhà cung cấp này khỏi danh mục?')) setNccList(prev => prev.filter(i => i.id !== id))
  }

  const handleSaveNcc = (updated) => {
    setNccList(prev => prev.map(i => i.id === updated.id ? updated : i))
    setEditNcc(null)
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
      {previewVattu && (
        <ModalPreviewVattu
          newItems={previewVattu.newItems}
          skipped={previewVattu.skipped}
          total={previewVattu.total}
          onConfirm={() => { setVattuList(prev => [...prev, ...previewVattu.newItems]); setPreviewVattu(null) }}
          onCancel={() => setPreviewVattu(null)}
        />
      )}
      {previewNcc && (
        <ModalPreviewNcc
          newItems={previewNcc.newItems}
          skipped={previewNcc.skipped}
          total={previewNcc.total}
          onConfirm={() => { setNccList(prev => [...prev, ...previewNcc.newItems]); setPreviewNcc(null) }}
          onCancel={() => setPreviewNcc(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-royal-700 via-royal-600 to-royal-500 shadow-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg leading-none tracking-tight">Data Vật Tư & NCC</h1>
            <p className="text-royal-100 text-xs font-medium mt-0.5">Quản lý danh mục chuẩn hệ thống</p>
          </div>
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

      {/* ── TAB VẬT TƯ ── */}
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
                    <td className="px-4 py-2.5 border-r border-slate-300"><span className="font-mono font-bold text-royal-600">{item.maVattuSap || '—'}</span></td>
                    <td className="px-4 py-2.5 border-r border-slate-300"><span className="font-mono text-slate-800">{item.maNhomVattu || '—'}</span></td>
                    <td className="px-4 py-2.5 font-medium text-slate-800 border-r border-slate-300">{item.tenNhomVattu || '—'}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 border-r border-slate-300">{item.tenVattu || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-300 text-center text-slate-800">{item.dvt || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-300"><span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold">{item.loaiVattu || '—'}</span></td>
                    <td className="px-4 py-2.5 text-slate-800 italic max-w-xs truncate border-r border-slate-300" title={item.thongSoKyThuat}>{item.thongSoKyThuat || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-800 max-w-xs truncate border-r border-slate-300" title={item.ghiChu}>{item.ghiChu || '—'}</td>
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
                    <td className="px-4 py-2.5 font-semibold text-slate-800 border-r border-slate-300">{item.nhaCungCap || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-800 border-r border-slate-300">{item.maSoThue || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-300"><span className="font-mono font-bold text-royal-600">{item.maVendorSap || '—'}</span></td>
                    <td className="px-4 py-2.5 text-slate-800 border-r border-slate-300 max-w-xs truncate" title={item.diaChi}>{item.diaChi || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-800 border-r border-slate-300">{item.nguoiDaiDien || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-800 border-r border-slate-300">{item.soDienThoai || '—'}</td>
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
  )
}
