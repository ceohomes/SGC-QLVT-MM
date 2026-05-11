import React, { useState, useRef, useEffect } from 'react'
import {
  // Group headers
  Boxes, Wrench, ShieldCheck,
  Database,
  // NHÓM VẬT TƯ items
  TableProperties, ClipboardCheck,
  // NHÓM MMTB items
  HardHat, CalendarClock, GanttChartSquare, PieChart,
  // ADMINISTRATION items
  UserCog, Palette, FolderCog,
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
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-1 transition-all group"
      >
        <span className="flex-1 text-left text-[12px] font-black text-white/40 uppercase tracking-[0.2em]">
          {group.label}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/20 transition-transform duration-300 ${open ? '' : '-rotate-90'}`} />
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map(item => {
            const IIcon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-left transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] ring-1 ring-white/15'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,1)]" />
                )}
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-500 ${isActive ? 'bg-white/10 text-white' : 'text-white/20 group-hover:text-white/60'}`}>
                  <IIcon className="w-4 h-4 transition-transform duration-500 group-hover:rotate-[5deg]" />
                </div>
                <span className={`text-[15px] leading-tight flex-1 tracking-tight transition-colors duration-300 ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                {item.current && !isActive && (
                  <div className="w-1 h-1 rounded-full bg-blue-400/50 shadow-[0_0_10px_rgba(96,165,250,0.3)] animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Phân quyền menu theo phongBan + chucDanh ──────────────────────────────
// phongBan: 'vat-tu' | 'mmtb'
// chucDanh: 'truong-nhom' | 'chuyen-vien' | 'hanh-chinh'
// role:     'admin' | 'user'
//
// Logic:
//   admin                  → thấy tất cả
//   truong-nhom (vat-tu)   → nhom-vat-tu + administration
//   truong-nhom (mmtb)     → nhom-mmtb   + administration
//   chuyen-vien/hanh-chinh (vat-tu) → nhom-vat-tu only
//   chuyen-vien/hanh-chinh (mmtb)   → nhom-mmtb   only

function getVisibleGroups(user) {
  if (!user) return MENU_GROUPS
  if (user.role === 'admin') return MENU_GROUPS

  const pb = user.phongBan  // 'vat-tu' | 'mmtb'
  const cd = user.chucDanh  // 'truong-nhom' | 'chuyen-vien' | 'hanh-chinh'

  const groupMap = {
    'vat-tu': 'nhom-vat-tu',
    'mmtb':   'nhom-mmtb',
  }
  const ownGroupId = groupMap[pb] || null

  const allowed = new Set()
  if (ownGroupId) allowed.add(ownGroupId)
  if (cd === 'truong-nhom') allowed.add('administration')

  return MENU_GROUPS
    .map(group => {
      if (!allowed.has(group.id)) return null

      // Nếu là nhóm administration, truong-nhom chỉ thấy Quản lý tài khoản bị ẩn (chỉ admin)
      // → truong-nhom thấy Cấu hình Logo + Cấu hình Dự án, KHÔNG thấy Quản lý tài khoản
      if (group.id === 'administration' && cd === 'truong-nhom') {
        return {
          ...group,
          items: group.items.filter(item => item.id !== 'quan-ly-tai-khoan')
        }
      }
      return group
    })
    .filter(Boolean)
}


export default function Sidebar({ onNavigate, activeSheet, branding, user, onLogout, isOpen: open, onOpenChange: setOpen }) {
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
      {/* Hidden Hover trigger - Left edge */}
      {!open && (
        <div
          onMouseEnter={handleMouseEnterTrigger}
          className="fixed left-0 top-0 bottom-0 w-1.5 z-[90] cursor-pointer group"
        />
      )}

      {/* Backdrop */}
      {open && !pinned && (
        <div className="fixed inset-0 z-[92] bg-black/20 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar panel */}
      <div
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
        className={`fixed left-0 top-0 bottom-0 z-[93] flex flex-col transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.15)] ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 280 }}
      >
        {/* Background with branding gradient */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ 
            background: branding?.primaryColor ? `linear-gradient(165deg, ${branding.primaryColor} 0%, #001A33 100%)` : '#001A33' 
          }}
        >
          {/* Extremely subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>

        <div className="relative flex flex-col h-full z-10">
          {/* Logo header section - Premium Integrated Look */}
          <div className="pt-4 pb-2 px-3 shrink-0">
            <div className="group relative w-full bg-white flex items-center justify-center overflow-hidden rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/20 transition-all duration-500 hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)]" style={{ height: 90 }}>
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="max-w-[95%] max-h-[90%] object-contain transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <img src="https://smartandgreen.vn/wp-content/uploads/2021/04/Logo-SGC-Header.png" alt="Logo" className="max-w-[95%] max-h-[90%] object-contain transition-transform duration-500 group-hover:scale-105" onError={e => { e.target.style.display='none' }} />
              )}
              
              {/* Pin Button - More subtle integration */}
              <button
                onClick={() => setPinned(p => !p)}
                className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 ${pinned ? 'bg-royal-600 text-white shadow-md' : 'bg-black/5 text-black/10 hover:bg-black/10 hover:text-black/30 opacity-0 group-hover:opacity-100'}`}
                title={pinned ? 'Gỡ ghim' : 'Ghim menu'}
              >
                <div className="rotate-[-45deg]">
                  <Menu className="w-2.5 h-2.5" />
                </div>
              </button>
            </div>
            <div className="mt-3 px-1">
              <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-0.5">ENTERPRISE SYSTEM</div>
              <div className="text-white font-black text-[15px] leading-tight uppercase tracking-tight">
                {branding?.appName || 'SGC | Vật Tư & Thiết Bị'}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {getVisibleGroups(user).map(group => (
              <MenuGroup key={group.id} group={group} activeItem={activeItem} onSelect={handleSelect} />
            ))}
          </div>

          {/* Footer - Professional Profile Section */}
          <div className="shrink-0 p-3 bg-black/20 backdrop-blur-xl border-t border-white/5">
            <div className="group flex items-center gap-2.5 p-2 rounded-[16px] bg-white/5 border border-white/5 mb-2 transition-all duration-300 hover:bg-white/10 hover:border-white/10">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-white/10 ring-2 ring-white/5 shadow-2xl transition-transform duration-500 group-hover:scale-105" 
                style={{ background: user?.role === 'admin' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)' }}>
                <Users className="w-4 h-4 text-white/90" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white text-[15px] font-black truncate tracking-tight">{user?.hoTen || 'Administrator'}</div>
                <div className="text-white/20 text-[11px] truncate font-bold uppercase tracking-wider">{user?.role === 'admin' ? 'Hệ thống Admin' : 'Thành viên hệ thống'}</div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="group w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[14px] text-rose-400 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 transition-all duration-500 text-[15px] font-black shadow-lg"
            >
              <LogOut className="w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1" />
              ĐĂNG XUẤT
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
