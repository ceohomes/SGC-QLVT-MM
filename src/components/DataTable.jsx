import React, { useRef } from 'react'
import { Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react'
import { TRANG_THAI_COLOR, PALETTE } from '../constants'
import { calcKhoiLuongConThieu, calcPcuDeadline, isPcuOverdue, formatDate } from '../utils'

const COLUMNS = [
  { key: 'stt',                  label: 'STT',                             width: 50,  fixed: true, center: true,  vung: 'info' },
  { key: 'actions',              label: 'Thao tác',                        width: 80,  center: true, fixed: true,  vung: 'info' },
  { key: 'khoiThiCong',          label: 'Khối thi công',                   width: 140, center: true,              vung: 'info' },
  { key: 'projectName',          label: 'Dự án',                           width: 180,                            vung: 'info' },
  { key: 'maVattu',              label: 'Mã Vật tư',                       width: 110, fixed: true,               vung: 'info' },
  { key: 'tenVattu',             label: 'Tên vật tư',                      width: 200,                            vung: 'info' },
  { key: 'dvt',                  label: 'Đvt',                             width: 70,  center: true,              vung: 'info' },
  { key: 'nhom',                 label: 'Nhóm vật tư',                     width: 120,                            vung: 'info' },
  { key: 'quyCachKyThuat',       label: 'Quy cách kỹ thuật',               width: 200,                            vung: 'info' },
  { key: 'khoiLuongConThieu',    label: 'KL Còn thiếu',                    width: 115, center: true, computed: true, vung: 'info' },
  { key: 'trangThai',            label: 'Trạng thái',                      width: 130, center: true, computed: true, vung: 'info' },
  { key: 'ghiChu',               label: 'Ghi chú',                         width: 200,                            vung: 'info' },
  { key: 'tenNcc',               label: 'Tên NCC',                         width: 180,                            vung: 'kehoach' },
  { key: 'loaiHd',               label: 'Loại HĐ',                         width: 140,                            vung: 'kehoach' },
  { key: 'dot',                  label: 'Đợt',                             width: 70,  center: true,              vung: 'kehoach' },
  { key: 'khoiLuong',            label: 'Khối lượng',                      width: 100, center: true,              vung: 'kehoach' },
  { key: 'ngayGuiPcu',           label: 'Ngày gửi PCU',                    width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayPcuTra',           label: 'Ngày PCU trả',                    width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayKyHd',             label: 'Ngày ký HĐ',                      width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayTamUng',           label: 'Ngày tạm ứng',                    width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayVeDuKienBatDau',   label: 'Ngày về DK bắt đầu',              width: 135, center: true, required: true, vung: 'kehoach' },
  { key: 'ngayVeDuKienKetThuc',  label: 'Ngày về DK kết thúc',             width: 135, center: true, required: true, vung: 'kehoach' },
  { key: 'tenCvpcuThucHien',     label: 'CVPCU thực hiện',                 width: 155,                            vung: 'kehoach' },
  { key: 'dotNhapTay',           label: 'Đợt (NT)',                        width: 90,  center: true,              vung: 'thucte' },
  { key: 'ngayTheoNhuCauBch',    label: 'Ngày NC BCH',                     width: 120, center: true,              vung: 'thucte' },
  { key: 'ngayVeThucTe',         label: 'Ngày về TT',                      width: 115, center: true,              vung: 'thucte' },
  { key: 'khoiLuongNhapTay',     label: 'KL Nhập tay',                     width: 110, center: true,              vung: 'thucte' },
  { key: 'tenChuyenVienKqlvt',   label: 'Chuyên viên P. QLVT',             width: 175,                            vung: 'thucte' },
]

// Tính colSpan cho các vùng header
const INFO_COLS    = COLUMNS.filter(c => c.vung === 'info').length
const KEHOACH_COLS = COLUMNS.filter(c => c.vung === 'kehoach').length
const THUCTE_COLS  = COLUMNS.filter(c => c.vung === 'thucte').length

function StatusBadge({ status }) {
  const cfg = {
    'Đã xử lý':        { icon: CheckCircle2,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/60', dot: 'bg-emerald-400' },
    'Quá hạn':         { icon: AlertTriangle, cls: 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100/60 status-overdue', dot: 'bg-rose-400' },
    'Chờ xử lý':       { icon: Clock,         cls: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100/60', dot: 'bg-amber-400' },
    'Đã về hàng đủ':   { icon: CheckCircle2,  cls: 'bg-sky-50 text-sky-700 border-sky-200 shadow-sky-100/60', dot: 'bg-sky-400' },
    'Chưa về hàng đủ': { icon: AlertTriangle, cls: 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100/60', dot: 'bg-orange-400' },
  }
  const c = cfg[status] || { icon: Clock, cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-bold border shadow-sm ${c.cls} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {status}
    </span>
  )
}

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 opacity-25" />
  if (sortDir === 'asc') return <ChevronUp className="w-3 h-3 text-blue-200" />
  return <ChevronDown className="w-3 h-3 text-blue-200" />
}

export default function DataTable({ rows, projects = [], onEdit, onDelete, onAddSubRow, pcuDays, currentUser, sortKey, sortDir, onSort }) {
  const tableRef = useRef(null)

  const getProjectInfo = (item) => {
    const id = item.projectId

    // Tìm dự án con trước (có khoiId = id) — dự án con có duAn khớp với item.duAn
    let p = null
    if (item.duAn) {
      // Tìm dự án con theo tên duAn đã lưu
      p = projects.find(proj => {
        if (!proj.khoiId) return false // bỏ qua Khối cha
        const vt = proj.khoiVietTat || proj.vietTat || ''
        const label = vt ? `${vt}. ${proj.ten}` : proj.ten
        return label === item.duAn || proj.ten === item.duAn
      })
    }
    // Fallback: tìm theo id
    if (!p) p = projects.find(proj => proj.id === id)

    const color = (p && p.paletteIdx !== undefined) ? PALETTE[p.paletteIdx] : null

    let vt = ''
    let name = ''
    const label = item.duAn || ''

    if (p) {
      vt = p.khoiVietTat || p.vietTat || ''
      name = p.ten || ''
    } else if (item.duAn) {
      const parts = item.duAn.split('. ')
      if (parts.length > 1) {
        vt = parts[0]
        name = parts.slice(1).join('. ')
      } else {
        name = item.duAn
      }
    }

    return { 
      label, 
      vt,
      name,
      khoiTen: item.khoiTen || (p ? (p.khoiTen || '') : ''),
      khoiVietTat: item.khoiVietTat || (p ? (p.khoiVietTat || p.vietTat || '') : ''),
      color
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto" ref={tableRef}>
      <table className="border-collapse min-w-max w-full text-[12px] font-roboto">
        <thead className="sticky-header">
          {/* Dòng 1: Nhãn vùng + các cột info (rowSpan=2) */}
          <tr className="bg-[#1e4db7] h-6">
            {/* Nhãn vùng Nội dung — span ngang toàn bộ cột info */}
            <th
              colSpan={INFO_COLS}
              className="text-center text-[12px] font-black text-white tracking-widest border border-[#031240]/60 bg-[#1e4db7] uppercase"
            >
              📄 Nội dung
            </th>
            {/* Nhãn vùng Kế hoạch */}
            <th
              colSpan={KEHOACH_COLS}
              className="text-center text-[12px] font-black text-white tracking-widest border border-[#031240]/60 bg-[#f6b84b] uppercase h-6"
            >
              📋 Kế hoạch
            </th>
            {/* Nhãn vùng Thực tế */}
            <th
              colSpan={THUCTE_COLS}
              className="text-center text-[12px] font-black text-white tracking-widest border border-[#031240]/60 bg-[#1b7a4a] uppercase h-6"
            >
              ✅ Thực tế
            </th>
          </tr>
          {/* Dòng 2: Tên tất cả các cột */}
          <tr className="bg-[#1e4db7] backdrop-blur-sm shadow-sm h-7">
            {COLUMNS.map(col => {
              const vungCls =
                col.vung === 'kehoach' ? 'bg-[#f6b84b]' :
                col.vung === 'thucte'  ? 'bg-[#1a6b3c] hover:bg-[#1b7a4a]/80' :
                'bg-[#1e4db7] hover:bg-[#1a3a7a]/80'
              return (
                <th
                  key={col.key}
                  className={`px-2 py-1 text-center text-[13px] font-bold text-white tracking-wide border border-[#031240]/60 cursor-pointer select-none transition-colors font-roboto ${vungCls}`}
                  style={{ minWidth: col.width, width: col.width }}
                  onClick={() => !col.computed && col.key !== 'actions' && onSort(col.key)}
                >
                  <div className="flex items-center justify-center gap-1">
                    {col.required && <span className="text-rose-300 text-sm leading-none">*</span>}
                    <span className="leading-tight">{col.label}</span>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="text-center py-20 text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-royal-50 border-2 border-royal-100 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-royal-300" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-500 text-base">Chưa có dữ liệu</p>
                    <p className="text-sm text-slate-400 mt-1">Nhấn "+ Thêm mới" để bắt đầu hoặc Import Excel</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : rows.map((row, idx) => {
            const overdue   = isPcuOverdue(row.ngayGuiPcu, row.ngayPcuTra, pcuDays)
            const pcuDeadline = calcPcuDeadline(row.ngayGuiPcu, pcuDays)
            const klConThieu  = calcKhoiLuongConThieu(row.khoiLuong, row.khoiLuongNhapTay)
            const isEven      = idx % 2 === 0

            const getStt = () => {
              if (!row.parentId) {
                const parentIdx = rows.filter(r => !r.parentId).indexOf(row)
                return parentIdx + 1
              } else {
                const parent = rows.find(r => r.id === row.parentId)
                const parentIdx = rows.filter(r => !r.parentId).indexOf(parent)
                return `${parentIdx + 1}.${row.subIdx || 1}`
              }
            }

            const info = getProjectInfo(row)

            return (
              <tr
                key={row.id}
                className={`group transition-colors h-7 hover:bg-royal-50/70
                  ${row.parentId 
                    ? 'bg-white italic text-black' 
                    : (isEven ? 'bg-royal-100/60' : 'bg-royal-200/50')}
                  ${overdue ? 'outline outline-1 outline-rose-200 outline-offset-[-1px]' : ''}
                `}
              >
                {/* STT */}
                <td className="px-2 py-0.5 text-center text-black font-medium border-b border-r border-[#031240]/20 font-data text-[12px]">
                  {getStt()}
                </td>

                {/* Actions */}
                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!row.parentId && (
                      <>
                        <button
                          onClick={() => onAddSubRow(row, 'kehoach')}
                          className="flex items-center gap-0.5 px-1.5 h-5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-all shadow-sm text-[10px] font-bold whitespace-nowrap"
                          title="Thêm dòng Kế hoạch"
                        >
                          <Plus className="w-2.5 h-2.5" />KH
                        </button>
                        <button
                          onClick={() => onAddSubRow(row, 'thucte')}
                          className="flex items-center gap-0.5 px-1.5 h-5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md transition-all shadow-sm text-[10px] font-bold whitespace-nowrap"
                          title="Thêm dòng Thực tế"
                        >
                          <Plus className="w-2.5 h-2.5" />TT
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onEdit(row)}
                      className="w-5 h-5 flex items-center justify-center bg-royal-100 hover:bg-royal-200 text-royal-700 rounded-md transition-all shadow-sm"
                      title="Sửa"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      className="w-5 h-5 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-md transition-all shadow-sm"
                      title="Xóa"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Khối thi công */}
                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 text-[12px]">
                  {info.khoiTen ? (
                    <span 
                      className="inline-block px-3 py-0.5 rounded-full border text-[11px] font-bold shadow-sm whitespace-nowrap" 
                      title={info.khoiTen}
                      style={{ 
                        backgroundColor: info.color ? info.color.bg : '#f8fafc',
                        color: info.color ? info.color.badge : '#475569',
                        borderColor: info.color ? info.color.border : '#e2e8f0'
                      }}
                    >
                      {info.khoiTen}
                    </span>
                  ) : null}
                </td>

                {/* Dự án */}
                <td className="px-2 py-0.5 border-b border-r border-[#031240]/20 text-[12px]">
                  <div className="flex items-center gap-1.5" title={info.label}>
                    {info.vt && (
                      <span 
                        className="shrink-0 text-[10px] font-bold px-2 py-0 rounded-full border shadow-sm uppercase tracking-tighter"
                        style={{ 
                          backgroundColor: info.color ? info.color.bg : '#f1f5f9',
                          color: info.color ? info.color.badge : '#475569',
                          borderColor: info.color ? info.color.border : '#e2e8f0'
                        }}
                      >
                        {info.vt}
                      </span>
                    )}
                    <span className="text-black font-medium">{info.name || info.label}</span>
                  </div>
                </td>

                {/* Mã vật tư */}
                <td className="px-2 py-0.5 border-b border-r border-[#031240]/20 whitespace-nowrap">
                  <span className="font-data font-bold text-royal-600 bg-royal-50 px-1 py-0 rounded text-[12px]">
                    {row.maVattu || ''}
                  </span>
                </td>

                {/* Tên vật tư */}
                <td className="px-2 py-0.5 font-medium text-black border-b border-r border-[#031240]/20">
                  <div className="truncate max-w-[200px]" title={row.tenVattu}>{row.tenVattu || ''}</div>
                </td>

                {/* ĐVT */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap">
                  {row.dvt || ''}
                </td>

                {/* Nhóm */}
                <td className="px-2 py-0.5 border-b border-r border-[#031240]/20">
                  {row.nhom ? (
                    <span className="px-1 py-0 bg-royal-100 text-royal-700 rounded text-[12px] font-semibold">{row.nhom}</span>
                  ) : ''}
                </td>

                {/* Quy cách KT */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 text-[12px]">
                  <div className="truncate max-w-[200px]" title={row.quyCachKyThuat}>{row.quyCachKyThuat || ''}</div>
                </td>

                {/* KL Còn thiếu (vùng Nội dung) */}
                <td className={`px-2 py-0.5 text-center font-bold border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${
                  klConThieu && parseFloat(klConThieu) > 0 ? 'text-rose-600'
                  : klConThieu && parseFloat(klConThieu) < 0 ? 'text-emerald-600'
                  : 'text-black'
                }`}>
                  {klConThieu || ''}
                </td>

                {/* Trạng thái */}
                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap">
                  <StatusBadge status={row.trangThai} />
                </td>

                {/* Ghi chú (vùng Nội dung) */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 text-[12px]">
                  <div className="truncate max-w-[200px]" title={row.ghiChu}>{row.ghiChu || ''}</div>
                </td>

                {/* Tên NCC */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20">
                  {!row.parentId ? '' : <div className="truncate max-w-[180px]" title={row.tenNcc}>{row.tenNcc || ''}</div>}
                </td>

                {/* Loại HĐ */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 text-[12px]">
                  {!row.parentId ? '' : (row.loaiHd || '')}
                </td>

                {/* Đợt */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.dot || '')}
                </td>

                {/* Khối lượng */}
                <td className="px-2 py-0.5 text-center font-semibold text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.khoiLuong || '')}
                </td>

                {/* Ngày gửi PCU */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.ngayGuiPcu || '')}
                </td>

                {/* Ngày PCU trả */}
                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${overdue ? 'text-rose-600 font-bold' : 'text-black'}`}>
                  {row.parentId ? (
                    row.ngayPcuTra ? (
                      <span className="text-emerald-600 font-semibold">{row.ngayPcuTra}</span>
                    ) : pcuDeadline ? (
                      <span className={overdue ? 'text-rose-500 font-bold' : 'text-amber-600'}>
                        {overdue ? '⚠ ' : ''}HX: {pcuDeadline}
                      </span>
                    ) : ''
                  ) : ''}
                </td>

                {/* Ngày ký HĐ */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.ngayKyHd || '')}
                </td>

                {/* Ngày tạm ứng */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.ngayTamUng || '')}
                </td>

                {/* Ngày về DK bắt đầu */}
                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${!row.parentId ? '' : (!row.ngayVeDuKienBatDau ? 'text-rose-400' : 'text-black')}`}>
                  {!row.parentId ? '' : (row.ngayVeDuKienBatDau || <span className="italic text-slate-400 text-[12px]">Chưa nhập*</span>)}
                </td>

                {/* Ngày về DK kết thúc */}
                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${!row.parentId ? '' : (!row.ngayVeDuKienKetThuc ? 'text-rose-400' : 'text-black')}`}>
                  {!row.parentId ? '' : (row.ngayVeDuKienKetThuc || <span className="italic text-slate-400 text-[12px]">Chưa nhập*</span>)}
                </td>

                {/* Đợt NT */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.dotNhapTay || '')}
                </td>

                {/* Ngày NC BCH */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.ngayTheoNhuCauBch || '')}
                </td>

                {/* Ngày về TT */}
                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.ngayVeThucTe
                    ? <span className="text-emerald-600 font-semibold">{row.ngayVeThucTe}</span>
                    : '')}
                </td>

                {/* KL nhập tay */}
                <td className="px-2 py-0.5 text-center font-semibold text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {!row.parentId ? '' : (row.khoiLuongNhapTay || '')}
                </td>

                {/* CV phối hợp */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 text-[12px]">
                  {!row.parentId ? '' : (
                    <div className="truncate max-w-[170px]" title={row.tenChuyenVienKqlvt}>
                      {row.tenChuyenVienKqlvt || (currentUser ? <span className="text-royal-400 italic">{currentUser}</span> : '')}
                    </div>
                  )}
                </td>

                {/* CVPCU */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 last:border-r-0 text-[12px]">
                  {!row.parentId ? '' : <div className="truncate max-w-[150px]" title={row.tenCvpcuThucHien}>{row.tenCvpcuThucHien || ''}</div>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
