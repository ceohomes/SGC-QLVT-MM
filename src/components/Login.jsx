import React, { useState, useEffect } from 'react'
import { LogIn, Key, User, ShieldCheck, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { getSupabase } from '../lib/supabase'
import { ACCOUNTS_KEY, TABLES } from '../constants'

const DEFAULT_ACCOUNTS = [
  {
    id: 'acc-admin-002',
    hoTen: 'Đỗ Công Chung',
    username: 'Docongchung',
    password: 'sgc@2026',
    role: 'admin',
    active: true,
    phongBan: 'vat-tu',
    chucDanh: 'truong-nhom',
  },
  {
    id: 'acc-admin-001',
    hoTen: 'Administrator',
    username: 'admin',
    password: 'admin@2025',
    role: 'admin',
    active: true,
    phongBan: 'vat-tu',
    chucDanh: 'truong-nhom',
  }
]

export default function Login({ onLogin, branding }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let accounts = []
      const supabase = getSupabase()
      
      // Try Supabase first
      if (supabase) {
        try {
          const { data, error: sbError } = await supabase
            .from(TABLES.TAI_KHOAN)
            .select('*')
          if (!sbError && data && data.length > 0) {
            accounts = data.map(dbAcc => ({
              id: dbAcc.id,
              hoTen: dbAcc.ho_ten,
              username: dbAcc.username,
              password: dbAcc.password,
              role: dbAcc.role,
              active: dbAcc.active,
              phongBan: dbAcc.phong_ban || 'vat-tu',
              chucDanh: dbAcc.chuc_danh || 'chuyen-vien',
            }))
          }
        } catch (fetchErr) {
          console.warn('Supabase fetch failed, using fallback:', fetchErr)
        }
      }

      // Fallback: LocalStorage → DEFAULT_ACCOUNTS
      if (accounts.length === 0) {
        const localData = localStorage.getItem(ACCOUNTS_KEY)
        const localAccounts = localData ? JSON.parse(localData) : []
        // Merge local with defaults (local overrides defaults by id)
        const merged = [...DEFAULT_ACCOUNTS]
        localAccounts.forEach(la => {
          const idx = merged.findIndex(d => d.id === la.id)
          if (idx >= 0) merged[idx] = la
          else merged.push(la)
        })
        accounts = merged
      }

      // FIND USER - CASE INSENSITIVE (as per user request)
      const user = accounts.find(a => 
        a.username.toLowerCase() === username.toLowerCase() && 
        a.password === password
      )

      if (user) {
        if (user.active === false) {
          setError('Tài khoản đã bị khóa. Vui lòng liên hệ Admin.')
        } else {
          onLogin(user)
        }
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác')
      }
    } catch (err) {
      console.error(err)
      setError('Đã có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#991b1b] p-4 font-sans select-none overflow-hidden relative">
      {/* Abstract Background Decorations - Modern Red Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ef4444] via-[#b91c1c] to-[#7f1d1d] opacity-100" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-black/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="w-full max-w-[420px] relative z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="w-64 h-28 bg-white rounded-xl shadow-2xl flex items-center justify-center border border-white/20 transition-transform hover:scale-105 duration-500 overflow-hidden">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="max-w-[95%] max-h-[90%] object-contain" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <ShieldCheck className="text-red-600 w-12 h-12" />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-[18px] font-black text-white tracking-tight drop-shadow-md uppercase">
            {branding?.appName || 'SGC | QUẢN LÝ VẬT TƯ & MMTB'}
          </h1>
          <p className="text-white/70 font-medium text-[12px] mt-1 uppercase tracking-[0.25em]">Hệ thống quản trị nội bộ</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/50">
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Username */}
            <div>
              <label className="block text-[12px] font-black text-[#0f58a7] mb-2 uppercase tracking-widest ml-1">Tên đăng nhập</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0f58a7]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-[#0f58a7] focus:bg-white transition-all text-[16px]"
                  placeholder="Nhập tên đăng nhập..."
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-black text-[#0f58a7] mb-2 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#0f58a7]">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600/50 focus:bg-white transition-all text-[16px]"
                  placeholder="Nhập mật khẩu..."
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[14px] font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#0f58a7] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] text-white rounded-2xl font-black text-[16px] shadow-xl shadow-blue-900/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  ĐĂNG NHẬP NGAY
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[12px] text-white/40 font-black uppercase tracking-[0.3em]">Hệ thống bảo mật cao</span>
            </div>
            <div className="h-px w-8 bg-white/10" />
          </div>
          <p className="text-white/20 text-[12px] font-bold uppercase tracking-widest">
            SGC Enterprise &copy; 2026
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}} />
    </div>
  )
}
