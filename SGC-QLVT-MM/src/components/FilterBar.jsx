import React from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { TRANG_THAI, NHOM_VAT_TU, LOAI_HOP_DONG } from '../constants'

export default function FilterBar({ filters, onFilterChange, onClearFilters, uniqueNCC, uniqueNhom }) {
  const hasActiveFilter = Object.values(filters).some(v => v && v !== 'ALL')

  const sel = (label, field, options) => (
    <div className="relative">
      <select
        value={filters[field] || 'ALL'}
        onChange={e => onFilterChange(field, e.target.value)}
        className="pl-3 pr-7 h-8 bg-white border border-royal-200 rounded-lg text-xs font-semibold text-slate-700 outline-none appearance-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 min-w-[130px] transition-all"
      >
        <option value="ALL">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  )

  return (
    <div className="bg-white border-b border-royal-100 px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
      <div className="flex items-center gap-1.5 text-royal-500 font-bold text-xs uppercase tracking-wide mr-1">
        <Filter className="w-3.5 h-3.5" />
        <span>Lọc</span>
      </div>

      {/* Text search filters */}
      <input
        type="text"
        placeholder="Mã vật tư..."
        value={filters.maVatTu || ''}
        onChange={e => onFilterChange('maVatTu', e.target.value)}
        className="h-8 px-3 bg-white border border-royal-200 rounded-lg text-xs font-semibold text-slate-700 w-[110px] outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 transition-all"
      />

      <input
        type="text"
        placeholder="Tên vật tư..."
        value={filters.tenVatTu || ''}
        onChange={e => onFilterChange('tenVatTu', e.target.value)}
        className="h-8 px-3 bg-white border border-royal-200 rounded-lg text-xs font-semibold text-slate-700 w-[140px] outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 transition-all"
      />

      {/* NCC */}
      {sel('Tất cả NCC', 'tenNCC', uniqueNCC)}

      {/* Nhóm */}
      {sel('Tất cả Nhóm', 'nhom', NHOM_VAT_TU)}

      {/* Loại HĐ */}
      {sel('Tất cả Loại HĐ', 'loaiHD', LOAI_HOP_DONG)}

      {/* Trạng thái */}
      {sel('Tất cả Trạng thái', 'trangThai', Object.values(TRANG_THAI))}

      {/* Dot */}
      <input
        type="text"
        placeholder="Đợt..."
        value={filters.dot || ''}
        onChange={e => onFilterChange('dot', e.target.value)}
        className="h-8 px-3 bg-white border border-royal-200 rounded-lg text-xs font-semibold text-slate-700 w-[80px] outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100 transition-all"
      />

      {/* Clear filters */}
      {hasActiveFilter && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 h-8 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all"
        >
          <X className="w-3.5 h-3.5" />
          <span>Xóa lọc</span>
        </button>
      )}
    </div>
  )
}
