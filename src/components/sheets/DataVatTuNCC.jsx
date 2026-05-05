import React, { useState, useMemo, useEffect } from 'react'
import { Database, Package, Truck, Upload, Download, Search, Trash2, AlertCircle } from 'lucide-react'
import { CATALOG_VATTU_KEY } from '../../constants'
import { genId } from '../../utils'

async function loadXLSX() { return import('xlsx') }

export default function DataVatTuNCC() {
  const [activeTab, setActiveTab] = useState('vattu') // 'vattu' | 'ncc'
  const [vattuList, setVattuList] = useState(() => {
    try {
      const d = localStorage.getItem(CATALOG_VATTU_KEY)
      return d ? JSON.parse(d) : []
    } catch { return [] }
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    localStorage.setItem(CATALOG_VATTU_KEY, JSON.stringify(vattuList))
  }, [vattuList])

  const filteredVattu = useMemo(() => {
    if (!searchQuery.trim()) return vattuList
    const q = searchQuery.toLowerCase()
    return vattuList.filter(item => 
      Object.values(item).some(v => String(v).toLowerCase().includes(q))
    )
  }, [vattuList, searchQuery])

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      
      if (raw.length < 2) return

      const headerMap = {
        'Mã Vật Tư (Mã SAP)': 'maVattuSap',
        'Mã nhóm Vật tư': 'maNhomVattu',
        'Tên nhóm Vật tư': 'tenNhomVattu',
        'Tên vật tư': 'tenVattu',
        'Đơn vị tính': 'dvt',
        'Loại vật tư': 'loaiVattu',
        'Thông số kỹ thuật': 'thongSoKyThuat',
        'Ghi chú': 'ghiChu'
      }

      const headers = raw[0].map(h => String(h).trim())
      const colMap = {}
      headers.forEach((h, i) => { if (headerMap[h]) colMap[i] = headerMap[h] })

      const newItems = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => {
        const obj = { id: genId() }
        Object.entries(colMap).forEach(([i, key]) => { obj[key] = String(r[i] || '').trim() })
        return obj
      })

      setVattuList(prev => [...prev, ...newItems])
      alert(`Đã import thành công ${newItems.length} dòng vật tư`)
    } catch (err) {
      console.error(err)
      alert('Lỗi khi import file Excel')
    }
    e.target.value = ''
  }

  const handleDelete = (id) => {
    if (confirm('Xóa vật tư này khỏi danh mục?')) {
      setVattuList(prev => prev.filter(i => i.id !== id))
    }
  }

  const handleExport = async () => {
    const XLSX = await loadXLSX()
    const headers = [['Mã Vật Tư (Mã SAP)', 'Mã nhóm Vật tư', 'Tên nhóm Vật tư', 'Tên vật tư', 'Đơn vị tính', 'Loại vật tư', 'Thông số kỹ thuật', 'Ghi chú']]
    const data = filteredVattu.map(i => [
      i.maVattuSap, i.maNhomVattu, i.tenNhomVattu, i.tenVattu, i.dvt, i.loaiVattu, i.thongSoKyThuat, i.ghiChu
    ])
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Danh mục Vật tư')
    XLSX.writeFile(wb, `DanhMucVatTu_${new Date().getTime()}.xlsx`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-royal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-700 via-royal-600 to-royal-500 shadow-xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
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
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-royal-100 px-6 pt-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('vattu')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'vattu' ? 'border-royal-600 text-royal-700' : 'border-transparent text-slate-400 hover:text-royal-500'
            }`}
          >
            <Package className="w-4 h-4" />
            Danh mục Vật tư ({vattuList.length})
          </button>
          <button
            onClick={() => setActiveTab('ncc')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'ncc' ? 'border-royal-600 text-royal-700' : 'border-transparent text-slate-400 hover:text-royal-500'
            }`}
          >
            <Truck className="w-4 h-4" />
            Danh mục NCC
          </button>
        </div>
      </div>

      {activeTab === 'vattu' ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="bg-white px-6 py-3 border-b border-royal-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative max-w-sm flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm mã, tên vật tư, nhóm..."
                  className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-3 h-9 bg-royal-50 border border-royal-200 text-royal-700 rounded-lg font-bold text-xs hover:bg-royal-100 transition-all cursor-pointer whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Excel</span>
                  <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} className="hidden" />
                </label>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 h-9 bg-royal-50 border border-royal-200 text-royal-700 rounded-lg font-bold text-xs hover:bg-royal-100 transition-all whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-medium italic hidden md:block">
              * Cần đúng định dạng file Excel mẫu để import dữ liệu
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse text-xs border border-slate-200">
              <thead className="sticky top-0 z-10 bg-royal-100 border-b border-royal-300 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide w-12 text-center border-r border-royal-200">Stt</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[140px] border-r border-royal-200">Mã SAP</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[250px] border-r border-royal-200">Tên nội dung vật tư</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide border-r border-royal-200">Đvt</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide border-r border-royal-200">Nhóm vật tư</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide border-r border-royal-200">Loại vật tư</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide min-w-[200px] border-r border-royal-200">Thông số kỹ thuật</th>
                  <th className="px-4 py-3 font-bold text-royal-900 tracking-wide text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVattu.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-10 h-10 text-slate-300" />
                        <p className="font-medium">Chưa có dữ liệu vật tư</p>
                        <p className="text-[11px]">Vui lòng Import Excel để nạp dữ liệu danh mục</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredVattu.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-royal-50/50 transition-colors group">
                    <td className="px-4 py-2.5 text-center text-slate-400 font-mono border-r border-slate-100">{idx + 1}</td>
                    <td className="px-4 py-2.5 border-r border-slate-100"><span className="font-mono font-bold text-royal-600">{item.maVattuSap || '—'}</span></td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 border-r border-slate-100">{item.tenVattu || '—'}</td>
                    <td className="px-4 py-2.5 border-r border-slate-100">{item.dvt || '—'}</td>
                    <td className="px-4 py-2.5 text-slate-500 border-r border-slate-100">
                      <div className="text-[10px] text-slate-400">{item.maNhomVattu}</div>
                      <div className="font-medium">{item.tenNhomVattu}</div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{item.loaiVattu || '—'}</span></td>
                    <td className="px-4 py-2.5 text-slate-500 italic max-w-xs truncate border-r border-slate-100" title={item.thongSoKyThuat}>{item.thongSoKyThuat || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                       <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 italic">
          <Truck className="w-12 h-12 text-slate-200 mb-4" />
          Module Danh mục NCC đang hoàn thiện...
        </div>
      )}
    </div>
  )
}
