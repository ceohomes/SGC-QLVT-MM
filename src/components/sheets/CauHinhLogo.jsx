import React, { useState, useEffect, useRef } from 'react'
import { Palette, Save, Upload, Image, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { TABLES } from '../../constants'
import { getSupabase } from '../../lib/supabase'

const STORAGE_KEY = 'SGC_LOGO_CONFIG_v1'
const DEFAULT_CONFIG = {
  logoUrl: '',
  appName: 'SGC | QUẢN LÝ VẬT TƯ',
  primaryColor: '#1d4ed8'
}

<<<<<<< HEAD
export default function CauHinhLogo({ onBrandingChange }) {
=======
export default function CauHinhLogo({ onBrandingChange, onOpenSidebar }) {
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [previewSrc, setPreviewSrc] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    async function fetchLogo() {
      setIsLoading(true)
      const supabase = getSupabase()
      if (supabase) {
        try {
          const { data, error } = await supabase.from(TABLES.LOGO).select('*').eq('id', 1).maybeSingle()
          if (!error && data) {
            const c = {
              logoUrl: data.logourl || '',
              appName: data.appname || DEFAULT_CONFIG.appName,
              primaryColor: data.primarycolor || DEFAULT_CONFIG.primaryColor,
            }
            setConfig(c)
            setPreviewSrc(c.logoUrl || '')
            setIsLoading(false)
            return
          }
        } catch (err) { console.error('Supabase fetch failed', err) }
      }
      try {
        const d = localStorage.getItem(STORAGE_KEY)
        if (d) {
          const c = JSON.parse(d)
          setConfig(c)
          setPreviewSrc(c.logoUrl || '')
        }
      } catch {}
      setIsLoading(false)
    }
    fetchLogo()
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Xử lý upload file ảnh → nén + convert sang base64
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Chỉ chấp nhận file ảnh (PNG, JPG, SVG...)', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => {
        // Resize xuống tối đa 400px chiều rộng để giảm dung lượng
        const MAX_W = 800
        const scale = img.width > MAX_W ? MAX_W / img.width : 1
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        // Nén xuống quality 0.7, định dạng webp (nhỏ hơn png/jpg nhiều)
        const compressed = canvas.toDataURL('image/webp', 0.7)
        const kb = Math.round(compressed.length * 0.75 / 1024)
        if (kb > 500) {
          // Nén thêm nếu vẫn còn lớn
          const compressed2 = canvas.toDataURL('image/webp', 0.4)
          setPreviewSrc(compressed2)
          setConfig(p => ({ ...p, logoUrl: compressed2 }))
        } else {
          setPreviewSrc(compressed)
          setConfig(p => ({ ...p, logoUrl: compressed }))
        }
        showToast(`Đã tải ảnh (~${kb}KB)`)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = getSupabase()
    if (supabase) {
      try {
        // Thử upsert không có updated_at trước
        const payload = {
          id: 1,
          logourl: config.logoUrl,
          appname: config.appName,
          primarycolor: config.primaryColor,
          updated_at: new Date().toISOString(),
        }
        const { error } = await supabase
          .from(TABLES.LOGO)
          .upsert([payload])
        if (error) {
          console.error('Supabase upsert error:', JSON.stringify(error))
          showToast('Lỗi: ' + (error.message || error.code || JSON.stringify(error)), 'error')
          setIsSaving(false)
          return
        }
      } catch (err) { console.error('Supabase save failed', err) }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    onBrandingChange?.(config)
    showToast('Đã lưu cấu hình giao diện')
    setIsSaving(false)
  }

  const handleReset = () => {
    if (confirm('Bạn có muốn khôi phục về mặc định?')) {
      setConfig(DEFAULT_CONFIG)
      setPreviewSrc('')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <div className="shrink-0 shadow-md bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700">
<<<<<<< HEAD
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
=======
        <div className="flex items-center">
          <div 
            onMouseEnter={onOpenSidebar}
            className="h-20 flex items-center justify-center pl-6 pr-4 cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm group-hover:scale-105 transition-all">
              <Palette className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="py-4">
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
            <h1 className="text-white font-black text-xl leading-none tracking-tight">CẤU HÌNH LOGO & THƯƠNG HIỆU</h1>
            <p className="text-blue-200 text-sm font-medium mt-0.5">Tùy chỉnh nhận diện thương hiệu cho ứng dụng</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-8">

          {/* Preview */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Xem trước hiển thị</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
            </div>
            <div className="p-12 flex flex-col items-center justify-center gap-4 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/topography.png')] bg-repeat">
              <div className="w-full flex items-center justify-center">
                {previewSrc
<<<<<<< HEAD
                  ? <img src={previewSrc} alt="Logo Preview" className="max-h-48 w-auto object-contain drop-shadow-2xl" />
                  : <div className="w-40 h-20 bg-white/60 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs font-semibold">Chưa có logo</div>
=======
                  ? <img src={previewSrc} alt="Logo Preview" className="max-h-48 w-full object-contain drop-shadow-2xl" />
                  : <div className="w-60 h-24 bg-white/60 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-xs font-semibold uppercase tracking-wider">Chưa có logo</div>
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
                }
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: config.primaryColor }}>
                  {config.appName}
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-[0.2em]">Smart & Green Construction</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">

              {/* Logo upload/URL */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-500 mb-3 uppercase flex items-center gap-2">
                  <Image className="w-4 h-4" /> Logo
                </label>

                <div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
<<<<<<< HEAD
                      className="w-full h-28 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      {previewSrc ? (
                        <img src={previewSrc} alt="preview" className="max-h-20 max-w-full object-contain" />
=======
                      className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      {previewSrc ? (
                        <img src={previewSrc} alt="preview" className="max-h-24 max-w-[90%] object-contain group-hover:scale-[1.02] transition-transform" />
>>>>>>> 1b450e7 (Cập nhật code mới nhất)
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400" />
                          <span className="text-xs text-slate-500 font-semibold">Click để chọn ảnh</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG, SVG — tối đa 2MB</span>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    {previewSrc && (
                      <button onClick={() => { setPreviewSrc(''); setConfig(p => ({ ...p, logoUrl: '' })) }}
                        className="mt-2 text-xs text-rose-500 hover:text-rose-700 font-semibold">
                        ✕ Xóa ảnh
                      </button>
                    )}
                  </div>
              </div>

              {/* Màu chủ đạo */}
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

            {/* Tên app */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Tên ứng dụng hiển thị</label>
                <textarea
                  className="w-full h-40 px-3 py-3 rounded-xl border border-slate-200 text-lg font-black focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-slate-50 leading-tight resize-none"
                  placeholder="SGC | VẬT TƯ"
                  value={config.appName}
                  onChange={e => setConfig(p => ({ ...p, appName: e.target.value }))}
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">* Tên hiển thị trong sidebar và preview</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all active:scale-95">
              <RotateCcw className="w-5 h-5" /> Mặc định
            </button>
            <button onClick={handleSave} disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50">
              {isSaving ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Đang đồng bộ...</>
              ) : (
                <><Save className="w-5 h-5" /> Lưu cấu hình</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-amber-50 px-6 py-3 border-t border-amber-100 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <span className="text-[11px] text-amber-700 font-medium">
          Lưu ý: Các thay đổi này sẽ áp dụng ngay lập tức cho toàn bộ dashboard của người dùng. Hãy kiểm tra preview cẩn thận trước khi lưu.
        </span>
      </div>

      {toast && (
        <div className={`fixed bottom-10 right-10 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 transition-all ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
