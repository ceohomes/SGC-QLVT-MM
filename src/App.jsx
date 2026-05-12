import React, { useState, useMemo, useEffect } from 'react'
import { Layers, Settings, ShieldCheck } from 'lucide-react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import DataTable from './components/DataTable'
import EditModal from './components/EditModal'
import SettingsModal from './components/SettingsModal'
import StatsBar from './components/StatsBar'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import DataVatTuNCC from './components/sheets/DataVatTuNCC'
import QuanLyTaiKhoan from './components/sheets/QuanLyTaiKhoan'
import BaoCaoCanhBao from './components/sheets/BaoCaoCanhBao'
import CauHinhDuAn from './components/sheets/CauHinhDuAn'
import CauHinhLogo from './components/sheets/CauHinhLogo'
import { LOCAL_STORAGE_KEY, SETTINGS_KEY, DEFAULT_PCU_DAYS, TABLES } from './constants'
import { genId, calcTrangThai, calcKhoiLuongConThieu, toCamelCase, toSnakeCase } from './utils'
import { getSupabase } from './lib/supabase'

const LOGO_CONFIG_KEY = 'SGC_LOGO_CONFIG_v1'

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
  primaryColor: '#0f58a7'
}

async function loadXLSX() { return import('xlsx') }

function recalcAll(rows, pcuDays) {
  return rows.map(r => ({ ...r, trangThai: calcTrangThai(r, pcuDays) }))
}

function ChiTietCongViec({ settings, onSaveSettings, branding, onOpenSidebar, user }) {
  const pcuDays = settings.pcuDays || DEFAULT_PCU_DAYS

  const [rows, setRows] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Load projects
  useEffect(() => {
    let channel = null
    async function fetchProjects() {
      const supabase = getSupabase()
      
      const loadFromLocal = () => {
        try {
          const d = localStorage.getItem('sgc_cau_hinh_du_an_v2')
          if (d) {
            const localData = JSON.parse(d)
            const flattened = localData.reduce((acc, k) => [
              ...acc,
              { id: k.id, ten: k.ten, vietTat: k.vietTat, paletteIdx: k.paletteIdx, isLocalOnly: true },
              ...(k.duAn || []).map(d => ({ 
                ...d, 
                khoiId: k.id, 
                khoiTen: k.ten, 
                khoiVietTat: k.vietTat,
                paletteIdx: k.paletteIdx,
                isLocalOnly: true
              }))
            ], [])
            setProjects(flattened)
            console.log('[App] Projects loaded from localStorage fallback (marked isLocalOnly)')
          }
        } catch (err) { console.error('LocalStorage projects load failed:', err) }
      }

      const processProjects = (data) => {
        if (!data) return
        const camelData = data.map(toCamelCase)
        
        // Chỉ lấy các bản ghi là Khối (có du_an là mảng)
        const dbKhois = camelData.filter(item => Array.isArray(item.duAn))
        const allParsedProjects = []

        dbKhois.forEach(k => {
          // 1. Thêm chính Khối đó vào danh sách (để hiển thị ở dropdown hoặc lọc)
          allParsedProjects.push({
            ...k,
            isLocalOnly: false
          })

          // 2. Trích xuất các dự án con từ cột du_an (JSON array)
          if (k.duAn && k.duAn.length > 0) {
            k.duAn.forEach(p => {
              allParsedProjects.push({
                ...p,
                khoiId: k.id,
                khoiTen: k.ten,
                khoiVietTat: k.vietTat,
                paletteIdx: k.paletteIdx,
                isLegacy: false, // Giờ đây chính là chuẩn mới
                isLocalOnly: false
              })
            })
          }
        })

        console.log('[App] Reconstructed projects from JSON:', allParsedProjects.length)
        setProjects(allParsedProjects)
      }

      if (supabase) {
        try {
          const { data, error } = await supabase.from(TABLES.DU_AN).select('*')
          if (data && data.length > 0) {
            processProjects(data)
          } else {
            loadFromLocal()
          }

          channel = supabase
            .channel(`rt-projects-${Date.now()}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.DU_AN }, async () => {
              const { data: fresh } = await supabase.from(TABLES.DU_AN).select('*')
              if (fresh) processProjects(fresh)
            })
            .subscribe()
        } catch (err) { 
          console.error('Projects fetch failed', err)
          loadFromLocal()
        }
      } else {
        loadFromLocal()
      }
    }
    fetchProjects()
    return () => {
      if (channel) getSupabase()?.removeChannel(channel)
    }
  }, [])

  // Load data + Realtime subscription
  useEffect(() => {
    let channel = null

    function loadFromLocal() {
      try {
        const d = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (d) setRows(recalcAll(JSON.parse(d), pcuDays))
      } catch (err) { console.error('LocalStorage load failed:', err) }
      setIsLoading(false)
    }

    async function fetchData() {
      const supabase = getSupabase()
      if (!supabase) { loadFromLocal(); return }
      setIsLoading(true)

      try {
        console.log('[App] Loading from table:', TABLES.CHI_TIET_CONG_VIEC)
        const { data, error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setRows(recalcAll(data.map(toCamelCase), pcuDays))
          setIsLoading(false)
        } else {
          console.error('[Supabase] Fetch error:', error)
          loadFromLocal()
          if (error) showToast('Lỗi tải dữ liệu: ' + error.message, 'error')
        }
      } catch (err) {
        console.error('[App] Fetch exception:', err)
        loadFromLocal()
      }

      // Realtime: cập nhật tức thì khi tài khoản khác thay đổi dữ liệu
      // Sử dụng tên channel duy nhất để tránh lỗi "cannot add callbacks after subscribe"
      const channelName = `rt-ctcv-${Date.now()}`
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: TABLES.CHI_TIET_CONG_VIEC
        }, async () => {
          const { data: fresh } = await supabase
            .from(TABLES.CHI_TIET_CONG_VIEC)
            .select('*')
            .order('created_at', { ascending: false })
          if (fresh) setRows(recalcAll(fresh.map(toCamelCase), pcuDays))
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Subscribed to', channelName)
          }
        })
    }

    fetchData()

    return () => {
      const supabase = getSupabase()
      if (channel && supabase) supabase.removeChannel(channel)
    }
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
  const [filters, setFilters] = useState({ searchVattu: '', tenNcc: 'ALL', nhom: 'ALL', loaiHd: 'ALL', trangThai: 'ALL', dot: '' })
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddNew = () => { 
    setEditingRow(selectedProjectId !== 'ALL' ? { projectId: selectedProjectId } : null)
    setIsEditOpen(true) 
  }

  const handleAddSubRow = (parentRow, mode = 'kehoach') => {
    setEditingRow({ 
      parentId: parentRow.id,
      projectId: parentRow.projectId,
      maVattu: parentRow.maVattu,
      tenVattu: parentRow.tenVattu,
      dvt: parentRow.dvt,
      nhom: parentRow.nhom,
      khoiLuong: parentRow.khoiLuong,
      quyCachKyThuat: parentRow.quyCachKyThuat,
      tenChuyenVienKqlvt: settings.currentUser || '',
      subMode: mode   // 'kehoach' hoặc 'thucte'
    })
    setIsEditOpen(true)
  }

  const handleEdit   = (row) => { setEditingRow(row); setIsEditOpen(true) }

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dòng này?')) return
    
    const supabase = getSupabase()
    if (supabase) {
      // Tìm tất cả id cần xóa: dòng chính + các dòng phụ liên quan
      const subRowIds = rows
        .filter(r => r.parentId === id && r.id)
        .map(r => r.id)
      const allIds = [id, ...subRowIds].filter(Boolean)

      // Xóa từng id riêng lẻ (tránh dùng parent_id vì cột này không tồn tại trên DB)
      for (const deleteId of allIds) {
        const { error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .delete()
          .eq('id', deleteId)
        if (error) {
          showToast('Lỗi khi xóa trên Supabase: ' + error.message, 'error')
          return
        }
      }
    }

    setRows(prev => prev.filter(r => r.id !== id && r.parentId !== id))
    showToast('Đã xóa thành công')
  }

  const handleSave = async (formData) => {
    console.log('[App] Saving formData:', formData)
    const supabase = getSupabase()
    const isEdit = !!editingRow?.id
    
    try {
      if (isEdit) {
        const updatedRow = { ...editingRow, ...formData }
        updatedRow.trangThai = calcTrangThai(updatedRow, pcuDays)
        updatedRow.updatedAt = new Date().toISOString()
        
        if (supabase) {
          const dbRow = toSnakeCase(updatedRow)
          delete dbRow.trang_thai  // Computed field, không có trong DB
          // parent_id và sub_idx được lưu bình thường vào DB

          // Cập nhật lại project_id nếu bị đổi
          if (dbRow.project_id && dbRow.project_id !== 'ALL') {
             const proj = projects.find(b => b.id === dbRow.project_id)
             if (proj) {
                if (proj.isLocalOnly || proj.isLegacy) {
                   showToast('Lỗi: Khối thi công này chưa được lưu trên hệ thống. Vui lòng vào "Cấu hình dự án" và bấm "Lưu cấu hình".', 'error')
                   return
                }
                // CHỐT: Luôn dùng ID của Khối (hàng cha thực sự) để thỏa mãn FK
                dbRow.project_id = proj.khoiId || proj.id
                
                // Cập nhật Tên dự án theo định dạng [Tên viết tắt]. [Tên dự án]
                const vt = proj.khoiVietTat || proj.vietTat
                const duAnFormatted = vt ? `${vt}. ${proj.ten}` : proj.ten
                dbRow.du_an = duAnFormatted

                // Denormalization
                dbRow.khoi_ten = proj.khoiTen || proj.ten
                dbRow.khoi_viet_tat = proj.khoiVietTat || proj.vietTat
             }
          }
          
          console.log('[Supabase] Updating dbRow:', dbRow)
          const { error } = await supabase
            .from(TABLES.CHI_TIET_CONG_VIEC)
            .update(dbRow)
            .eq('id', editingRow.id)
          if (error) {
            console.error('[Supabase] Update error:', error)
            showToast('Lỗi đồng bộ Supabase: ' + error.message, 'error')
            return
          }
        }

        setRows(prev => prev.map(r => r.id === editingRow.id ? updatedRow : r))
        showToast('Đã cập nhật thành công')
      } else {
        // THÊM MỚI
        const newRow = { 
          ...formData, 
          id: genId(), 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Đảm bảo có projectId chính xác
        let finalProjectId = formData.projectId || selectedProjectId
        
        // Nếu finalProjectId là ALL hoặc không có, không được phép thêm mới vật tư chính
        if (!formData.parentId && (!finalProjectId || finalProjectId === 'ALL')) {
          showToast('Lỗi: Bạn phải chọn một Khối thi công hoặc Dự án cụ thể trước khi thêm vật tư', 'error')
          return
        }

        if (finalProjectId && finalProjectId !== 'ALL') {
          const block = projects.find(b => b.id === finalProjectId)
          if (block) {
            if (block.isLocalOnly || block.isLegacy) {
               showToast('Lỗi: Khối thi công/Dự án này chưa được đồng bộ hoàn toàn (Legacy). Vui lòng vào "Cấu hình dự án" và bấm "Lưu cấu hình" để nâng cấp dữ liệu.', 'error')
               return
            }
            // CHỐT: Luôn dùng ID của Khối (hàng cha thực sự) để thỏa mãn FK
            finalProjectId = block.khoiId || block.id
            
            // Cập nhật Tên dự án và thông tin khối cho denormalization
            const vt = block.khoiVietTat || block.vietTat
            newRow.duAn = vt ? `${vt}. ${block.ten}` : block.ten
            newRow.khoiTen = block.khoiTen || block.ten
            newRow.khoiVietTat = block.khoiVietTat || block.vietTat
          } else {
            showToast('Lỗi: Dự án/Khối thi công này không tồn tại trong danh sách. Vui lòng kiểm tra lại Cấu hình dự án.', 'error')
            return
          }
        }

        newRow.projectId = finalProjectId

        // Kiểm tra cuối cùng trước khi lưu
        if (!newRow.projectId || newRow.projectId === 'ALL') {
          showToast('Lỗi: Chưa xác định được Khối thi công cho vật tư này', 'error')
          return
        }
        
        // Nếu là dòng phụ, tính toán subIdx
        if (formData.parentId) {
          const siblings = rows.filter(r => r.parentId === formData.parentId)
          newRow.subIdx = siblings.length + 1
          // Dòng phụ luôn theo project của dòng chính
          const parentRow = rows.find(r => r.id === formData.parentId)
          if (parentRow) newRow.projectId = parentRow.projectId
        }
        
        newRow.trangThai = calcTrangThai(newRow, pcuDays)
        
        if (supabase) {
          const dbRow = toSnakeCase(newRow)
          delete dbRow.trang_thai  // Computed field, không có trong DB

          // Nếu DB chưa có cột parent_id/sub_idx, xóa để tránh lỗi
          // Để hỗ trợ dòng phụ đầy đủ, chạy SQL sau trong Supabase:
          // ALTER TABLE vt_chi_tiet_cong_viec
          //   ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES vt_chi_tiet_cong_viec(id) ON DELETE CASCADE,
          //   ADD COLUMN IF NOT EXISTS sub_idx integer DEFAULT 1;
          
          // CHỐT: Luôn dùng ID của Khối (hàng cha thực sự trong DB) để thỏa mãn FK constraint
          const proj = projects.find(p => p.id === dbRow.project_id)
          if (proj) {
            dbRow.project_id = proj.khoiId || proj.id
            
            // Cập nhật Tên dự án theo định dạng [Tên viết tắt]. [Tên dự án]
            const vt = proj.khoiVietTat || proj.vietTat
            const duAnFormatted = vt ? `${vt}. ${proj.ten}` : proj.ten
            dbRow.du_an = duAnFormatted

            dbRow.khoi_ten = proj.khoiTen || proj.ten
            dbRow.khoi_viet_tat = proj.khoiVietTat || proj.vietTat
          }

          if (dbRow.project_id === '') dbRow.project_id = null

          console.log('[Supabase] Inserting dbRow:', dbRow)
          let { error } = await supabase
            .from(TABLES.CHI_TIET_CONG_VIEC)
            .insert([dbRow])

          // Nếu lỗi do cột parent_id/sub_idx chưa tồn tại trong DB → thử lại không có 2 cột này
          if (error && (error.message?.includes('parent_id') || error.message?.includes('sub_idx'))) {
            const fallbackRow = { ...dbRow }
            delete fallbackRow.parent_id
            delete fallbackRow.sub_idx
            const retry = await supabase.from(TABLES.CHI_TIET_CONG_VIEC).insert([fallbackRow])
            if (retry.error) {
              console.error('[Supabase] Insert error details:', retry.error)
              showToast('Lỗi đồng bộ Supabase: ' + retry.error.message, 'error')
              return
            }
            // Cột chưa có → báo người dùng biết cần thêm cột để dòng phụ hoạt động đầy đủ
            showToast('⚠️ Đã lưu nhưng dòng phụ cần thêm cột DB. Xem hướng dẫn trong Settings.', 'warning')
            error = null
          }

          if (error) {
            console.error('[Supabase] Insert error details:', error)
            showToast('Lỗi đồng bộ Supabase: ' + error.message, 'error')
            return
          }
        }

        setRows(prev => [...prev, newRow])
        showToast('Đã thêm mới thành công')
      }
    } catch (err) {
      console.error('[App] handleSave exception:', err)
      showToast('Lỗi hệ thống khi lưu dữ liệu', 'error')
    } finally {
      setIsEditOpen(false)
      setEditingRow(null)
    }
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
    setFilters({ searchVattu: '', tenNcc: 'ALL', nhom: 'ALL', loaiHd: 'ALL', trangThai: 'ALL', dot: '' })
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
    // CẬP NHẬT: Lọc dự án chính xác theo Khối hoặc Dự án con
    if (selectedProjectId !== 'ALL') {
      const selected = projects.find(p => p.id === selectedProjectId)
      if (selected) {
        if (selected.khoiId) {
          // Nếu chọn Dự án con: Lọc theo định dạng tên đã lưu ở cột duAn
          const vt = selected.khoiVietTat || selected.vietTat
          const matchName = vt ? `${vt}. ${selected.ten}` : selected.ten
          result = result.filter(r => r.duAn === matchName)
        } else {
          // Nếu chọn Khối thi công: Lọc theo projectId (Khối ID)
          result = result.filter(r => r.projectId === selectedProjectId)
        }
      }
    }
    if (searchGlobal.trim()) {
      const q = searchGlobal.toLowerCase()
      result = result.filter(r => Object.values(r).some(v => v && String(v).toLowerCase().includes(q)))
    }
    if (filters.searchVattu) {
      const q = filters.searchVattu.toLowerCase()
      result = result.filter(r => 
        (r.maVattu || '').toLowerCase().includes(q) || 
        (r.tenVattu || '').toLowerCase().includes(q)
      )
    }
    if (filters.tenNcc   && filters.tenNcc   !== 'ALL') result = result.filter(r => r.tenNcc   === filters.tenNcc)
    if (filters.nhom     && filters.nhom     !== 'ALL') result = result.filter(r => r.nhom     === filters.nhom)
    if (filters.loaiHd   && filters.loaiHd   !== 'ALL') result = result.filter(r => r.loaiHd   === filters.loaiHd)
    if (filters.trangThai && filters.trangThai !== 'ALL') result = result.filter(r => r.trangThai === filters.trangThai)
    if (filters.dot) {
      const q = filters.dot.toLowerCase()
      result = result.filter(r => (r.dot || '').toLowerCase().includes(q) || (r.dotNhapTay || '').toLowerCase().includes(q))
    }

    // Tổ chức theo phân cấp: Dòng phụ nằm ngay dưới dòng chính
    const parents = result.filter(r => !r.parentId)
    const children = result.filter(r => r.parentId)

    // Sắp xếp dòng chính theo thời gian tạo (hoặc sortKey nếu có)
    if (sortKey) {
      parents.sort((a, b) => {
        const cmp = String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''), 'vi')
        return sortDir === 'asc' ? cmp : -cmp
      })
    } else {
      parents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    const hierarchical = []
    parents.forEach(p => {
      hierarchical.push(p)
      const subRows = children.filter(c => c.parentId === p.id)
      subRows.sort((a, b) => (a.subIdx || 0) - (b.subIdx || 0))
      hierarchical.push(...subRows)
    })

    return hierarchical
  }, [rows, searchGlobal, filters, sortKey, sortDir, selectedProjectId])

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
        let finalPid = selectedProjectId
        if (finalPid !== 'ALL') {
          obj.projectId = finalPid
          const proj = projects.find(p => p.id === finalPid)
          if (proj) {
            const vt = proj.khoiVietTat || proj.vietTat
            obj.duAn = vt ? `${vt}. ${proj.ten}` : proj.ten
            obj.khoiTen = proj.khoiTen || proj.ten
            obj.khoiVietTat = proj.khoiVietTat || proj.vietTat
          }
        }
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
      const headers = ['STT','Dự án','Khối thi công','Mã Vật tư','Tên vật tư','Đvt','Tên NCC','Số Lượng Giao thực NCC','Nhóm','Loại HĐ','Quy cách kỹ thuật','Đợt','Khối lượng','Trạng thái','Ngày gửi PCU','Ngày PCU trả','Ngày ký HĐ','Ngày tạm ứng','Ngày về Dự kiến bắt đầu','Ngày về Dự kiến kết thúc','Đợt (nhập tay)','Ngày theo nhu cầu BCH','Ngày về thực tế','Khối lượng (nhập tay)','Khối lượng còn thiếu','Tên chuyên viên phối hợp K.QLVT','Tên CVPCU thực hiện','Ghi chú']
      const dataRows = filteredRows.map((r, idx) => {
        const pInfo = projects.find(p => p.id === r.projectId)
        const duAnStr = r.duAn || (pInfo ? (pInfo.khoiVietTat ? `${pInfo.khoiVietTat}. ${pInfo.ten}` : pInfo.ten) : '—')
        const khoiStr = r.khoiVietTat ? `${r.khoiVietTat} · ${r.khoiTen}` : (pInfo ? (pInfo.khoiVietTat ? `${pInfo.khoiVietTat} · ${pInfo.khoiTen}` : pInfo.ten) : '—')

        return [
          idx+1,
          duAnStr,
          khoiStr,
          r.maVattu||'',
          r.tenVattu||'',
          r.dvt||'',
          r.tenNcc||'',
          r.soLuongGiaoThuc||'',
          r.nhom||'',
          r.loaiHd||'',
          r.quyCachKyThuat||'',
          r.dot||'',
          r.khoiLuong||'',
          r.trangThai||'',
          r.ngayGuiPcu||'',
          r.ngayPcuTra||'',
          r.ngayKyHd||'',
          r.ngayTamUng||'',
          r.ngayVeDuKienBatDau||'',
          r.ngayVeDuKienKetThuc||'',
          r.dotNhapTay||'',
          r.ngayTheoNhuCauBch||'',
          r.ngayVeThucTe||'',
          r.khoiLuongNhapTay||'',
          calcKhoiLuongConThieu(r.khoiLuong,r.khoiLuongNhapTay),
          r.tenChuyenVienKqlvt||'',
          r.tenCvpcuThucHien||'',
          r.ghiChu||''
        ]
      })
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])
      ws['!cols'] = [{wch:5},{wch:25},{wch:20},{wch:12},{wch:25},{wch:8},{wch:20},{wch:15},{wch:15},{wch:18},{wch:25},{wch:8},{wch:12},{wch:12},{wch:14},{wch:14},{wch:12},{wch:12},{wch:18},{wch:18},{wch:12},{wch:18},{wch:14},{wch:15},{wch:16},{wch:30},{wch:20},{wch:25}]
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
        branding={branding}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onOpenSidebar={onOpenSidebar}
      />

      <StatsBar rows={rows} />

      <FilterBar
        filters={filters} onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        uniqueNcc={uniqueNcc} uniqueNhom={uniqueNhom}
        onAddNew={handleAddNew}
        selectedProjectId={selectedProjectId}
        projects={projects}
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
          <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-white/50 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Đang đồng bộ dữ liệu...</span>
            </div>
          </div>
        )}
        <DataTable
          rows={filteredRows} projects={projects} onEdit={handleEdit} onDelete={handleDelete}
          onAddSubRow={handleAddSubRow}
          pcuDays={pcuDays} currentUser={settings.currentUser}
          sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
        />
      </div>

      <EditModal
        isOpen={isEditOpen} initialData={editingRow}
        onClose={() => { setIsEditOpen(false); setEditingRow(null) }}
        onSave={handleSave} currentUser={settings.currentUser}
        projects={projects} existingRows={rows}
      />

      <SettingsModal
        isOpen={isSettingsOpen} settings={settings}
        onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings}
        user={user}
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
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [activeSheet, setActiveSheet] = useState('chi-tiet-cong-viec')
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('SGC_AUTH_USER_v1')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })

  const [branding, setBranding] = useState(() => {
    try {
      const d = localStorage.getItem(LOGO_CONFIG_KEY)
      return d ? JSON.parse(d) : DEFAULT_BRANDING
    } catch { return DEFAULT_BRANDING }
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Đảm bảo app không bao giờ bị treo màn hình trắng — timeout tối đa 5 giây
    const safetyTimer = setTimeout(() => {
      setIsAppLoading(false)
    }, 5000)

    async function init() {
      try {
        const supabase = getSupabase()
        if (!supabase) {
          clearTimeout(safetyTimer)
          await new Promise(r => setTimeout(r, 600))
          setIsAppLoading(false)
          return
        }

        // Race giữa fetch branding và timeout 4 giây
        const fetchBranding = supabase.from(TABLES.LOGO).select('*').single()
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))

        try {
          const { data, error } = await Promise.race([fetchBranding, timeout])
          if (!error && data) {
            const config = {
              logoUrl: data.logourl || '',
              appName: data.appname || DEFAULT_BRANDING.appName,
              primaryColor: data.primarycolor || DEFAULT_BRANDING.primaryColor,
            }
            setBranding(config)
            localStorage.setItem(LOGO_CONFIG_KEY, JSON.stringify(config))
          }
        } catch (fetchErr) {
          console.warn('Branding fetch skipped:', fetchErr.message)
        }

        // Hiệu ứng splash tối thiểu
        await new Promise(r => setTimeout(r, 600))
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        clearTimeout(safetyTimer)
        setIsAppLoading(false)
      }
    }

    init()

    return () => clearTimeout(safetyTimer)
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
      case 'quan-ly-tai-khoan':   return <QuanLyTaiKhoan branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} currentUser={user} />
      case 'data-vat-tu-ncc':    return <DataVatTuNCC branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'chi-tiet-cong-viec': return <ChiTietCongViec settings={settings} onSaveSettings={handleSaveSettings} branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} user={user} />
      case 'bao-cao-canh-bao':   return <BaoCaoCanhBao branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'cau-hinh-du-an':     return <CauHinhDuAn branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'cau-hinh-logo':       return <CauHinhLogo onBrandingChange={setBranding} onOpenSidebar={() => setIsSidebarOpen(true)} />
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
      <Sidebar 
        onNavigate={setActiveSheet} 
        activeSheet={activeSheet} 
        branding={branding} 
        user={user} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />
      
      {/* Content Area - Moves when sidebar opens if we wanted, but for now we'll use a fixed width layout pattern */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="flex-1 min-h-0 flex flex-col">
          {renderSheet()}
        </div>
        {/* Thanh ghi chú SGC Company */}
        <footer className="h-7 bg-white border-t border-slate-200 flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 font-roboto uppercase tracking-[0.2em]">
              SGC Company
            </span>
          </div>
        </footer>
      </main>
    </div>
  )
}
