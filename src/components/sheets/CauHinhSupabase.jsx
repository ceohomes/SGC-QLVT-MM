import React, { useState, useEffect } from 'react'
import { Cloud, Save, Shield, Key, ExternalLink, Globe, AlertCircle, CheckCircle2 } from 'lucide-react'

const SUPABASE_CONFIG_KEY = 'SUPABASE_CONFIG_v1'

export default function CauHinhSupabase() {
  const [config, setConfig] = useState({
    url: '',
    anonKey: ''
  })
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY)
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (err) {
        console.error('Failed to load Supabase config', err)
      }
    }
  }, [])

  const handleSave = () => {
    if (!config.url.trim() || !config.anonKey.trim()) {
      setError('Vui lòng điền đầy đủ thông tin API URL và Anon Key')
      return
    }
    
    // Basic URL validation
    try {
      new URL(config.url)
    } catch {
      setError('Định dạng API URL không hợp lệ')
      return
    }

    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config))
    setError('')
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            
            <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 text-sm">Hướng dẫn kết nối</h3>
                <p className="text-blue-700/80 text-xs mt-1 leading-relaxed">
                  Để liên kết dữ liệu, bạn cần lấy thông tin tại bảng điều khiển Supabase - Project Settings - API. Thông tin này sẽ được lưu trữ an toàn tại trình duyệt của bạn.
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
                    onChange={e => setConfig(prev => ({ ...prev, url: e.target.value }))}
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
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Key className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={3}
                    value={config.anonKey}
                    onChange={e => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono resize-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between gap-4">
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-royal-600 transition-colors"
              >
                Mở bảng điều khiển Supabase
                <ExternalLink className="w-3 h-3" />
              </a>

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
              Lưu ý: Sau khi lưu cấu hình, hệ thống sẽ tự động sử dụng Endpoint này để truy vấn dữ liệu từ bảng `vattu` và các bảng liên quan. Hãy đảm bảo bạn đã cấp quyền RLS phù hợp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
