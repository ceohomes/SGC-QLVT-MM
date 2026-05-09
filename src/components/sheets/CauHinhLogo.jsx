import React, { useState, useEffect } from 'react'
import { Palette, Save, Upload, Image, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { TABLES } from '../../constants'
import { getSupabase } from '../../lib/supabase'
import { toCamelCase, toSnakeCase } from '../../utils'

const STORAGE_KEY = 'SGC_LOGO_CONFIG_v1'
const DEFAULT_CONFIG = {
  logoUrl: 'https://smartandgreen.vn/wp-content/uploads/2021/04/Logo-SGC-Header.png',
  appName: 'SGC | QUẢN LÝ VẬT TƯ',
  primaryColor: '#1d4ed8'
}

export default function CauHinhLogo() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    async function fetchLogo() {
      setIsLoading(true)
      const supabase = getSupabase()
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from(TABLES.LOGO)
            .select('*')
            .single()
          if (!error && data) {
            setConfig(toCamelCase(data))
            setIsLoading(false)
            return
          }
        } catch (err) { console.error('Supabase fetch failed', err) }
      }

      try {
        const d = localStorage.getItem(STORAGE_KEY)
        if (d) setConfig(JSON.parse(d))
      } catch {}
      setIsLoading(false)
    }
    fetchLogo()
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = getSupabase()
    
    if (supabase) {
      try {
        const dbConfig = toSnakeCase(config)
        // Upsert logic
        const { error } = await supabase
          .from(TABLES.LOGO)
          .upsert([ { id: 1, ...dbConfig, updated_at: new Date().toISOString() } ])
        if (error) {
          showToast('Lỗi Supabase: ' + error.message, 'error')
          setIsSaving(false)
          return
        }
      } catch (err) { console.error('Supabase save failed', err) }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    showToast('Đã lưu cấu hình giao diện')
    setIsSaving(false)
  }

  const handleReset = () => {
    if (confirm('Bạn có muốn khôi phục về mặc định?')) {
      setConfig(DEFAULT_CONFIG)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <div className="shrink-0 shadow-md bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-none tracking-tightCaps">CẤU HÌNH LOGO & THƯƠNG HIỆU</h1>
            <p className="text-blue-200 text-sm font-medium mt-0.5">Tùy chỉnh nhận diện thương hiệu cho ứng dụng</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Xem trước hiển thị</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
            </div>
            <div className="p-12 flex flex-col items-center justify-center gap-6 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/topography.png')] bg-repeat">
              <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 flex items-center justify-center transition-all hover:scale-105">
                <img src={config.logoUrl} alt="Logo Preview" className="max-h-16 w-auto object-contain" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: config.primaryColor }}>
                  {config.appName}
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-[0.2em]">Smart & Green Construction</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                  <Image className="w-4 h-4" /> Link Logo (URL)
                </label>
                <div className="relative">
                  <input
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-slate-50"
                    placeholder="https://..."
                    value={config.logoUrl}
                    onChange={e => setConfig(p => ({ ...p, logoUrl: e.target.value }))}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                      <Upload className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">* Sử dụng link ảnh .png hoặc .svg nền trong suốt</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Màu chủ đạo (Brand Color)</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl shadow-inner flex-shrink-0" style={{ background: config.primaryColor }} />
                  <input
                    className="flex-1 h-12 px-3 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:border-blue-400"
                    value={config.primaryColor}
                    onChange={e => setConfig(p => ({ ...p, primaryColor: e.target.value }))}
                  />
                  <input type="color" className="hidden" id="color-picker" value={config.primaryColor} onChange={e => setConfig(p => ({ ...p, primaryColor: e.target.value }))} />
                  <label htmlFor="color-picker" className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-xs font-bold transition-all">Chọn</label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 h-full">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Tên ứng dụng hiển thị</label>
                <textarea
                  className="w-full h-32 px-3 py-3 rounded-xl border border-slate-200 text-lg font-black focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-slate-50 leading-tight"
                  placeholder="SGC | VẬT TƯ"
                  value={config.appName}
                  onChange={e => setConfig(p => ({ ...p, appName: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5" /> Mặc định
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang đồng bộ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Lưu cấu hình
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      <div className="shrink-0 bg-amber-50 px-6 py-3 border-t border-amber-100 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <span className="text-[11px] text-amber-700 font-medium">
          Lưu ý: Các thay đổi này sẽ áp dụng ngay lập tức cho toàn bộ dashboard của người dùng. Hãy kiểm tra preview cẩn thận trước khi lưu.
        </span>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 transition-all animate-bounce ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
