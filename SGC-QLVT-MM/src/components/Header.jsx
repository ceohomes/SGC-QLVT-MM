import React from 'react'
import { Package, Plus, Download, Upload, Settings, BarChart3, Search, RefreshCw } from 'lucide-react'

export default function Header({ 
  onAddNew, 
  onExport, 
  onImport, 
  onOpenSettings, 
  totalRows, 
  filteredRows,
  searchGlobal,
  onSearchGlobal,
  onRefresh
}) {
  return (
    <header className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-700 shadow-xl sticky top-0 z-50">
      <div className="px-4 py-3">
        {/* Top row: Logo + Title + Stats */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none tracking-tight">Quản Lý Vật Tư & PCU</h1>
              <p className="text-blue-200 text-xs font-medium mt-0.5">Theo dõi tiến độ vật tư - Kiểm soát PCU</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-white font-black text-xl leading-none">{totalRows}</div>
              <div className="text-blue-200 text-xs">Tổng dòng</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-white font-black text-xl leading-none">{filteredRows}</div>
              <div className="text-blue-200 text-xs">Đang hiện</div>
            </div>
          </div>
        </div>

        {/* Bottom row: Search + Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Global search */}
          <div className="flex-1 min-w-[180px] max-w-sm relative">
            <Search className="w-4 h-4 text-blue-200 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm toàn bộ..."
              value={searchGlobal}
              onChange={e => onSearchGlobal(e.target.value)}
              className="w-full pl-9 pr-3 h-9 bg-white/15 border border-white/25 rounded-lg text-white placeholder-blue-200 text-sm focus:bg-white/25 focus:border-white/50 transition-all outline-none"
            />
          </div>

          {/* Action buttons */}
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-4 h-9 bg-white text-navy-800 rounded-lg font-bold text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-lg whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
          
          <label className="flex items-center gap-2 px-3 h-9 bg-white/15 border border-white/25 text-white rounded-lg font-medium text-sm hover:bg-white/25 transition-all cursor-pointer whitespace-nowrap">
            <Upload className="w-4 h-4" />
            <span>Import Excel</span>
            <input type="file" accept=".xlsx,.xls" onChange={onImport} className="hidden" />
          </label>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 h-9 bg-white/15 border border-white/25 text-white rounded-lg font-medium text-sm hover:bg-white/25 transition-all active:scale-95 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={onRefresh}
            title="Tính lại trạng thái"
            className="flex items-center justify-center w-9 h-9 bg-white/15 border border-white/25 text-white rounded-lg hover:bg-white/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Cài đặt"
            className="flex items-center justify-center w-9 h-9 bg-white/15 border border-white/25 text-white rounded-lg hover:bg-white/25 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
