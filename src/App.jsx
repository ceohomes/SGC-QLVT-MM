import React, { useState, useMemo, useEffect } from 'react'
import { Layers, Settings } from 'lucide-react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import DataTable from './components/DataTable'
import EditModal from './components/EditModal'
import SettingsModal from './components/SettingsModal'
import StatsBar from './components/StatsBar'
import Sidebar from './components/Sidebar'
<<<<<<< HEAD
=======
import Login from './components/Login'
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
import DataVatTuNCC from './components/sheets/DataVatTuNCC'
import QuanLyTaiKhoan from './components/sheets/QuanLyTaiKhoan'
import BaoCaoCanhBao from './components/sheets/BaoCaoCanhBao'
import CauHinhDuAn from './components/sheets/CauHinhDuAn'
import CauHinhLogo from './components/sheets/CauHinhLogo'
import { LOCAL_STORAGE_KEY, SETTINGS_KEY, DEFAULT_PCU_DAYS, TABLES } from './constants'
import { genId, calcTrangThai, calcKhoiLuongConThieu, toCamelCase, toSnakeCase } from './utils'
import { getSupabase } from './lib/supabase'

const LOGO_CONFIG_KEY = 'SGC_LOGO_CONFIG_v1'
<<<<<<< HEAD
const DEFAULT_BRANDING = {
  logoUrl: '',
  appName: 'SGC | QUẢN LÝ VẬT TƯ',
=======

function LoadingScreen({ branding }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#ef4444] via-[#b91c1c] to-[#7f1d1d] overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-black/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Rectangular Logo Box */}
        <div className="w-64 h-28 bg-white rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-700 overflow-hidden">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="max-w-[90%] max-h-[85%] object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="text-red-600 w-12 h-12" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">SGC SYSTEM</span>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-white/10 rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.4em] font-sans">Vui lòng chờ giây lát...</p>
        </div>
      </div>
    </div>
  )
}
const DEFAULT_BRANDING = {
  logoUrl: '',
  appName: 'SGC | QUẢN LÝ VẬT TƯ & MMTB',
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
  primaryColor: '#0f58a7'
}

async function loadXLSX() { return import('xlsx') }

function recalcAll(rows, pcuDays) {
  return rows.map(r => ({ ...r, trangThai: calcTrangThai(r, pcuDays) }))
}

<<<<<<< HEAD
function ChiTietCongViec({ settings, onSaveSettings }) {
  const pcuDays = settings.pcuDays || DEFAULT_PCU_DAYS

  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(false)

=======
function ChiTietCongViec({ settings, onSaveSettings, branding, onOpenSidebar }) {
  const pcuDays = settings.pcuDays || DEFAULT_PCU_DAYS

  const [rows, setRows] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Load projects
  useEffect(() => {
    async function fetchProjects() {
      const supabase = getSupabase()
      if (supabase) {
        try {
          const { data, error } = await supabase.from(TABLES.DU_AN).select('*')
          if (!error && data) {
            const camelData = data.map(toCamelCase)
            const flattened = camelData.reduce((acc, k) => [...acc, ...(k.duAn || []).map(d => ({ ...d, khoiTen: k.ten }))], [])
            setProjects(flattened)
            return
          }
        } catch (err) { console.error('Projects fetch failed', err) }
      }
    }
    fetchProjects()
  }, [])

>>>>>>> 1b450e7 (Cập nhật code mới nhất)
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

<<<<<<< HEAD
  const handleAddNew = () => { setEditingRow(null); setIsEditOpen(true) }
=======
  const handleAddNew = () => { 
    setEditingRow(selectedProjectId !== 'ALL' ? { projectId: selectedProjectId } : null)
    setIsEditOpen(true) 
  }
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
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
<<<<<<< HEAD
=======
    if (selectedProjectId !== 'ALL') {
      result = result.filter(r => r.projectId === selectedProjectId)
    }
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
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
<<<<<<< HEAD
=======
        if (selectedProjectId !== 'ALL') obj.projectId = selectedProjectId
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
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
<<<<<<< HEAD
=======
        branding={branding}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onOpenSidebar={onOpenSidebar}
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
      />

      <StatsBar rows={rows} />

      <FilterBar
        filters={filters} onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        uniqueNcc={uniqueNcc} uniqueNhom={uniqueNhom}
<<<<<<< HEAD
=======
        onAddNew={handleAddNew}
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
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
<<<<<<< HEAD
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-royal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-royal-600">Đang đồng bộ dữ liệu...</span>
=======
          <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-white/50 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Đang đồng bộ dữ liệu...</span>
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
            </div>
          </div>
        )}
        <DataTable
<<<<<<< HEAD
          rows={filteredRows} onEdit={handleEdit} onDelete={handleDelete}
=======
          rows={filteredRows} projects={projects} onEdit={handleEdit} onDelete={handleDelete}
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
          pcuDays={pcuDays} currentUser={settings.currentUser}
          sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
        />
      </div>

      <EditModal
        isOpen={isEditOpen} initialData={editingRow}
        onClose={() => { setIsEditOpen(false); setEditingRow(null) }}
        onSave={handleSave} currentUser={settings.currentUser}
<<<<<<< HEAD
=======
        projects={projects}
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
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
<<<<<<< HEAD
  const [activeSheet, setActiveSheet] = useState('chi-tiet-cong-viec')
=======
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [activeSheet, setActiveSheet] = useState('chi-tiet-cong-viec')
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('SGC_AUTH_USER_v1')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })

>>>>>>> 1b450e7 (Cập nhật code mới nhất)
  const [branding, setBranding] = useState(() => {
    try {
      const d = localStorage.getItem(LOGO_CONFIG_KEY)
      return d ? JSON.parse(d) : DEFAULT_BRANDING
    } catch { return DEFAULT_BRANDING }
  })

<<<<<<< HEAD
  useEffect(() => {
    async function fetchBranding() {
      const supabase = getSupabase()
      if (!supabase) return
=======
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = getSupabase()
      if (!supabase) {
        setIsAppLoading(false)
        return
      }
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
      try {
        const { data, error } = await supabase.from(TABLES.LOGO).select('*').single()
        if (!error && data) {
          const config = {
            logoUrl: data.logourl || '',
            appName: data.appname || DEFAULT_BRANDING.appName,
            primaryColor: data.primarycolor || DEFAULT_BRANDING.primaryColor,
          }
          setBranding(config)
          localStorage.setItem(LOGO_CONFIG_KEY, JSON.stringify(config))
        }
<<<<<<< HEAD
      } catch (err) { console.error('Branding fetch failed', err) }
    }
    fetchBranding()
=======
        // Small delay to ensure smooth splash experience
        await new Promise(r => setTimeout(r, 800))
      } catch (err) { 
        console.error('Branding fetch failed', err) 
      } finally {
        setIsAppLoading(false)
      }
    }
    init()
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
  }, [])

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

<<<<<<< HEAD
  const renderSheet = () => {
    switch (activeSheet) {
      case 'quan-ly-tai-khoan':   return <QuanLyTaiKhoan />
      case 'data-vat-tu-ncc':    return <DataVatTuNCC />
      case 'chi-tiet-cong-viec': return <ChiTietCongViec settings={settings} onSaveSettings={handleSaveSettings} />
      case 'bao-cao-canh-bao':   return <BaoCaoCanhBao />
      case 'cau-hinh-du-an':     return <CauHinhDuAn />
      case 'cau-hinh-logo':       return <CauHinhLogo onBrandingChange={setBranding} />
=======
  const handleLogin = (newUser) => {
    setUser(newUser)
    localStorage.setItem('SGC_AUTH_USER_v1', JSON.stringify(newUser))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('SGC_AUTH_USER_v1')
  }

  if (isAppLoading) {
    return <LoadingScreen branding={branding} />
  }

  if (!user) {
    return <Login onLogin={handleLogin} branding={branding} />
  }

  const renderSheet = () => {
    switch (activeSheet) {
      case 'quan-ly-tai-khoan':   return <QuanLyTaiKhoan branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'data-vat-tu-ncc':    return <DataVatTuNCC branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'chi-tiet-cong-viec': return <ChiTietCongViec settings={settings} onSaveSettings={handleSaveSettings} branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'bao-cao-canh-bao':   return <BaoCaoCanhBao branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'cau-hinh-du-an':     return <CauHinhDuAn branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'cau-hinh-logo':       return <CauHinhLogo onBrandingChange={setBranding} onOpenSidebar={() => setIsSidebarOpen(true)} />
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
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
    <div className="flex h-screen overflow-hidden bg-slate-50">
<<<<<<< HEAD
      <Sidebar onNavigate={setActiveSheet} activeSheet={activeSheet} branding={branding} />
=======
      <Sidebar 
        onNavigate={setActiveSheet} 
        activeSheet={activeSheet} 
        branding={branding} 
        user={user} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
      
      {/* Content Area - Moves when sidebar opens if we wanted, but for now we'll use a fixed width layout pattern */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        {renderSheet()}
      </main>
    </div>
  )
}
