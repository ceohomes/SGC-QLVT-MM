import React, { useState, useRef, useEffect } from 'react'
import {
  Database, ClipboardList, BarChart2, Settings,
  Layers, Clock, TrendingUp, BarChart, FolderOpen,
  ShieldCheck, Users, Image,
  ChevronRight, ChevronDown,
  LogOut, Menu, X, Package
} from 'lucide-react'

const MENU_GROUPS = [
  {
    id: 'nhom-vat-tu', label: 'NHÓM VẬT TƯ', icon: Package,
    accent: '#3b7fe8',
    items: [
      { id: 'data-vat-tu-ncc',    label: 'Data vật tư & NCC',   icon: Database },
      { id: 'chi-tiet-cong-viec', label: 'Chi tiết công việc',  icon: ClipboardList, current: true },
      { id: 'bao-cao-canh-bao',   label: 'Báo cáo & Cảnh báo', icon: BarChart2 },
      { id: 'cau-hinh-chung',     label: 'Cấu hình chung',      icon: Settings },
    ],
  },
  {
    id: 'nhom-mmtb', label: 'NHÓM MMTB', icon: Layers,
    accent: '#10b981',
    items: [
      { id: 'ql-mmtb',              label: 'Quản lý MMTB',        icon: ClipboardList },
      { id: 'theo-doi-bao-duong',   label: 'Theo dõi bảo dưỡng', icon: Clock },
      { id: 'tien-do-mmtb',         label: 'Tiến độ MMTB',        icon: TrendingUp },
      { id: 'bao-cao-mmtb',         label: 'Báo cáo quản trị',    icon: BarChart },
      { id: 'danh-sach-du-an-mmtb', label: 'Danh sách dự án',     icon: FolderOpen },
    ],
  },
  {
    id: 'administration', label: 'ADMINISTRATION', icon: ShieldCheck,
    accent: '#a855f7',
    items: [
      { id: 'quan-ly-tai-khoan', label: 'Quản lý tài khoản', icon: Users },
      { id: 'cau-hinh-logo',     label: 'Cấu hình Logo',     icon: Image },
    ],
  },
]

function MenuGroup({ group, activeItem, onSelect }) {
  const [open, setOpen] = useState(true)
  const Icon = group.icon

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/8 transition-all group"
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
          style={{background: `${group.accent}30`, border: `1px solid ${group.accent}50`}}
        >
          <Icon className="w-3 h-3" style={{color: group.accent}} />
        </div>
        <span className="flex-1 text-left text-[10px] font-black text-white/60 uppercase tracking-widest">
          {group.label}
        </span>
        {open
          ? <ChevronDown className="w-3 h-3 text-white/30 shrink-0" />
          : <ChevronRight className="w-3 h-3 text-white/30 shrink-0" />
        }
      </button>

      {open && (
        <div className="ml-2 pl-3 border-l border-white/10 mt-0.5 space-y-0.5">
          {group.items.map(item => {
            const IIcon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all relative group ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/55 hover:bg-white/8 hover:text-white/85'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{background: group.accent}}
                  />
                )}
                <IIcon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/45 group-hover:text-white/70'}`} />
                <span className="text-[12px] font-medium leading-tight">{item.label}</span>
                {item.current && !isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-royal-400/70 shrink-0" />
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
        style={{width:240}}
      >
        {/* Background */}
        <div
          className="absolute inset-0 shadow-2xl"
          style={{background:'linear-gradient(180deg,#1a3478 0%,#1d4fb8 30%,#1a3f96 65%,#111f4a 100%)'}}
        />
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex flex-col h-full">
          {/* Logo header */}
          <div className="flex items-center justify-between px-3.5 py-3.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md shrink-0">
                <span className="text-royal-700 font-black text-[11px] tracking-tight">SGC</span>
              </div>
              <div>
                <div className="text-white font-black text-[13px] leading-none">Quản lý VT&MMTB</div>
                <div className="text-royal-300/80 text-[10px] font-medium mt-0.5">Smart & Green</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPinned(p => !p)}
                title={pinned ? 'Bỏ ghim' : 'Ghim sidebar'}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${pinned ? 'bg-white/20 text-white' : 'text-white/30 hover:bg-white/10 hover:text-white/70'}`}
              >
                <Menu className="w-3 h-3" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white/70 transition-all"
              >
                <X className="w-3 h-3" />
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
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{background:'linear-gradient(135deg,#3b7fe8,#1d4fb8)'}}>
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-white text-[12px] font-bold truncate">Người dùng</div>
                <div className="text-royal-300/70 text-[10px] truncate">SGC System</div>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400/80 hover:bg-rose-500/15 hover:text-rose-300 transition-all text-[12px] font-semibold">
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất tài khoản
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
