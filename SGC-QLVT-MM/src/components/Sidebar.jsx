import React, { useState, useRef, useEffect } from 'react'
import {
  FileText, CreditCard, Tag, TrendingUp, BarChart2, FolderOpen,
  Package, ClipboardList, Clock, BarChart, Layers,
  ShieldCheck, Users, Image, ChevronRight, ChevronDown,
  LogOut, Settings, X, Menu
} from 'lucide-react'

// ─── Cấu trúc menu ──────────────────────────────────────────────────────────
const MENU_GROUPS = [
  {
    id: 'nhom-vat-tu',
    label: 'NHÓM VẬT TƯ',
    icon: Package,
    color: 'from-royal-600 to-royal-500',
    items: [
      { id: 'qlvt-main',          label: 'Quản lý vật tư & PCU',  icon: ClipboardList, current: true },
      { id: 'theo-doi-thanh-toan',label: 'Theo dõi thanh toán',   icon: CreditCard },
      { id: 'phan-loai-chi-phi',  label: 'Phân loại chi phí',     icon: Tag },
      { id: 'tien-do-vat-tu',     label: 'Tiến độ vật tư',        icon: TrendingUp },
      { id: 'bao-cao-vat-tu',     label: 'Báo cáo quản trị',      icon: BarChart2 },
      { id: 'danh-sach-du-an-vt', label: 'Danh sách dự án',       icon: FolderOpen },
    ],
  },
  {
    id: 'nhom-mmtb',
    label: 'NHÓM MMTB',
    icon: Layers,
    color: 'from-emerald-600 to-emerald-500',
    items: [
      { id: 'ql-mmtb',            label: 'Quản lý MMTB',          icon: FileText },
      { id: 'theo-doi-bao-duong', label: 'Theo dõi bảo dưỡng',    icon: Clock },
      { id: 'tien-do-mmtb',       label: 'Tiến độ MMTB',          icon: TrendingUp },
      { id: 'bao-cao-mmtb',       label: 'Báo cáo quản trị',      icon: BarChart },
      { id: 'danh-sach-du-an-mmtb',label: 'Danh sách dự án',      icon: FolderOpen },
    ],
  },
  {
    id: 'administration',
    label: 'ADMINISTRATION',
    icon: ShieldCheck,
    color: 'from-purple-600 to-purple-500',
    items: [
      { id: 'quan-ly-tai-khoan', label: 'Quản lý tài khoản', icon: Users },
      { id: 'cau-hinh-logo',     label: 'Cấu hình Logo',     icon: Image },
      { id: 'cai-dat',           label: 'Cài đặt hệ thống',  icon: Settings },
    ],
  },
]

// ─── Component con: nhóm menu ─────────────────────────────────────────────
function MenuGroup({ group, activeItem, onSelect }) {
  const [open, setOpen] = useState(true)
  const Icon = group.icon

  return (
    <div className="mb-1">
      {/* Group header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/10 transition-all group"
      >
        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${group.color} flex items-center justify-center shrink-0 shadow-sm`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="flex-1 text-left text-xs font-black text-white/90 uppercase tracking-widest leading-none">
          {group.label}
        </span>
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-white/50 shrink-0" />
        }
      </button>

      {/* Items */}
      {open && (
        <div className="ml-3 pl-3 border-l border-white/15 mt-0.5 space-y-0.5">
          {group.items.map(item => {
            const IIcon = item.icon
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all group relative ${
                  isActive
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full" />
                )}
                <IIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`} />
                <span className="text-xs font-semibold leading-tight">{item.label}</span>
                {item.current && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-royal-300 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Sidebar ──────────────────────────────────────────────────────────
export default function Sidebar({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('qlvt-main')
  const [pinned, setPinned] = useState(false)
  const triggerRef = useRef(null)
  const sidebarRef = useRef(null)
  const closeTimer = useRef(null)

  const handleMouseEnterTrigger = () => {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }

  const handleMouseLeaveSidebar = () => {
    if (pinned) return
    closeTimer.current = setTimeout(() => setOpen(false), 300)
  }

  const handleMouseEnterSidebar = () => {
    clearTimeout(closeTimer.current)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const handleSelect = (id) => {
    setActiveItem(id)
    onNavigate?.(id)
    if (!pinned) setOpen(false)
  }

  return (
    <>
      {/* ── Trigger zone: dải mỏng bên trái màn hình ── */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnterTrigger}
        className="fixed left-0 top-0 h-full w-2 z-[90] cursor-pointer"
      />

      {/* ── Tab nhỏ hiển thị khi sidebar đóng ── */}
      {!open && (
        <button
          onMouseEnter={handleMouseEnterTrigger}
          onClick={() => setOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[91] flex items-center justify-center w-5 h-16 bg-royal-500 hover:bg-royal-400 rounded-r-xl shadow-lg transition-all group"
          title="Mở menu điều hướng"
        >
          <ChevronRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* ── Overlay mờ khi sidebar mở (không pinned) ── */}
      {open && !pinned && (
        <div
          className="fixed inset-0 z-[92] bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar panel ── */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeaveSidebar}
        className={`fixed left-0 top-0 h-full z-[93] flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 240 }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-royal-900 via-royal-800 to-royal-950 shadow-2xl" />

        {/* Content */}
        <div className="relative flex flex-col h-full">

          {/* ── Logo / Header ── */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-md shrink-0">
                <span className="text-royal-700 font-black text-sm">SGC</span>
              </div>
              <div>
                <div className="text-white font-black text-sm leading-none">Quản lý VT&MMTB</div>
                <div className="text-royal-300 text-[10px] font-medium mt-0.5">Smart & Green</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Pin button */}
              <button
                onClick={() => setPinned(p => !p)}
                title={pinned ? 'Bỏ ghim sidebar' : 'Ghim sidebar'}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  pinned ? 'bg-white/20 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Menu className="w-3.5 h-3.5" />
              </button>
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Menu groups ── */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-hide">
            {MENU_GROUPS.map(group => (
              <MenuGroup
                key={group.id}
                group={group}
                activeItem={activeItem}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 border-t border-white/10 px-3 py-3">
            <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2">
              <div className="w-7 h-7 bg-royal-500 rounded-full flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs font-bold truncate">Người dùng</div>
                <div className="text-royal-300 text-[10px] truncate">SGC System</div>
              </div>
            </div>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all text-xs font-semibold">
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
