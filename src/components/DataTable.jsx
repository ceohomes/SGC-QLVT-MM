import React, { useState, useRef } from 'react'
import { Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { TRANG_THAI_COLOR } from '../constants'
import { calcKhoiLuongConThieu, calcPcuDeadline, isPcuOverdue, formatDate } from '../utils'

// Column definitions
const COLUMNS = [
  { key: 'stt', label: 'STT', width: 50, fixed: true, center: true },
  { key: 'maVatTu', label: 'Mã Vật tư', width: 110, fixed: true },
  { key: 'tenVatTu', label: 'Tên vật tư', width: 200 },
  { key: 'dvt', label: 'Đvt', width: 70, center: true },
  { key: 'tenNCC', label: 'Tên NCC', width: 180 },
  { key: 'soLuongGiaoThuc', label: 'Số Lượng Giao thực NCC', width: 120, center: true },
  { key: 'nhom', label: 'Nhóm', width: 120 },
  { key: 'loaiHD', label: 'Loại HĐ', width: 140 },
  { key: 'quyCachKyThuat', label: 'Quy cách kỹ thuật', width: 200 },
  { key: 'dot', label: 'Đợt', width: 70, center: true },
  { key: 'khoiLuong', label: 'Khối lượng', width: 100, center: true },
  { key: 'trangThai', label: 'Trạng thái', width: 130, center: true, computed: true },
  { key: 'ngayGuiPCU', label: 'Ngày gửi PCU', width: 110, center: true },
  { key: 'ngayPCUTra', label: 'Ngày PCU trả', width: 110, center: true },
  { key: 'ngayKyHD', label: 'Ngày ký HĐ', width: 110, center: true },
  { key: 'ngayTamUng', label: 'Ngày tạm ứng', width: 110, center: true },
  { key: 'ngayVeDuKienBatDau', label: 'Ngày về Dự kiến bắt đầu', width: 140, center: true, required: true },
  { key: 'ngayVeDuKienKetThuc', label: 'Ngày về Dự kiến kết thúc', width: 145, center: true, required: true },
  { key: 'dotNhapTay', label: 'Đợt (nhập tay)', width: 90, center: true },
  { key: 'ngayTheoNhuCauBCH', label: 'Ngày theo nhu cầu BCH', width: 130, center: true },
  { key: 'ngayVeThucTe', label: 'Ngày về thực tế', width: 120, center: true },
  { key: 'khoiLuongNhapTay', label: 'Khối lượng (nhập tay)', width: 120, center: true },
  { key: 'khoiLuongConThieu', label: 'Khối lượng còn thiếu', width: 120, center: true, computed: true },
  { key: 'tenChuyenVienKQLVT', label: 'Tên chuyên viên phối hợp K.QLVT', width: 180 },
  { key: 'tenCVPCUThucHien', label: 'Tên CVPCU thực hiện', width: 160 },
  { key: 'ghiChu', label: 'Ghi chú', width: 200 },
  { key: 'actions', label: 'Thao tác', width: 90, center: true, fixed: true },
]

function StatusBadge({ status }) {
  const colorClass = TRANG_THAI_COLOR[status] || 'bg-slate-100 text-slate-700 border-slate-300'
  const icon = status === 'Đã xử lý' ? <CheckCircle2 className="w-3 h-3" /> 
              : status === 'Quá hạn' ? <AlertCircle className="w-3 h-3" />
              : <Clock className="w-3 h-3" />
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${colorClass} whitespace-nowrap ${status === 'Quá hạn' ? 'status-overdue' : ''}`}>
      {icon}
      {status}
    </span>
  )
}

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 opacity-30" />
  if (sortDir === 'asc') return <ChevronUp className="w-3 h-3 text-violet-200" />
  return <ChevronDown className="w-3 h-3 text-violet-200" />
}

export default function DataTable({ rows, onEdit, onDelete, pcuDays, currentUser, sortKey, sortDir, onSort }) {
  const tableRef = useRef(null)

  const thClass = "px-2 py-2.5 text-left text-xs font-bold text-white/90 uppercase tracking-wide whitespace-nowrap border-r border-white/10 last:border-r-0 cursor-pointer hover:bg-white/10 transition-colors select-none"

  return (
    <div className="flex-1 min-h-0 overflow-auto" ref={tableRef}>
      <table className="border-collapse min-w-max w-full text-xs">
        <thead className="sticky-header">
          <tr className="bg-gradient-to-r from-violet-700 to-purple-700">
            {COLUMNS.map(col => (
              <th
                key={col.key}
                className={thClass}
                style={{ minWidth: col.width, width: col.width }}
                onClick={() => !col.computed && col.key !== 'actions' && onSort(col.key)}
              >
                <div className={`flex items-center gap-1 ${col.center ? 'justify-center' : ''}`}>
                  <span>{col.label}</span>
                  {!col.computed && col.key !== 'actions' && col.key !== 'stt' && (
                    <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                  )}
                  {col.required && <span className="text-rose-300 text-xs">*</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="text-center py-16 text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-violet-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-violet-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Chưa có dữ liệu</p>
                    <p className="text-xs text-slate-400 mt-1">Nhấn "+ Thêm mới" để bắt đầu hoặc Import Excel</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : rows.map((row, idx) => {
            const overdue = isPcuOverdue(row.ngayGuiPCU, row.ngayPCUTra, pcuDays)
            const pcuDeadline = calcPcuDeadline(row.ngayGuiPCU, pcuDays)
            const klConThieu = calcKhoiLuongConThieu(row.khoiLuong, row.khoiLuongNhapTay)
            const isEven = idx % 2 === 0

            return (
              <tr
                key={row.id}
                className={`
                  group transition-colors hover:bg-violet-50
                  ${isEven ? 'bg-white' : 'bg-violet-50/30'}
                  ${overdue ? 'ring-inset ring-1 ring-rose-200' : ''}
                `}
              >
                {/* STT */}
                <td className="px-2 py-1.5 text-center text-slate-500 font-medium border-b border-violet-50 whitespace-nowrap">
                  {idx + 1}
                </td>

                {/* Mã vật tư */}
                <td className="px-2 py-1.5 font-mono font-semibold text-violet-700 border-b border-violet-50 whitespace-nowrap">
                  {row.maVatTu || '—'}
                </td>

                {/* Tên vật tư */}
                <td className="px-2 py-1.5 font-medium text-slate-800 border-b border-violet-50">
                  <div className="max-w-[190px] truncate" title={row.tenVatTu}>{row.tenVatTu || '—'}</div>
                </td>

                {/* ĐVT */}
                <td className="px-2 py-1.5 text-center text-slate-600 border-b border-violet-50 whitespace-nowrap">
                  {row.dvt || '—'}
                </td>

                {/* Tên NCC */}
                <td className="px-2 py-1.5 text-slate-700 border-b border-violet-50">
                  <div className="max-w-[170px] truncate" title={row.tenNCC}>{row.tenNCC || '—'}</div>
                </td>

                {/* Số lượng giao thực NCC */}
                <td className="px-2 py-1.5 text-center font-semibold text-slate-700 border-b border-violet-50 whitespace-nowrap">
                  {row.soLuongGiaoThuc || '—'}
                </td>

                {/* Nhóm */}
                <td className="px-2 py-1.5 border-b border-violet-50 whitespace-nowrap">
                  {row.nhom ? (
                    <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md text-xs font-semibold">{row.nhom}</span>
                  ) : '—'}
                </td>

                {/* Loại HĐ */}
                <td className="px-2 py-1.5 text-slate-600 border-b border-violet-50">
                  <div className="max-w-[130px] truncate" title={row.loaiHD}>{row.loaiHD || '—'}</div>
                </td>

                {/* Quy cách KT */}
                <td className="px-2 py-1.5 text-slate-600 border-b border-violet-50">
                  <div className="max-w-[190px] truncate" title={row.quyCachKyThuat}>{row.quyCachKyThuat || '—'}</div>
                </td>

                {/* Đợt */}
                <td className="px-2 py-1.5 text-center text-slate-600 border-b border-violet-50 whitespace-nowrap">
                  {row.dot || '—'}
                </td>

                {/* Khối lượng */}
                <td className="px-2 py-1.5 text-center font-semibold text-slate-700 border-b border-violet-50 whitespace-nowrap">
                  {row.khoiLuong || '—'}
                </td>

                {/* Trạng thái (auto) */}
                <td className="px-2 py-1.5 text-center border-b border-violet-50 whitespace-nowrap">
                  <StatusBadge status={row.trangThai} />
                </td>

                {/* Ngày gửi PCU */}
                <td className="px-2 py-1.5 text-center text-slate-600 border-b border-violet-50 whitespace-nowrap">
                  {row.ngayGuiPCU || '—'}
                </td>

                {/* Ngày PCU trả - show deadline if not returned yet */}
                <td className={`px-2 py-1.5 text-center border-b border-violet-50 whitespace-nowrap ${overdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                  {row.ngayPCUTra ? (
                    <span className="text-emerald-600 font-semibold">{row.ngayPCUTra}</span>
                  ) : pcuDeadline ? (
                    <span className={overdue ? 'text-rose-600 font-bold' : 'text-amber-600'}>
                      {overdue ? '⚠ ' : ''}HX: {pcuDeadline}
                    </span>
                  ) : '—'}
                </td>

                {/* Ngày ký HĐ */}
                <td className="px-2 py-1.5 text-center text-slate-600 border-b border-violet-50 whitespace-nowrap">
                  {row.ngayKyHD || '—'}
                </td>

                {/* Ngày tạm ứng */}
                <td className="px-2 py-1.5 text-center text-slate-600 border-b border-violet-50 whitespace-nowrap">
                  {row.ngayTamUng || '—'}
                </td>

                {/* Ngày về dự kiến bắt đầu */}
                <td className={`px-2 py-1.5 text-center border-b border-violet-50 whitespace-nowrap ${!row.ngayVeDuKienBatDau ? 'text-rose-400 font-semibold' : 'text-slate-600'}`}>
                  {row.ngayVeDuKienBatDau || <span className="text-rose-400">Chưa nhập*</span>}
                </td>

                {/* Ngày về dự kiến kết thúc */}
                <td className={`px-2 py-1.5 text-center border-b border-violet-50 whitespace-nowrap ${!row.ngayVeDuKienKetThuc ? 'text-rose-400 font-semibold' : 'text-slate-600'}`}>
                  {row.ngayVeDuKienKetThuc || <span className="text-rose-400">Chưa nhập*</span>}
                </td>

                {/* Đợt (nhập tay) */}
                <td className="px-2 py-1.5 text-center text-slate-600 border-b border-violet-50 whitespace-nowrap">
                  {row.dotNhapTay || '—'}
                </td>

                {/* Ngày theo nhu cầu BCH */}
                <td className="px-2 py-1.5 text-center text-slate-600 border-b border-violet-50 whitespace-nowrap">
                  {row.ngayTheoNhuCauBCH || '—'}
                </td>

                {/* Ngày về thực tế */}
                <td className="px-2 py-1.5 text-center border-b border-violet-50 whitespace-nowrap">
                  {row.ngayVeThucTe ? (
                    <span className="text-emerald-600 font-semibold">{row.ngayVeThucTe}</span>
                  ) : '—'}
                </td>

                {/* Khối lượng nhập tay */}
                <td className="px-2 py-1.5 text-center font-semibold text-slate-700 border-b border-violet-50 whitespace-nowrap">
                  {row.khoiLuongNhapTay || '—'}
                </td>

                {/* Khối lượng còn thiếu (computed) */}
                <td className={`px-2 py-1.5 text-center font-bold border-b border-violet-50 whitespace-nowrap ${
                  klConThieu && parseFloat(klConThieu) > 0 ? 'text-rose-600' 
                  : klConThieu && parseFloat(klConThieu) < 0 ? 'text-emerald-600' 
                  : 'text-slate-600'
                }`}>
                  {klConThieu || '—'}
                </td>

                {/* Tên chuyên viên K.QLVT */}
                <td className="px-2 py-1.5 text-slate-700 border-b border-violet-50">
                  <div className="max-w-[170px] truncate" title={row.tenChuyenVienKQLVT}>
                    {row.tenChuyenVienKQLVT || (currentUser ? <span className="text-violet-500 italic text-xs">{currentUser}</span> : '—')}
                  </div>
                </td>

                {/* Tên CVPCU */}
                <td className="px-2 py-1.5 text-slate-700 border-b border-violet-50">
                  <div className="max-w-[150px] truncate" title={row.tenCVPCUThucHien}>{row.tenCVPCUThucHien || '—'}</div>
                </td>

                {/* Ghi chú */}
                <td className="px-2 py-1.5 text-slate-500 border-b border-violet-50">
                  <div className="max-w-[190px] truncate" title={row.ghiChu}>{row.ghiChu || ''}</div>
                </td>

                {/* Actions */}
                <td className="px-2 py-1.5 text-center border-b border-violet-50 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(row)}
                      className="w-7 h-7 flex items-center justify-center bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-md transition-all"
                      title="Sửa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      className="w-7 h-7 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-md transition-all"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
