import React, { useState, useEffect } from 'react'
import { Cloud, Save, Shield, Key, ExternalLink, Globe, AlertCircle, CheckCircle2, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { DEFAULT_CONFIG } from '../../lib/supabase'

const SUPABASE_CONFIG_KEY = 'SUPABASE_CONFIG_v1'

export default function CauHinhSupabase() {
  const [config, setConfig] = useState({
    url: DEFAULT_CONFIG.url,
    anonKey: DEFAULT_CONFIG.anonKey
  })
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState('')
  const [testStatus, setTestStatus] = useState(null) // null | 'testing' | 'ok' | 'fail'
  const [isDefault, setIsDefault] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConfig(parsed)
        setIsDefault(parsed.url === DEFAULT_CONFIG.url && parsed.anonKey === DEFAULT_CONFIG.anonKey)
      } catch (err) {
        console.error('Failed to load Supabase config', err)
      }
    }
  }, [])

  const handleTest = async () => {
    setTestStatus('testing')
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const client = createClient(config.url, config.anonKey)
      const { error } = await client.from('dm_vattu').select('id').limit(1)
      setTestStatus(error ? 'fail' : 'ok')
    } catch {
      setTestStatus('fail')
    }
  }

  const handleSave = () => {
    if (!config.url.trim() || !config.anonKey.trim()) {
      setError('Vui lòng điền đầy đủ thông tin API URL và Anon Key')
      return
    }
    try {
      new URL(config.url)
    } catch {
      setError('Định dạng API URL không hợp lệ')
      return
    }
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config))
    setIsDefault(config.url === DEFAULT_CONFIG.url && config.anonKey === DEFAULT_CONFIG.anonKey)
    setError('')
    setIsSaved(true)
    setTestStatus(null)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleReset = () => {
    setConfig({ url: DEFAULT_CONFIG.url, anonKey: DEFAULT_CONFIG.anonKey })
    localStorage.removeItem(SUPABASE_CONFIG_KEY)
    setIsDefault(true)
    setTestStatus(null)
    setError('')
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-6 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <Cloud className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight leading-none">Cấu hình Supabase</h1>
            <p className="text-slate-400 text-sm font-medium mt-1.5 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Kết nối cơ sở dữ liệu Cloud cho ứng dụng
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full">

        {/* Trạng thái hiện tại */}
        <div className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${
          isDefault
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <Wifi className="w-4 h-4 shrink-0" />
          {isDefault
            ? '✅ Đang dùng cấu hình mặc định — toàn bộ web app đều kết nối cùng một Supabase'
            : '⚙️ Đang dùng cấu hình tuỳ chỉnh (ghi đè mặc định trên máy này)'}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">

            <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 text-sm">Hướng dẫn kết nối</h3>
                <p className="text-blue-700/80 text-xs mt-1 leading-relaxed">
                  Cấu hình mặc định đã được nhúng sẵn trong app — mọi máy đều tự động kết nối mà không cần nhập lại. Chỉ thay đổi khi cần chuyển sang Supabase project khác.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  API URL
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={config.url}
                    onChange={e => { setConfig(prev => ({ ...prev, url: e.target.value })); setTestStatus(null) }}
                    placeholder="https://xxxxxx.supabase.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Anon Public Key
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Key className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={3}
                    value={config.anonKey}
                    onChange={e => { setConfig(prev => ({ ...prev, anonKey: e.target.value })); setTestStatus(null) }}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Test kết nối */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTest}
                disabled={testStatus === 'testing'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                {testStatus === 'testing' ? 'Đang kiểm tra...' : 'Test kết nối'}
              </button>
              {testStatus === 'ok' && (
                <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                  <Wifi className="w-4 h-4" /> Kết nối thành công!
                </span>
              )}
              {testStatus === 'fail' && (
                <span className="flex items-center gap-1.5 text-rose-600 text-sm font-bold">
                  <WifiOff className="w-4 h-4" /> Kết nối thất bại — kiểm tra lại URL/Key và RLS
                </span>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                >
                  Mở bảng điều khiển Supabase
                  <ExternalLink className="w-3 h-3" />
                </a>
                {!isDefault && (
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold text-amber-500 hover:text-amber-700 transition-colors"
                  >
                    ↩ Khôi phục mặc định
                  </button>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
                  isSaved
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-royal-600 text-white hover:bg-royal-700 shadow-royal-600/20 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã lưu cấu hình</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu liên kết</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 italic">
            <p className="text-[10px] text-slate-400 leading-relaxed text-center">
              💡 Cấu hình mặc định đã được nhúng sẵn trong code — mọi người dùng trên mọi máy đều tự động kết nối cùng một Supabase mà không cần nhập lại.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
