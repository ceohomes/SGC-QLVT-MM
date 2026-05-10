import React from 'react'
import { BarChart2, AlertTriangle, Bell, FileText, TrendingDown, TrendingUp, Clock } from 'lucide-react'

export default function BaoCaoCanhBao({ branding, onOpenSidebar }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-royal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-500 to-orange-500 shadow-xl flex items-center h-16 shrink-0 px-0">
        <div 
          onMouseEnter={onOpenSidebar}
          className="h-full flex items-center justify-center pl-2 pr-4 cursor-pointer group"
        >
          <div className={`h-[54px] ${branding?.logoUrl ? 'px-4' : 'w-[54px]'} bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30 z-10 shrink-0 overflow-hidden group-hover:scale-[1.02] group-active:scale-95 transition-all`}>
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center scale-90">
                <BarChart2 className="w-7 h-7 text-rose-600" />
              </div>
            )}
          </div>
        </div>
        <div className="px-2 flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl leading-none tracking-tight">Báo Cáo & Cảnh Báo</h1>
            <p className="text-rose-100 text-[11px] font-bold uppercase tracking-wider mt-0.5 opacity-80">Theo dõi tiến độ & Cảnh báo</p>
          </div>
          <button className="flex items-center gap-2 px-3 h-9 bg-white/15 border border-white/25 text-white rounded-lg font-medium text-sm opacity-50 cursor-not-allowed whitespace-nowrap">
            <FileText className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Summary cards – mock */}
      <div className="bg-white border-b border-rose-100 px-6 py-3 grid grid-cols-3 gap-3">
        {[
          { label: 'Cảnh báo quá hạn', value: '—', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
          { label: 'Chờ PCU xử lý', value: '—', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Hoàn thành tháng', value: '—', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 px-4 py-3 ${s.bg} border ${s.border} rounded-xl`}>
            <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
            <div>
              <div className={`font-black text-xl leading-none ${s.color}`}>{s.value}</div>
              <div className={`text-xs ${s.color} font-medium mt-0.5 opacity-80`}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Content area – Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-24 h-24 rounded-3xl bg-rose-100 flex items-center justify-center shadow-inner">
          <Bell className="w-12 h-12 text-rose-400" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Báo Cáo & Cảnh Báo</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-1">
            Tự động tổng hợp dữ liệu từ sheet Chi tiết công việc, phát cảnh báo theo ngưỡng cấu hình sẵn.
          </p>
          <p className="text-slate-400 text-xs">
            Biểu đồ, bảng tổng hợp và danh sách cảnh báo sẽ hiển thị ở đây.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 w-full max-w-2xl">
          {[
            {
              icon: AlertTriangle,
              color: 'bg-rose-100 text-rose-600',
              title: 'Cảnh báo tự động',
              desc: 'PCU quá hạn, thiếu KL, chưa ký HĐ',
            },
            {
              icon: BarChart2,
              color: 'bg-royal-100 text-royal-600',
              title: 'Báo cáo tổng hợp',
              desc: 'Theo NCC, nhóm VT, trạng thái, đợt',
            },
            {
              icon: TrendingDown,
              color: 'bg-amber-100 text-amber-600',
              title: 'Phân tích xu hướng',
              desc: 'Tiến độ, tốc độ xử lý, dự báo',
            },
          ].map(card => (
            <div key={card.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-700 text-sm">{card.title}</div>
                <div className="text-slate-400 text-xs mt-0.5">{card.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-amber-600 text-sm font-semibold">🔧 Đang cấu hình — sẽ cập nhật theo yêu cầu</span>
        </div>
      </div>
    </div>
  )
}
