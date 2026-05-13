import React, { useRef } from 'react'
import { Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react'
import { TRANG_THAI_COLOR, PALETTE } from '../constants'
import { calcKhoiLuongConThieu, calcPcuDeadline, isPcuOverdue, formatDate } from '../utils'

const COLUMNS = [
  { key: 'stt',                  label: 'STT',                             width: 50,  fixed: true, center: true,  computed: true, vung: 'info' },
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
  { key: 'loaiHd',               label: 'Loại HĐ',                         width: 140,                            vung: 'kehoach' },
  { key: 'dot',                  label: 'Đợt',                             width: 70,  center: true,              vung: 'kehoach' },
  { key: 'khoiLuong',            label: 'Khối lượng',                      width: 100, center: true,              vung: 'kehoach' },
  { key: 'ngayGuiPcu',           label: 'Ngày gửi PCU',                    width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayPcuTra',           label: 'Ngày PCU trả',                    width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayKyHd',             label: 'Ngày ký HĐ',                      width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayTamUng',           label: 'Ngày tạm ứng',                    width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayVeDuKienBatDau',   label: 'Ngày về dự kiến bắt đầu',         width: 110, center: true, required: false, vung: 'kehoach' },
  { key: 'ngayVeDuKienKetThuc',  label: 'Ngày về dự kiến kết thúc',        width: 110, center: true, required: false, vung: 'kehoach' },
  { key: 'tenCvpcuThucHien',     label: 'CV PCU thực hiện',                 width: 110,                            vung: 'kehoach' },
  { key: 'tenNcc',               label: 'Tên NCC',                         width: 180,                            vung: 'kehoach' },
  { key: 'tenNccThucTe',         label: 'Tên NCC',                         width: 180,                            vung: 'thucte' },
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
    'Chưa về hàng đủ': { icon: AlertTriangle, cls: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 shadow-fuchsia-100/60', dot: 'bg-fuchsia-400' },
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
    <div className="flex-1 min-h-0 px-4 pb-4">
      <div 
        className="h-full border border-[#031240]/15 rounded-2xl overflow-hidden shadow-2xl bg-white flex flex-col"
        ref={tableRef}
      >
        <div className="flex-1 overflow-auto">
          <table className="border-collapse min-w-max w-full text-[12px] font-roboto relative">
            <thead className="z-30">
              {/* Dòng 1: Nhãn vùng - Sticky top-0 */}
              <tr className="h-7 sticky top-0 z-40">
                <th
                  colSpan={INFO_COLS}
                  className="text-center text-[12px] font-black text-white tracking-widest border-r border-b border-[#031240]/60 bg-[#1e4db7] uppercase"
                >
                  📄 Nội dung
                </th>
                <th
                  colSpan={KEHOACH_COLS}
                  className="text-center text-[12px] font-black text-white tracking-widest border-r border-b border-[#031240]/60 bg-[#d25c05] uppercase"
                >
                  📋 Kế hoạch
                </th>
                <th
                  colSpan={THUCTE_COLS}
                  className="text-center text-[12px] font-black text-white tracking-widest border-b border-[#031240]/60 bg-[#1b7a4a] uppercase"
                >
                  ✅ Thực tế
                </th>
              </tr>
              {/* Dòng 2: Tên tất cả các cột - Sticky top-[28px] (độ cao dòng 1 là 7 = 1.75rem = 28px) */}
              <tr className="h-7 sticky top-[28px] z-40">
                {COLUMNS.map((col, cIdx) => {
                  const vungCls =
                    col.vung === 'kehoach' ? 'bg-[#d25c05]' :
                    col.vung === 'thucte'  ? 'bg-[#1a6b3c] hover:bg-[#1b7a4a]/80' :
                    'bg-[#1e4db7] hover:bg-[#1a3a7a]/80'
                  return (
                    <th
                      key={col.key}
                      className={`px-2 py-1 text-center text-xs font-bold text-white tracking-wide border-r border-b border-[#031240]/60 cursor-pointer select-none transition-colors font-roboto ${vungCls} ${cIdx === COLUMNS.length - 1 ? 'border-r-0' : ''}`}
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
              const parentsOnly = rows.filter(r => !r.parentId)
              const totalParents = parentsOnly.length
              if (!row.parentId) {
                const parentIdx = parentsOnly.indexOf(row)
                return totalParents - parentIdx
              } else {
                const parent = rows.find(r => r.id === row.parentId)
                const parentIdx = parentsOnly.indexOf(parent)
                if (parentIdx === -1) return '' // Should not happen
                return `${totalParents - parentIdx}.${row.subIdx || 1}`
              }
            }

            const parentRow = row.parentId ? rows.find(r => r.id === row.parentId) : null
            const info = getProjectInfo(parentRow || row)

            return (
                <tr
                key={row.id}
                onDoubleClick={() => onEdit(row)}
                className={`group transition-colors hover:bg-royal-50/70 cursor-pointer
                  ${row.parentId 
                    ? (row.subMode === 'thucte' ? 'bg-emerald-100 italic text-emerald-900 font-medium' : 'bg-amber-100 italic text-amber-900 font-medium')
                    : (isEven ? 'bg-royal-100/60 font-bold text-royal-900' : 'bg-royal-200/50 font-bold text-royal-900')}
                  ${overdue ? 'outline outline-1 outline-rose-200 outline-offset-[-1px]' : ''}
                `}
              >
                {/* STT */}
                <td className="px-2 py-0.5 text-center text-black font-medium border-b border-r border-[#031240]/20 font-data text-[12px]">
                  {getStt()}
                </td>

                {/* Khối thi công */}
                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 text-[12px]">
                  {info.khoiTen ? (
                    <span 
                      className="inline-block px-3 py-0.5 rounded-full border text-[11px] font-bold shadow-sm" 
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
                <td className="px-2 py-1 font-medium text-black border-b border-r border-[#031240]/20 break-words">
                  {row.tenVattu || ''}
                </td>

                {/* ĐVT */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap">
                  {row.dvt || ''}
                </td>

                {/* Nhóm */}
                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20">
                  {row.nhom ? (
                    <span className="px-1 py-0 bg-royal-100 text-royal-700 rounded text-[12px] font-semibold">{row.nhom}</span>
                  ) : ''}
                </td>

                {/* Quy cách KT */}
                <td className="px-2 py-1 text-black border-b border-r border-[#031240]/20 text-[12px] break-words">
                  {row.quyCachKyThuat || ''}
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
                <td className="px-2 py-1 text-black border-b border-r border-[#031240]/20 text-[12px] break-words">
                  {row.ghiChu || ''}
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
                  {!row.parentId ? '' : (row.ngayVeDuKienBatDau || <span className="italic text-slate-400 text-[12px]">Chưa nhập</span>)}
                </td>

                {/* Ngày về DK kết thúc */}
                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${!row.parentId ? '' : (!row.ngayVeDuKienKetThuc ? 'text-rose-400' : 'text-black')}`}>
                  {!row.parentId ? '' : (row.ngayVeDuKienKetThuc || <span className="italic text-slate-400 text-[12px]">Chưa nhập</span>)}
                </td>

                {/* CVPCU */}
                <td className="px-2 py-1 text-black border-b border-r border-[#031240]/20 text-[12px] break-words">
                  {!row.parentId ? '' : (row.tenCvpcuThucHien || '')}
                </td>

                {/* Tên NCC */}
                <td className="px-2 py-1 text-black border-b border-r border-[#031240]/20 text-[12px] break-words">
                  {!row.parentId ? '' : (row.tenNcc || '')}
                </td>
                
                {/* Tên NCC Thực tế */}
                <td className="px-2 py-1 text-black border-b border-r border-[#031240]/20 text-[12px] break-words">
                  {!row.parentId ? '' : (row.tenNccThucTe || '')}
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
                <td className="px-2 py-1 text-black border-b border-r border-[#031240]/20 last:border-r-0 text-[12px] break-words">
                  {!row.parentId ? '' : (
                    row.tenChuyenVienKqlvt || (currentUser ? <span className="text-royal-400 italic">{currentUser}</span> : '')
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>
</div>
  )
}
