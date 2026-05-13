import React from 'react'
import { SlidersHorizontal, X, Plus, Check } from 'lucide-react'
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

function MultiSel({ label, field, options, filters, onChange }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef(null)
  
  const selectedValues = Array.isArray(filters[field]) ? filters[field] : []
  
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleValue = (val) => {
    let next;
    if (selectedValues.includes(val)) {
      next = selectedValues.filter(v => v !== val)
    } else {
      next = [...selectedValues, val]
    }
    onChange(field, next.length === 0 ? 'ALL' : next)
  }

  const displayText = selectedValues.length === 0 ? label : `${selectedValues.length} Trạng thái`

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={inputBase + ' min-w-[140px] flex items-center justify-between gap-2 text-left cursor-pointer'}
      >
        <span className="truncate font-bold text-royal-600">{displayText}</span>
        <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[200px] bg-white border border-slate-200 rounded-lg shadow-xl z-[100] py-2">
          <button
            onClick={() => { onChange(field, 'ALL'); setIsOpen(false) }}
            className={`w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${selectedValues.length === 0 ? 'bg-royal-50 text-royal-600 font-bold' : 'text-slate-600'}`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedValues.length === 0 ? 'bg-royal-500 border-royal-500' : 'bg-white border-slate-300'}`}>
              {selectedValues.length === 0 && <Check className="w-3 h-3 text-white" />}
            </div>
            {label}
          </button>
          
          <div className="h-px bg-slate-100 my-1" />
          
          {options.map(o => (
            <button
              key={o}
              onClick={() => toggleValue(o)}
              className={`w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${selectedValues.includes(o) ? 'bg-royal-50 text-royal-600 font-bold' : 'text-slate-600'}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedValues.includes(o) ? 'bg-royal-500 border-royal-500' : 'bg-white border-slate-300'}`}>
                {selectedValues.includes(o) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="truncate">{o}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SearchSelect({ label, field, options, filters, onChange }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const containerRef = React.useRef(null)

  const currentValue = filters[field] || 'ALL'
  const filteredOptions = options.filter(o => 
    o.toLowerCase().includes(search.toLowerCase())
  )

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={inputBase + ' min-w-[200px] flex items-center justify-between gap-2 text-left cursor-pointer'}
      >
        <span className="truncate">{currentValue === 'ALL' ? label : currentValue}</span>
        <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[300px] bg-white border border-slate-200 rounded-lg shadow-xl z-[100] py-1">
          <div className="px-2 py-1.5 border-b border-slate-100">
            <input
              type="text"
              autoFocus
              placeholder="Tìm kiếm NCC..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 px-2 text-sm border border-slate-200 rounded focus:border-royal-400 outline-none"
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto">
            <button
              onClick={() => { onChange(field, 'ALL'); setIsOpen(false); setSearch('') }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${currentValue === 'ALL' ? 'text-royal-600 font-bold bg-royal-50 cursor-default' : 'text-slate-600'}`}
            >
              {label}
            </button>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(o => (
                <button
                  key={o}
                  onClick={() => { onChange(field, o); setIsOpen(false); setSearch('') }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${currentValue === o ? 'text-royal-600 font-bold bg-royal-50 cursor-default' : 'text-slate-600'}`}
                >
                  {o}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">Không tìm thấy kết quả</div>
            )}
          </div>
        </div>
      )}
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
      <SearchSelect label="Tất cả NCC"       field="tenNcc"    options={uniqueNcc}                  filters={filters} onChange={onFilterChange} />
      <Sel label="Tất cả Nhóm"      field="nhom"      options={uniqueNhom}                 filters={filters} onChange={onFilterChange} />
      <Sel label="Tất cả Loại HĐ"   field="loaiHd"    options={LOAI_HOP_DONG}              filters={filters} onChange={onFilterChange} />
      <MultiSel label="Tất cả Trạng thái" field="trangThai" options={Object.values(TRANG_THAI)} filters={filters} onChange={onFilterChange} />

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
