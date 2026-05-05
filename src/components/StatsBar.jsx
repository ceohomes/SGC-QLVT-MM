import React from 'react'
import { CheckCircle2, Clock, AlertCircle, Package } from 'lucide-react'
import { TRANG_THAI } from '../constants'

export default function StatsBar({ rows }) {
  const total = rows.length
  const daXuLy = rows.filter(r => r.trangThai === TRANG_THAI.DA_XU_LY).length
  const choXuLy = rows.filter(r => r.trangThai === TRANG_THAI.CHO_XU_LY).length
  const quaHan = rows.filter(r => r.trangThai === TRANG_THAI.QUA_HAN).length

  const stats = [
    { label: 'Tổng vật tư', value: total, icon: Package, bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', val: 'text-violet-900' },
    { label: 'Chờ xử lý', value: choXuLy, icon: Clock, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', val: 'text-amber-900' },
    { label: 'Đã xử lý', value: daXuLy, icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', val: 'text-emerald-900' },
    { label: 'Quá hạn', value: quaHan, icon: AlertCircle, bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', val: 'text-rose-900' },
  ]

  return (
    <div className="bg-white border-b border-violet-100 px-4 py-2.5 grid grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className={`flex items-center gap-2.5 px-3 py-2 ${s.bg} ${s.border} border rounded-xl`}>
          <s.icon className={`w-4 h-4 ${s.text} shrink-0`} />
          <div>
            <div className={`font-black text-lg leading-none ${s.val}`}>{s.value}</div>
            <div className={`text-xs ${s.text} font-medium`}>{s.label}</div>
          </div>
          {total > 0 && (
            <div className={`ml-auto text-xs font-bold ${s.text}`}>
              {Math.round(s.value / total * 100)}%
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
