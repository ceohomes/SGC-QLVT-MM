import React, { useEffect } from 'react'
import { Check, X, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  subtitle = 'Yêu cầu xác nhận thao tác',
  message, 
  confirmText = 'Đồng ý (Yes)', 
  cancelText = 'Không (No)',
  type = 'info', // info, warning, danger
  icon: Icon = RefreshCw,
  isLoading = false,
  count = 0,
  warningMessage = null
}) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const colors = {
    info: {
      bg: 'bg-blue-50',
      icon: 'text-blue-500',
      border: 'border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-500',
      border: 'border-amber-200',
      button: 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300'
    },
    danger: {
      bg: 'bg-rose-50',
      icon: 'text-rose-500',
      border: 'border-rose-200',
      button: 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
    }
  }

  const c = colors[type] || colors.info

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 border ${c.border} animate-in fade-in zoom-in duration-200`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${c.icon} ${isLoading ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-base">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
          <p className="leading-relaxed whitespace-pre-wrap">{message}</p>
          {(count > 0 || warningMessage) && (
            <div className="mt-3 flex items-start gap-2 text-rose-600 font-bold">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-xs leading-tight">
                {warningMessage || `Phát hiện ${count} dòng dữ liệu liên quan sẽ bị ảnh hưởng!`}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 ${c.button} text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98]`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {confirmText}
          </button>
          <button
            disabled={isLoading}
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}
