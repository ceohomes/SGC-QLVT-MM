import React from 'react'
import { Package, Plus, Download, Upload, Settings, Search, RefreshCw } from 'lucide-react'

export default function Header({
  onAddNew, onExport, onImport, onOpenSettings,
  totalRows, filteredRows, searchGlobal, onSearchGlobal, onRefresh
}) {
  return (
    <header className="sticky top-0 z-50 shadow-md" style={{background:'linear-gradient(135deg,#1d4ed8 0%,#2563eb 45%,#3b82f6 100%)'}}>
      {/* Decorative highlight */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-8 right-16 w-64 h-32 rounded-full opacity-10" style={{background:'radial-gradient(ellipse,#fff,transparent)'}} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      <div className="relative px-4 py-2.5">
        {/* Row 1: Logo + Stats */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            {/* Logo badge */}
            <div className="relative w-10 h-10 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner backdrop-blur-sm">
                <Package className="w-5 h-5 text-white drop-shadow" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white/80 rounded-full shadow-sm" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-tight tracking-tight drop-shadow-sm">
                SGC | Vật Tư & Thiết Bị
              </h1>
              <p className="text-blue-200/80 text-[12px] font-medium tracking-wide">
                Smart & Green Construction
              </p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/12 border border-white/20 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-white font-black text-xl leading-none tabular-nums">{totalRows}</div>
                <div className="text-blue-200 text-[11px] font-medium mt-0.5">Tổng dòng</div>
              </div>
              <div className="w-px h-7 bg-white/20 mx-1" />
              <div className="text-center">
                <div className="text-white font-black text-xl leading-none tabular-nums">{filteredRows}</div>
                <div className="text-blue-200 text-[11px] font-medium mt-0.5">Đang hiện</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Search + Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[180px] max-w-xs relative">
            <Search className="w-3.5 h-3.5 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm toàn bộ..."
              value={searchGlobal}
              onChange={e => onSearchGlobal(e.target.value)}
              className="w-full pl-8.5 pr-3 h-8.5 bg-white/12 border border-white/22 rounded-lg text-white text-[14px] placeholder-blue-300/70 focus:bg-white/20 focus:border-white/45 transition-all outline-none"
              style={{paddingLeft:'2rem'}}
            />
          </div>

          {/* Add new — primary CTA */}
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-4 h-8.5 bg-white text-royal-700 rounded-lg font-bold text-[14px] hover:bg-blue-50 transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
            style={{height:'34px'}}
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm mới
          </button>

          {/* Import */}
          <label className="flex items-center gap-1.5 px-3 bg-white/12 border border-white/22 text-white rounded-lg font-medium text-[14px] hover:bg-white/22 transition-all cursor-pointer whitespace-nowrap" style={{height:'34px'}}>
            <Upload className="w-3.5 h-3.5" />
            Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={onImport} className="hidden" />
          </label>

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 bg-white/12 border border-white/22 text-white rounded-lg font-medium text-[14px] hover:bg-white/22 transition-all active:scale-95 whitespace-nowrap"
            style={{height:'34px'}}
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel
          </button>

          {/* Icon-only buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRefresh}
              title="Tính lại trạng thái"
              className="flex items-center justify-center w-[34px] h-[34px] bg-white/12 border border-white/22 text-white rounded-lg hover:bg-white/22 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenSettings}
              title="Cài đặt"
              className="flex items-center justify-center w-[34px] h-[34px] bg-white/12 border border-white/22 text-white rounded-lg hover:bg-white/22 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom border shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </header>
  )
}
