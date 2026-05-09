import React, { useState, useMemo, useEffect } from 'react'
import { Layers, Settings } from 'lucide-react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import DataTable from './components/DataTable'
import EditModal from './components/EditModal'
import SettingsModal from './components/SettingsModal'
import StatsBar from './components/StatsBar'
import Sidebar from './components/Sidebar'
import DataVatTuNCC from './components/sheets/DataVatTuNCC'
import QuanLyTaiKhoan from './components/sheets/QuanLyTaiKhoan'
import BaoCaoCanhBao from './components/sheets/BaoCaoCanhBao'
import CauHinhSupabase from './components/sheets/CauHinhSupabase'
import CauHinhDuAn from './components/sheets/CauHinhDuAn'
import CauHinhLogo from './components/sheets/CauHinhLogo'
import { LOCAL_STORAGE_KEY, SETTINGS_KEY, DEFAULT_PCU_DAYS, TABLES } from './constants'
import { genId, calcTrangThai, calcKhoiLuongConThieu, toCamelCase, toSnakeCase } from './utils'
import { getSupabase } from './lib/supabase'

async function loadXLSX() { return import('xlsx') }

function recalcAll(rows, pcuDays) {
  return rows.map(r => ({ ...r, trangThai: calcTrangThai(r, pcuDays) }))
}

function ChiTietCongViec({ settings, onSaveSettings }) {
  const pcuDays = settings.pcuDays || DEFAULT_PCU_DAYS

  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load data from LocalStorage or Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const supabase = getSupabase()
      
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from(TABLES.CHI_TIET_CONG_VIEC)
            .select('*')
            .order('created_at', { ascending: false })
          
          if (!error && data) {
            setRows(recalcAll(data.map(toCamelCase), pcuDays))
            setIsLoading(false)
            return
          }
          console.error('Supabase fetch error:', error)
        } catch (err) {
          console.error('Supabase sync failed:', err)
        }
      }

      // Fallback to localStorage
      try {
        const d = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (d) {
          setRows(recalcAll(JSON.parse(d), pcuDays))
        }
      } catch (err) {
        console.error('LocalStorage load failed:', err)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [pcuDays])

  // Sync to localStorage as backup
  useEffect(() => {
    if (rows.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rows))
    }
  }, [rows])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [searchGlobal, setSearchGlobal] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [filters, setFilters] = useState({ maVattu: '', tenVattu: '', tenNcc: 'ALL', nhom: 'ALL', loaiHd: 'ALL', trangThai: 'ALL', dot: '' })
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddNew = () => { setEditingRow(null); setIsEditOpen(true) }
  const handleEdit   = (row) => { setEditingRow(row); setIsEditOpen(true) }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dòng này?')) return
    
    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase
        .from(TABLES.CHI_TIET_CONG_VIEC)
        .delete()
        .eq('id', id)
      if (error) {
        showToast('Lỗi khi xóa trên Supabase: ' + error.message, 'error')
        return
      }
    }

    setRows(prev => prev.filter(r => r.id !== id))
    showToast('Đã xóa thành công')
  }

  const handleSave = async (formData) => {
    const supabase = getSupabase()
    
    if (editingRow) {
      const updatedRow = { ...editingRow, ...formData }
      updatedRow.trangThai = calcTrangThai(updatedRow, pcuDays)
      
      if (supabase) {
        const dbRow = toSnakeCase(updatedRow)
        // Ensure trangThai and ID are handled correctly
        delete dbRow.trang_thai // Computed
        
        const { error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .update(dbRow)
          .eq('id', editingRow.id)
        if (error) {
          showToast('Lỗi đồng bộ Supabase: ' + error.message, 'error')
          return
        }
      }

      setRows(prev => prev.map(r => r.id === editingRow.id ? updatedRow : r))
      showToast('Đã cập nhật thành công')
    } else {
      const newRow = { ...formData, id: genId(), createdAt: new Date().toISOString() }
      newRow.trangThai = calcTrangThai(newRow, pcuDays)
      
      if (supabase) {
        const dbRow = toSnakeCase(newRow)
        delete dbRow.trang_thai // Computed
        
        const { error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .insert([dbRow])
        if (error) {
          showToast('Lỗi đồng bộ Supabase: ' + error.message, 'error')
          return
        }
      }

      setRows(prev => [newRow, ...prev])
      showToast('Đã thêm mới thành công')
    }
    setIsEditOpen(false)
    setEditingRow(null)
  }

  const handleRefresh = () => {
    setRows(prev => recalcAll(prev, pcuDays))
    showToast('Đã tính lại trạng thái')
  }

  const handleSaveSettings = (newSettings) => {
    onSaveSettings(newSettings)
    setRows(prev => recalcAll(prev, newSettings.pcuDays || DEFAULT_PCU_DAYS))
    showToast('Đã lưu cài đặt')
  }

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))
  const handleClearFilters  = () => {
    setFilters({ maVatTu: '', tenVatTu: '', tenNCC: 'ALL', nhom: 'ALL', loaiHD: 'ALL', trangThai: 'ALL', dot: '' })
    setSearchGlobal('')
  }

  const handleSort = (key) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir('asc') }
  }

  const uniqueNcc  = useMemo(() => Array.from(new Set(rows.map(r => r.tenNcc).filter(Boolean))).sort(), [rows])
  const uniqueNhom = useMemo(() => Array.from(new Set(rows.map(r => r.nhom).filter(Boolean))).sort(), [rows])

  const filteredRows = useMemo(() => {
    let result = [...rows]
    if (searchGlobal.trim()) {
      const q = searchGlobal.toLowerCase()
      result = result.filter(r => Object.values(r).some(v => v && String(v).toLowerCase().includes(q)))
    }
    if (filters.maVattu)                          result = result.filter(r => (r.maVattu  || '').toLowerCase().includes(filters.maVattu.toLowerCase()))
    if (filters.tenVattu)                         result = result.filter(r => (r.tenVattu || '').toLowerCase().includes(filters.tenVattu.toLowerCase()))
    if (filters.tenNcc   && filters.tenNcc   !== 'ALL') result = result.filter(r => r.tenNcc   === filters.tenNcc)
    if (filters.nhom     && filters.nhom     !== 'ALL') result = result.filter(r => r.nhom     === filters.nhom)
    if (filters.loaiHd   && filters.loaiHd   !== 'ALL') result = result.filter(r => r.loaiHd   === filters.loaiHd)
    if (filters.trangThai && filters.trangThai !== 'ALL') result = result.filter(r => r.trangThai === filters.trangThai)
    if (filters.dot) {
      const q = filters.dot.toLowerCase()
      result = result.filter(r => (r.dot || '').toLowerCase().includes(q) || (r.dotNhapTay || '').toLowerCase().includes(q))
    }
    if (sortKey) {
      result.sort((a, b) => {
        const cmp = String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''), 'vi')
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return result
  }, [rows, searchGlobal, filters, sortKey, sortDir])

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb  = XLSX.read(buffer, { type: 'array' })
      const ws  = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 2) { showToast('File trống hoặc không đúng định dạng', 'error'); return }
      const headerMap = {
        'Mã Vật tư':'maVattu','Tên vật tư':'tenVattu','Đvt':'dvt','Tên NCC':'tenNcc',
        'Số Lượng Giao thực NCC':'soLuongGiaoThuc','Nhóm':'nhom','Loại HĐ':'loaiHd',
        'Quy cách kỹ thuật':'quyCachKyThuat','Đợt':'dot','Khối lượng':'khoiLuong',
        'Ngày gửi PCU':'ngayGuiPcu','Ngày PCU trả':'ngayPcuTra','Ngày ký HĐ':'ngayKyHd',
        'Ngày tạm ứng':'ngayTamUng','Ngày về Dự kiến bắt đầu':'ngayVeDuKienBatDau',
        'Ngày về Dự kiến kết thúc':'ngayVeDuKienKetThuc','Đợt (nhập tay)':'dotNhapTay',
        'Ngày theo nhu cầu BCH':'ngayTheoNhuCauBch','Ngày về thực tế':'ngayVeThucTe',
        'Khối lượng (nhập tay)':'khoiLuongNhapTay',
        'Tên chuyên viên phối hợp K.QLVT':'tenChuyenVienKqlvt',
        'Tên CVPCU thực hiện':'tenCvpcuThucHien','Ghi chú':'ghiChu',
      }
      const headers = raw[0].map(h => String(h).trim())
      const colMap  = {}
      headers.forEach((h, i) => { const key = headerMap[h]; if (key) colMap[i] = key })
      const newRows = raw.slice(1).filter(r => r.some(v => v !== '')).map(r => {
        const obj = { id: genId(), createdAt: new Date().toISOString() }
        Object.entries(colMap).forEach(([i, key]) => { obj[key] = String(r[i] || '').trim() })
        obj.trangThai = calcTrangThai(obj, pcuDays)
        return obj
      })
      setRows(prev => [...prev, ...newRows])
      showToast(`Đã import ${newRows.length} dòng thành công`)
    } catch (err) {
      console.error(err); showToast('Lỗi đọc file Excel', 'error')
    }
    e.target.value = ''
  }

  const handleExport = async () => {
    try {
      const XLSX = await loadXLSX()
      const headers = ['STT','Mã Vật tư','Tên vật tư','Đvt','Tên NCC','Số Lượng Giao thực NCC','Nhóm','Loại HĐ','Quy cách kỹ thuật','Đợt','Khối lượng','Trạng thái','Ngày gửi PCU','Ngày PCU trả','Ngày ký HĐ','Ngày tạm ứng','Ngày về Dự kiến bắt đầu','Ngày về Dự kiến kết thúc','Đợt (nhập tay)','Ngày theo nhu cầu BCH','Ngày về thực tế','Khối lượng (nhập tay)','Khối lượng còn thiếu','Tên chuyên viên phối hợp K.QLVT','Tên CVPCU thực hiện','Ghi chú']
      const dataRows = filteredRows.map((r, idx) => [idx+1,r.maVattu||'',r.tenVattu||'',r.dvt||'',r.tenNcc||'',r.soLuongGiaoThuc||'',r.nhom||'',r.loaiHd||'',r.quyCachKyThuat||'',r.dot||'',r.khoiLuong||'',r.trangThai||'',r.ngayGuiPcu||'',r.ngayPcuTra||'',r.ngayKyHd||'',r.ngayTamUng||'',r.ngayVeDuKienBatDau||'',r.ngayVeDuKienKetThuc||'',r.dotNhapTay||'',r.ngayTheoNhuCauBch||'',r.ngayVeThucTe||'',r.khoiLuongNhapTay||'',calcKhoiLuongConThieu(r.khoiLuong,r.khoiLuongNhapTay),r.tenChuyenVienKqlvt||'',r.tenCvpcuThucHien||'',r.ghiChu||''])
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
      ws['!cols'] = [{wch:5},{wch:12},{wch:25},{wch:8},{wch:20},{wch:15},{wch:15},{wch:18},{wch:25},{wch:8},{wch:12},{wch:12},{wch:14},{wch:14},{wch:12},{wch:12},{wch:18},{wch:18},{wch:12},{wch:18},{wch:14},{wch:15},{wch:16},{wch:30},{wch:20},{wch:25}]
      const wb2 = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb2, ws, 'Vật tư PCU')
      XLSX.writeFile(wb2, `QuanLyVatTu_${new Date().toLocaleDateString('vi-VN').replace(/\//g,'-')}.xlsx`)
      showToast('Xuất Excel thành công')
    } catch (err) {
      console.error(err); showToast('Lỗi xuất Excel', 'error')
    }
  }

  return (
    <>
      <Header
        onAddNew={handleAddNew} onExport={handleExport} onImport={handleImport}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalRows={rows.length} filteredRows={filteredRows.length}
        searchGlobal={searchGlobal} onSearchGlobal={setSearchGlobal}
        onRefresh={handleRefresh}
      />

      <StatsBar rows={rows} />

      <FilterBar
        filters={filters} onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        uniqueNcc={uniqueNcc} uniqueNhom={uniqueNhom}
      />

      {/* Info bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-1 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Hiển thị <span className="font-bold text-royal-600">{filteredRows.length}</span>
          {' '}/ <span className="font-semibold text-slate-700">{rows.length}</span> dòng
        </span>
        {filteredRows.length !== rows.length && (
          <span className="flex items-center gap-1 text-royal-500 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-royal-400 inline-block" />
            Đang lọc
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-royal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-royal-600">Đang đồng bộ dữ liệu...</span>
            </div>
          </div>
        )}
        <DataTable
          rows={filteredRows} onEdit={handleEdit} onDelete={handleDelete}
          pcuDays={pcuDays} currentUser={settings.currentUser}
          sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
        />
      </div>

      <EditModal
        isOpen={isEditOpen} initialData={editingRow}
        onClose={() => { setIsEditOpen(false); setEditingRow(null) }}
        onSave={handleSave} currentUser={settings.currentUser}
      />

      <SettingsModal
        isOpen={isSettingsOpen} settings={settings}
        onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings}
      />

      {toast && (
        <div className={`toast-enter fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold ${
          toast.type === 'error'
            ? 'bg-rose-500 text-white border-rose-400/50 shadow-rose-500/25'
            : 'bg-white text-slate-800 border-slate-200 shadow-slate-900/15'
        }`}>
          <span className="text-base">{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.message}
        </div>
      )}
    </>
  )
}

function ComingSoonSheet({ title, icon: Icon, color }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-slate-50/50">
      <div className={`w-20 h-20 rounded-3xl ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-10 h-10 text-white opacity-80" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-black text-slate-700 mb-1">{title}</h2>
        <p className="text-slate-400 text-sm">Module này đang được phát triển</p>
      </div>
      <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 text-sm font-semibold shadow-sm">
        🚧 Sắp ra mắt
      </div>
    </div>
  )
}

export default function App() {
  const [activeSheet, setActiveSheet] = useState('chi-tiet-cong-viec')

  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY)
      return s ? JSON.parse(s) : { pcuDays: DEFAULT_PCU_DAYS, currentUser: '' }
    } catch { return { pcuDays: DEFAULT_PCU_DAYS, currentUser: '' } }
  })

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
  }

  const renderSheet = () => {
    switch (activeSheet) {
      case 'quan-ly-tai-khoan':   return <QuanLyTaiKhoan />
      case 'data-vat-tu-ncc':    return <DataVatTuNCC />
      case 'chi-tiet-cong-viec': return <ChiTietCongViec settings={settings} onSaveSettings={handleSaveSettings} />
      case 'bao-cao-canh-bao':   return <BaoCaoCanhBao />
      case 'cau-hinh-supabase':  return <CauHinhSupabase />
      case 'cau-hinh-du-an':     return <CauHinhDuAn />
      case 'cau-hinh-logo':       return <CauHinhLogo />
      default:
        return (
          <ComingSoonSheet
            title={activeSheet.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            icon={Layers}
            color="bg-slate-400"
          />
        )
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Sidebar onNavigate={setActiveSheet} activeSheet={activeSheet} />
      {renderSheet()}
    </div>
  )
}
