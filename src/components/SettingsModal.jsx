import React, { useState, useEffect } from 'react'
import { X, Settings, Save, User, Clock } from 'lucide-react'
import { DEFAULT_PCU_DAYS } from '../constants'

export default function SettingsModal({ isOpen, settings, onClose, onSave }) {
  const [local, setLocal] = useState(settings)

  useEffect(() => {
    if (isOpen) setLocal(settings)
  }, [isOpen, settings])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && isOpen) onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-royal-200">
        <div className="bg-gradient-to-r from-royal-700 to-royal-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-white" />
            <h2 className="text-white font-black text-lg">Cài đặt hệ thống</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* User name */}
          <div>
            <label className="block text-xs font-bold text-royal-700 mb-1.5">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Tên người dùng (tự động điền CV K.QLVT)</span>
            </label>
            <input
              type="text"
              value={local.currentUser || ''}
              onChange={e => setLocal(p => ({ ...p, currentUser: e.target.value }))}
              placeholder="Nhập tên của bạn..."
              className="w-full px-3 py-2.5 border border-royal-200 rounded-xl text-sm outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Khi thêm mới, tên này sẽ tự động điền vào cột "Tên CV phối hợp K.QLVT"</p>
          </div>

          {/* PCU days */}
          <div>
            <label className="block text-xs font-bold text-royal-700 mb-1.5">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Số ngày PCU báo quá hạn (từ ngày gửi PCU)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={local.pcuDays || DEFAULT_PCU_DAYS}
                onChange={e => setLocal(p => ({ ...p, pcuDays: parseInt(e.target.value) || DEFAULT_PCU_DAYS }))}
                min={1}
                max={365}
                className="w-28 px-3 py-2.5 border border-royal-200 rounded-xl text-sm outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 transition-all text-center font-bold"
              />
              <span className="text-sm text-slate-500">ngày</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sau {local.pcuDays || DEFAULT_PCU_DAYS} ngày từ khi gửi PCU mà chưa có ngày PCU trả, hệ thống sẽ đánh dấu "Quá hạn"
            </p>
          </div>

          <div className="bg-royal-50 rounded-xl p-4 text-xs text-royal-700 space-y-1 border border-royal-100">
            <p className="font-bold">📌 Logic trạng thái tự động:</p>
            <p>• <span className="font-semibold text-emerald-600">Đã xử lý</span>: Đã có ngày về thực tế</p>
            <p>• <span className="font-semibold text-rose-600">Quá hạn</span>: Đã gửi PCU nhưng chưa có ngày trả, vượt {local.pcuDays || DEFAULT_PCU_DAYS} ngày</p>
            <p>• <span className="font-semibold text-amber-600">Chờ xử lý</span>: Các trường hợp còn lại</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-royal-100 bg-royal-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 h-9 border border-slate-300 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-all">
            Hủy
          </button>
          <button
            onClick={() => { onSave(local); onClose(); }}
            className="flex items-center gap-2 px-5 h-9 bg-royal-500 text-white rounded-xl font-bold text-sm hover:bg-royal-600 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  )
}
