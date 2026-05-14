import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, CheckCircle2, Clock, AlertTriangle, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { TRANG_THAI_COLOR, PALETTE } from '../constants'
import { calcKhoiLuongConThieu, calcPcuDeadline, isPcuOverdue, formatDate, parseNumber, formatNum } from '../utils'

export const COLUMNS = [
  { key: 'stt',                  label: 'Stt',                             width: 50,  fixed: true, center: true,                 vung: 'info' },
  { key: 'khoiThiCong',          label: 'Khối thi công',                   width: 140, center: true,              vung: 'info' },
  { key: 'projectName',          label: 'Dự án',                           width: 180,                            vung: 'info' },
  { key: 'maVattu',              label: 'Mã Vật tư',                       width: 110, fixed: true, center: true, vung: 'info' },
  { key: 'tenVattu',             label: 'Tên vật tư',                      width: 200,                            vung: 'info' },
  { key: 'dvt',                  label: 'Đvt',                             width: 70,  center: true,              vung: 'info' },
  { key: 'nhom',                 label: 'Nhóm vật tư',                     width: 120,                            vung: 'info' },
  { key: 'quyCachKyThuat',       label: 'Quy cách kỹ thuật',               width: 200,                            vung: 'info' },
  { key: 'khoiLuongConThieu',    label: 'Khối lượng còn thiếu',            width: 115, center: true, computed: true, vung: 'info' },
  { key: 'trangThai',            label: 'Trạng thái',                      width: 130, center: true, computed: true, vung: 'info' },
  { key: 'tenChuyenVienKqlvt',   label: 'Chuyên viên P. QLVT',             width: 115, center: true,              vung: 'info' },
  { key: 'ghiChu',               label: 'Ghi chú',                         width: 200,                            vung: 'info' },
  { key: 'tenNcc',               label: 'Tên NCC',                         width: 180,                            vung: 'kehoach' },
  { key: 'loaiHd',               label: 'Loại HĐ',                         width: 140,                            vung: 'kehoach' },
  { key: 'dot',                  label: 'Đợt',                             width: 70,  center: true,              vung: 'kehoach' },
  { key: 'khoiLuong',            label: 'Khối lượng',                      width: 100, center: true,              vung: 'kehoach' },
  { key: 'tenCvpcuThucHien',     label: 'Cán bộ phụ trách',                 width: 140,                            vung: 'kehoach' },
  { key: 'tenCpcuPcu',           label: 'Cán bộ PCU',                      width: 130, required: true,                vung: 'kehoach' },
  { key: 'ngayGuiPcu',           label: 'Ngày gửi PCU',                    width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayPcuTra',           label: 'Ngày PCU trả',                    width: 110, center: true, required: true,  vung: 'kehoach' },
  { key: 'ngayKyHd',             label: 'Ngày ký HĐ',                      width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayTamUng',           label: 'Ngày tạm ứng',                    width: 110, center: true,              vung: 'kehoach' },
  { key: 'ngayVeDuKienBatDau',   label: 'Ngày về dự kiến bắt đầu',         width: 110, center: true, required: false, vung: 'kehoach' },
  { key: 'ngayVeDuKienKetThuc',  label: 'Ngày về dự kiến kết thúc',        width: 110, center: true, required: false, vung: 'kehoach' },
  { key: 'tenNccThucTe',         label: 'Tên NCC',                         width: 180,                            vung: 'thucte' },
  { key: 'dotNhapTay',           label: 'Đợt',                             width: 90,  center: true,              vung: 'thucte' },
  { key: 'ngayTheoNhuCauBch',    label: 'Ngày BCH yêu cầu',                 width: 120, center: true,              vung: 'thucte' },
  { key: 'ngayVeThucTe',         label: 'Ngày về TT',                      width: 115, center: true,              vung: 'thucte' },
  { key: 'khoiLuongNhapTay',     label: 'Khối lượng',                      width: 110, center: true,              vung: 'thucte' },
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
    'Chưa gửi cung ứng': { icon: Clock,         cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-100/60', dot: 'bg-indigo-400' },
  }
  const c = cfg[status] || { icon: Clock, cls: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[14px] font-bold border shadow-sm ${c.cls} whitespace-nowrap`}>
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Tách dòng cha và dòng con
  const parentRows = useMemo(() => rows.filter(r => !r.parentId), [rows])
  const childRows = useMemo(() => rows.filter(r => r.parentId), [rows])

  // Tính toán số trang
  const totalParents = parentRows.length
  const totalPages = Math.ceil(totalParents / pageSize)
  
  // Lấy dòng cha cho trang hiện tại
  const paginatedParents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return parentRows.slice(start, start + pageSize)
  }, [parentRows, currentPage, pageSize])

  // Xây dựng danh sách hiển thị bao gồm cả con
  const displayRows = useMemo(() => {
    const result = []
    paginatedParents.forEach(p => {
      result.push(p)
      const children = childRows.filter(c => c.parentId === p.id)
      result.push(...children)
    })
    return result
  }, [paginatedParents, childRows])

  // Reset trang khi đổi size hoặc khi rows thay đổi (nếu trang hiện tại > trang cuối)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    } else if (totalPages === 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

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
          <table className="border-collapse min-w-max w-full text-[14px] font-roboto relative">
            <thead className="z-30">
              {/* Dòng 1: Nhãn vùng - Sticky top-0 */}
              <tr className="h-7 sticky top-0 z-40">
                <th
                  colSpan={INFO_COLS}
                  className="text-center text-[14px] font-black text-white tracking-widest border-r border-b border-white/40 bg-[#0f51cc] uppercase"
                >
                  📄 NỘI DUNG
                </th>
                <th
                  colSpan={KEHOACH_COLS}
                  className="text-center text-[14px] font-black text-white tracking-widest border-r border-b border-white/40 bg-[#f2740b] uppercase"
                >
                  📋 KẾ HOẠCH
                </th>
                <th
                  colSpan={THUCTE_COLS}
                  className="text-center text-[14px] font-black text-white tracking-widest border-b border-white/40 bg-[#10a45b] uppercase"
                >
                  ✅ THỰC TẾ
                </th>
              </tr>
              {/* Dòng 2: Tên tất cả các cột - Sticky top-[28px] (độ cao dòng 1 là 7 = 1.75rem = 28px) */}
              <tr className="h-7 sticky top-[28px] z-40">
                {COLUMNS.map((col, cIdx) => {
                  const vungCls =
                    col.vung === 'kehoach' ? 'bg-[#f2740b]' :
                    col.vung === 'thucte'  ? 'bg-[#10a45b] hover:bg-[#10a45b]/80' :
                    'bg-[#0f51cc] hover:bg-[#0f51cc]/80'
                  return (
                    <th
                      key={col.key}
                      className={`px-2 py-1 text-center text-[14px] font-bold text-white tracking-wide border-r border-b border-white/40 cursor-pointer select-none transition-colors font-roboto ${vungCls} ${cIdx === COLUMNS.length - 1 ? 'border-r-0' : ''}`}
                      style={{ minWidth: col.width, width: col.width }}
                      onClick={() => !col.computed && col.key !== 'actions' && onSort(col.key)}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {col.required && <span className="text-rose-300 text-[14px] leading-none">*</span>}
                        <span className="leading-tight">
                          {col.key === 'tenChuyenVienKqlvt' ? (
                            <>Chuyên viên <br/> P. QLVT</>
                          ) : col.key === 'khoiLuongConThieu' ? (
                            <>Khối lượng <br/> còn thiếu</>
                          ) : col.label}
                        </span>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
          {displayRows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="text-center py-20 text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-royal-50 border-2 border-royal-100 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-royal-300" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-500 text-[16px]">Chưa có dữ liệu</p>
                    <p className="text-[14px] text-slate-400 mt-1">Nhấn "+ Thêm mới" để bắt đầu hoặc Import Excel</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : displayRows.map((row, idx) => {
            if (row.isHiddenContext) return null

            if (row.isGroupHeader) {
              const khoiName = row.khoiTen || ''
              let displayProjectName = row.projectName || ''
              
              // Loại bỏ tiền tố viết tắt (ví dụ "CKN. ") nếu nó đã có trong tên dự án
              if (row.khoiVietTat && displayProjectName.startsWith(`${row.khoiVietTat}. `)) {
                displayProjectName = displayProjectName.substring(row.khoiVietTat.length + 2)
              }

              return (
                <tr key={row.id} className="bg-slate-200/90 font-black text-blue-900 h-9 border-t-2 border-blue-200">
                  <td className="px-2 py-1 text-center border-b border-r border-slate-300 font-black text-[14px]">
                    {row.stt}
                  </td>
                  <td colSpan={COLUMNS.length - 1} className="px-4 py-1 border-b border-slate-300 uppercase tracking-[0.15em] text-[14px] font-black italic">
                    📁 KHỐI THI CÔNG {khoiName} - DỰ ÁN {displayProjectName}
                  </td>
                </tr>
              )
            }

            const overdue   = isPcuOverdue(row.ngayGuiPcu, row.ngayPcuTra, pcuDays)
            const pcuDeadline = calcPcuDeadline(row.ngayGuiPcu, pcuDays)
            
            // Sử dụng các trường đã tính toán từ App.jsx (recalcAll)
            const displayKhoiLuong = row.computedKL !== undefined ? row.computedKL : row.khoiLuong
            const displayKhoiLuongNhapTay = row.computedKLNT !== undefined ? row.computedKLNT : row.khoiLuongNhapTay
            const klConThieu  = calcKhoiLuongConThieu(displayKhoiLuong, displayKhoiLuongNhapTay)
            const rawDiff = parseNumber(displayKhoiLuong) - parseNumber(displayKhoiLuongNhapTay)
            const isEven      = idx % 2 === 0

            const getStt = () => {
              const parentsOnly = rows.filter(r => !r.parentId)
              const totalParents = parentsOnly.length
              
              if (row.parentId) {
                const parent = rows.find(r => r.id === row.parentId)
                if (parent) {
                  const pStt = parent.stt !== undefined ? parent.stt : (totalParents - parentsOnly.indexOf(parent))
                  return `${pStt}.${row.subIdx || 1}`
                }
                return ''
              }
              
              if (row.stt) return row.stt
              const parentIdx = parentsOnly.indexOf(row)
              return totalParents - parentIdx
            }

            const parentRow = row.parentId ? rows.find(r => r.id === row.parentId) : null
            const info = getProjectInfo(parentRow || row)

            return (
                <tr
                key={row.id}
                onDoubleClick={() => onEdit(row)}
                className={`group transition-colors hover:bg-opacity-80 cursor-pointer
                  ${row.parentId 
                    ? (row.subMode === 'thucte' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900')
                    : 'font-bold text-black tracking-tight'}
                  ${overdue ? 'outline outline-2 outline-rose-400 outline-offset-[-2px]' : ''}
                `}
                style={!row.parentId ? { backgroundColor: '#fbfbfb' } : {}}
              >
                {/* STT */}
                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {getStt()}
                </td>

                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 text-[14px]">
                  {info.khoiTen ? (
                    <span 
                      className="inline-block px-3 py-0.5 rounded-full border text-[12px] font-bold shadow-sm" 
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

                <td className={`px-2 py-0.5 border-b border-r border-[#031240]/20 text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  <div className="flex items-center gap-1.5" title={info.label}>
                    {info.vt && (
                      <span 
                        className="shrink-0 text-[12px] font-bold px-2 py-0 rounded-full border shadow-sm uppercase tracking-tighter"
                        style={{ 
                          backgroundColor: info.color ? info.color.bg : '#f1f5f9',
                          color: info.color ? info.color.badge : '#475569',
                          borderColor: info.color ? info.color.border : '#e2e8f0'
                        }}
                      >
                        {info.vt}
                      </span>
                    )}
                    <span className={`text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>{info.name || info.label}</span>
                  </div>
                </td>

                <td className="px-2 py-0.5 border-b border-r border-[#031240]/20 whitespace-nowrap text-center">
                  <span className={`font-data text-black text-[14px] ${!row.parentId ? 'font-bold' : 'font-normal'}`}>
                    {row.maVattu || (parentRow && parentRow.maVattu) || ''}
                  </span>
                </td>

                <td className={`px-2 py-1 border-b border-r border-[#031240]/20 break-words ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {row.tenVattu || (parentRow && parentRow.tenVattu) || ''}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {row.dvt || (parentRow && parentRow.dvt) || ''}
                </td>

                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20">
                  {(row.nhom || (parentRow && parentRow.nhom)) ? (
                    <span className={`text-black text-[14px] ${!row.parentId ? 'font-bold' : 'font-normal'}`}>{row.nhom || parentRow.nhom}</span>
                  ) : ''}
                </td>

                <td className={`px-2 py-1 border-b border-r border-[#031240]/20 text-[14px] break-words ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {row.quyCachKyThuat || ''}
                </td>

                <td className={`px-2 py-0.5 text-center font-bold border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${klConThieu === '0' ? 'text-sky-700' : 'text-rose-600'}`}>
                  {!row.parentId ? (klConThieu || '') : ''}
                </td>

                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap">
                  <StatusBadge status={row.trangThai} />
                </td>

                <td className="px-2 py-1.5 leading-normal text-center text-black border-b border-r border-[#031240]/20 text-[14px] break-words">
                  {!row.parentId ? '' : (
                    row.tenChuyenVienKqlvt || (currentUser ? <span className="text-royal-400 italic">{currentUser}</span> : '')
                  )}
                </td>

                <td className={`px-2 py-1 border-b border-r border-[#031240]/20 text-[14px] break-words ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {row.ghiChu || ''}
                </td>

                <td className={`px-2 py-1 border-b border-r border-[#031240]/20 text-[14px] break-words ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.tenNcc || '')}
                </td>

                <td className={`px-2 py-0.5 border-b border-r border-[#031240]/20 text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.loaiHd || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.dot || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {formatNum(displayKhoiLuong)}
                </td>

                <td className={`px-2 py-1 border-b border-r border-[#031240]/20 text-[14px] break-words ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.tenCvpcuThucHien || '')}
                </td>

                <td className={`px-2 py-1 border-b border-r border-[#031240]/20 text-[14px] break-words ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.tenCpcuPcu || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.ngayGuiPcu || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : (overdue ? 'text-rose-600' : 'text-black')}`}>
                  {row.parentId ? (
                    row.ngayPcuTra ? (
                      <span className="text-emerald-600 font-semibold">{row.ngayPcuTra}</span>
                    ) : ''
                  ) : ''}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.ngayKyHd || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.ngayTamUng || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : (!row.ngayVeDuKienBatDau ? 'text-rose-400 font-normal' : 'text-black font-normal')}`}>
                  {!row.parentId ? '' : (row.ngayVeDuKienBatDau || <span className="italic text-slate-400 text-[14px]">Chưa nhập</span>)}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : (!row.ngayVeDuKienKetThuc ? 'text-rose-400 font-normal' : 'text-black font-normal')}`}>
                  {!row.parentId ? '' : (row.ngayVeDuKienKetThuc || <span className="italic text-slate-400 text-[14px]">Chưa nhập</span>)}
                </td>

                <td className={`px-2 py-1 border-b border-r border-[#031240]/20 text-[14px] break-words ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.tenNccThucTe || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.dotNhapTay || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.ngayTheoNhuCauBch || '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black font-normal'}`}>
                  {!row.parentId ? '' : (row.ngayVeThucTe
                    ? <span className="text-emerald-600">{row.ngayVeThucTe}</span>
                    : '')}
                </td>

                <td className={`px-2 py-0.5 text-center border-b border-[#031240]/20 last:border-r-0 whitespace-nowrap font-data text-[14px] ${!row.parentId ? 'text-black font-bold' : 'text-black'}`}>
                  {formatNum(displayKhoiLuongNhapTay)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    {/* Footer Phân trang */}
    {totalParents > 0 && (
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-[14px] text-slate-500">
            Hiển thị <span className="font-bold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-bold text-slate-700">{Math.min(currentPage * pageSize, totalParents)}</span> trong tổng số <span className="font-bold text-slate-700">{totalParents}</span> vật tư chính
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-slate-500">Dòng mỗi trang:</span>
            <select 
              value={pageSize} 
              onChange={e => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[14px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[20, 50, 100, 200].map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-1 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-300 rounded disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronsLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-1 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-300 rounded disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          
          <div className="flex items-center gap-1 mx-2">
            <span className="text-[14px] text-slate-500">Trang</span>
            <input 
              type="number"
              value={currentPage}
              onChange={e => {
                const val = Number(e.target.value)
                if (val >= 1 && val <= totalPages) setCurrentPage(val)
              }}
              className="w-10 text-center bg-white border border-slate-300 rounded py-0.5 text-[14px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-[14px] text-slate-500">/ {totalPages}</span>
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-1 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-300 rounded disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-300 rounded disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronsRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    )}
  </div>
</div>
  )
}
