import React, { useRef } from 'react'
import { Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react'
import { TRANG_THAI_COLOR, PALETTE } from '../constants'
import { calcKhoiLuongConThieu, calcPcuDeadline, isPcuOverdue, formatDate } from '../utils'

const COLUMNS = [
  { key: 'stt',                  label: 'STT',                             width: 50,  fixed: true, center: true },
  { key: 'actions',              label: 'Thao tác',                        width: 80,  center: true, fixed: true },
  { key: 'khoiThiCong',          label: 'Khối thi công',                   width: 140, center: true },
  { key: 'projectName',          label: 'Dự án',                           width: 180 },
  { key: 'maVattu',              label: 'Mã Vật tư',                       width: 110, fixed: true },
  { key: 'tenVattu',             label: 'Tên vật tư',                      width: 200 },
  { key: 'dvt',                  label: 'Đvt',                             width: 70,  center: true },
  { key: 'nhom',                 label: 'Nhóm vật tư',                     width: 120 },
  { key: 'tenNcc',               label: 'Tên NCC',                         width: 180 },
  { key: 'loaiHd',               label: 'Loại HĐ',                         width: 140 },
  { key: 'quyCachKyThuat',       label: 'Quy cách kỹ thuật',               width: 200 },
  { key: 'dot',                  label: 'Đợt',                             width: 70,  center: true },
  { key: 'khoiLuong',            label: 'Khối lượng',                      width: 100, center: true },
  { key: 'trangThai',            label: 'Trạng thái',                      width: 130, center: true, computed: true },
  { key: 'ngayGuiPcu',           label: 'Ngày gửi PCU',                    width: 110, center: true },
  { key: 'ngayPcuTra',           label: 'Ngày PCU trả',                    width: 110, center: true },
  { key: 'ngayKyHd',             label: 'Ngày ký HĐ',                      width: 110, center: true },
  { key: 'ngayTamUng',           label: 'Ngày tạm ứng',                    width: 110, center: true },
  { key: 'ngayVeDuKienBatDau',   label: 'Ngày về DK bắt đầu',              width: 135, center: true, required: true },
  { key: 'ngayVeDuKienKetThuc',  label: 'Ngày về DK kết thúc',             width: 135, center: true, required: true },
  { key: 'dotNhapTay',           label: 'Đợt (NT)',                        width: 90,  center: true },
  { key: 'ngayTheoNhuCauBch',    label: 'Ngày NC BCH',                     width: 120, center: true },
  { key: 'ngayVeThucTe',         label: 'Ngày về TT',                      width: 115, center: true },
  { key: 'khoiLuongNhapTay',     label: 'KL Nhập tay',                     width: 110, center: true },
  { key: 'khoiLuongConThieu',    label: 'KL Còn thiếu',                    width: 115, center: true, computed: true },
  { key: 'tenChuyenVienKqlvt',   label: 'CV phối hợp K.QLVT',              width: 175 },
  { key: 'tenCvpcuThucHien',     label: 'CVPCU thực hiện',                 width: 155 },
  { key: 'ghiChu',               label: 'Ghi chú',                         width: 200 },
]

function StatusBadge({ status }) {
  const cfg = {
    'Đã xử lý': { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/60', dot: 'bg-emerald-400' },
    'Quá hạn':   { icon: AlertTriangle, cls: 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100/60 status-overdue', dot: 'bg-rose-400' },
    'Chờ xử lý': { icon: Clock, cls: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100/60', dot: 'bg-amber-400' },
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
    const p = projects.find(proj => proj.id === id)
    const color = (p && p.paletteIdx !== undefined) ? PALETTE[p.paletteIdx] : null

    let vt = ''
    let name = ''
    let label = item.duAn || ''

    if (p) {
      vt = p.vietTat || ''
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
      khoiTen: item.khoiTen || (p ? (p.khoiTen || p.ten) : ''),
      khoiVietTat: item.khoiVietTat || (p ? (p.khoiVietTat || p.vietTat) : ''),
      color
    }
  }

  const thCls = "px-2 py-1 text-center text-[13px] font-bold text-royal-900 tracking-wide border border-[#031240]/60 cursor-pointer select-none transition-colors hover:bg-royal-200/50 font-roboto"

  return (
    <div className="flex-1 min-h-0 overflow-auto" ref={tableRef}>
      <table className="border-collapse min-w-max w-full text-[12px] font-roboto">
        <thead className="sticky-header">
          <tr className="bg-royal-100 backdrop-blur-sm shadow-sm h-7">
            {COLUMNS.map(col => (
              <th
                key={col.key}
                className={thCls}
                style={{ minWidth: col.width, width: col.width }}
                onClick={() => !col.computed && col.key !== 'actions' && onSort(col.key)}
              >
                <div className="flex items-center justify-center gap-1">
                  {col.required && <span className="text-rose-300 text-sm leading-none">*</span>}
                  <span className="leading-tight">{col.label}</span>
                </div>
              </th>
            ))}
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
                    : (isEven ? 'bg-royal-50/30' : 'bg-royal-50/60')}
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
                      <button
                        onClick={() => onAddSubRow(row)}
                        className="w-5 h-5 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md transition-all shadow-sm"
                        title="Thêm dòng phụ"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
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

                {/* Tên NCC */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20">
                  <div className="truncate max-w-[180px]" title={row.tenNcc}>{row.tenNcc || ''}</div>
                </td>

                {/* Loại HĐ */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 text-[12px]">
                  {row.loaiHd || ''}
                </td>

                {/* Quy cách KT */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 text-[12px]">
                  <div className="truncate max-w-[200px]" title={row.quyCachKyThuat}>{row.quyCachKyThuat || ''}</div>
                </td>

                {/* Đợt */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.dot || ''}
                </td>

                {/* Khối lượng */}
                <td className="px-2 py-0.5 text-center font-semibold text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.khoiLuong || ''}
                </td>

                {/* Trạng thái */}
                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap">
                  <StatusBadge status={row.trangThai} />
                </td>

                {/* Ngày gửi PCU */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.ngayGuiPcu || ''}
                </td>

                {/* Ngày PCU trả */}
                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${overdue ? 'text-rose-600 font-bold' : 'text-black'}`}>
                  {row.ngayPcuTra ? (
                    <span className="text-emerald-600 font-semibold">{row.ngayPcuTra}</span>
                  ) : pcuDeadline ? (
                    <span className={overdue ? 'text-rose-500 font-bold' : 'text-amber-600'}>
                      {overdue ? '⚠ ' : ''}HX: {pcuDeadline}
                    </span>
                  ) : ''}
                </td>

                {/* Ngày ký HĐ */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.ngayKyHd || ''}
                </td>

                {/* Ngày tạm ứng */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.ngayTamUng || ''}
                </td>

                {/* Ngày về DK bắt đầu */}
                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${!row.ngayVeDuKienBatDau ? 'text-rose-400' : 'text-black'}`}>
                  {row.ngayVeDuKienBatDau || <span className="italic text-slate-400 text-[12px]">Chưa nhập*</span>}
                </td>

                {/* Ngày về DK kết thúc */}
                <td className={`px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${!row.ngayVeDuKienKetThuc ? 'text-rose-400' : 'text-black'}`}>
                  {row.ngayVeDuKienKetThuc || <span className="italic text-slate-400 text-[12px]">Chưa nhập*</span>}
                </td>

                {/* Đợt NT */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.dotNhapTay || ''}
                </td>

                {/* Ngày NC BCH */}
                <td className="px-2 py-0.5 text-center text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.ngayTheoNhuCauBch || ''}
                </td>

                {/* Ngày về TT */}
                <td className="px-2 py-0.5 text-center border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.ngayVeThucTe
                    ? <span className="text-emerald-600 font-semibold">{row.ngayVeThucTe}</span>
                    : ''}
                </td>

                {/* KL nhập tay */}
                <td className="px-2 py-0.5 text-center font-semibold text-black border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px]">
                  {row.khoiLuongNhapTay || ''}
                </td>

                {/* KL còn thiếu */}
                <td className={`px-2 py-0.5 text-center font-bold border-b border-r border-[#031240]/20 whitespace-nowrap font-data text-[12px] ${
                  klConThieu && parseFloat(klConThieu) > 0 ? 'text-rose-600'
                  : klConThieu && parseFloat(klConThieu) < 0 ? 'text-emerald-600'
                  : 'text-black'
                }`}>
                  {klConThieu || ''}
                </td>

                {/* CV phối hợp */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 text-[12px]">
                  <div className="truncate max-w-[170px]" title={row.tenChuyenVienKqlvt}>
                    {row.tenChuyenVienKqlvt || (currentUser ? <span className="text-royal-400 italic">{currentUser}</span> : '')}
                  </div>
                </td>

                {/* CVPCU */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 text-[12px]">
                  <div className="truncate max-w-[150px]" title={row.tenCvpcuThucHien}>{row.tenCvpcuThucHien || ''}</div>
                </td>

                {/* Ghi chú */}
                <td className="px-2 py-0.5 text-black border-b border-r border-[#031240]/20 last:border-r-0 text-[12px]">
                  <div className="truncate max-w-[200px]" title={row.ghiChu}>{row.ghiChu || ''}</div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
