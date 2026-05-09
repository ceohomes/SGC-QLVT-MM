import React, { useState, useRef, useEffect } from 'react'
import {
  // Group headers
  Boxes, Wrench, ShieldCheck,
  // NHÓM VẬT TƯ items
  TableProperties, ClipboardCheck,
  // NHÓM MMTB items
  HardHat, CalendarClock, GanttChartSquare, PieChart,
  // ADMINISTRATION items
  // UI controls
  ChevronRight, ChevronDown, LogOut, Menu, X, Users
} from 'lucide-react'

const MENU_GROUPS = [
  {
    id: 'nhom-vat-tu', label: 'NHÓM VẬT TƯ', icon: Boxes,
    accent: '#60a5fa',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    items: [
      { id: 'data-vat-tu-ncc',    label: 'Data vật tư & NCC',   icon: TableProperties },
      { id: 'chi-tiet-cong-viec', label: 'Chi tiết công việc',  icon: ClipboardCheck, current: true },
      { id: 'bao-cao-canh-bao',   label: 'Báo cáo quản trị', icon: PieChart },
    ],
  },
  {
    id: 'nhom-mmtb', label: 'NHÓM MMTB', icon: Wrench,
    accent: '#34d399',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    items: [
      { id: 'ql-mmtb',              label: 'Quản lý MMTB',        icon: HardHat },
      { id: 'theo-doi-bao-duong',   label: 'Theo dõi bảo dưỡng', icon: CalendarClock },
      { id: 'tien-do-mmtb',         label: 'Tiến độ MMTB',        icon: GanttChartSquare },
      { id: 'bao-cao-mmtb',         label: 'Báo cáo quản trị',    icon: PieChart },
    ],
  },
  {
    id: 'administration', label: 'ADMINISTRATION', icon: ShieldCheck,
    accent: '#fbbf24',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    items: [
      { id: 'quan-ly-tai-khoan', label: 'Quản lý tài khoản', icon: UserCog },
      { id: 'cau-hinh-logo',     label: 'Cấu hình Logo',     icon: Palette },
      { id: 'cau-hinh-du-an',    label: 'Cấu hình Dự án',    icon: FolderCog },
    ],
  },
]

function MenuGroup({ group, activeItem, onSelect }) {
  const [open, setOpen] = useState(true)
  const Icon = group.icon

  return (
    <div className={`mb-4 rounded-xl border ${group.border} ${group.bg} overflow-hidden shadow-sm`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 transition-all group"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
          style={{background: group.accent}}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="flex-1 text-left text-[13px] font-black text-white/90 uppercase tracking-widest">
          {group.label}
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
        }
      </button>

      {open && (
        <div className="px-1.5 pb-2 mt-0.5 space-y-0.5">
          {group.items.map(item => {
            const IIcon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all relative group ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    style={{background: group.accent}}
                  />
                )}
                <IIcon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/35 group-hover:text-white/60'}`} />
                <span className={`text-[15px] leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
                {item.current && !isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400/70 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ onNavigate, activeSheet }) {
  const [open, setOpen]   = useState(false)
  const [pinned, setPinned] = useState(false)
  const closeTimer = useRef(null)
  const activeItem = activeSheet || 'chi-tiet-cong-viec'

  const handleMouseEnterTrigger = () => { clearTimeout(closeTimer.current); setOpen(true) }
  const handleMouseLeaveSidebar = () => {
    if (pinned) return
    closeTimer.current = setTimeout(() => setOpen(false), 300)
  }
  const handleMouseEnterSidebar = () => clearTimeout(closeTimer.current)
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const handleSelect = (id) => { onNavigate?.(id); if (!pinned) setOpen(false) }

  return (
    <>
      {/* Hover trigger strip */}
      <div
        onMouseEnter={handleMouseEnterTrigger}
        className="fixed left-0 top-0 h-full w-2 z-[90] cursor-pointer"
      />

      {/* Collapsed toggle */}
      {!open && (
        <button
          onMouseEnter={handleMouseEnterTrigger}
          onClick={() => setOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[91] flex items-center justify-center w-5 h-16 rounded-r-xl shadow-lg transition-all group"
          style={{background:'linear-gradient(180deg,#2563d4,#1d4fb8)'}}
          title="Mở menu"
        >
          <ChevronRight className="w-3 h-3 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Backdrop */}
      {open && !pinned && (
        <div className="fixed inset-0 z-[92] bg-black/20 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar panel */}
      <div
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
        className={`fixed left-0 top-0 h-full z-[93] flex flex-col transition-transform duration-250 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{width:272}}
      >
        {/* Background */}
        <div
          className="absolute inset-0 shadow-2xl"
          style={{backgroundColor: '#0f58a7'}}
        />
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex flex-col h-full">
          {/* Logo header */}
          <div className="flex items-center justify-between px-0 pt-0 pb-3 border-b border-white/10 shrink-0 flex-col">
            <div className="w-full bg-white flex items-center justify-center overflow-hidden" style={{minHeight: 64}}>
              <img src="https://smartandgreen.vn/wp-content/uploads/2021/04/Logo-SGC-Header.png" alt="Logo" className="w-full h-full object-contain" style={{maxHeight: 72}} onError={e => { e.target.style.display='none' }} />
            </div>
            <div className="text-center mt-2 px-2">
              <div className="text-white font-black text-[13px] leading-tight">SGC | Vật Tư & Thiết Bị</div>
              <div className="text-royal-300/80 text-[11px] font-medium">Smart & Green</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPinned(p => !p)}
                title={pinned ? 'Bỏ ghim' : 'Ghim sidebar'}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${pinned ? 'bg-white/20 text-white' : 'text-white/30 hover:bg-white/10 hover:text-white/70'}`}
              >
                <Menu className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white/70 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Menu groups */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-hide">
            {MENU_GROUPS.map(group => (
              <MenuGroup key={group.id} group={group} activeItem={activeItem} onSelect={handleSelect} />
            ))}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-white/10 px-3 py-3">
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{background:'linear-gradient(135deg,#3b7fe8,#1d4fb8)'}}>
                <Users className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-white text-[15px] font-bold truncate">Người dùng</div>
                <div className="text-royal-300/70 text-[13px] truncate">SGC System</div>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400/80 hover:bg-rose-500/15 hover:text-rose-300 transition-all text-[15px] font-bold">
              <LogOut className="w-5 h-5" />
              Đăng xuất tài khoản
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
