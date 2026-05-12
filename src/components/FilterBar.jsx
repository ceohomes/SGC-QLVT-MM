import React from 'react'
import { SlidersHorizontal, X, Plus } from 'lucide-react'
import { TRANG_THAI, NHOM_VAT_TU, LOAI_HOP_DONG } from '../constants'

const inputBase = "h-8 px-2.5 bg-white border border-royal-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100/60 transition-all placeholder-slate-400"
const selectBase = "h-8 pl-2.5 pr-6 bg-white border border-royal-200 rounded-lg text-sm font-medium text-slate-700 outline-none appearance-none focus:border-royal-400 focus:ring-2 focus:ring-royal-100/60 transition-all"

function Sel({ label, field, options, filters, onChange }) {
  return (
    <div className="relative filter-chip">
      <select
        value={filters[field] || 'ALL'}
        onChange={e => onChange(field, e.target.value)}
        className={selectBase + ' min-w-[128px]'}
      >
        <option value="ALL">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

export default function FilterBar({ filters, onFilterChange, onClearFilters, uniqueNcc, uniqueNhom, onAddNew, selectedProjectId, projects = [] }) {
  const hasActiveFilter = Object.values(filters).some(v => v && v !== 'ALL')
  
  // Chỉ cho phép thêm mới khi đã chọn một dự án cụ thể (có khoiId), không cho phép khi chọn ALL hoặc chọn cả Khối
  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const canAddNew = selectedProjectId && selectedProjectId !== 'ALL' && selectedProject && selectedProject.khoiId

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 flex-wrap">
      {/* Label */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-6 h-6 rounded-md bg-royal-100 flex items-center justify-center">
          <SlidersHorizontal className="w-3 h-3 text-royal-600" />
        </div>
        <span className="text-[12px] font-black text-royal-500 uppercase tracking-widest">Lọc</span>
      </div>

      <div className="w-px h-5 bg-royal-200 shrink-0" />

      {/* Text inputs */}
      <input
        type="text"
        placeholder="Mã/Tên vật tư..."
        value={filters.searchVattu || ''}
        onChange={e => onFilterChange('searchVattu', e.target.value)}
        className={inputBase + ' w-[200px] filter-chip'}
      />

      {/* Selects */}
      <Sel label="Tất cả NCC"       field="tenNcc"    options={uniqueNcc}                  filters={filters} onChange={onFilterChange} />
      <Sel label="Tất cả Nhóm"      field="nhom"      options={NHOM_VAT_TU}                filters={filters} onChange={onFilterChange} />
      <Sel label="Tất cả Loại HĐ"   field="loaiHd"    options={LOAI_HOP_DONG}              filters={filters} onChange={onFilterChange} />
      <Sel label="Tất cả Trạng thái" field="trangThai" options={Object.values(TRANG_THAI)}  filters={filters} onChange={onFilterChange} />

      <input
        type="text"
        placeholder="Đợt..."
        value={filters.dot || ''}
        onChange={e => onFilterChange('dot', e.target.value)}
        className={inputBase + ' w-[72px] filter-chip'}
      />

      {/* Action Area */}
      <div className="ml-auto flex items-center gap-2">
        {/* Clear button */}
        {hasActiveFilter && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-2.5 h-8 bg-rose-50 border border-rose-200 text-rose-500 rounded-lg text-sm font-bold hover:bg-rose-100 hover:text-rose-600 transition-all"
          >
            <X className="w-3 h-3" />
            Xóa lọc
          </button>
        )}

        {/* Add New Button */}
        <button
          onClick={onAddNew}
          disabled={!canAddNew}
          className={`flex items-center gap-1.5 px-4 h-8 rounded-lg text-sm font-black shadow-sm transition-all
            ${canAddNew 
              ? "bg-emerald-600 border border-emerald-700 text-white hover:bg-emerald-500 hover:shadow-md active:scale-95" 
              : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
            }`}
          title={!canAddNew ? "Vui lòng chọn một dự án cụ thể để thêm mới" : ""}
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm mới
        </button>
      </div>
    </div>
  )
}
