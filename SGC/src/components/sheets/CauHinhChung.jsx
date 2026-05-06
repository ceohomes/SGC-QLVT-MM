import React from 'react'
import { Settings, Calendar, Users, Bell, Shield, Sliders, Database } from 'lucide-react'

export default function CauHinhChung() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 shadow-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg leading-none tracking-tight">Cấu Hình Chung</h1>
            <p className="text-slate-300 text-xs font-medium mt-0.5">Thiết lập hệ thống & tham số</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-24 h-24 rounded-3xl bg-slate-200 flex items-center justify-center shadow-inner">
          <Sliders className="w-12 h-12 text-slate-400" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Cấu Hình Chung</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-1">
            Tập trung toàn bộ tham số hệ thống, phân quyền người dùng và cài đặt thông báo.
          </p>
          <p className="text-slate-400 text-xs">
            Thay thế modal cài đặt hiện tại với giao diện đầy đủ hơn.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 w-full max-w-2xl">
          {[
            {
              icon: Calendar,
              color: 'bg-royal-100 text-royal-600',
              title: 'Tham số PCU',
              desc: 'Số ngày hạn PCU, ngưỡng cảnh báo',
            },
            {
              icon: Users,
              color: 'bg-emerald-100 text-emerald-600',
              title: 'Người dùng',
              desc: 'Chuyên viên K.QLVT, CVPCU',
            },
            {
              icon: Bell,
              color: 'bg-amber-100 text-amber-600',
              title: 'Thông báo',
              desc: 'Quy tắc cảnh báo tự động',
            },
            {
              icon: Shield,
              color: 'bg-royal-100 text-royal-600',
              title: 'Phân quyền',
              desc: 'Vai trò & quyền thao tác',
            },
            {
              icon: Database,
              color: 'bg-rose-100 text-rose-600',
              title: 'Dữ liệu',
              desc: 'Backup, restore, xóa dữ liệu',
            },
            {
              icon: Sliders,
              color: 'bg-slate-100 text-slate-600',
              title: 'Giao diện',
              desc: 'Logo, tên dự án, màu sắc',
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
