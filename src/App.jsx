import React, { useState, useMemo, useEffect } from 'react'
import { Layers, Settings, ShieldCheck, Trash2, AlertTriangle, FileText, X, CheckCircle } from 'lucide-react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import DataTable, { COLUMNS } from './components/DataTable'
import EditModal from './components/EditModal'
import SettingsModal from './components/SettingsModal'
import StatsBar from './components/StatsBar'
import Sidebar from './components/Sidebar'
import ConfirmModal from './components/ConfirmModal'
import Login from './components/Login'
import DataVatTuNCC from './components/sheets/DataVatTuNCC'
import QuanLyTaiKhoan from './components/sheets/QuanLyTaiKhoan'
import BaoCaoCanhBao from './components/sheets/BaoCaoCanhBao'
import CauHinhDuAn from './components/sheets/CauHinhDuAn'
import CauHinhLogo from './components/sheets/CauHinhLogo'
import { LOCAL_STORAGE_KEY, SETTINGS_KEY, DEFAULT_PCU_DAYS, TABLES, TRANG_THAI } from './constants'
import { genId, calcTrangThai, calcKhoiLuongConThieu, toCamelCase, toSnakeCase, parseNumber } from './utils'
import { getSupabase, fetchAll } from './lib/supabase'

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
  return rows.map(row => {
    let kl = row.khoiLuong
    let klnt = row.khoiLuongNhapTay
    let subRowsFound = false
    
    // Nếu là dòng chính, Khối lượng = tổng các dòng phụ
    if (!row.parentId) {
      const subRows = rows.filter(r => r.parentId === row.id)
      if (subRows.length > 0) {
        subRowsFound = true
        const sumKL = subRows.reduce((acc, sub) => acc + parseNumber(sub.khoiLuong), 0)
        const sumKLNT = subRows.reduce((acc, sub) => acc + parseNumber(sub.khoiLuongNhapTay), 0)
        kl = sumKL > 0 ? sumKL : ''
        klnt = sumKLNT > 0 ? sumKLNT : ''
      }
    }
    
    // Sử dụng giá trị cộng dồn để tính Trạng thái và KL còn thiếu
    const statusRow = { ...row, khoiLuong: kl, khoiLuongNhapTay: klnt }
    
    // 1. Đối với dòng chính: nếu không có dòng con nào thì để trống Trạng thái
    // 2. Đối với dòng phụ:
    //    - Nếu là nhóm 'Kế hoạch': Giữ nguyên logic trạng thái
    //    - Nếu là nhóm 'Thực tế': Bỏ trạng thái
    let finalTrangThai = ''
    if (!row.parentId) {
      // Dòng chính
      if (subRowsFound) {
        finalTrangThai = calcTrangThai(statusRow, pcuDays)
      }
    } else {
      // Dòng phụ
      if (row.subMode === 'kehoach' || !row.subMode) {
        finalTrangThai = calcTrangThai(statusRow, pcuDays)
      } else {
        finalTrangThai = ''
      }
    }

    return { 
      ...row, 
      trangThai: finalTrangThai,
      computedKL: kl,
      computedKLNT: klnt
    }
  })
}

function PreviewUpVatTuModal({ data, onConfirm, onCancel }) {
  if (!data) return null
  const { newItems, skipped, total, errors } = data

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-royal-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">Xem trước dữ liệu Up Vật tư</h3>
              <p className="text-royal-100 text-[10px] font-medium tracking-wider">Xác nhận danh sách vật tư sẽ được thêm vào dự án hiện tại</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-royal-50 border-b border-royal-100 flex gap-4 flex-wrap">
          <div className="px-3 py-1.5 bg-white rounded-lg border border-royal-200 shadow-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700">Sẽ thêm mới: <span className="text-emerald-600">{newItems.length}</span> / {total} dòng</span>
          </div>
          <div className="px-3 py-1.5 bg-white rounded-lg border border-orange-200 shadow-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-700">Đã bỏ qua (trùng/không hợp lệ): <span className="text-orange-600">{skipped + errors.length}</span> dòng</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {newItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
              <ShieldCheck className="w-16 h-16 opacity-20" />
              <p className="font-medium">Không có vật tư mới nào để thêm. Tất cả mã đã tồn tại hoặc không hợp lệ.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-200 w-16 text-center">STT</th>
                    <th className="px-4 py-3 border-b border-slate-200 w-32">Mã SAP</th>
                    <th className="px-4 py-3 border-b border-slate-200">Tên vật tư</th>
                    <th className="px-4 py-3 border-b border-slate-200 w-24 text-center">ĐVT</th>
                    <th className="px-4 py-3 border-b border-slate-200">Loại vật tư</th>
                    <th className="px-4 py-3 border-b border-slate-200">Chuyên viên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 text-center font-mono text-[11px] text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-royal-600 font-mono text-[12px]">{item.maVattu}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-700">{item.tenVattu}</td>
                      <td className="px-4 py-2.5 text-center text-slate-500">{item.dvt}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 bg-royal-50 text-royal-700 rounded-full text-[10px] font-black tracking-tighter uppercase">{item.nhom}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 font-medium">{item.tenChuyenVienKqlvt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
              <h4 className="text-red-700 font-black text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Mã vật tư không tồn tại trong danh mục ({errors.length}):
              </h4>
              <p className="text-red-600 text-xs font-mono break-all leading-relaxed">
                {errors.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={newItems.length === 0}
            className={`px-8 py-2 rounded-xl text-sm font-black text-white shadow-lg shadow-royal-200 transform transition-all active:scale-95
              ${newItems.length > 0 ? "bg-royal-600 hover:bg-royal-500 hover:-translate-y-0.5" : "bg-slate-300 cursor-not-allowed"}
            `}
          >
            Lưu {newItems.length} dòng vào hệ thống
          </button>
        </div>
      </div>
    </div>
  )
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
          const data = await fetchAll(supabase, TABLES.DU_AN)
          if (data && data.length > 0) {
            processProjects(data)
          } else {
            loadFromLocal()
          }

          channel = supabase
            .channel(`rt-projects-${Date.now()}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.DU_AN }, async () => {
              try {
                const fresh = await fetchAll(supabase, TABLES.DU_AN)
                if (fresh) processProjects(fresh)
              } catch (err) { console.error(err) }
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
        const data = await fetchAll(supabase, TABLES.CHI_TIET_CONG_VIEC, { 
          orderCol: 'created_at', 
          orderAsc: false 
        })

        if (data) {
          setRows(recalcAll(data.map(toCamelCase), pcuDays))
          setIsLoading(false)
        } else {
          loadFromLocal()
        }
      } catch (err) {
        console.error('[App] Fetch exception:', err)
        loadFromLocal()
        showToast('Lỗi tải dữ liệu: ' + (err.message || 'Lỗi không xác định'), 'error')
      }

      // Realtime: cập nhật tức thì khi tài khoản khác thay đổi dữ liệu
      const channelName = `rt-ctcv-${Date.now()}`
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: TABLES.CHI_TIET_CONG_VIEC
        }, async () => {
          try {
            const fresh = await fetchAll(supabase, TABLES.CHI_TIET_CONG_VIEC, { 
              orderCol: 'created_at', 
              orderAsc: false 
            })
            if (fresh) setRows(recalcAll(fresh.map(toCamelCase), pcuDays))
          } catch (err) { console.error(err) }
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
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, title, message }
  const [alertInfo, setAlertInfo] = useState(null) // { title, message, type, icon }

  const showAlert = (title, message, type = 'danger', icon = AlertTriangle) => {
    setAlertInfo({ title, message, type, icon })
  }

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
      duAn: parentRow.duAn,
      maVattu: parentRow.maVattu,
      tenVattu: parentRow.tenVattu,
      dvt: parentRow.dvt,
      nhom: parentRow.nhom,
      khoiLuong: parentRow.khoiLuong,
      quyCachKyThuat: parentRow.quyCachKyThuat,
      tenNcc: parentRow.tenNcc,
      tenNccThucTe: parentRow.tenNcc,
      subMode: mode   // 'kehoach' hoặc 'thucte'
    })
    setIsEditOpen(true)
  }

  const handleEdit   = (row) => { setEditingRow(row); setIsEditOpen(true) }

  const handleDelete = async (id) => {
    setConfirmDelete({
      id,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa dòng này? Tất cả dữ liệu liên quan sẽ bị loại bỏ.'
    })
  }

  const performDelete = async (id) => {
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
          showAlert('Lỗi khi xóa', 'Không thể xóa dữ liệu trên hệ thống. Chi tiết: ' + error.message)
          setConfirmDelete(null)
          return
        }
      }
    }

    setRows(prev => prev.filter(r => r.id !== id && r.parentId !== id))
    
    // Nếu đang mở modal chính cái dòng vừa xóa thì đóng lại
    if (editingRow?.id === id) {
      setIsEditOpen(false)
      setEditingRow(null)
    }

    showToast('Đã xóa thành công')
    setConfirmDelete(null)
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
            showAlert('Lỗi cập nhật', 'Không thể lưu thay đổi vào hệ thống. Chi tiết: ' + error.message)
            return
          }
        }

        setRows(prev => prev.map(r => r.id === editingRow.id ? updatedRow : r))

        // Nếu là dòng chính (không có parentId), cập nhật các trường chung xuống tất cả dòng con
        if (!editingRow.parentId) {
          const SHARED_FIELDS = ['projectId', 'duAn', 'khoiTen', 'khoiVietTat', 'maVattu', 'tenVattu', 'dvt', 'nhom', 'quyCachKyThuat']
          const sharedData = {}
          SHARED_FIELDS.forEach(f => { if (updatedRow[f] !== undefined) sharedData[f] = updatedRow[f] })

          // Cập nhật local state cho dòng con
          setRows(prev => prev.map(r => {
            if (r.parentId !== editingRow.id) return r
            const updatedNames = {}
            if (updatedRow.duAn !== undefined) updatedNames.duAn = updatedRow.duAn
            const updated = { ...r, ...sharedData, ...updatedNames, updatedAt: new Date().toISOString() }
            updated.trangThai = calcTrangThai(updated, pcuDays)
            return updated
          }))

          // Cập nhật lên Supabase cho từng dòng con
          if (supabase) {
            const childRows = rows.filter(r => r.parentId === editingRow.id)
            for (const child of childRows) {
              const childDbRow = toSnakeCase({ ...child, ...sharedData, updatedAt: new Date().toISOString() })
              await supabase.from(TABLES.CHI_TIET_CONG_VIEC).update(childDbRow).eq('id', child.id)
            }
          }
        }

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
          // Dòng phụ luôn theo project và thông tin vật tư của dòng chính
          const parentRow = rows.find(r => r.id === formData.parentId)
          if (parentRow) {
            const SHARED_FIELDS = ['projectId', 'duAn', 'khoiTen', 'khoiVietTat', 'maVattu', 'tenVattu', 'dvt', 'nhom', 'quyCachKyThuat']
            SHARED_FIELDS.forEach(f => {
              newRow[f] = parentRow[f]
            })
          }
        }
        
        newRow.trangThai = calcTrangThai(newRow, pcuDays)
        
        if (supabase) {
          const dbRow = toSnakeCase(newRow)

          // dbRow.project_id đã được set đúng là khoiId (FK constraint)
          // dbRow.du_an, khoi_ten, khoi_viet_tat đã được set đúng ở bước trên
          // KHÔNG override lại ở đây để tránh bị ghi đè bằng dữ liệu của khối cha

          if (dbRow.project_id === '') dbRow.project_id = null

          console.log('[Supabase] Inserting dbRow:', dbRow)
          let { error } = await supabase
            .from(TABLES.CHI_TIET_CONG_VIEC)
            .insert([dbRow])

          if (error) {
            console.error('[Supabase] Insert error details:', error)
            showAlert('Lỗi thêm mới', 'Không thể lưu vật tư mới vào hệ thống. Chi tiết: ' + error.message)
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

  const uniqueNcc  = useMemo(() => Array.from(new Set(rows.flatMap(r => [r.tenNcc, r.tenNccThucTe]).filter(Boolean))).sort(), [rows])
  const uniqueNhom = useMemo(() => Array.from(new Set(rows.map(r => r.nhom).filter(Boolean))).sort(), [rows])

  const filteredRows = useMemo(() => {
    // Helper to check if a single row matches the filters
    const matches = (r) => {
      if (searchGlobal.trim()) {
        const q = searchGlobal.toLowerCase()
        if (!Object.values(r).some(v => v && String(v).toLowerCase().includes(q))) return false
      }
      if (filters.searchVattu) {
        const q = filters.searchVattu.toLowerCase()
        if (!(r.maVattu || '').toLowerCase().includes(q) && !(r.tenVattu || '').toLowerCase().includes(q)) return false
      }
      if (filters.tenNcc && filters.tenNcc !== 'ALL') {
        if (r.tenNcc !== filters.tenNcc && r.tenNccThucTe !== filters.tenNcc) return false
      }
      if (filters.nhom && filters.nhom !== 'ALL') {
        if (r.nhom !== filters.nhom) return false
      }
      if (filters.loaiHd && filters.loaiHd !== 'ALL') {
        if (r.loaiHd !== filters.loaiHd) return false
      }
      if (filters.trangThai && filters.trangThai !== 'ALL') {
        if (Array.isArray(filters.trangThai)) {
          if (!filters.trangThai.includes(r.trangThai)) return false
        } else {
          if (r.trangThai !== filters.trangThai) return false
        }
      }
      if (filters.dot) {
        const q = filters.dot.toLowerCase()
        if (!(r.dot || '').toLowerCase().includes(q) && !(r.dotNhapTay || '').toLowerCase().includes(q)) return false
      }
      return true
    }

    const rawParents = rows.filter(r => !r.parentId)
    const rawChildren = rows.filter(r => r.parentId)

    const selectedProjectInfo = selectedProjectId !== 'ALL' ? projects.find(p => p.id === selectedProjectId) : null
    
    // Filter parents by Project Selector
    const projectMatchingParents = rawParents.filter(p => {
      if (!selectedProjectInfo) return true
      if (selectedProjectInfo.khoiId) {
        // Lọc theo Dự án con (so khớp chuỗi tên)
        const vt = selectedProjectInfo.khoiVietTat || selectedProjectInfo.vietTat
        const matchName = vt ? `${vt}. ${selectedProjectInfo.ten}` : selectedProjectInfo.ten
        return (p.duAn || '').trim() === matchName.trim()
      }
      // Lọc theo Khối cha (so khớp ID)
      return p.projectId === selectedProjectId
    })

    const finalResult = []
    
    // Sort project-matching parents
    const sortedParents = [...projectMatchingParents]
    if (sortKey) {
      sortedParents.sort((a, b) => {
        const cmp = String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''), 'vi')
        return sortDir === 'asc' ? cmp : -cmp
      })
    } else {
      sortedParents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    sortedParents.forEach(p => {
      const pChildren = rawChildren.filter(c => c.parentId === p.id)
      const pMatches = matches(p)
      const matchingChildren = pChildren.filter(c => matches(c))

      // Nếu dòng chính khớp filter (Tìm kiếm/NCC/Nhóm...) HOẶC có bất kỳ dòng con nào khớp
      if (pMatches || matchingChildren.length > 0) {
        finalResult.push(p)
        
        // Sắp xếp các dòng con (Kế hoạch trước, Thực tế sau, rồi theo subIdx)
        const sortedChildren = [...pChildren].sort((a, b) => {
          const modeA = a.subMode || 'kehoach'
          const modeB = b.subMode || 'kehoach'
          if (modeA === modeB) return (a.subIdx || 0) - (b.subIdx || 0)
          return modeA === 'kehoach' ? -1 : 1
        })
        
        // Chỉ hiển thị các dòng con thực sự khớp khi đang có bộ lọc tích cực
        const isFiltering = searchGlobal.trim() || Object.values(filters).some(v => v && v !== 'ALL' && v !== '')
        if (isFiltering) {
          finalResult.push(...sortedChildren.filter(c => matchingChildren.some(m => m.id === c.id)))
        } else {
          finalResult.push(...sortedChildren)
        }
      }
    })

    return finalResult
  }, [rows, searchGlobal, filters, sortKey, sortDir, selectedProjectId, projects])

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
        'Nhóm':'nhom','Loại HĐ':'loaiHd',
        'Quy cách kỹ thuật':'quyCachKyThuat','Đợt':'dot','Khối lượng':'khoiLuong',
        'Ngày gửi PCU':'ngayGuiPcu','Ngày PCU trả':'ngayPcuTra','Ngày ký HĐ':'ngayKyHd',
        'Ngày tạm ứng':'ngayTamUng','Ngày về Dự kiến bắt đầu':'ngayVeDuKienBatDau',
        'Ngày về Dự kiến kết thúc':'ngayVeDuKienKetThuc','Đợt (nhập tay)':'dotNhapTay',
        'Ngày theo nhu cầu BCH':'ngayTheoNhuCauBch','Ngày về thực tế':'ngayVeThucTe',
        'Khối lượng (nhập tay)':'khoiLuongNhapTay','Tên NCC (thực tế)':'tenNccThucTe',
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

  const [previewUpVattu, setPreviewUpVattu] = useState(null) // { newItems, errors, skipped, total }

  const handleUpVatTu = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const supabase = getSupabase()
    if (!supabase) {
      showToast('Hệ thống chưa kết nối cơ sở dữ liệu', 'error')
      return
    }

    try {
      setIsLoading(true)
      // 1. Fetch toàn bộ danh mục vật tư để so khớp
      const dmData = await fetchAll(supabase, TABLES.DM_VATTU)
      if (!dmData || dmData.length === 0) {
        showToast('Danh mục vật tư trống. Vui lòng kiểm tra lại.', 'error')
        setIsLoading(false)
        return
      }
      const dmDict = {}
      dmData.forEach(item => {
        const code = String(item.ma_vattu_sap || '').trim().toUpperCase()
        if (code) dmDict[code] = item
      })

      // 2. Đọc file Excel
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 2) {
        showToast('File trống hoặc không có tiêu đề', 'error')
        setIsLoading(false)
        return
      }

      // 3. Tìm cột Mã vật tư
      const headers = raw[0].map(h => String(h).trim().toLowerCase())
      const maVattuIdx = headers.findIndex(h => 
        h.includes('mã vật tư') || 
        h.includes('mã sap') || 
        h === 'ma_vattu_sap' ||
        h === 'ma_vattu' ||
        h === 'sap'
      )
      if (maVattuIdx === -1) {
        showToast('Không tìm thấy cột "Mã vật tư" trong file Excel. Vui lòng kiểm tra lại tiêu đề.', 'error')
        setIsLoading(false)
        return
      }

      // Thông tin dự án hiện tại
      const selectedProject = projects.find(p => p.id === selectedProjectId)
      if (!selectedProject || !selectedProject.khoiId) {
        showToast('Chưa xác định được Khối thi công.', 'error')
        setIsLoading(false)
        return
      }

      const projId = selectedProject.khoiId
      const vt = selectedProject.khoiVietTat || selectedProject.vietTat
      const duAnName = vt ? `${vt}. ${selectedProject.ten}` : selectedProject.ten
      const khoiTen = selectedProject.khoiTen || selectedProject.ten
      const khoiVietTat = selectedProject.khoiVietTat || selectedProject.vietTat

      // 4. Kiểm tra trùng lặp trong dự án hiện tại
      const existingCodesInProject = new Set(
        rows
          .filter(r => !r.parentId && r.maVattu)
          .map(r => String(r.maVattu).trim().toUpperCase())
      )

      // 5. So khớp và tạo bản ghi mới
      const newItems = []
      const fileCodes = new Set()
      const errors = []
      let skippedCount = 0

      for (let i = 1; i < raw.length; i++) {
        const row = raw[i]
        const codeValue = String(row[maVattuIdx] || '').trim().toUpperCase()
        if (!codeValue) continue

        // Kiểm tra trùng lặp nội bộ trong file
        if (fileCodes.has(codeValue)) {
          skippedCount++
          continue
        }
        fileCodes.add(codeValue)

        // Kiểm tra trùng lặp với dữ liệu đã có trong dự án
        if (existingCodesInProject.has(codeValue)) {
          skippedCount++
          continue
        }

        const matchedVattu = dmDict[codeValue]
        if (matchedVattu) {
          const newRow = {
            id: genId(),
            projectId: projId,
            duAn: duAnName,
            khoiTen: khoiTen,
            khoiVietTat: khoiVietTat,
            maVattu: matchedVattu.ma_vattu_sap,
            tenVattu: matchedVattu.ten_vattu,
            dvt: matchedVattu.dvt,
            nhom: matchedVattu.loai_vattu || 'Vật tư chính',
            quyCachKyThuat: matchedVattu.thong_so_ky_thuat || '',
            tenChuyenVienKqlvt: user?.hoTen || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            trangThai: TRANG_THAI.CHO_XU_LY 
          }
          newItems.push(newRow)
        } else {
          errors.push(codeValue)
        }
      }

      if (newItems.length === 0 && errors.length === 0) {
        showToast('Không có dữ liệu mới hợp lệ để thêm (có thể dữ liệu đã tồn tại trong dự án hoặc file trùng lặp).', 'warning')
      } else {
        setPreviewUpVattu({ newItems, errors, skipped: skippedCount, total: raw.length - 1 })
      }

    } catch (err) {
      console.error(err)
      showToast('Lỗi khi xử lý file: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  const confirmUpVatTu = async () => {
    if (!previewUpVattu || previewUpVattu.newItems.length === 0) {
      setPreviewUpVattu(null)
      return
    }
    
    setIsLoading(true)
    const supabase = getSupabase()
    try {
      const dbRows = previewUpVattu.newItems.map(toSnakeCase)
      const { error: insertErr } = await supabase.from(TABLES.CHI_TIET_CONG_VIEC).insert(dbRows)
      if (insertErr) {
        showAlert('Lỗi lưu dữ liệu', 'Không thể lưu danh sách vật tư vào hệ thống. Chi tiết: ' + insertErr.message)
      } else {
        setRows(prev => [...prev, ...previewUpVattu.newItems])
        showToast(`Đã thêm ${previewUpVattu.newItems.length} vật tư vào dự án.`)
        setPreviewUpVattu(null)
      }
    } catch (err) {
      showToast('Lỗi khi lưu dữ liệu: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default || await import('exceljs');
      const { saveAs } = await import('file-saver');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Chi tiết công việc');

      // 1. Phân loại cột từ DataTable.jsx
      const infoCols = COLUMNS.filter(c => c.vung === 'info')
      const keHoachCols = COLUMNS.filter(c => c.vung === 'kehoach')
      const thucTeCols = COLUMNS.filter(c => c.vung === 'thucte')
      const allCols = [...infoCols, ...keHoachCols, ...thucTeCols]

      // 2. Dòng 1: Header Nhóm (Nội dung, Kế hoạch, Thực tế)
      const headerGroupRow = worksheet.addRow([])
      headerGroupRow.height = 30
      
      const setGroupHeader = (startIdx, length, label, color) => {
        const startCol = startIdx + 1
        const endCol = startIdx + length
        worksheet.mergeCells(1, startCol, 1, endCol)
        const cell = worksheet.getCell(1, startCol)
        cell.value = label
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color.replace('#', 'FF') }
        }
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        }
      }

      setGroupHeader(0, infoCols.length, '📄 Nội dung', '#0f51cc')
      setGroupHeader(infoCols.length, keHoachCols.length, '📋 Kế hoạch', '#f2740b')
      setGroupHeader(infoCols.length + keHoachCols.length, thucTeCols.length, '✅ Thực tế', '#10a45b')

      // 3. Dòng 2: Header Cột
      const headerLabels = allCols.map(c => {
        if (c.key === 'tenChuyenVienKqlvt') return "Chuyên viên\nP. QLVT"
        if (c.key === 'khoiLuongConThieu') return "Khối lượng\ncòn thiếu"
        return c.label
      })
      const headerRow = worksheet.addRow(headerLabels)
      headerRow.height = 25
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const colDef = allCols[colNumber - 1]
        let bgColor = '#0f51cc'
        if (colDef.vung === 'kehoach') bgColor = '#f2740b'
        if (colDef.vung === 'thucte') bgColor = '#10a45b'

        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor.replace('#', 'FF') }
        }
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        }
      })

      // Enable Auto Filter for the second row (headers)
      worksheet.autoFilter = {
        from: { row: 2, column: 1 },
        to: { row: 2, column: allCols.length }
      }

      // Set column widths
      worksheet.columns = allCols.map(c => ({ width: c.width / 7 }))

      // 4. Data Rows
      const parentsOnly = rows.filter(r => !r.parentId)
      
      filteredRows.forEach((r, idx) => {
        const pInfo = projects.find(p => p.id === r.projectId)
        const duAnStr = r.duAn || (pInfo ? (pInfo.khoiVietTat ? `${pInfo.khoiVietTat}. ${pInfo.ten}` : pInfo.ten) : '')
        const khoiStr = r.khoiTen || (pInfo ? (pInfo.khoiTen || '') : '')

        const klForExport = r.computedKL !== undefined ? r.computedKL : r.khoiLuong
        const klntForExport = r.computedKLNT !== undefined ? r.computedKLNT : r.khoiLuongNhapTay

        // STT Logic
        let stt = ''
        if (!r.parentId) {
          const pIdx = parentsOnly.indexOf(r)
          stt = parentsOnly.length - pIdx
        } else {
          const p = rows.find(x => x.id === r.parentId)
          const pIdx = parentsOnly.indexOf(p)
          stt = `${parentsOnly.length - pIdx}.${r.subIdx || 1}`
        }

        const rowData = allCols.map(col => {
          if (col.key === 'stt') return stt
          if (col.key === 'khoiThiCong') return khoiStr
          if (col.key === 'projectName') return duAnStr
          if (col.key === 'khoiLuongConThieu') return !r.parentId ? (calcKhoiLuongConThieu(klForExport, klntForExport) || '') : ''
          if (col.key === 'khoiLuong') return klForExport
          if (col.key === 'khoiLuongNhapTay') return klntForExport
          
          return r[col.key] || ''
        })

        const excelRow = worksheet.addRow(rowData)
        // Remove fixed height to allow auto-row height for wrapped text in Excel

        // Styling rows - MUST include empty cells to ensure borders and background colors are applied
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const colDef = allCols[colNumber - 1]
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          }
          cell.alignment = { vertical: 'middle', horizontal: colDef.center ? 'center' : 'left', wrapText: true }

          if (!r.parentId) {
            // Dòng chính
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFBFBFB' }
            }
            cell.font = { bold: true, color: { argb: 'FF000000' } }
          } else {
            // Dòng phụ
            if (r.subMode === 'thucte') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }
              cell.font = { color: { argb: 'FF065F46' } }
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
              cell.font = { color: { argb: 'FF78350F' } }
            }
          }
          
          // Specific column formatting
          if (colDef.key === 'maVattu') {
            cell.font = { ...cell.font, bold: !r.parentId }
          }
          if (colDef.key === 'khoiLuongConThieu') {
             // Always Red as per request
             cell.font = { ...cell.font, color: { argb: 'FFFF0000' } }
          }
        })
      })

      // Freeze headers
      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2, activePane: 'bottomRight', selType: 'cell' }]

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `ChiTietCongViec_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`)
      showToast('Xuất Excel thành công')
    } catch (err) {
      console.error(err); showToast('Lỗi xuất Excel: ' + err.message, 'error')
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

      <StatsBar rows={filteredRows} />

      <FilterBar
        filters={filters} onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        uniqueNcc={uniqueNcc} uniqueNhom={uniqueNhom}
        onAddNew={handleAddNew}
        onUpVatTu={handleUpVatTu}
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
        onSave={handleSave} currentUser={user?.hoTen || settings.currentUser || ''}
        projects={projects} existingRows={rows}
        onAddSubRow={handleAddSubRow}
        onDelete={handleDelete}
      />

      <SettingsModal
        isOpen={isSettingsOpen} settings={settings}
        onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings}
        user={user}
      />

      <PreviewUpVatTuModal
        data={previewUpVattu}
        onConfirm={confirmUpVatTu}
        onCancel={() => setPreviewUpVattu(null)}
      />

      {confirmDelete && (
        <ConfirmModal
          isOpen={!!confirmDelete}
          title={confirmDelete.title}
          subtitle="Hành động này không thể hoàn tác"
          message={confirmDelete.message}
          type="danger"
          icon={Trash2}
          onConfirm={() => performDelete(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
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

        // Fetch system config (id=1)
        try {
          const { data, error } = await supabase.from(TABLES.LOGO).select('*').eq('id', 1).maybeSingle()
          
          if (!error && data) {
            const config = {
              logoUrl: data.logourl || DEFAULT_BRANDING.logoUrl,
              appName: data.appname || DEFAULT_BRANDING.appName,
              primaryColor: data.primarycolor || DEFAULT_BRANDING.primaryColor,
            }
            setBranding(config)
            localStorage.setItem(LOGO_CONFIG_KEY, JSON.stringify(config))
            
            if (data.pcudays !== undefined && data.pcudays !== null) {
              setSettings(prev => {
                const updated = { ...prev, pcuDays: data.pcudays }
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
                return updated
              })
            }
          }
        } catch (fetchErr) {
          console.warn('System config fetch failed:', fetchErr.message)
        }

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

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase
      .channel('rt-system-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.LOGO }, (payload) => {
        console.log('[Realtime] Logo table change:', payload)
        const data = payload.new || payload.old
        if (data && data.id === 1) {
          if (data.pcudays !== undefined && data.pcudays !== null) {
            setSettings(prev => {
              const updated = { ...prev, pcuDays: data.pcudays }
              localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
              return updated
            })
          }
          if (data.logourl || data.appname || data.primarycolor) {
            setBranding(prev => {
              const config = {
                logoUrl: data.logourl || prev.logoUrl,
                appName: data.appname || prev.appName,
                primaryColor: data.primarycolor || prev.primaryColor,
              }
              localStorage.setItem(LOGO_CONFIG_KEY, JSON.stringify(config))
              return config
            })
          }
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))

    // Persist to Supabase for global application
    const supabase = getSupabase()
    if (supabase) {
      try {
        // Fetch current to avoid overwriting branding
        const { data: current, error: fetchErr } = await supabase.from(TABLES.LOGO).select('*').eq('id', 1).maybeSingle()
        
        const payload = {
          id: 1,
          pcudays: newSettings.pcuDays ?? 7,
          logourl: current?.logourl || branding.logoUrl || '',
          appname: current?.appname || branding.appName || '',
          primarycolor: current?.primarycolor || branding.primaryColor || '',
          updated_at: new Date().toISOString()
        }
        
        console.log('[App] Saving global settings:', payload)
        const { error: saveErr } = await supabase.from(TABLES.LOGO).upsert([payload])
        
        if (saveErr) {
          console.error('[App] Supabase settings save error:', saveErr)
          // Alert user that cloud sync failed
          alert(`Lưu ngoại tuyến thành công nhưng không thể đồng bộ lên đám mây: ${saveErr.message}. Vui lòng kiểm tra kết nối hoặc bảng ad_cau_hinh_logo.`)
        } else {
          console.log('[App] Global settings synced successfully')
        }
      } catch (err) {
        console.error('[App] Failed to sync settings to cloud:', err)
      }
    }
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
