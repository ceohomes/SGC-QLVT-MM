import React, { useState, useEffect, useMemo } from 'react'
import { ACCOUNTS_KEY as STORAGE_KEY, TABLES } from '../../constants'
import { getSupabase } from '../../lib/supabase'
import {
  UserCog, Plus, Trash2, Edit2, Eye, EyeOff, Shield, User, Search,
  CheckCircle2, XCircle, AlertCircle, X, Save, Key, Crown, Briefcase,
  Users, ClipboardList, RefreshCw
} from 'lucide-react'

const ROLES = [
  { value: 'admin',  label: 'Admin',  color: 'bg-rose-100 text-rose-700 border-rose-300',   icon: Crown,      desc: 'Toàn quyền hệ thống' },
  { value: 'user',   label: 'User',   color: 'bg-blue-100 text-blue-700 border-blue-300',   icon: User,       desc: 'Quyền xem & nhập liệu' },
]

const CHUC_DANH = [
  { value: 'hanh-chinh',   label: 'Hành chính',    color: 'bg-teal-100   text-teal-700   border-teal-300',     icon: ClipboardList, iconBg: 'bg-teal-500',   iconBgOff: 'bg-teal-100',   iconClrOff: 'text-teal-500'   },
  { value: 'chuyen-vien',  label: 'Chuyên viên',   color: 'bg-indigo-100 text-indigo-700 border-indigo-300',   icon: Briefcase,     iconBg: 'bg-indigo-500', iconBgOff: 'bg-indigo-100', iconClrOff: 'text-indigo-500' },
  { value: 'truong-nhom',  label: 'Trưởng nhóm',   color: 'bg-amber-100  text-amber-700  border-amber-300',    icon: Users,         iconBg: 'bg-amber-500',  iconBgOff: 'bg-amber-100',  iconClrOff: 'text-amber-500'  },
]

const PHONG_BAN = [
  { value: 'vat-tu', label: 'Phòng Vật tư', color: 'bg-purple-100 text-purple-700 border-purple-300', selectedBg: 'bg-purple-50', selectedBorder: 'border-purple-500', selectedText: 'text-purple-700', icon: ClipboardList },
  { value: 'mmtb',   label: 'Phòng MMTB',   color: 'bg-orange-100 text-orange-700 border-orange-300', selectedBg: 'bg-orange-50', selectedBorder: 'border-orange-500', selectedText: 'text-orange-700', icon: RefreshCw },
]

const DEFAULT_ACCOUNTS = [
  {
    id: 'acc-admin-002',
    hoTen: 'Đỗ Công Chung',
    username: 'Docongchung',
    password: 'sgc@2026',
    role: 'admin',
    chucDanh: 'truong-nhom',
    email: 'chung.do@sgc.vn',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'acc-admin-001',
    hoTen: 'Administrator',
    username: 'admin',
    password: 'admin@2025',
    role: 'admin',
    chucDanh: 'truong-nhom',
    email: 'admin@sgc.vn',
    active: true,
    createdAt: new Date().toISOString(),
  }
]

function genId() {
  return 'acc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function Badge({ value, list, size = 'sm' }) {
  const item = list.find(i => i.value === value)
  if (!item) return <span className="text-slate-400 text-xs">—</span>
  const Icon = item.icon
  const sz = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${item.color} ${sz}`}>
      <Icon className="w-3 h-3" />
      {item.label}
    </span>
  )
}

const EMPTY_FORM = { hoTen: '', username: '', password: '', role: 'user', chucDanh: 'chuyen-vien', phongBan: 'vat-tu', email: '', active: true }

const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

function AccountModal({ isOpen, onClose, onSave, initialData }) {
  const isEdit = !!initialData
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? { ...initialData } : { ...EMPTY_FORM })
      setErrors({})
      setShowPass(false)
    }
  }, [isOpen, initialData])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.hoTen.trim())     e.hoTen     = 'Bắt buộc'
    if (!form.username.trim())  e.username  = 'Bắt buộc'
    if (!isEdit && !form.password.trim()) e.password = 'Bắt buộc'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(form)
  }

  if (!isOpen) return null

  const inputCls = (key) =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[key]
        ? 'border-rose-300 bg-rose-50 focus:ring-rose-200'
        : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-blue-100 focus:bg-white'
    }`

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100" style={{background:'linear-gradient(135deg,#1d4ed8,#2563eb)'}}>
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-base">{isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}</h2>
            <p className="text-blue-200 text-xs font-medium">Điền đầy đủ thông tin bên dưới</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/25 text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Username + Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">Tên đăng nhập <span className="text-rose-500">*</span></label>
              <input 
                className={inputCls('username')} 
                placeholder="Ví dụ: Trần Đức Trung" 
                value={form.username} 
                onChange={e => {
                  const val = e.target.value
                  setForm(p => ({ ...p, username: val, hoTen: toTitleCase(val) }))
                }} 
              />
              {errors.username && <p className="text-rose-500 text-[11px] mt-0.5">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1">
                Mật khẩu {!isEdit && <span className="text-rose-500">*</span>}
                {isEdit && <span className="text-slate-400 font-normal">(để trống = giữ nguyên)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className={inputCls('password') + ' pr-8'}
                  placeholder={isEdit ? '••••••••' : 'Mật khẩu'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-[11px] mt-0.5">{errors.password}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">Email</label>
            <input className={inputCls('email')} placeholder="example@sgc.vn" value={form.email} onChange={e => set('email', e.target.value)} />
            {errors.email && <p className="text-rose-500 text-[11px] mt-0.5">{errors.email}</p>}
          </div>

          {/* Phòng ban */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1.5">Phòng ban phân loại <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {PHONG_BAN.map(pb => {
                const selected = form.phongBan === pb.value
                return (
                  <button key={pb.value} type="button" onClick={() => set('phongBan', pb.value)}
                    className={`flex items-center justify-center p-2.5 rounded-xl border-2 text-center transition-all ${
                      selected ? `${pb.selectedBorder} ${pb.selectedBg}` : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}>
                    <span className={`text-sm font-black ${selected ? pb.selectedText : 'text-slate-600'}`}>{pb.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1.5">Quyền hệ thống <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => {
                const Icon = r.icon
                const selected = form.role === r.value
                return (
                  <button key={r.value} type="button" onClick={() => set('role', r.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${
                      selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-blue-500' : 'bg-slate-100'}`}>
                      <Icon className={`w-4 h-4 ${selected ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <div className={`text-xs font-black ${selected ? 'text-blue-700' : 'text-slate-700'}`}>{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chức danh */}
          {form.role !== 'admin' && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5">Chức danh <span className="text-rose-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {CHUC_DANH.map(cd => {
                  const selected = form.chucDanh === cd.value
                  return (
                    <button key={cd.value} type="button" onClick={() => set('chucDanh', cd.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selected ? `border-2 ${cd.color}` : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selected ? cd.iconBg : cd.iconBgOff}`}>
                        <cd.icon className={`w-5 h-5 ${selected ? 'text-white' : cd.iconClrOff}`} />
                      </div>
                      <span className={`text-sm font-bold text-center leading-tight ${selected ? '' : 'text-slate-600'}`}>{cd.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Trạng thái */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-sm font-bold text-slate-700">Trạng thái tài khoản</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{form.active ? 'Tài khoản đang hoạt động' : 'Tài khoản bị khóa'}</div>
            </div>
            <button type="button" onClick={() => set('active', !form.active)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all">
            Hủy
          </button>
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-95">
            <Save className="w-4 h-4" />
            {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QuanLyTaiKhoan({ branding, onOpenSidebar }) {
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let channel = null

    function mapAccount(item) {
      return {
        id: item.id, hoTen: item.ho_ten, username: item.username,
        password: item.password, role: item.role, chucDanh: item.chuc_danh,
        phongBan: item.phong_ban, email: item.email, active: item.active,
        createdAt: item.created_at
      }
    }

    async function fetchAccounts() {
      setIsLoading(true)
      const supabase = getSupabase()
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from(TABLES.TAI_KHOAN).select('*').order('created_at', { ascending: false })
          if (!error && data) {
            setAccounts(data.map(mapAccount))
            setIsLoading(false)
          } else {
            loadLocal()
          }
        } catch (err) { console.error('Supabase fetch failed', err); loadLocal() }

        // Realtime
        channel = supabase
          .channel('realtime-tai-khoan')
          .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.TAI_KHOAN }, async () => {
            const { data } = await supabase.from(TABLES.TAI_KHOAN).select('*').order('created_at', { ascending: false })
            if (data) setAccounts(data.map(mapAccount))
          })
          .subscribe()
        return
      }
      loadLocal()
    }

    function loadLocal() {
      try {
        const d = localStorage.getItem(STORAGE_KEY)
        if (d) setAccounts(JSON.parse(d))
        else setAccounts(DEFAULT_ACCOUNTS)
      } catch { setAccounts(DEFAULT_ACCOUNTS) }
      setIsLoading(false)
    }

    fetchAccounts()
    return () => {
      const supabase = getSupabase()
      if (channel && supabase) supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
    }
  }, [accounts])

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [filterChucDanh, setFilterChucDanh] = useState('ALL')
  const [filterPhongBan, setFilterPhongBan] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Thứ tự ưu tiên sắp xếp
  const PHONG_BAN_ORDER = { 'vat-tu': 0, 'mmtb': 1 }
  const CHUC_DANH_ORDER = { 'truong-nhom': 0, 'chuyen-vien': 1, 'hanh-chinh': 2 }

  const filtered = useMemo(() => {
    let r = [...accounts]
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(a => [a.hoTen, a.username, a.email].some(v => v && v.toLowerCase().includes(q)))
    }
    if (filterRole !== 'ALL') r = r.filter(a => a.role === filterRole)
    if (filterChucDanh !== 'ALL') r = r.filter(a => a.chucDanh === filterChucDanh)
    if (filterPhongBan !== 'ALL') r = r.filter(a => a.phongBan === filterPhongBan)

    // Sắp xếp: 1. Phòng ban (Vật tư → MMTB), 2. Chức danh (Trưởng nhóm → Chuyên viên → Hành chính), 3. Họ tên A-Z
    r.sort((a, b) => {
      const pbA = PHONG_BAN_ORDER[a.phongBan] ?? 99
      const pbB = PHONG_BAN_ORDER[b.phongBan] ?? 99
      if (pbA !== pbB) return pbA - pbB

      const cdA = CHUC_DANH_ORDER[a.chucDanh] ?? 99
      const cdB = CHUC_DANH_ORDER[b.chucDanh] ?? 99
      if (cdA !== cdB) return cdA - cdB

      return (a.hoTen || '').localeCompare(b.hoTen || '', 'vi', { sensitivity: 'base' })
    })

    return r
  }, [accounts, search, filterRole, filterChucDanh, filterPhongBan])

  const handleSave = async (form) => {
    const supabase = getSupabase()
    const dbAccount = {
      ho_ten: form.hoTen,
      username: form.username,
      password: form.password,
      role: form.role,
      chuc_danh: form.role === 'admin' ? '' : form.chucDanh,
      phong_ban: form.phongBan,
      email: form.email,
      active: form.active,
    }

    if (editing) {
      if (!form.password.trim()) delete dbAccount.password

      if (supabase) {
        const { error } = await supabase.from(TABLES.TAI_KHOAN).update(dbAccount).eq('id', editing.id)
        if (error) { showToast('Lỗi Supabase: ' + error.message, 'error'); return }
      }

      setAccounts(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } : a))
      showToast('Đã cập nhật tài khoản')
    } else {
      if (accounts.some(a => a.username === form.username)) {
        showToast('Tên đăng nhập đã tồn tại!', 'error'); return
      }
      const newAcc = { ...form, id: genId(), createdAt: new Date().toISOString() }
      const dbNewAcc = { ...dbAccount, id: newAcc.id, created_at: newAcc.createdAt }
      
      if (supabase) {
        const { error } = await supabase.from(TABLES.TAI_KHOAN).insert([dbNewAcc])
        if (error) { showToast('Lỗi Supabase: ' + error.message, 'error'); return }
      }

      setAccounts(prev => [newAcc, ...prev])
      showToast('Đã tạo tài khoản mới')
    }
    setModalOpen(false)
    setEditing(null)
  }

  const handleDelete = async (id) => {
    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase.from(TABLES.TAI_KHOAN).delete().eq('id', id)
      if (error) { showToast('Lỗi Supabase: ' + error.message, 'error'); return }
    }
    setAccounts(prev => prev.filter(a => a.id !== id))
    setConfirmDel(null)
    showToast('Đã xóa tài khoản')
  }

  const handleToggleActive = async (id) => {
    const account = accounts.find(a => a.id === id)
    if (!account) return
    const nextActive = !account.active

    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase
        .from(TABLES.TAI_KHOAN)
        .update({ active: nextActive })
        .eq('id', id)
      if (error) { showToast('Lỗi Supabase: ' + error.message, 'error'); return }
    }

    setAccounts(prev => prev.map(a => a.id === id ? { ...a, active: nextActive } : a))
  }

  const stats = {
    total: accounts.length,
    active: accounts.filter(a => a.active).length,
    admin: accounts.filter(a => a.role === 'admin').length,
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      {/* Header */}
      <div className="shrink-0 shadow-md h-16 flex items-center px-0" style={{background:'linear-gradient(135deg,#1d4ed8 0%,#2563eb 45%,#3b82f6 100%)'}}>
        <div 
          onMouseEnter={onOpenSidebar}
          className="h-full flex items-center justify-center pl-2 pr-4 cursor-pointer group"
        >
          <div className={`h-[54px] ${branding?.logoUrl ? 'px-4' : 'w-[54px]'} bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30 z-10 shrink-0 overflow-hidden group-hover:scale-[1.02] group-active:scale-95 transition-all`}>
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center scale-90">
                <UserCog className="w-7 h-7 text-[#0f58a7]" />
              </div>
            )}
          </div>
        </div>
        <div className="px-2 flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl leading-none tracking-tight">Quản lý tài khoản</h1>
            <p className="text-blue-100 text-[11px] font-bold uppercase tracking-wider mt-0.5 opacity-80">Phân quyền người dùng</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { label: 'Tổng TK', value: stats.total, color: 'bg-white/15' },
              { label: 'Hoạt động', value: stats.active, color: 'bg-emerald-500/25' },
              { label: 'Admin', value: stats.admin, color: 'bg-rose-500/25' },
            ].map(s => (
              <div key={s.label} className={`px-3 py-1.5 rounded-lg ${s.color} border border-white/20 text-center min-w-[64px]`}>
                <div className="text-white font-black text-lg leading-none">{s.value}</div>
                <div className="text-blue-200 text-[11px] font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, username, email..."
            className="w-full pl-8 pr-3 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-slate-50"
          />
        </div>

        {/* Filter role */}
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-400">
          <option value="ALL">Tất cả quyền</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        {/* Filter chức danh */}
        <select value={filterChucDanh} onChange={e => setFilterChucDanh(e.target.value)}
          className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-400">
          <option value="ALL">Tất cả chức danh</option>
          {CHUC_DANH.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        {/* Filter phòng ban */}
        <select value={filterPhongBan} onChange={e => setFilterPhongBan(e.target.value)}
          className="h-9 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-400">
          <option value="ALL">Tất cả phòng ban</option>
          {PHONG_BAN.map(pb => <option key={pb.value} value={pb.value}>{pb.label}</option>)}
        </select>

        <div className="ml-auto">
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="flex items-center gap-1.5 px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            Tạo tài khoản
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-royal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-royal-600">Đang tải danh sách tài khoản...</span>
            </div>
          </div>
        )}
        <table className="w-full text-left border-collapse border border-slate-300" style={{fontSize:'15px'}}>
          <thead className="sticky top-0 z-10 bg-blue-50 border-b-2 border-blue-200 shadow-sm">
            <tr>
              {['STT','Họ & Tên','Tên đăng nhập','Email','Phòng ban','Quyền','Chức danh','Trạng thái','Ngày tạo','Thao tác'].map(h => (
                <th key={h} className="px-4 py-3 font-bold text-blue-900 tracking-wide text-center whitespace-nowrap border border-blue-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-20 text-center">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-semibold text-sm">Chưa có tài khoản nào</p>
                  <p className="text-slate-300 text-xs mt-1">Nhấn "Tạo tài khoản" để bắt đầu</p>
                </td>
              </tr>
            ) : filtered.map((acc, idx) => (
              <tr key={acc.id} className={`border-b border-slate-100 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/40`}>
                <td className="px-4 py-3 text-center text-slate-400 font-semibold border border-slate-200">{idx + 1}</td>
                <td className="px-4 py-3 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{background: acc.role === 'admin' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)'}}>
                      {(acc.hoTen || acc.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-800">{acc.hoTen}</span>
                  </div>
                </td>
                <td className="px-4 py-3 border border-slate-200">
                  <span className="font-mono text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md">{acc.username}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 border border-slate-200">{acc.email || '—'}</td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <Badge value={acc.phongBan} list={PHONG_BAN} />
                </td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <Badge value={acc.role} list={ROLES} />
                </td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <Badge value={acc.chucDanh} list={CHUC_DANH} />
                </td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <button onClick={() => handleToggleActive(acc.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-semibold text-[11px] transition-all ${
                      acc.active
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                    }`}>
                    {acc.active
                      ? <><CheckCircle2 className="w-3 h-3" />Hoạt động</>
                      : <><XCircle className="w-3 h-3" />Bị khóa</>
                    }
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-400 text-center border border-slate-200 whitespace-nowrap">
                  {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => { setEditing(acc); setModalOpen(true) }}
                      title="Chỉnh sửa"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDel(acc)}
                      title="Xóa"
                      disabled={acc.username === 'admin' || acc.username === 'Docongchung'}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info bar */}
      <div className="shrink-0 bg-white border-t border-slate-100 px-6 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>Hiển thị <span className="font-bold text-blue-600">{filtered.length}</span> / <span className="font-semibold text-slate-600">{accounts.length}</span> tài khoản</span>
        <span className="flex items-center gap-1 text-amber-600 font-semibold">
          <Shield className="w-3 h-3" />
          Tài khoản Admin hệ thống mặc định không thể xóa
        </span>
      </div>

      {/* Modal tạo/sửa */}
      <AccountModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
        initialData={editing}
      />

      {/* Confirm delete */}
      {confirmDel && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDel(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="font-black text-slate-800 text-base mb-1">Xóa tài khoản?</h3>
            <p className="text-slate-500 text-sm mb-5">
              Tài khoản <span className="font-bold text-rose-600">"{confirmDel.hoTen}"</span> sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Hủy</button>
              <button onClick={() => handleDelete(confirmDel.id)} className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[400] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold toast-enter ${
          toast.type === 'error'
            ? 'bg-rose-500 text-white border-rose-400/50'
            : 'bg-white text-slate-800 border-slate-200'
        }`}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
