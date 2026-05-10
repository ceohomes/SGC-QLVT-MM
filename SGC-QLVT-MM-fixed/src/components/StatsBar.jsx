import React from 'react'
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react'
import { TRANG_THAI } from '../constants'

export default function StatsBar({ rows }) {
  const total = rows.length
  const daXuLy = rows.filter(r => r.trangThai === TRANG_THAI.DA_XU_LY).length
  const choXuLy = rows.filter(r => r.trangThai === TRANG_THAI.CHO_XU_LY).length
  const quaHan  = rows.filter(r => r.trangThai === TRANG_THAI.QUA_HAN).length

  const pct = (n) => total > 0 ? Math.round(n / total * 100) : 0

  const stats = [
    {
      label: 'Tổng vật tư',
      value: total,
      icon: Layers,
      pct: 100,
      accent: '#3b7fe8',
      bg: 'bg-royal-50',
      border: 'border-royal-200/70',
      iconBg: 'bg-royal-100',
      iconColor: 'text-royal-600',
      textVal: 'text-royal-800',
      textLabel: 'text-royal-500',
      bar: 'bg-royal-400',
    },
    {
      label: 'Chờ xử lý',
      value: choXuLy,
      icon: Clock,
      pct: pct(choXuLy),
      accent: '#f59e0b',
      bg: 'bg-amber-50',
      border: 'border-amber-200/70',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textVal: 'text-amber-800',
      textLabel: 'text-amber-500',
      bar: 'bg-amber-400',
    },
    {
      label: 'Đã xử lý',
      value: daXuLy,
      icon: CheckCircle2,
      pct: pct(daXuLy),
      accent: '#10b981',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/70',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      textVal: 'text-emerald-800',
      textLabel: 'text-emerald-500',
      bar: 'bg-emerald-400',
    },
    {
      label: 'Quá hạn',
      value: quaHan,
      icon: AlertTriangle,
      pct: pct(quaHan),
      accent: '#f43f5e',
      bg: 'bg-rose-50',
      border: 'border-rose-200/70',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      textVal: 'text-rose-800',
      textLabel: 'text-rose-500',
      bar: 'bg-rose-400',
    },
  ]

  return (
    <div className="bg-white border-b border-royal-100 px-4 py-2.5 grid grid-cols-4 gap-3 shadow-sm">
      {stats.map(s => (
        <div
          key={s.label}
          className={`stat-card flex items-center gap-3 px-3.5 py-2.5 ${s.bg} border ${s.border} rounded-xl relative overflow-hidden`}
        >
          {/* Icon */}
          <div className={`shrink-0 w-9 h-9 ${s.iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
            <s.icon className={`w-4.5 h-4.5 ${s.iconColor}`} style={{width:'18px',height:'18px'}} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className={`font-black text-2xl leading-none ${s.textVal} tabular-nums`}>{s.value}</div>
            <div className={`text-[12px] font-semibold ${s.textLabel} mt-0.5 truncate`}>{s.label}</div>
            {/* Mini progress bar */}
            <div className="mt-1.5 h-1 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full ${s.bar} rounded-full transition-all duration-700`}
                style={{width: `${s.pct}%`}}
              />
            </div>
          </div>

          {/* Percentage */}
          <div className={`text-sm font-black ${s.textLabel} tabular-nums shrink-0`}>
            {s.pct}%
          </div>

          {/* Subtle corner accent */}
          <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-3xl opacity-10" style={{background:`radial-gradient(circle at top right,${s.accent},transparent)`}} />
        </div>
      ))}
    </div>
  )
}
