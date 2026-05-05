import React from 'react'
import { Database, Package, Truck, Plus, Upload, Download, Search } from 'lucide-react'

export default function DataVatTuNCC() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-royal-50">
      {/* Header của sheet */}
      <div className="bg-gradient-to-r from-royal-700 via-royal-500 to-royal-600 shadow-xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none tracking-tight">Data Vật Tư & NCC</h1>
              <p className="text-royal-200 text-xs font-medium mt-0.5">Danh mục vật tư & nhà cung cấp</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 h-9 bg-white text-royal-700 rounded-lg font-bold text-sm hover:bg-royal-50 transition-all opacity-50 cursor-not-allowed whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>
            <button className="flex items-center gap-2 px-3 h-9 bg-white/15 border border-white/25 text-white rounded-lg font-medium text-sm hover:bg-white/25 transition-all opacity-50 cursor-not-allowed whitespace-nowrap">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button className="flex items-center gap-2 px-3 h-9 bg-white/15 border border-white/25 text-white rounded-lg font-medium text-sm hover:bg-white/25 transition-all opacity-50 cursor-not-allowed whitespace-nowrap">
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="bg-white border-b border-royal-100 px-6">
        <div className="flex gap-1 pt-2">
          {[
            { label: 'Danh mục Vật tư', icon: Package, active: true },
            { label: 'Danh mục NCC', icon: Truck, active: false },
          ].map(tab => (
            <button
              key={tab.label}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                tab.active
                  ? 'border-royal-600 text-royal-700 bg-royal-50'
                  : 'border-transparent text-slate-500 hover:text-royal-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border-b border-royal-100 px-6 py-3">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm vật tư..."
            className="w-full pl-9 pr-3 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-royal-400 transition-colors opacity-50 cursor-not-allowed"
            disabled
          />
        </div>
      </div>

      {/* Content area – Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-24 h-24 rounded-3xl bg-royal-100 flex items-center justify-center shadow-inner">
          <Database className="w-12 h-12 text-royal-400" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-black text-royal-800 mb-2">Data Vật Tư & NCC</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-1">
            Sheet này sẽ lưu trữ danh mục vật tư chuẩn và danh sách nhà cung cấp.
          </p>
          <p className="text-slate-400 text-xs">
            Dữ liệu sẽ được cấu hình và kết nối với sheet Chi tiết công việc.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 w-full max-w-lg">
          {[
            {
              icon: Package,
              color: 'bg-royal-100 text-royal-600',
              title: 'Danh mục Vật tư',
              desc: 'Mã VT, tên, ĐVT, nhóm, quy cách kỹ thuật',
            },
            {
              icon: Truck,
              color: 'bg-emerald-100 text-emerald-600',
              title: 'Danh mục NCC',
              desc: 'Tên NCC, địa chỉ, liên hệ, đánh giá',
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
