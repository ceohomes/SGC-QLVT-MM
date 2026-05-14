import React from 'react'
import { CheckCircle2, Clock, AlertTriangle, Layers, PackageCheck, PackageX } from 'lucide-react'
import { TRANG_THAI } from '../constants'

export default function StatsBar({ rows }) {
  // Dòng chính (không có parentId): tính Tổng vật tư, Đã về hàng đủ, Chưa về hàng đủ
  const dongChinh     = rows.filter(r => !r.parentId)
  const total         = dongChinh.length
  
  // Dòng phụ (có parentId): tính Chờ xử lý, Đã xử lý, Quá hạn
  const dongPhu       = rows.filter(r => r.parentId && r.subMode !== 'thucte')
  const daXuLy        = dongPhu.filter(r => r.trangThai === TRANG_THAI.DA_XU_LY).length
  const choXuLy       = dongPhu.filter(r => r.trangThai === TRANG_THAI.CHO_XU_LY).length
  const quaHan        = dongPhu.filter(r => r.trangThai === TRANG_THAI.QUA_HAN).length
  const chuaGuiPcu    = dongPhu.filter(r => r.trangThai === TRANG_THAI.CHUA_GUI_PCU).length

  const daVeHangDu    = dongChinh.filter(r => r.trangThai === TRANG_THAI.DA_VE_HANG_DU).length
  const chuaVeHangDu  = dongChinh.filter(r => r.trangThai === TRANG_THAI.CHUA_VE_HANG_DU).length

  const pct = (n, total) => total > 0 ? Math.round(n / total * 100) : 0

  const stats = [
    {
      label: 'Tổng vật tư', value: total, icon: Layers, pct: 100, accent: '#3b7fe8',
      bg: 'bg-royal-50', border: 'border-royal-200/70', iconBg: 'bg-royal-100',
      iconColor: 'text-royal-600', textVal: 'text-royal-800', textLabel: 'text-royal-500', bar: 'bg-royal-400',
      note: 'Dòng chính',
    },
    {
      label: 'Chưa gửi PCU', value: chuaGuiPcu, icon: Clock, pct: pct(chuaGuiPcu, dongPhu.length), accent: '#6366f1',
      bg: 'bg-indigo-50', border: 'border-indigo-200/70', iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600', textVal: 'text-indigo-800', textLabel: 'text-indigo-500', bar: 'bg-indigo-400',
      note: 'Dòng phụ',
    },
    {
      label: 'Chờ xử lý', value: choXuLy, icon: Clock, pct: pct(choXuLy, dongPhu.length), accent: '#f59e0b',
      bg: 'bg-amber-50', border: 'border-amber-200/70', iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600', textVal: 'text-amber-800', textLabel: 'text-amber-500', bar: 'bg-amber-400',
      note: 'Dòng phụ',
    },
    {
      label: 'Đã xử lý', value: daXuLy, icon: CheckCircle2, pct: pct(daXuLy, dongPhu.length), accent: '#10b981',
      bg: 'bg-emerald-50', border: 'border-emerald-200/70', iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600', textVal: 'text-emerald-800', textLabel: 'text-emerald-500', bar: 'bg-emerald-400',
      note: 'Dòng phụ',
    },
    {
      label: 'Quá hạn', value: quaHan, icon: AlertTriangle, pct: pct(quaHan, dongPhu.length), accent: '#f43f5e',
      bg: 'bg-rose-50', border: 'border-rose-200/70', iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600', textVal: 'text-rose-800', textLabel: 'text-rose-500', bar: 'bg-rose-400',
      note: 'Dòng phụ',
    },
    {
      label: 'Đã về hàng đủ', value: daVeHangDu, icon: PackageCheck, pct: pct(daVeHangDu, dongChinh.length), accent: '#0ea5e9',
      bg: 'bg-sky-50', border: 'border-sky-200/70', iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600', textVal: 'text-sky-800', textLabel: 'text-sky-500', bar: 'bg-sky-400',
      note: 'Dòng chính',
    },
    {
      label: 'Chưa về hàng đủ', value: chuaVeHangDu, icon: PackageX, pct: pct(chuaVeHangDu, dongChinh.length), accent: '#d946ef',
      bg: 'bg-fuchsia-50', border: 'border-fuchsia-200/70', iconBg: 'bg-fuchsia-100',
      iconColor: 'text-fuchsia-600', textVal: 'text-fuchsia-800', textLabel: 'text-fuchsia-500', bar: 'bg-fuchsia-400',
      note: 'Dòng chính',
    },
  ]

  return (
    <div className="bg-white border-b border-royal-100 px-4 py-2.5 grid grid-cols-7 gap-3 shadow-sm">
      {stats.map(s => (
        <div
          key={s.label}
          className={`stat-card flex items-center gap-2 px-3 py-2.5 ${s.bg} border ${s.border} rounded-xl relative overflow-hidden`}
        >
          <div className={`shrink-0 w-9 h-9 ${s.iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
            <s.icon className={s.iconColor} style={{width:'18px',height:'18px'}} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-black text-2xl leading-none ${s.textVal} tabular-nums`}>{s.value}</div>
            <div className={`text-[11px] font-semibold ${s.textLabel} mt-0.5 truncate`}>{s.label}</div>
            {s.note && (
              <div className={`text-[9px] font-medium ${s.textLabel} opacity-60 truncate`}>{s.note}</div>
            )}
            <div className="mt-1 h-1 bg-white/60 rounded-full overflow-hidden">
              <div className={`h-full ${s.bar} rounded-full transition-all duration-700`} style={{width:`${s.pct}%`}} />
            </div>
          </div>
          <div className={`text-xs font-black ${s.textLabel} tabular-nums shrink-0`}>{s.pct}%</div>
          <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-3xl opacity-10" style={{background:`radial-gradient(circle at top right,${s.accent},transparent)`}} />
        </div>
      ))}
    </div>
  )
}
