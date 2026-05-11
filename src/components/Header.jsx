import React, { useState, useRef, useEffect } from 'react'
import { Boxes, Plus, Download, Upload, Settings, Search, RefreshCw, ShieldCheck, Briefcase, ChevronDown } from 'lucide-react'

// ── Custom Project Dropdown ──────────────────────────────────────────────────
function ProjectDropdown({ projects, selectedProjectId, onProjectChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Đóng khi click ngoài
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Nhóm dự án theo khối thi công
  const grouped = projects.reduce((acc, p) => {
    const key = p.khoiTen || 'Chưa phân bổ'
    if (!acc[key]) acc[key] = { vietTat: p.khoiVietTat || '', items: [] }
    acc[key].items.push(p)
    return acc
  }, {})

  const selected = projects.find(p => p.id === selectedProjectId)
  const label = selectedProjectId === 'ALL'
    ? 'Tất cả Dự án'
    : selected
      ? (selected.khoiVietTat ? `${selected.khoiVietTat}. ${selected.ten}` : selected.ten)
      : 'Tất cả Dự án'

  // Màu badge cho từng khối (cycle qua palette)
  const BADGE_COLORS = [
    'bg-violet-500', 'bg-orange-500', 'bg-pink-500',
    'bg-teal-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-slate-500'
  ]
  const groupKeys = Object.keys(grouped)

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 h-[38px] rounded-xl border text-white text-[13px] font-bold transition-all shadow-sm select-none
          ${open ? 'bg-white/25 border-white/40' : 'bg-white/12 border-white/22 hover:bg-white/20'}`}
      >
        <Briefcase className="w-4 h-4 text-blue-200 shrink-0" />
        <span className="max-w-[200px] truncate">{label}</span>
        <ChevronDown className={`w-4 h-4 text-blue-200 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[200] w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-white/80" />
            <span className="text-white font-black text-sm tracking-wide">Chọn Dự án</span>
            <span className="ml-auto text-blue-200 text-xs font-semibold">{projects.length} dự án</span>
          </div>

          {/* Tất cả */}
          <button
            onClick={() => { onProjectChange('ALL'); setOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-slate-100
              ${selectedProjectId === 'ALL' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0 bg-slate-400`}>
              ALL
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">Tất cả Dự án</div>
              <div className="text-xs text-slate-400">Hiển thị toàn bộ dữ liệu</div>
            </div>
            {selectedProjectId === 'ALL' && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            )}
          </button>

          {/* Grouped projects */}
          {groupKeys.map((groupName, gi) => {
            const { vietTat, items } = grouped[groupName]
            const badgeCls = BADGE_COLORS[gi % BADGE_COLORS.length]
            return (
              <div key={groupName}>
                {/* Group header */}
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md text-white ${badgeCls}`}>
                    {vietTat || '??'}
                  </span>
                  <span className="text-xs font-bold text-slate-500 truncate">{groupName}</span>
                  <span className="ml-auto text-[11px] text-slate-400 shrink-0">{items.length}</span>
                </div>
                {/* Items */}
                {items.map(p => {
                  const isActive = selectedProjectId === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => { onProjectChange(p.id); setOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all border-b border-slate-50 last:border-0
                        ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0 ${badgeCls} opacity-80`}>
                        {vietTat ? vietTat.charAt(0) : '?'}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{p.ten}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )
          })}

          {projects.length === 0 && (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              Chưa có dự án nào
            </div>
          )}
        </div>
      )}
    </div>
  )
}


export default function Header({
  onAddNew, onExport, onImport, onOpenSettings,
  totalRows, filteredRows, searchGlobal, onSearchGlobal, onRefresh,
  branding, projects = [], selectedProjectId = 'ALL', onProjectChange,
  onOpenSidebar
}) {
  return (
    <header className="sticky top-0 z-50 shadow-md" style={{background:'linear-gradient(135deg,#1d4ed8 0%,#2563eb 45%,#3b82f6 100%)'}}>
      {/* Decorative highlight */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-8 right-16 w-64 h-32 rounded-full opacity-10" style={{background:'radial-gradient(ellipse,#fff,transparent)'}} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      <div className="relative flex items-center h-20 px-0">
        {/* Logo wrapper for larger hover area as requested by user */}
        <div 
          onMouseEnter={onOpenSidebar}
          className="h-full flex items-center justify-center pl-4 pr-6 cursor-pointer group"
        >
          {/* Logo badge - Modern rounded style */}
          <div className={`h-[58px] ${branding?.logoUrl ? 'px-5' : 'w-[58px]'} bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_25px_-5px_rgba(0,0,0,0.3)] border-2 border-white/40 z-10 shrink-0 overflow-hidden group-hover:scale-[1.02] group-active:scale-95 transition-all`}>
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Boxes className="w-8 h-8 text-[#0f58a7]" />
              </div>
            )}
          </div>
        </div>

        {/* Header content container */}
        <div className="flex-1 flex items-center gap-4 px-2 flex-wrap">
          {/* Title (hidden on small screens to save space) */}
          <div className="hidden lg:block shrink-0">
            <h1 className="text-white font-black text-2xl leading-tight tracking-tight drop-shadow-md uppercase">
              Chi tiết công việc
            </h1>
            <p className="text-blue-100/80 text-[12px] font-bold uppercase tracking-[0.2em] mt-0.5">
              Quản lý vật tư & MMTB
            </p>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-10 bg-white/20 shrink-0 mx-2" />

          {/* Search */}
          <div className="flex-1 min-w-[160px] max-w-xs relative">
            <Search className="w-3.5 h-3.5 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm toàn bộ..."
              value={searchGlobal}
              onChange={e => onSearchGlobal(e.target.value)}
              className="w-full pr-3 h-[34px] bg-white/12 border border-white/22 rounded-lg text-white text-[14px] placeholder-blue-300/70 focus:bg-white/20 focus:border-white/45 transition-all outline-none"
              style={{paddingLeft:'2rem'}}
            />
          </div>

          {/* Import */}
          <label className="flex items-center gap-1.5 px-4 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 text-white rounded-lg font-bold text-[14px] transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm active:scale-95" style={{height:'38px'}}>
            <Upload className="w-4 h-4" />
            Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={onImport} className="hidden" />
          </label>

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white rounded-lg font-bold text-[14px] transition-all active:scale-95 whitespace-nowrap shrink-0 shadow-sm"
            style={{height:'38px'}}
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>

          {/* Icon-only buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRefresh}
              title="Tính lại trạng thái"
              className="flex items-center justify-center w-[38px] h-[38px] bg-white/12 border border-white/22 text-white rounded-lg hover:bg-white/25 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              title="Cài đặt"
              className="flex items-center justify-center w-[38px] h-[38px] bg-white/12 border border-white/22 text-white rounded-lg hover:bg-white/25 transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Project Selector — Custom Dropdown */}
          <ProjectDropdown
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={onProjectChange}
          />

          {/* Stats pills — pushed to the right */}
          <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
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
      </div>

      {/* Bottom border shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </header>
  )
}
