import React, { useState, useMemo, useEffect } from 'react'
import { Layers, Settings, ShieldCheck, Trash2, AlertTriangle, FileText, X, CheckCircle } from 'lucide-react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import DataTable, { COLUMNS } from './components/DataTable'
import EditModal from './components/EditModal'
import SettingsModal from './components/SettingsModal'
import StatsBar from './components/StatsBar'
import Sidebar from './components/Sidebar'
import ConfirmModal from './components/ConfirmModal'
import Login from './components/Login'
import DataVatTuNCC from './components/sheets/DataVatTuNCC'
import QuanLyTaiKhoan from './components/sheets/QuanLyTaiKhoan'
import BaoCaoCanhBao from './components/sheets/BaoCaoCanhBao'
import CauHinhDuAn from './components/sheets/CauHinhDuAn'
import CauHinhLogo from './components/sheets/CauHinhLogo'
import SupplySentDateModal from './components/SupplySentDateModal'
import { LOCAL_STORAGE_KEY, SETTINGS_KEY, DEFAULT_PCU_DAYS, TABLES, TRANG_THAI } from './constants'
import { genId, calcTrangThai, calcKhoiLuongConThieu, toCamelCase, toSnakeCase, parseNumber, formatExcelDate, formatNum, isValidDate } from './utils'
import { getSupabase, fetchAll } from './lib/supabase'

const LOGO_CONFIG_KEY = 'SGC_LOGO_CONFIG_v1'

function LoadingScreen({ branding }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#ef4444] via-[#b91c1c] to-[#7f1d1d] overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-black/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Rectangular Logo Box */}
        <div className="w-64 h-28 bg-white rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-700 overflow-hidden">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="max-w-[90%] max-h-[85%] object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="text-red-600 w-12 h-12" />
              <span className="text-slate-400 text-[12px] font-black uppercase tracking-widest">SGC SYSTEM</span>
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-white/10 rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white/60 text-[12px] font-black uppercase tracking-[0.4em] font-sans">Vui lòng chờ giây lát...</p>
        </div>
      </div>
    </div>
  )
}
const DEFAULT_BRANDING = {
  logoUrl: '',
  appName: 'SGC | QUẢN LÝ VẬT TƯ & MMTB',
  primaryColor: '#0f58a7'
}

async function loadXLSX() { return import('xlsx') }

function recalcAll(rows, pcuDays) {
  return rows.map(row => {
    let kl = row.khoiLuong
    let klnt = row.khoiLuongNhapTay
    let subRowsFound = false
    
    // Nếu là dòng chính, Khối lượng = tổng các dòng phụ
    if (!row.parentId) {
      const subRows = rows.filter(r => r.parentId === row.id)
      if (subRows.length > 0) {
        subRowsFound = true
        const sumKL = subRows.reduce((acc, sub) => acc + parseNumber(sub.khoiLuong), 0)
        const sumKLNT = subRows.reduce((acc, sub) => acc + parseNumber(sub.khoiLuongNhapTay), 0)
        kl = sumKL > 0 ? sumKL : ''
        klnt = sumKLNT > 0 ? sumKLNT : ''
      }
    }
    
    // Sử dụng giá trị cộng dồn để tính Trạng thái và KL còn thiếu
    const statusRow = { ...row, khoiLuong: kl, khoiLuongNhapTay: klnt }
    
    // 1. Đối với dòng chính: nếu không có dòng con nào thì để trống Trạng thái
    // 2. Đối với dòng phụ:
    //    - Nếu là nhóm 'Kế hoạch': Giữ nguyên logic trạng thái
    //    - Nếu là nhóm 'Thực tế': Bỏ trạng thái
    let finalTrangThai = ''
    if (!row.parentId) {
      // Dòng chính
      if (subRowsFound) {
        finalTrangThai = calcTrangThai(statusRow, pcuDays)
      }
    } else {
      // Dòng phụ
      if (row.subMode === 'kehoach' || !row.subMode) {
        finalTrangThai = calcTrangThai(statusRow, pcuDays)
      } else {
        finalTrangThai = ''
      }
    }

    return { 
      ...row, 
      trangThai: finalTrangThai,
      computedKL: kl,
      computedKLNT: klnt
    }
  })
}

function PreviewUpVatTuModal({ data, onConfirm, onCancel, type = 'vattu', onUpdateItem, onDeleteItem, existingRows = [], projectName = '', projectAbbr = '' }) {
  if (!data) return null
  const { newItems, skipped, total, errors, missingInProject = [] } = data
  const [bulkDotPrefix, setBulkDotPrefix] = useState('');
  const [bulkMonthYear, setBulkMonthYear] = useState('');

  const isPlan = type === 'kehoach'
  const title = isPlan ? 'Up Kế hoạch vật tư' : 'Up Vật tư'

  const validLoaiHds = ['Khung', 'Không khung'];

  const handleBulkUpdateDot = (dotPrefix, my) => {
    if (dotPrefix && my) {
      const combined = `${dotPrefix} Tháng ${my}`;
      newItems.forEach((_, idx) => onUpdateItem(idx, 'dot', combined));
    }
  };

  // Kiểm tra xem có lỗi validation không (dành cho Plan)
  const getMonthFromDot = (dot) => {
    if (!dot) return null;
    const match = dot.match(/Tháng\s+(\d{2}\/\d{2})/i);
    return match ? match[1] : null;
  };

  const months = isPlan ? newItems.map(item => getMonthFromDot(item.dot)).filter(Boolean) : [];
  const distinctMonths = [...new Set(months)];
  const isInconsistentMonths = isPlan && distinctMonths.length > 1;

  const checkLoaiHdValid = (val) => {
    if (!val || val === '' || val.includes('--')) return false;
    return validLoaiHds.includes(val);
  };

  const checkDotValid = (val) => {
    if (!val || val === '' || val.includes('--')) return false;
    // Kiểm tra định dạng: Đợt XX Tháng MM/YY
    return /^Đợt \d{2} Tháng \d{2}\/\d{2}$/.test(val);
  };

  // Check for duplicates in current import list and DB
  const getDuplicateKey = (item) => {
    const ma = (item.maVattu || '').trim().toUpperCase();
    const dot = (item.dot || '').trim().toUpperCase();
    const pid = (item.projectId || '').trim();
    const project = (item.duAn || '').trim().toUpperCase();
    
    // Chỉ tạo khóa nếu có đủ thông tin nhận diện
    if (!ma || !dot || !pid || !project) return null;
    return `${pid}_${project}_${ma}_${dot}`;
  };
  
  const currentImportKeys = isPlan ? newItems.map(getDuplicateKey) : [];
  
  // Only check existing rows that belong to the relevant projects being imported
  const projectIdsInImport = [...new Set(newItems.map(item => item.projectId))];
  const existingKeys = isPlan ? existingRows
    .filter(r => r.parentId && projectIdsInImport.includes(r.projectId))
    .map(getDuplicateKey)
    .filter(Boolean) : [];

  const checkIsDuplicate = (item, idx) => {
    if (!isPlan) return false;
    const key = getDuplicateKey(item);
    if (!key) return false; 
    
    // Check against existing rows in DB
    if (existingKeys.includes(key)) return true;
    
    // Check against other items in same import (excluding self)
    const firstIdx = currentImportKeys.indexOf(key);
    if (firstIdx !== -1 && firstIdx !== idx) return true;
    
    return false;
  };

  const duplicateItemsCount = isPlan ? newItems.filter((item, idx) => checkIsDuplicate(item, idx)).length : 0;

  const hasValidationErrors = isPlan && (newItems.some((item, idx) => {
    const isLoaiHdInvalid = !checkLoaiHdValid(item.loaiHd);
    const isKhoiLuongMissing = !item.khoiLuong || String(item.khoiLuong).trim() === '';
    const isCbptMissing = !item.tenCvpcuThucHien || String(item.tenCvpcuThucHien).trim() === '';
    const isDotInvalid = !checkDotValid(item.dot);
    const isNgayBdInvalid = !isValidDate(item.ngayVeDuKienBatDau);
    const isNgayKtInvalid = !isValidDate(item.ngayVeDuKienKetThuc);
    const isDuplicate = checkIsDuplicate(item, idx);
    
    return isLoaiHdInvalid || isKhoiLuongMissing || isCbptMissing || isDotInvalid || isNgayBdInvalid || isNgayKtInvalid || item.missingInProject || isDuplicate;
  }) || isInconsistentMonths);

  const totalErrorsCount = errors.length + missingInProject.length + (isPlan ? newItems.filter((item, idx) => {
    const isLoaiHdInvalid = !checkLoaiHdValid(item.loaiHd);
    const isDotInvalid = !checkDotValid(item.dot);
    const isNgayBdInvalid = !isValidDate(item.ngayVeDuKienBatDau);
    const isNgayKtInvalid = !isValidDate(item.ngayVeDuKienKetThuc);
    const isDuplicate = checkIsDuplicate(item, idx);
    return isLoaiHdInvalid || !item.khoiLuong || !item.tenCvpcuThucHien || isDotInvalid || isNgayBdInvalid || isNgayKtInvalid || isDuplicate;
  }).length : 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-2 animate-in fade-in duration-300 font-roboto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[96vw] xl:max-w-[1560px] max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in duration-500">
        <div className="bg-royal-600 px-8 py-3 flex items-center justify-between border-b border-royal-700/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-royal-600/50 to-indigo-600/50 pointer-events-none"></div>
          <div className="flex items-center gap-6 relative z-10 w-full">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-black text-[18px] tracking-tight">
                Xem trước dữ liệu import – {title}
              </h3>
            </div>

            {/* Project Badge */}
            {projectName && (
              <div className="flex items-center gap-2.5 bg-white/15 rounded-xl px-3 py-1.5 border border-white/20 backdrop-blur-md ml-auto mr-4 shadow-lg">
                <div className="w-8 h-8 bg-rose-500 text-white text-[14px] font-black rounded-lg border-2 border-rose-400/50 shadow-sm flex items-center justify-center shrink-0 uppercase tracking-tighter">
                  {projectAbbr || 'SGC'}
                </div>
                <div className="flex flex-col">
                  <span className="text-white/60 text-[12px] font-black uppercase tracking-[0.2em] leading-none mb-1">Dự án hiện hành</span>
                  <span className="text-white text-[16px] font-black leading-none">{projectName}</span>
                </div>
              </div>
            )}

            <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
             <div className="flex items-center gap-2 px-3 py-1.5 border border-royal-400 bg-royal-50 rounded-lg shadow-sm">
               <CheckCircle className="w-4 h-4 text-royal-600" />
               <span className="text-[14px] font-black text-royal-700 tracking-tighter">
                 Tổng trong file: <span className="text-royal-800 ml-1 font-black">{total} dòng</span>
               </span>
             </div>

             <div className="flex items-center gap-2 px-3 py-1.5 border border-emerald-400 bg-emerald-50 rounded-lg shadow-sm">
               <CheckCircle className="w-4 h-4 text-emerald-600" />
               <span className="text-[14px] font-black text-emerald-700 tracking-tighter">
                 Sẽ thêm mới: <span className="text-emerald-800 ml-1 font-black">{newItems.length} dòng</span>
               </span>
             </div>

             <div className="flex items-center gap-2 px-3 py-1.5 border border-orange-400 bg-orange-50 rounded-lg shadow-sm">
               <AlertTriangle className="w-4 h-4 text-orange-600" />
               <span className="text-[14px] font-black text-orange-700 tracking-tighter">
                 Bỏ qua trùng mã SAP / Không hợp lệ: <span className="text-orange-800 ml-1 font-black">{skipped + errors.length} / {total} dòng</span>
               </span>
             </div>
          </div>

          {isPlan && (
            <div className="flex items-center gap-4 ml-auto px-4 py-2 bg-royal-50 border border-royal-100 rounded-xl shadow-sm group transition-all hover:bg-royal-100/50">
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-black text-royal-600 uppercase whitespace-nowrap tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-royal-400 animate-pulse"></div>
                  Chọn đợt:
                </span>
                <select 
                  value={bulkDotPrefix}
                  onChange={(e) => {
                    setBulkDotPrefix(e.target.value);
                    handleBulkUpdateDot(e.target.value, bulkMonthYear);
                  }}
                  className="text-[14px] font-black h-8 py-0 border-royal-200 rounded-lg focus:ring-royal-500 bg-white min-w-[100px] cursor-pointer hover:border-royal-400 transition-colors shadow-sm"
                >
                  <option value="">-- Đợt --</option>
                  <option value="Đợt 01">Đợt 01</option>
                  <option value="Đợt 02">Đợt 02</option>
                  <option value="Đợt 03">Đợt 03</option>
                </select>
              </div>
              <div className="w-px h-6 bg-royal-200"></div>
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-black text-royal-600 uppercase whitespace-nowrap tracking-wider flex items-center gap-1.5">
                  Chọn tháng/năm:
                </span>
                <select 
                  value={bulkMonthYear}
                  onChange={(e) => {
                    setBulkMonthYear(e.target.value);
                    handleBulkUpdateDot(bulkDotPrefix, e.target.value);
                  }}
                  className="text-[14px] font-black h-8 py-0 border-royal-200 rounded-lg focus:ring-royal-500 bg-white min-w-[100px] cursor-pointer hover:border-royal-400 transition-colors shadow-sm"
                >
                  <option value="">-- Tháng --</option>
                  {(() => {
                    const opts = [];
                    const curY = new Date().getFullYear();
                    for (const y of [curY - 1, curY, curY + 1]) {
                      for (let m = 1; m <= 12; m++) {
                        const ms = String(m).padStart(2, '0');
                        const ys = String(y).slice(-2);
                        opts.push(`${ms}/${ys}`);
                      }
                    }
                    return opts.map(o => <option key={o} value={o}>{o}</option>);
                  })()}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
          {(skipped > 0 || errors.length > 0 || missingInProject.length > 0 || hasValidationErrors || duplicateItemsCount > 0) && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-4 text-amber-800">
               <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                 <AlertTriangle className="w-6 h-6 text-amber-600" />
               </div>
               <div>
                  <p className="text-[16px] font-black tracking-tight">
                    {hasValidationErrors ? 'Thiếu thông tin bắt buộc hoặc trùng lặp trong file' : 'Trường hợp trùng mã hoặc không hợp lệ'}
                  </p>
                  <p className="text-[14px] font-medium opacity-90 mt-0.5">
                    {hasValidationErrors 
                      ? 'Cần phải điền đủ thông tin, đúng định dạng và không được trùng Mã vật tư + Đợt trong cùng dự án.' 
                      : 'Lưu ý: Hệ thống chỉ xét sự trùng lặp vật tư trong cùng một Dự án này thôi.'}
                  </p>
               </div>
            </div>
          )}

          {newItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border-4 border-white shadow-xl">
                  <AlertTriangle className="w-10 h-10" />
               </div>
               <div className="text-center">
                  <p className="text-amber-800 font-bold text-[18px] mb-1">Tất cả đều trùng hoặc không có dữ liệu mới để thêm</p>
                  <p className="text-slate-500 text-[14px] italic">Vui lòng kiểm tra lại file Excel hoặc các mã vật tư đã tồn tại trong dự án</p>
               </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-md">
              <table className="w-full text-[14px] text-left border-collapse table-fixed">
                <thead className="bg-slate-100/80 text-slate-800 font-black tracking-wider sticky top-0 z-20 shadow-sm text-[14px]">
                  <tr className="border-b border-slate-200">
                    <th className="px-3 py-4 w-12 text-center border-r border-slate-200 bg-slate-100/90">Stt</th>
                    <th className="px-3 py-4 w-32 text-center border-r border-slate-200 bg-slate-100/90">Mã vật tư</th>
                    <th className="px-3 py-4 w-[280px] text-center border-r border-slate-200 bg-slate-100/90">Tên vật tư</th>
                    <th className="px-3 py-4 w-16 text-center border-r border-slate-200 bg-slate-100/90">Đvt</th>
                    {isPlan ? (
                      <>
                        <th className="px-3 py-4 w-32 text-center border-r border-slate-200 bg-slate-100/90">Loại hđ</th>
                        <th className="px-3 py-4 w-28 text-center border-r border-slate-200 bg-slate-100/90">Khối lượng</th>
                        <th className="px-3 py-4 w-40 text-center border-r border-slate-200 bg-slate-100/90">Cán bộ phụ trách</th>
                        <th className="px-3 py-4 w-48 text-center border-r border-slate-200 bg-slate-100/90">Đợt kế hoạch</th>
                        <th className="px-3 py-4 w-28 text-center border-r border-slate-200 bg-slate-100/90">Dự kiến bđ</th>
                        <th className="px-3 py-4 w-28 text-center border-r border-slate-200 bg-slate-100/90 leading-none">Dự kiến kt</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-4 w-40 text-center border-r border-slate-200 bg-slate-100/90">Loại vật tư</th>
                        <th className="px-3 py-4 w-44 text-center border-r border-slate-200 bg-slate-100/90">Chuyên viên</th>
                      </>
                    )}
                    <th className="px-3 py-4 w-12 text-center bg-slate-100/90">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {newItems.map((item, idx) => {
                    const isMissingInProject = isPlan && item.missingInProject;
                    const isDuplicate = isPlan && checkIsDuplicate(item, idx);
                    const rowError = isPlan && (!item.loaiHd || !item.khoiLuong || !item.tenCvpcuThucHien || !item.dot || !item.ngayVeDuKienBatDau || !item.ngayVeDuKienKetThuc || isMissingInProject || isDuplicate);
                    
                    return (
                      <tr key={item.id} className={`transition-colors border-b border-slate-100 ${rowError ? 'bg-red-50/70 hover:bg-red-100/60' : 'hover:bg-slate-50'}`}>
                        <td className="px-3 py-3 text-center font-bold text-slate-400 border-r border-slate-100 text-[14px]">{idx + 1}</td>
                        <td className={`px-3 py-3 font-bold border-r border-slate-100 text-[14px] text-center ${isMissingInProject || isDuplicate ? 'text-red-600 bg-red-100/30' : 'text-royal-600'}`}>{item.maVattu}</td>
                        <td className="px-3 py-3 font-bold text-slate-800 border-r border-slate-100 text-[14px] leading-tight max-w-[280px]">
                          <div className="line-clamp-2" title={item.tenVattu}>{item.tenVattu}</div>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-500 border-r border-slate-100 text-[14px]">{item.dvt}</td>
                        {isPlan ? (
                          <>
                          <td className={`px-3 py-2 border-r border-slate-100 ${!checkLoaiHdValid(item.loaiHd) ? 'bg-red-100/50' : ''}`}>
                            <select
                              value={item.loaiHd || ''}
                              onChange={(e) => onUpdateItem(idx, 'loaiHd', e.target.value)}
                              className={`w-full bg-transparent border-none focus:ring-0 text-[14px] font-black cursor-pointer p-0 h-8 ${!checkLoaiHdValid(item.loaiHd) ? 'text-red-600' : 'text-slate-800'}`}
                            >
                              <option value="">-- Chọn --</option>
                              <option value="Khung">Khung</option>
                              <option value="Không khung">Không khung</option>
                            </select>
                          </td>
                            <td className={`px-3 py-2 border-r border-slate-100 ${!item.khoiLuong ? 'bg-red-100/50' : ''}`}>
                              <input
                                type="text"
                                value={item.khoiLuong || ''}
                                onChange={(e) => onUpdateItem(idx, 'khoiLuong', e.target.value)}
                                onBlur={(e) => onUpdateItem(idx, 'khoiLuong', formatNum(e.target.value))}
                                placeholder="KL"
                                className={`w-full bg-transparent border-none focus:ring-0 text-[14px] font-black text-center p-0 h-8 ${!item.khoiLuong ? 'text-red-600 placeholder:text-red-300' : 'text-royal-700'}`}
                              />
                            </td>
                            <td className={`px-3 py-2 border-r border-slate-100 ${!item.tenCvpcuThucHien ? 'bg-red-100/50' : ''}`}>
                              <input
                                type="text"
                                value={item.tenCvpcuThucHien || ''}
                                onChange={(e) => onUpdateItem(idx, 'tenCvpcuThucHien', e.target.value)}
                                placeholder="CBPT..."
                                className={`w-full bg-transparent border-none focus:ring-0 text-[14px] font-bold p-0 h-8 ${!item.tenCvpcuThucHien ? 'text-red-600 placeholder:text-red-300' : 'text-slate-700'}`}
                              />
                            </td>
                            <td className={`px-3 py-2 border-r border-slate-100 ${!checkDotValid(item.dot) || isDuplicate ? 'bg-red-100/50' : ''}`}>
                              <select
                                value={item.dot || ''}
                                onChange={(e) => onUpdateItem(idx, 'dot', e.target.value)}
                                className={`w-full bg-transparent border-none focus:ring-0 text-[14px] font-bold cursor-pointer p-0 h-8 ${!checkDotValid(item.dot) || isDuplicate ? 'text-red-600' : 'text-royal-600'}`}
                              >
                                <option value="">-- Chọn đợt --</option>
                                {(() => {
                                  const opts = [];
                                  const years = [2025, 2026, 2027];
                                  for (const y of years) {
                                    for (let m = 1; m <= 12; m++) {
                                      const ms = String(m).padStart(2, '0');
                                      const ys = String(y).slice(-2);
                                      opts.push(`Đợt 01 Tháng ${ms}/${ys}`);
                                      opts.push(`Đợt 02 Tháng ${ms}/${ys}`);
                                      opts.push(`Đợt 03 Tháng ${ms}/${ys}`);
                                    }
                                  }
                                  return opts.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ));
                                })()}
                              </select>
                            </td>
                            <td className={`px-3 py-2 border-r border-slate-100 ${!isValidDate(item.ngayVeDuKienBatDau) ? 'bg-red-100/50' : ''}`}>
                              <input
                                type="text"
                                value={item.ngayVeDuKienBatDau || ''}
                                onChange={(e) => onUpdateItem(idx, 'ngayVeDuKienBatDau', e.target.value)}
                                placeholder="dd/mm/yy"
                                className={`w-full bg-transparent border-none focus:ring-0 text-[14px] font-bold text-center p-0 h-8 ${!isValidDate(item.ngayVeDuKienBatDau) ? 'text-red-600 placeholder:text-red-300' : 'text-slate-900'}`}
                              />
                            </td>
                            <td className={`px-3 py-2 border-r border-slate-100 ${!isValidDate(item.ngayVeDuKienKetThuc) ? 'bg-red-100/50' : ''}`}>
                              <input
                                type="text"
                                value={item.ngayVeDuKienKetThuc || ''}
                                onChange={(e) => onUpdateItem(idx, 'ngayVeDuKienKetThuc', e.target.value)}
                                placeholder="dd/mm/yy"
                                className={`w-full bg-transparent border-none focus:ring-0 text-[14px] font-bold text-center p-0 h-8 ${!isValidDate(item.ngayVeDuKienKetThuc) ? 'text-red-600 placeholder:text-red-300' : 'text-slate-900'}`}
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-3 border-r border-[#031240]/10 text-center">
                              <span className="px-2 py-0.5 bg-royal-50 text-royal-700 rounded-full text-[14px] font-black tracking-tighter uppercase italic">{item.nhom}</span>
                            </td>
                            <td className="px-3 py-3 text-slate-500 font-medium border-r border-[#031240]/10 text-[14px] text-center">{item.tenChuyenVienKqlvt}</td>
                          </>
                        )}
                        <td className="px-2 py-1 text-center">
                          <button 
                            onClick={() => onDeleteItem(idx)}
                            className="p-1 px-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {isPlan && newItems.some((item, idx) => checkIsDuplicate(item, idx)) && (
            <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <h4 className="text-orange-700 font-black text-[12px] tracking-wider mb-2 flex items-center gap-2 uppercase">
                <AlertTriangle className="w-4 h-4" />
                Dữ liệu bị trùng (Mã vật tư + Đợt) trong dự án ({newItems.filter((item, idx) => checkIsDuplicate(item, idx)).length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {newItems.map((item, idx) => checkIsDuplicate(item, idx) && (
                  <span key={item.id} className="px-2 py-1 bg-white border border-orange-200 text-orange-600 text-[12px] font-bold rounded">
                    {item.maVattu} ({item.dot || 'N/A'})
                  </span>
                ))}
              </div>
            </div>
          )}
          {missingInProject.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
              <h4 className="text-red-700 font-black text-[12px] tracking-wider mb-2 flex items-center gap-2 uppercase">
                <AlertTriangle className="w-4 h-4" />
                Mã vật tư không nằm trong danh mục dự án chính ({missingInProject.length}):
              </h4>
              <p className="text-red-600 text-[12px] font-mono break-all leading-relaxed bg-white/50 p-2 rounded border border-red-200">
                {missingInProject.join(', ')}
              </p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
              <h4 className="text-red-700 font-black text-[12px] tracking-wider mb-2 flex items-center gap-2 uppercase">
                <AlertTriangle className="w-4 h-4" />
                Mã SAP không hợp lệ / Sai định dạng ({errors.length}):
              </h4>
              <p className="text-red-600 text-[12px] font-mono break-all leading-relaxed bg-white/50 p-2 rounded border border-red-200">
                {errors.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white px-6 py-4 border-t border-slate-100 flex flex-col items-center gap-3">
          {isInconsistentMonths && (
            <div className="px-6 py-2 bg-orange-600 text-white text-[12px] font-black rounded shadow-lg animate-pulse tracking-[0.05em] flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Số đợt tương ứng với số tháng phải trùng nhau ({distinctMonths.join(' vs ')})
            </div>
          )}
          {hasValidationErrors && !isInconsistentMonths && (
            <div className="px-6 py-2 bg-red-600 text-white text-[12px] font-black rounded shadow-lg animate-bounce tracking-[0.05em] flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              Cần phải điền đủ thông tin dữ liệu tất cả các cột mới cho lưu vào hệ thống
            </div>
          )}
          <div className="flex justify-center gap-3 w-full">
            <button
              onClick={onCancel}
              className="px-8 py-2 rounded-xl text-[14px] font-black text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
            >
              Huỷ bỏ
            </button>
            <button
              onClick={onConfirm}
              disabled={newItems.length === 0 || hasValidationErrors}
              className={`px-10 py-2 rounded-xl text-[14px] font-black text-white shadow-xl transform transition-all active:scale-95 flex items-center gap-2
                ${(newItems.length > 0 && !hasValidationErrors)
                  ? "bg-royal-600 hover:bg-royal-700 shadow-royal-200" 
                  : "bg-royal-300 opacity-50 cursor-not-allowed"}
              `}
            >
              <CheckCircle className="w-5 h-5" />
              Lưu {newItems.length} dòng vào hệ thống
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChiTietCongViec({ settings, onSaveSettings, branding, onOpenSidebar, user }) {
  const pcuDays = settings.pcuDays || DEFAULT_PCU_DAYS

  const [rows, setRows] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Load projects
  useEffect(() => {
    let channel = null
    async function fetchProjects() {
      const supabase = getSupabase()
      
      const loadFromLocal = () => {
        try {
          const d = localStorage.getItem('sgc_cau_hinh_du_an_v2')
          if (d) {
            const localData = JSON.parse(d)
            const flattened = localData.reduce((acc, k) => [
              ...acc,
              { id: k.id, ten: k.ten, vietTat: k.vietTat, paletteIdx: k.paletteIdx, isLocalOnly: true },
              ...(k.duAn || []).map(d => ({ 
                ...d, 
                khoiId: k.id, 
                khoiTen: k.ten, 
                khoiVietTat: k.vietTat,
                paletteIdx: k.paletteIdx,
                isLocalOnly: true
              }))
            ], [])
            setProjects(flattened)
            console.log('[App] Projects loaded from localStorage fallback (marked isLocalOnly)')
          }
        } catch (err) { console.error('LocalStorage projects load failed:', err) }
      }

      const processProjects = (data) => {
        if (!data) return
        const camelData = data.map(toCamelCase)
        
        // Chỉ lấy các bản ghi là Khối (có du_an là mảng)
        const dbKhois = camelData.filter(item => Array.isArray(item.duAn))
        const allParsedProjects = []

        dbKhois.forEach(k => {
          // 1. Thêm chính Khối đó vào danh sách (để hiển thị ở dropdown hoặc lọc)
          allParsedProjects.push({
            ...k,
            isLocalOnly: false
          })

          // 2. Trích xuất các dự án con từ cột du_an (JSON array)
          if (k.duAn && k.duAn.length > 0) {
            k.duAn.forEach(p => {
              allParsedProjects.push({
                ...p,
                khoiId: k.id,
                khoiTen: k.ten,
                khoiVietTat: k.vietTat,
                paletteIdx: k.paletteIdx,
                isLegacy: false, // Giờ đây chính là chuẩn mới
                isLocalOnly: false
              })
            })
          }
        })

        console.log('[App] Reconstructed projects from JSON:', allParsedProjects.length)
        setProjects(allParsedProjects)
      }

      if (supabase) {
        try {
          const data = await fetchAll(supabase, TABLES.DU_AN)
          if (data && data.length > 0) {
            processProjects(data)
          } else {
            loadFromLocal()
          }

          channel = supabase
            .channel(`rt-projects-${Date.now()}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.DU_AN }, async () => {
              try {
                const fresh = await fetchAll(supabase, TABLES.DU_AN)
                if (fresh) processProjects(fresh)
              } catch (err) { console.error(err) }
            })
            .subscribe()
        } catch (err) { 
          console.error('Projects fetch failed', err)
          loadFromLocal()
        }
      } else {
        loadFromLocal()
      }
    }
    fetchProjects()
    return () => {
      if (channel) getSupabase()?.removeChannel(channel)
    }
  }, [])

  // Load data + Realtime subscription
  useEffect(() => {
    let channel = null

    function loadFromLocal() {
      try {
        const d = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (d) setRows(recalcAll(JSON.parse(d), pcuDays))
      } catch (err) { console.error('LocalStorage load failed:', err) }
      setIsLoading(false)
    }

    async function fetchData() {
      const supabase = getSupabase()
      if (!supabase) { loadFromLocal(); return }
      setIsLoading(true)

      try {
        console.log('[App] Loading from table:', TABLES.CHI_TIET_CONG_VIEC)
        const data = await fetchAll(supabase, TABLES.CHI_TIET_CONG_VIEC, { 
          orderCol: 'created_at', 
          orderAsc: false 
        })

        if (data) {
          setRows(recalcAll(data.map(toCamelCase), pcuDays))
          setIsLoading(false)
        } else {
          loadFromLocal()
        }
      } catch (err) {
        console.error('[App] Fetch exception:', err)
        loadFromLocal()
        showToast('Lỗi tải dữ liệu: ' + (err.message || 'Lỗi không xác định'), 'error')
      }

      // Realtime: cập nhật tức thì khi tài khoản khác thay đổi dữ liệu
      const channelName = `rt-ctcv-${Date.now()}`
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: TABLES.CHI_TIET_CONG_VIEC
        }, async () => {
          try {
            const fresh = await fetchAll(supabase, TABLES.CHI_TIET_CONG_VIEC, { 
              orderCol: 'created_at', 
              orderAsc: false 
            })
            if (fresh) setRows(recalcAll(fresh.map(toCamelCase), pcuDays))
          } catch (err) { console.error(err) }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Subscribed to', channelName)
          }
        })
    }

    fetchData()

    return () => {
      const supabase = getSupabase()
      if (channel && supabase) supabase.removeChannel(channel)
    }
  }, [pcuDays])

  // Sync to localStorage as backup
  useEffect(() => {
    if (rows.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rows))
    }
  }, [rows])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [searchGlobal, setSearchGlobal] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [filters, setFilters] = useState({ searchVattu: '', tenNcc: 'ALL', nhom: 'ALL', loaiHd: 'ALL', trangThai: 'ALL', dot: '' })
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, title, message }
  const [alertInfo, setAlertInfo] = useState(null) // { title, message, type, icon }
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false)

  const showAlert = (title, message, type = 'danger', icon = AlertTriangle) => {
    setAlertInfo({ title, message, type, icon })
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddNew = () => { 
    setEditingRow(selectedProjectId !== 'ALL' ? { projectId: selectedProjectId } : null)
    setIsEditOpen(true) 
  }

  const handleAddSubRow = (parentRow, mode = 'kehoach') => {
    setEditingRow({ 
      parentId: parentRow.id,
      projectId: parentRow.projectId,
      duAn: parentRow.duAn,
      maVattu: parentRow.maVattu,
      tenVattu: parentRow.tenVattu,
      dvt: parentRow.dvt,
      nhom: parentRow.nhom,
      khoiLuong: parentRow.khoiLuong,
      quyCachKyThuat: parentRow.quyCachKyThuat,
      tenNcc: parentRow.tenNcc,
      tenNccThucTe: parentRow.tenNcc,
      subMode: mode   // 'kehoach' hoặc 'thucte'
    })
    setIsEditOpen(true)
  }

  const handleEdit   = (row) => { setEditingRow(row); setIsEditOpen(true) }

  const handleDelete = async (id) => {
    setConfirmDelete({
      id,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa dòng này? Tất cả dữ liệu liên quan sẽ bị loại bỏ.'
    })
  }

  const performDelete = async (id) => {
    const supabase = getSupabase()
    if (supabase) {
      // Tìm tất cả id cần xóa: dòng chính + các dòng phụ liên quan
      const subRowIds = rows
        .filter(r => r.parentId === id && r.id)
        .map(r => r.id)
      const allIds = [id, ...subRowIds].filter(Boolean)

      // Xóa từng id riêng lẻ (tránh dùng parent_id vì cột này không tồn tại trên DB)
      for (const deleteId of allIds) {
        const { error } = await supabase
          .from(TABLES.CHI_TIET_CONG_VIEC)
          .delete()
          .eq('id', deleteId)
        if (error) {
          showAlert('Lỗi khi xóa', 'Không thể xóa dữ liệu trên hệ thống. Chi tiết: ' + error.message)
          setConfirmDelete(null)
          return
        }
      }
    }

    setRows(prev => prev.filter(r => r.id !== id && r.parentId !== id))
    
    // Nếu đang mở modal chính cái dòng vừa xóa thì đóng lại
    if (editingRow?.id === id) {
      setIsEditOpen(false)
      setEditingRow(null)
    }

    showToast('Đã xóa thành công')
    setConfirmDelete(null)
  }

  const handleSave = async (dataOrArray) => {
    const formDataList = Array.isArray(dataOrArray) ? dataOrArray : [dataOrArray]
    console.log('[App] Saving formDataList:', formDataList)
    const supabase = getSupabase()
    
    // Bản sao local để tính toán STT và subIdx chính xác khi thêm nhiều dòng cùng lúc
    let currentRowsState = [...rows]

    try {
      for (const formData of formDataList) {
        const isEdit = !!formData.id
        
        if (isEdit) {
          const updatedRow = { ...formData }
          updatedRow.trangThai = calcTrangThai(updatedRow, pcuDays)
          updatedRow.updatedAt = new Date().toISOString()
          
          if (supabase) {
            const dbRow = toSnakeCase(updatedRow)
            if (dbRow.project_id && dbRow.project_id !== 'ALL') {
               const proj = projects.find(b => b.id === dbRow.project_id)
               if (proj) {
                  if (proj.isLocalOnly || proj.isLegacy) {
                     showToast('Lỗi: Khối thi công này chưa được lưu trên hệ thống.', 'error')
                     continue
                  }
                  dbRow.project_id = proj.khoiId || proj.id
               }
            }
            
            const { error } = await supabase
              .from(TABLES.CHI_TIET_CONG_VIEC)
              .update(dbRow)
              .eq('id', formData.id)
            if (error) {
              showAlert('Lỗi cập nhật', 'Không thể lưu thay đổi vào hệ thống: ' + error.message)
              continue
            }
          }

          currentRowsState = currentRowsState.map(r => r.id === formData.id ? updatedRow : r)

          // Nếu là dòng chính (không có parentId), cập nhật các trường chung xuống tất cả dòng con
          if (!formData.parentId) {
            const SHARED_FIELDS = ['projectId', 'duAn', 'khoiTen', 'khoiVietTat', 'maVattu', 'tenVattu', 'dvt', 'nhom', 'quyCachKyThuat']
            const sharedData = {}
            SHARED_FIELDS.forEach(f => { if (updatedRow[f] !== undefined) sharedData[f] = updatedRow[f] })

            currentRowsState = currentRowsState.map(r => {
              if (r.parentId !== formData.id) return r
              const updated = { ...r, ...sharedData, updatedAt: new Date().toISOString() }
              updated.trangThai = calcTrangThai(updated, pcuDays)
              return updated
            })

            if (supabase) {
              const childRows = rows.filter(r => r.parentId === formData.id)
              for (const child of childRows) {
                const childDbRow = toSnakeCase({ ...child, ...sharedData, updatedAt: new Date().toISOString() })
                await supabase.from(TABLES.CHI_TIET_CONG_VIEC).update(childDbRow).eq('id', child.id)
              }
            }
          }
        } else {
          // THÊM MỚI
          const newRow = { 
            ...formData, 
            id: genId(), 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          let finalProjectId = formData.projectId || selectedProjectId
          
          if (!formData.parentId && (!finalProjectId || finalProjectId === 'ALL')) {
            showToast('Lỗi: Bạn phải chọn một Dự án trước khi thêm vật tư', 'error')
            continue
          }

          if (finalProjectId && finalProjectId !== 'ALL') {
            const block = projects.find(b => b.id === finalProjectId)
            if (block) {
              finalProjectId = block.khoiId || block.id
              const vt = block.khoiVietTat || block.vietTat
              newRow.duAn = vt ? `${vt}. ${block.ten}` : block.ten
              newRow.khoiTen = block.khoiTen || block.ten
              newRow.khoiVietTat = block.khoiVietTat || block.vietTat
            }
          }

          newRow.projectId = finalProjectId
          
          if (!formData.parentId) {
            const projectParents = currentRowsState.filter(r => r.projectId === finalProjectId && !r.parentId && r.duAn === newRow.duAn)
            const maxStt = projectParents.length > 0 ? Math.max(0, ...projectParents.map(r => Number(r.stt || 0))) : 0
            newRow.stt = maxStt + 1
          }

          if (formData.parentId) {
            const siblings = currentRowsState.filter(r => r.parentId === formData.parentId)
            newRow.subIdx = siblings.length + 1
            const parentRow = currentRowsState.find(r => r.id === formData.parentId)
            if (parentRow) {
              newRow.stt = parentRow.stt
              const SHARED_FIELDS = ['projectId', 'duAn', 'khoiTen', 'khoiVietTat', 'maVattu', 'tenVattu', 'dvt', 'nhom', 'quyCachKyThuat']
              SHARED_FIELDS.forEach(f => { newRow[f] = parentRow[f] })
            }
          }
          
          newRow.trangThai = calcTrangThai(newRow, pcuDays)
          
          if (supabase) {
            const dbRow = toSnakeCase(newRow)
            if (dbRow.project_id === '') dbRow.project_id = null
            const { error } = await supabase.from(TABLES.CHI_TIET_CONG_VIEC).insert([dbRow])
            if (error) {
              showAlert('Lỗi thêm mới', 'Không thể lưu vào hệ thống: ' + error.message)
              continue
            }
          }

          currentRowsState.push(newRow)
        }
      }
      setRows(currentRowsState)
      showToast('Đã lưu dữ liệu thành công')
    } catch (err) {
      console.error('[App] handleSave exception:', err)
      showToast('Lỗi hệ thống khi lưu dữ liệu', 'error')
    } finally {
      setIsEditOpen(false)
      setEditingRow(null)
    }
  }

  const handleRefresh = () => {
    setRows(prev => recalcAll(prev, pcuDays))
    showToast('Đã tính lại trạng thái')
  }

  const handleUpdateSupplyDate = async (ids, date) => {
    setIsLoading(true)
    const supabase = getSupabase()
    try {
      const updatedRows = rows.map(r => {
        if (ids.includes(r.id)) {
          const updated = { ...r, ngayGuiPcu: date, updatedAt: new Date().toISOString() }
          updated.trangThai = calcTrangThai(updated, pcuDays)
          return updated
        }
        return r
      })

      if (supabase) {
        // Cập nhật từng cái hoặc dùng .in() nếu cấu trúc cho phép, nhưng ở đây toSnakeCase từng cái an toàn hơn
        for (const id of ids) {
          const rowToUpdate = updatedRows.find(r => r.id === id)
          if (rowToUpdate) {
            await supabase
              .from(TABLES.CHI_TIET_CONG_VIEC)
              .update(toSnakeCase(rowToUpdate))
              .eq('id', id)
          }
        }
      }

      setRows(updatedRows)
      showToast(`Đã cập nhật ngày gửi cho ${ids.length} dòng`)
    } catch (err) {
      console.error(err)
      showToast('Lỗi cập nhật: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = (newSettings) => {
    onSaveSettings(newSettings)
    setRows(prev => recalcAll(prev, newSettings.pcuDays || DEFAULT_PCU_DAYS))
    showToast('Đã lưu cài đặt')
  }

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))
  const handleClearFilters  = () => {
    setFilters({ searchVattu: '', tenNcc: 'ALL', nhom: 'ALL', loaiHd: 'ALL', trangThai: 'ALL', dot: '' })
    setSearchGlobal('')
  }

  const handleSort = (key) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') }
    else { setSortKey(key); setSortDir('asc') }
  }

  const uniqueNcc  = useMemo(() => Array.from(new Set(rows.flatMap(r => [r.tenNcc, r.tenNccThucTe]).filter(Boolean))).sort(), [rows])
  const uniqueNhom = useMemo(() => Array.from(new Set(rows.map(r => r.nhom).filter(Boolean))).sort(), [rows])
  const uniqueDot  = useMemo(() => Array.from(new Set(rows.map(r => r.dot).filter(v => v && v !== 'NaN' && !String(v).includes('NaN')))).sort(), [rows])

  const filteredRows = useMemo(() => {
    // Helper to check if a single row matches the filters
    const matches = (r) => {
      if (searchGlobal.trim()) {
        const q = searchGlobal.toLowerCase()
        if (!Object.values(r).some(v => v && String(v).toLowerCase().includes(q))) return false
      }
      if (filters.searchVattu) {
        const q = filters.searchVattu.toLowerCase()
        if (!(r.maVattu || '').toLowerCase().includes(q) && !(r.tenVattu || '').toLowerCase().includes(q)) return false
      }
      if (filters.tenNcc && filters.tenNcc !== 'ALL') {
        if (r.tenNcc !== filters.tenNcc && r.tenNccThucTe !== filters.tenNcc) return false
      }
      if (filters.nhom && filters.nhom !== 'ALL') {
        if (r.nhom !== filters.nhom) return false
      }
      if (filters.loaiHd && filters.loaiHd !== 'ALL') {
        if (r.loaiHd !== filters.loaiHd) return false
      }
      if (filters.trangThai && filters.trangThai !== 'ALL') {
        const statusList = Array.isArray(filters.trangThai) ? filters.trangThai : [filters.trangThai]
        if (!statusList.includes(r.trangThai)) return false
      }
      if (filters.dot) {
        const q = filters.dot.toLowerCase()
        if (!(r.dot || '').toLowerCase().includes(q)) return false
      }
      return true
    }

    const rawParents = rows.filter(r => !r.parentId)
    const rawChildren = rows.filter(r => r.parentId)

    const selectedProjectInfo = selectedProjectId !== 'ALL' ? projects.find(p => p.id === selectedProjectId) : null
    
    // Filter parents by Project Selector
    const projectMatchingParents = rawParents.filter(p => {
      if (!selectedProjectInfo) return true
      if (selectedProjectInfo.khoiId) {
        // Lọc theo Dự án con (so khớp chuỗi tên)
        const vt = selectedProjectInfo.khoiVietTat || selectedProjectInfo.vietTat
        const matchName = vt ? `${vt}. ${selectedProjectInfo.ten}` : selectedProjectInfo.ten
        return (p.duAn || '').trim() === matchName.trim()
      }
      // Lọc theo Khối cha (so khớp ID)
      return p.projectId === selectedProjectId
    })

    const finalResult = []
    
    // Sort project-matching parents
    const sortedParents = [...projectMatchingParents]
    if (sortKey) {
      sortedParents.sort((a, b) => {
        if (sortKey === 'stt') {
          const valA = Number(a.stt || 0)
          const valB = Number(b.stt || 0)
          return sortDir === 'asc' ? valA - valB : valB - valA
        }
        const cmp = String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''), 'vi')
        return sortDir === 'asc' ? cmp : -cmp
      })
    } else {
      sortedParents.sort((a, b) => {
        // Mặc định: Sắp xếp theo STT giảm dần (Lớn -> Nhỏ)
        const sttA = Number(a.stt || 0)
        const sttB = Number(b.stt || 0)
        if (sttA !== sttB) return sttB - sttA
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }

    const getAlphaStt = (idx) => {
      let s = ''
      let n = idx
      while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s
        n = Math.floor(n / 26) - 1
      }
      return s
    }

    // Luôn bật chế độ nhóm (isBlockMode) để hiển thị header A, B, C... cho từng dự án
    const isBlockMode = true

    if (isBlockMode && sortedParents.length > 0) {
      // Nhóm theo Dự án
      const groupsMap = new Map()
      sortedParents.forEach(p => {
        const key = (p.duAn || 'Không xác định').trim()
        if (!groupsMap.has(key)) groupsMap.set(key, [])
        groupsMap.get(key).push(p)
      })

      const sortedKeys = Array.from(groupsMap.keys()).sort((a, b) => a.localeCompare(b, 'vi'))

      sortedKeys.forEach((key, kIdx) => {
        const groupParents = groupsMap.get(key)
        const projectItemsInGroup = []

        groupParents.forEach(p => {
          const pChildren = rawChildren.filter(c => c.parentId === p.id)
          const pMatches = matches(p)
          const matchingChildren = pChildren.filter(c => matches(c))
          
          if (pMatches || matchingChildren.length > 0) {
            // Check if status filter is active to decide if parent is "Context only"
            const isStatusFiltered = filters.trangThai && filters.trangThai !== 'ALL'
            const showParentAsContext = isStatusFiltered && !pMatches
            
            projectItemsInGroup.push({ 
              p: showParentAsContext ? { ...p, isHiddenContext: true } : p, 
              pChildren, 
              matchingChildren, 
              pMatches 
            })
          }
        })

        if (projectItemsInGroup.length > 0) {
          const firstItem = projectItemsInGroup[0].p
          // Dòng tiêu đề dự án: A, B, C...
          finalResult.push({
            id: `group-header-${key}`,
            stt: getAlphaStt(kIdx),
            projectName: key,
            khoiTen: firstItem.khoiTen,
            khoiVietTat: firstItem.khoiVietTat,
            isGroupHeader: true,
            isLocked: true
          })

          projectItemsInGroup.forEach(({ p, pChildren, matchingChildren }) => {
            finalResult.push(p)
            const sortedChildren = [...pChildren].sort((a, b) => {
              const modeA = a.subMode || 'kehoach'
              const modeB = b.subMode || 'kehoach'
              if (modeA === modeB) return (a.subIdx || 0) - (b.subIdx || 0)
              return modeA === 'kehoach' ? -1 : 1
            })
            const isFiltering = searchGlobal.trim() || Object.values(filters).some(v => v && v !== 'ALL' && v !== '')
            if (isFiltering) {
              finalResult.push(...sortedChildren.filter(c => matchingChildren.some(m => m.id === c.id)))
            } else {
              finalResult.push(...sortedChildren)
            }
          })
        }
      })
    } else {
      sortedParents.forEach(p => {
        const pChildren = rawChildren.filter(c => c.parentId === p.id)
        const pMatches = matches(p)
        const matchingChildren = pChildren.filter(c => matches(c))

        if (pMatches || matchingChildren.length > 0) {
          const isStatusFiltered = filters.trangThai && filters.trangThai !== 'ALL'
          const showParentAsContext = isStatusFiltered && !pMatches
          const finalP = showParentAsContext ? { ...p, isHiddenContext: true } : p

          finalResult.push(finalP)
          
          const sortedChildren = [...pChildren].sort((a, b) => {
            const modeA = a.subMode || 'kehoach'
            const modeB = b.subMode || 'kehoach'
            if (modeA === modeB) return (a.subIdx || 0) - (b.subIdx || 0)
            return modeA === 'kehoach' ? -1 : 1
          })
          
          const isFiltering = searchGlobal.trim() || Object.values(filters).some(v => v && v !== 'ALL' && v !== '')
          if (isFiltering) {
            finalResult.push(...sortedChildren.filter(c => matchingChildren.some(m => m.id === c.id)))
          } else {
            finalResult.push(...sortedChildren)
          }
        }
      })
    }

    return finalResult
  }, [rows, searchGlobal, filters, sortKey, sortDir, selectedProjectId, projects])

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsLoading(true)
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb  = XLSX.read(buffer, { type: 'array' })
      const ws  = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 2) { showToast('File trống hoặc không đúng định dạng', 'error'); setIsLoading(false); return }
      
      const headerMap = {
        'Mã Vật tư':'maVattu','Tên vật tư':'tenVattu','Đvt':'dvt','Tên NCC':'tenNcc',
        'Nhóm':'nhom','Loại HĐ':'loaiHd',
        'Quy cách kỹ thuật':'quyCachKyThuat','Đợt':'dot','Khối lượng':'khoiLuong',
        'Ngày gửi PCU':'ngayGuiPcu','Ngày PCU trả':'ngayPcuTra','Ngày ký HĐ':'ngayKyHd',
        'Ngày tạm ứng':'ngayTamUng','Ngày về Dự kiến bắt đầu':'ngayVeDuKienBatDau',
        'Ngày về Dự kiến kết thúc':'ngayVeDuKienKetThuc','Đợt (nhập tay)':'dotNhapTay',
        'Ngày theo nhu cầu BCH':'ngayTheoNhuCauBch','Ngày về thực tế':'ngayVeThucTe',
        'Khối lượng (nhập tay)':'khoiLuongNhapTay','Tên NCC (thực tế)':'tenNccThucTe',
        'Tên chuyên viên phối hợp K.QLVT':'tenChuyenVienKqlvt',
        'Tên CVPCU thực hiện':'tenCvpcuThucHien','Ghi chú':'ghiChu',
      }
      const headers = raw[0].map(h => String(h).trim())
      const colMap  = {}
      headers.forEach((h, i) => { const key = headerMap[h]; if (key) colMap[i] = key })
      
      const newItems = []
      raw.slice(1).filter(r => r.some(v => v !== '')).forEach(r => {
        const obj = { id: genId(), createdAt: new Date().toISOString() }
        let finalPid = selectedProjectId
        if (finalPid !== 'ALL') {
          obj.projectId = finalPid
          const proj = projects.find(p => p.id === finalPid)
          if (proj) {
            const vt = proj.khoiVietTat || proj.vietTat
            obj.duAn = vt ? `${vt}. ${proj.ten}` : proj.ten
            obj.khoiTen = proj.khoiTen || proj.ten
            obj.khoiVietTat = proj.khoiVietTat || proj.vietTat
          }
        }
        Object.entries(colMap).forEach(([i, key]) => { 
          const val = r[i]
          if (key.startsWith('ngay')) {
            obj[key] = formatExcelDate(val)
          } else if (key === 'khoiLuong' || key === 'khoiLuongNhapTay') {
            obj[key] = formatNum(val)
          } else {
            obj[key] = String(val || '').trim() 
          }
        })
        obj.trangThai = calcTrangThai(obj, pcuDays)
        newItems.push(obj)
      })

      setPreviewImport({ newItems, total: raw.length - 1, skipped: 0, errors: [] })
    } catch (err) {
      console.error(err); showToast('Lỗi đọc file Excel', 'error')
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  const confirmGeneralImport = async () => {
    if (!previewImport || previewImport.newItems.length === 0) {
      setPreviewImport(null)
      return
    }
    
    setIsLoading(true)
    const supabase = getSupabase()
    try {
      // CỐ ĐỊNH STT: Tính toán STT cho các dòng mới (Max + 1)
      const sProject = projects.find(p => p.id === selectedProjectId)
      const sProjectName = sProject ? (sProject.khoiVietTat || sProject.vietTat ? `${sProject.khoiVietTat || sProject.vietTat}. ${sProject.ten}` : sProject.ten) : ''
      const projectParents = rows.filter(r => !r.parentId && r.projectId === (sProject?.khoiId || selectedProjectId) && r.duAn === sProjectName)
      const maxStt = projectParents.length > 0 ? Math.max(0, ...projectParents.map(r => Number(r.stt || 0))) : 0
      let nextStt = maxStt + 1
      
      const newItemsWithStt = previewImport.newItems.map(item => {
        if (!item.parentId) {
          const updated = { ...item, stt: nextStt++ }
          return updated
        }
        return item
      })

      const dbRows = newItemsWithStt.map(toSnakeCase)
      const { error: insertErr } = await supabase.from(TABLES.CHI_TIET_CONG_VIEC).insert(dbRows)
      if (insertErr) {
        showAlert('Lỗi lưu dữ liệu', 'Không thể lưu danh sách import vào hệ thống. Chi tiết: ' + insertErr.message)
      } else {
        setRows(prev => [...prev, ...newItemsWithStt])
        showToast(`Đã import ${newItemsWithStt.length} dòng thành công`)
        setPreviewImport(null)
      }
    } catch (err) {
      showToast('Lỗi khi lưu dữ liệu: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const [previewImport, setPreviewImport] = useState(null)
  const [previewUpVattu, setPreviewUpVattu] = useState(null) // { newItems, errors, skipped, total }
  const [previewUpKeHoach, setPreviewUpKeHoach] = useState(null) // { newItems, errors, skipped, total }
  
  const handleUpdatePreviewItem = (type, idx, field, value) => {
    if (type === 'kehoach') {
      setPreviewUpKeHoach(prev => {
        if (!prev) return prev;
        const newItems = [...prev.newItems];
        newItems[idx] = { ...newItems[idx], [field]: value };
        return { ...prev, newItems };
      });
    } else if (type === 'vattu') {
      setPreviewUpVattu(prev => {
        if (!prev) return prev;
        const newItems = [...prev.newItems];
        newItems[idx] = { ...newItems[idx], [field]: value };
        return { ...prev, newItems };
      });
    } else if (type === 'import') {
      setPreviewImport(prev => {
        if (!prev) return prev;
        const newItems = [...prev.newItems];
        newItems[idx] = { ...newItems[idx], [field]: value };
        return { ...prev, newItems };
      });
    }
  }

  const handleDeletePreviewItem = (type, idx) => {
    if (type === 'kehoach') {
      setPreviewUpKeHoach(prev => {
        if (!prev) return prev;
        const newItems = prev.newItems.filter((_, i) => i !== idx);
        return { ...prev, newItems };
      });
    } else if (type === 'vattu') {
      setPreviewUpVattu(prev => {
        if (!prev) return prev;
        const newItems = prev.newItems.filter((_, i) => i !== idx);
        return { ...prev, newItems };
      });
    } else if (type === 'import') {
      setPreviewImport(prev => {
        if (!prev) return prev;
        const newItems = prev.newItems.filter((_, i) => i !== idx);
        return { ...prev, newItems };
      });
    }
  }

  const handleUpVatTu = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const supabase = getSupabase()
    if (!supabase) {
      showToast('Hệ thống chưa kết nối cơ sở dữ liệu', 'error')
      return
    }

    try {
      setIsLoading(true)
      // 1. Fetch toàn bộ danh mục vật tư để so khớp
      const dmData = await fetchAll(supabase, TABLES.DM_VATTU)
      if (!dmData || dmData.length === 0) {
        showToast('Danh mục vật tư trống. Vui lòng kiểm tra lại.', 'error')
        setIsLoading(false)
        return
      }
      const dmDict = {}
      dmData.forEach(item => {
        const code = String(item.ma_vattu_sap || '').trim().toUpperCase()
        if (code) dmDict[code] = item
      })

      // 2. Đọc file Excel
      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 2) {
        showToast('File trống hoặc không có tiêu đề', 'error')
        setIsLoading(false)
        return
      }

      const headers = raw[0].map(h => h ? String(h).trim().toLowerCase() : '')
      
      // Strict validation for bulk upload template: exactly one column "Mã vật tư"
      const meaningfulHeaders = headers.filter(h => h !== '');
      if (meaningfulHeaders.length !== 1 || meaningfulHeaders[0] !== 'mã vật tư') {
        showToast('File không đúng định dạng mẫu (Yêu cầu duy nhất 1 cột "Mã vật tư").', 'error')
        setIsLoading(false)
        return
      }

      const maVattuIdx = headers.indexOf('mã vật tư')

      // Thông tin dự án hiện tại
      const selectedProject = projects.find(p => p.id === selectedProjectId)
      if (!selectedProject || !selectedProject.khoiId) {
        showToast('Chưa xác định được Khối thi công.', 'error')
        setIsLoading(false)
        return
      }

      const projId = selectedProject.khoiId
      const vt = selectedProject.khoiVietTat || selectedProject.vietTat
      const duAnName = vt ? `${vt}. ${selectedProject.ten}` : selectedProject.ten
      const khoiTen = selectedProject.khoiTen || selectedProject.ten
      const khoiVietTat = selectedProject.khoiVietTat || selectedProject.vietTat

      // 4. Kiểm tra trùng lặp trong dự án hiện tại (CHỈ XÉT TRONG CÙNG DỰ ÁN CỤ THỂ)
      const existingCodesInProject = new Set(
        rows
          .filter(r => !r.parentId && r.maVattu && r.projectId === projId && r.duAn === duAnName)
          .map(r => String(r.maVattu).trim().toUpperCase())
      )

      // 5. So khớp và tạo bản ghi mới
      const newItems = []
      const fileCodes = new Set()
      const errors = []
      let skippedCount = 0

      for (let i = 1; i < raw.length; i++) {
        const row = raw[i]
        if (!row || row.length === 0) continue
        const codeValue = String(row[maVattuIdx] || '').trim().toUpperCase()
        if (!codeValue) continue

        // Kiểm tra trùng lặp nội bộ trong file
        if (fileCodes.has(codeValue)) {
          skippedCount++
          continue
        }
        fileCodes.add(codeValue)

        // Kiểm tra trùng lặp với dữ liệu đã có trong dự án
        if (existingCodesInProject.has(codeValue)) {
          skippedCount++
          continue
        }

        const matchedVattu = dmDict[codeValue]
        if (matchedVattu) {
          const newRow = {
            id: genId(),
            projectId: projId,
            duAn: duAnName,
            khoiTen: khoiTen,
            khoiVietTat: khoiVietTat,
            maVattu: matchedVattu.ma_vattu_sap,
            tenVattu: matchedVattu.ten_vattu,
            dvt: matchedVattu.dvt,
            nhom: matchedVattu.loai_vattu || 'Vật tư chính',
            quyCachKyThuat: matchedVattu.thong_so_ky_thuat || '',
            tenChuyenVienKqlvt: user?.hoTen || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            trangThai: TRANG_THAI.CHO_XU_LY 
          }
          newItems.push(newRow)
        } else {
          errors.push(codeValue)
        }
      }

      // Luôn hiện preview nếu có dữ liệu để người dùng biết tại sao không thêm được (trùng/lỗi)
      setPreviewUpVattu({ newItems, errors, skipped: skippedCount, total: raw.length - 1 })

    } catch (err) {
      console.error(err)
      showToast('Lỗi khi xử lý file: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  const confirmUpVatTu = async () => {
    if (!previewUpVattu || previewUpVattu.newItems.length === 0) {
      setPreviewUpVattu(null)
      return
    }
    
    setIsLoading(true)
    const supabase = getSupabase()
    try {
      // CỐ ĐỊNH STT: Tính toán STT cho các dòng mới trong dự án hiện tại (Max + 1)
      const sProj = projects.find(p => p.id === selectedProjectId)
      const sProjName = sProj ? (sProj.khoiVietTat || sProj.vietTat ? `${sProj.khoiVietTat || sProj.vietTat}. ${sProj.ten}` : sProj.ten) : ''
      const projectParents = rows.filter(r => !r.parentId && r.projectId === (sProj?.khoiId || selectedProjectId) && r.duAn === sProjName)
      const maxStt = projectParents.length > 0 ? Math.max(0, ...projectParents.map(r => Number(r.stt || 0))) : 0
      let nextStt = maxStt + 1
      
      const newItemsWithStt = previewUpVattu.newItems.map(item => {
        const updated = { ...item, stt: nextStt++ }
        return updated
      })

      const dbRows = newItemsWithStt.map(toSnakeCase)
      const { error: insertErr } = await supabase.from(TABLES.CHI_TIET_CONG_VIEC).insert(dbRows)
      if (insertErr) {
        showAlert('Lỗi lưu dữ liệu', 'Không thể lưu danh sách vật tư vào hệ thống. Chi tiết: ' + insertErr.message)
      } else {
        setRows(prev => [...prev, ...newItemsWithStt])
        showToast(`Đã thêm ${newItemsWithStt.length} vật tư vào dự án.`)
        setPreviewUpVattu(null)
      }
    } catch (err) {
      showToast('Lỗi khi lưu dữ liệu: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpKeHoachVatTu = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const supabase = getSupabase()
    if (!supabase) {
      showToast('Hệ thống chưa kết nối cơ sở dữ liệu', 'error')
      return
    }

    try {
      setIsLoading(true)
      const dmData = await fetchAll(supabase, TABLES.DM_VATTU)
      if (!dmData || dmData.length === 0) {
        showToast('Danh mục vật tư trống.', 'error')
        setIsLoading(false)
        return
      }
      const dmDict = {}
      dmData.forEach(item => {
        const code = String(item.ma_vattu_sap || '').trim().toUpperCase()
        if (code) dmDict[code] = item
      })

      const XLSX = await loadXLSX()
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      if (raw.length < 2) {
        showToast('File trống hoặc không có tiêu đề', 'error')
        setIsLoading(false)
        return
      }

      const headers = raw[0].map(h => h ? String(h).trim().toLowerCase() : '')
      
      const findIdx = (keywords, exactOnly = false) => {
        let idx = headers.findIndex(h => keywords.some(k => h === k))
        if (idx === -1 && !exactOnly) {
           idx = headers.findIndex(h => keywords.some(k => h.includes(k)))
        }
        return idx
      }

      const maVattuIdx = findIdx(['mã vật tư', 'mã sap', 'sap', 'ma_vattu_sap', 'ma_vattu'], false)
      const loaiHdIdx = findIdx(['loại hđ', 'loai_hd', 'loại hợp đồng'], false)
      const khoiLuongIdx = findIdx(['khối lượng', 'khoi_luong', 'số lượng'], false)
      const cbptIdx = findIdx(['cán bộ phụ trách', 'chuyên viên p. qlvt', 'cv pcu', 'thực hiện', 'cvpcu', 'người thực hiện'], false)
      const cbPcuIdx = findIdx(['cán bộ pcu', 'cb pcu', 'can_bo_pcu'], false)
      const dotIdx = findIdx(['đợt kế hoạch', 'đợt', 'dot'], false)
      const batDauIdx = findIdx(['ngày dự kiến bắt đầu', 'dự kiến bắt đầu', 'ngày bắt đầu', 'bat_dau', 'ngày bđ'], false)
      const ketThucIdx = findIdx(['ngày dự kiến kết thúc', 'dự kiến kết thúc', 'ngày kết thúc', 'ket_thuc', 'ngày kt'], false)

      if (maVattuIdx === -1) {
        showToast('Không tìm thấy cột "Mã vật tư".', 'error')
        setIsLoading(false)
        return
      }

      const selectedProject = projects.find(p => p.id === selectedProjectId)
      if (!selectedProject || !selectedProject.khoiId) {
        showToast('Chưa chọn dự án hợp lệ.', 'error')
        setIsLoading(false)
        return
      }

      const projId = selectedProject.khoiId
      const vt = selectedProject.khoiVietTat || selectedProject.vietTat
      const duAnName = vt ? `${vt}. ${selectedProject.ten}` : selectedProject.ten
      const khoiTen = selectedProject.khoiTen || selectedProject.ten
      const khoiVietTat = selectedProject.khoiVietTat || selectedProject.vietTat

      const existingCodesInProject = new Set(
        rows.filter(r => !r.parentId && r.maVattu).map(r => String(r.maVattu).trim().toUpperCase())
      )

      const newItems = []
      const fileCodes = new Set()
      const errors = []
      const missingInProject = []
      let skippedCount = 0

      for (let i = 1; i < raw.length; i++) {
        const row = raw[i]
        if (!row || row.length === 0) continue
        const codeValue = String(row[maVattuIdx] || '').trim().toUpperCase()
        if (!codeValue) continue

        if (fileCodes.has(codeValue)) { skippedCount++; continue }
        fileCodes.add(codeValue)

        const matchedVattu = dmDict[codeValue]
        if (matchedVattu) {
          // Tìm xem vật tư này đã có trong danh mục của dự án hiện tại chưa
          const existingParent = rows.find(r => 
            !r.parentId && 
            r.projectId === projId && 
            r.duAn === duAnName && 
            String(r.maVattu).trim().toUpperCase() === codeValue
          )

          const newRow = {
            id: genId(),
            projectId: projId,
            duAn: duAnName,
            khoiTen: khoiTen,
            khoiVietTat: khoiVietTat,
            maVattu: matchedVattu.ma_vattu_sap,
            tenVattu: matchedVattu.ten_vattu,
            dvt: matchedVattu.dvt,
            nhom: matchedVattu.loai_vattu || 'Vật tư chính',
            quyCachKyThuat: matchedVattu.thong_so_ky_thuat || '',
            tenChuyenVienKqlvt: user?.hoTen || '',
            
            // Plan fields
            loaiHd: loaiHdIdx !== -1 ? String(row[loaiHdIdx] || '').trim() : '',
            khoiLuong: khoiLuongIdx !== -1 ? formatNum(row[khoiLuongIdx]) : '',
            tenCvpcuThucHien: cbptIdx !== -1 ? String(row[cbptIdx] || '').trim() : '',
            tenCpcuPcu: cbPcuIdx !== -1 ? String(row[cbPcuIdx] || '').trim() : '',
            dot: dotIdx !== -1 ? String(row[dotIdx] || '').trim() : '',
            ngayVeDuKienBatDau: batDauIdx !== -1 ? formatExcelDate(row[batDauIdx]) : '',
            ngayVeDuKienKetThuc: ketThucIdx !== -1 ? formatExcelDate(row[ketThucIdx]) : '',

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          if (existingParent) {
            newRow.parentId = existingParent.id
            const siblings = rows.filter(r => r.parentId === existingParent.id)
            const previewSiblings = newItems.filter(r => r.parentId === existingParent.id)
            newRow.subIdx = siblings.length + previewSiblings.length + 1
            newRow.subMode = 'kehoach' 
          } else {
            // Không tìm thấy trong dự án chính
            missingInProject.push(codeValue)
            newRow.missingInProject = true
            
            // Tính STT cho dòng cha mới (mặc dù thực tế người dùng muốn nó phải có sẵn)
            const projectParents = rows.filter(r => !r.parentId && r.projectId === projId && r.duAn === duAnName)
            const previewParents = newItems.filter(r => !r.parentId && r.projectId === projId && r.duAn === duAnName)
            const maxStt = Math.max(0, ...projectParents.map(r => Number(r.stt || 0)), ...previewParents.map(r => Number(r.stt || 0)))
            newRow.stt = maxStt + 1
          }

          newRow.trangThai = calcTrangThai(newRow, pcuDays)
          newItems.push(newRow)
        } else {
          errors.push(codeValue)
        }
      }

      setPreviewUpKeHoach({ newItems, errors, missingInProject, skipped: skippedCount, total: raw.length - 1 })
    } catch (err) {
      console.error(err)
      showToast('Lỗi xử lý file: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }

  const confirmUpKeHoachVatTu = async () => {
    if (!previewUpKeHoach || previewUpKeHoach.newItems.length === 0) {
      setPreviewUpKeHoach(null)
      return
    }

    // Safety check again before saving
    const hasAnyError = previewUpKeHoach.newItems.some((item, idx) => {
      const maVattu = (item.maVattu || '').trim().toUpperCase();
      const dot = (item.dot || '').trim().toUpperCase();
      const pid = (item.projectId || '').trim();
      
      // Check for internal duplicates in the batch
      const currentKeys = previewUpKeHoach.newItems.map(it => {
        const m = (it.maVattu || '').trim().toUpperCase();
        const d = (it.dot || '').trim().toUpperCase();
        const p = (it.projectId || '').trim();
        return m && d && p ? `${p}_${m}_${d}` : null;
      });
      
      const key = maVattu && dot && pid ? `${pid}_${maVattu}_${dot}` : null;
      const isInternalDup = key && currentKeys.indexOf(key) !== idx;
      
      return !item.loaiHd || !item.khoiLuong || !item.dot || !item.ngayVeDuKienBatDau || !item.ngayVeDuKienKetThuc || isInternalDup;
    });

    if (hasAnyError) {
      showToast('Vui lòng kiểm tra lại dữ liệu: còn lỗi hoặc trùng lặp (Mã + Đợt) trong dự án.', 'error');
      return;
    }

    setIsLoading(true)
    const supabase = getSupabase()
    try {
      const dbRows = previewUpKeHoach.newItems.map(toSnakeCase)
      const { error: insertErr } = await supabase.from(TABLES.CHI_TIET_CONG_VIEC).insert(dbRows)
      if (insertErr) {
        showAlert('Lỗi lưu dữ liệu', 'Không thể lưu danh sách kế hoạch vào hệ thống. Chi tiết: ' + insertErr.message)
      } else {
        setRows(prev => [...prev, ...previewUpKeHoach.newItems])
        showToast(`Đã đồng bộ ${previewUpKeHoach.newItems.length} kế hoạch vật tư vào dự án.`)
        setPreviewUpKeHoach(null)
      }
    } catch (err) {
      showToast('Lỗi khi lưu dữ liệu: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTemplateBulk = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default || await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Mau_Up_Hang_Loat');
      
      const headers = ['Mã vật tư'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
        cell.alignment = { horizontal: 'center' };
      });
      worksheet.getColumn(1).width = 25;
      worksheet.addRow(['VI025287']);
      worksheet.addRow(['VI031475']);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mau_Up_Vat_Tu_Hang_Loat.xlsx`;
      a.click();
    } catch (err) {
      showToast('Lỗi tải file mẫu: ' + err.message, 'error');
    }
  }

  const handleDownloadTemplatePlan = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default || await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Mau_Up_Ke_Hoach');
      
      const headers = ['Mã vật tư', 'Loại HĐ', 'Khối lượng', 'Cán bộ phụ trách', 'Cán bộ PCU', 'Đợt kế hoạch', 'Ngày dự kiến bắt đầu', 'Ngày dự kiến kết thúc'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2740B' } };
        cell.alignment = { horizontal: 'center' };
      });
      
      worksheet.columns.forEach(col => col.width = 25);
      worksheet.addRow(['VI025751', 'Trọn gói', '100', 'Nguyễn Văn A', 'Trần Thị C', 'Đợt 1', '2024-05-20', '2024-06-20']);
      worksheet.addRow(['VI001485', 'Đơn giá', '50', 'Lê Văn B', 'Phạm Văn D', 'Đợt 2', '2024-05-25', '2024-06-25']);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mau_Up_Ke_Hoach_Vat_Tu.xlsx`;
      a.click();
    } catch (err) {
      showToast('Lỗi tải file mẫu: ' + err.message, 'error');
    }
  }

  const handleExport = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default || await import('exceljs');
      const { saveAs } = await import('file-saver');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Chi tiết công việc');

      // 1. Phân loại cột từ DataTable.jsx
      const infoCols = COLUMNS.filter(c => c.vung === 'info')
      const keHoachCols = COLUMNS.filter(c => c.vung === 'kehoach')
      const thucTeCols = COLUMNS.filter(c => c.vung === 'thucte')
      const allCols = [...infoCols, ...keHoachCols, ...thucTeCols]

      // 2. Dòng 1: Header Nhóm (Nội dung, Kế hoạch, Thực tế)
      const headerGroupRow = worksheet.addRow([])
      headerGroupRow.height = 30
      
      const setGroupHeader = (startIdx, length, label, color) => {
        const startCol = startIdx + 1
        const endCol = startIdx + length
        worksheet.mergeCells(1, startCol, 1, endCol)
        const cell = worksheet.getCell(1, startCol)
        cell.value = label
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: color.replace('#', 'FF') }
        }
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        }
      }

      setGroupHeader(0, infoCols.length, '📄 Nội dung', '#0f51cc')
      setGroupHeader(infoCols.length, keHoachCols.length, '📋 Kế hoạch', '#f2740b')
      setGroupHeader(infoCols.length + keHoachCols.length, thucTeCols.length, '✅ Thực tế', '#10a45b')

      // 3. Dòng 2: Header Cột
      const headerLabels = allCols.map(c => {
        if (c.key === 'tenChuyenVienKqlvt') return "Chuyên viên\nP. QLVT"
        if (c.key === 'khoiLuongConThieu') return "Khối lượng\ncòn thiếu"
        return c.label
      })
      const headerRow = worksheet.addRow(headerLabels)
      headerRow.height = 25
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const colDef = allCols[colNumber - 1]
        let bgColor = '#0f51cc'
        if (colDef.vung === 'kehoach') bgColor = '#f2740b'
        if (colDef.vung === 'thucte') bgColor = '#10a45b'

        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor.replace('#', 'FF') }
        }
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        }
      })

      // Enable Auto Filter for the second row (headers)
      worksheet.autoFilter = {
        from: { row: 2, column: 1 },
        to: { row: 2, column: allCols.length }
      }

      // Set column widths
      worksheet.columns = allCols.map(c => ({ width: c.width / 7 }))

      // 4. Data Rows
      const currentParents = filteredRows.filter(r => !r.parentId && !r.isGroupHeader)
      const totalParents = currentParents.length

      filteredRows.forEach((r) => {
        // Skip hidden context rows just like in the UI
        if (r.isHiddenContext) return

        if (r.isGroupHeader) {
          const khoiName = r.khoiTen || ''
          let displayProjectName = r.projectName || ''
          if (r.khoiVietTat && displayProjectName.startsWith(`${r.khoiVietTat}. `)) {
            displayProjectName = displayProjectName.substring(r.khoiVietTat.length + 2)
          }
          const label = `📁 KHỐI THI CÔNG ${khoiName} - DỰ ÁN ${displayProjectName}`
          
          const groupRow = worksheet.addRow([])
          groupRow.height = 30
          
          // Merge all cells for the group header
          worksheet.mergeCells(groupRow.number, 1, groupRow.number, allCols.length)
          
          const firstCell = groupRow.getCell(1)
          firstCell.value = `${r.stt}. ${label}`
          firstCell.font = { bold: true, size: 12, italic: true, color: { argb: 'FF1E3A8A' } }
          firstCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE2E8F0' } // bg-slate-200
          }
          firstCell.alignment = { vertical: 'middle', horizontal: 'left' }
          firstCell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          }
          return
        }

        const pInfo = projects.find(p => p.id === r.projectId)
        const duAnStr = r.duAn || (pInfo ? (pInfo.khoiVietTat ? `${pInfo.khoiVietTat}. ${pInfo.ten}` : pInfo.ten) : '')
        const khoiStr = r.khoiTen || (pInfo ? (pInfo.khoiTen || '') : '')

        const klForExport = r.computedKL !== undefined ? r.computedKL : r.khoiLuong
        const klntForExport = r.computedKLNT !== undefined ? r.computedKLNT : r.khoiLuongNhapTay

        // STT Logic matching DataTable.jsx
        let displayStt = ''
        if (r.parentId) {
          const parent = rows.find(x => x.id === r.parentId)
          if (parent) {
            const pSttValue = parent.stt !== undefined ? parent.stt : (totalParents - currentParents.indexOf(parent))
            displayStt = `${pSttValue}.${r.subIdx || 1}`
          }
        } else {
          displayStt = r.stt !== undefined ? r.stt : (totalParents - currentParents.indexOf(r))
        }

        const rowData = allCols.map(col => {
          if (col.key === 'stt') return displayStt
          if (col.key === 'khoiThiCong') return khoiStr
          if (col.key === 'projectName') return duAnStr
          if (col.key === 'khoiLuongConThieu') return !r.parentId ? (calcKhoiLuongConThieu(klForExport, klntForExport) || '') : ''
          if (col.key === 'khoiLuong') return klForExport
          if (col.key === 'khoiLuongNhapTay') return klntForExport
          
          return r[col.key] || ''
        })

        const excelRow = worksheet.addRow(rowData)
        // Remove fixed height to allow auto-row height for wrapped text in Excel

        // Styling rows - MUST include empty cells to ensure borders and background colors are applied
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const colDef = allCols[colNumber - 1]
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
          }
          cell.alignment = { vertical: 'middle', horizontal: colDef.center ? 'center' : 'left', wrapText: true }

          if (!r.parentId) {
            // Dòng chính
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFBFBFB' }
            }
            cell.font = { bold: true, color: { argb: 'FF000000' } }
          } else {
            // Dòng phụ
            if (r.subMode === 'thucte') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }
              cell.font = { color: { argb: 'FF065F46' } }
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
              cell.font = { color: { argb: 'FF78350F' } }
            }
          }
          
          // Specific column formatting
          if (colDef.key === 'maVattu') {
            cell.font = { ...cell.font, bold: !r.parentId }
          }
          if (colDef.key === 'khoiLuongConThieu') {
             // Always Red as per request
             cell.font = { ...cell.font, color: { argb: 'FFFF0000' } }
          }
        })
      })

      // Freeze headers
      worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 2, activePane: 'bottomRight', selType: 'cell' }]

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `ChiTietCongViec_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`)
      showToast('Xuất Excel thành công')
    } catch (err) {
      console.error(err); showToast('Lỗi xuất Excel: ' + err.message, 'error')
    }
  }

  return (
    <>
      <Header
        onAddNew={handleAddNew} onExport={handleExport} onImport={handleImport}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalRows={rows.length} filteredRows={filteredRows.length}
        searchGlobal={searchGlobal} onSearchGlobal={setSearchGlobal}
        onRefresh={handleRefresh}
        branding={branding}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onOpenSidebar={onOpenSidebar}
      />

      <StatsBar rows={filteredRows} />

      <FilterBar
        filters={filters} onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        uniqueNcc={uniqueNcc} uniqueNhom={uniqueNhom} uniqueDot={uniqueDot}
        onAddNew={handleAddNew}
        onUpVatTu={handleUpVatTu}
        onUpKeHoach={handleUpKeHoachVatTu}
        onDownloadTemplateBulk={handleDownloadTemplateBulk}
        onDownloadTemplatePlan={handleDownloadTemplatePlan}
        onOpenSupplyModal={() => setIsSupplyModalOpen(true)}
        selectedProjectId={selectedProjectId}
        projects={projects}
      />

      {/* Info bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-1 flex items-center justify-between text-[12px] text-slate-500">
        <span>
          Hiển thị <span className="font-bold text-royal-600">{filteredRows.length}</span>
          {' '}/ <span className="font-semibold text-slate-700">{rows.length}</span> dòng
        </span>
        {filteredRows.length !== rows.length && (
          <span className="flex items-center gap-1 text-royal-500 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-royal-400 inline-block" />
            Đang lọc
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-white/50 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Đang đồng bộ dữ liệu...</span>
            </div>
          </div>
        )}
        <DataTable
          rows={filteredRows} projects={projects} onEdit={handleEdit} onDelete={handleDelete}
          onAddSubRow={handleAddSubRow}
          pcuDays={pcuDays} currentUser={settings.currentUser}
          sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
        />
      </div>

      <EditModal
        isOpen={isEditOpen} initialData={editingRow}
        onClose={() => { setIsEditOpen(false); setEditingRow(null) }}
        onSave={handleSave} currentUser={user?.hoTen || settings.currentUser || ''}
        projects={projects} existingRows={rows}
        onAddSubRow={handleAddSubRow}
        onDelete={handleDelete}
      />

      <SettingsModal
        isOpen={isSettingsOpen} settings={settings}
        onClose={() => setIsSettingsOpen(false)} onSave={handleSaveSettings}
        user={user}
      />

      <PreviewUpVatTuModal
        data={previewImport}
        type="import"
        existingRows={rows}
        onConfirm={confirmGeneralImport}
        onCancel={() => setPreviewImport(null)}
        onUpdateItem={(idx, f, v) => handleUpdatePreviewItem('import', idx, f, v)}
        onDeleteItem={(idx) => handleDeletePreviewItem('import', idx)}
        projectName={projects.find(p => p.id === selectedProjectId)?.ten || ''}
        projectAbbr={projects.find(p => p.id === selectedProjectId)?.vietTat || projects.find(p => p.id === selectedProjectId)?.khoiVietTat || ''}
      />

      <PreviewUpVatTuModal
        data={previewUpVattu}
        existingRows={rows}
        onConfirm={confirmUpVatTu}
        onCancel={() => setPreviewUpVattu(null)}
        onUpdateItem={(idx, f, v) => handleUpdatePreviewItem('vattu', idx, f, v)}
        onDeleteItem={(idx) => handleDeletePreviewItem('vattu', idx)}
        projectName={projects.find(p => p.id === selectedProjectId)?.ten || ''}
        projectAbbr={projects.find(p => p.id === selectedProjectId)?.vietTat || projects.find(p => p.id === selectedProjectId)?.khoiVietTat || ''}
      />

      <PreviewUpVatTuModal
        data={previewUpKeHoach}
        type="kehoach"
        existingRows={rows}
        onConfirm={confirmUpKeHoachVatTu}
        onCancel={() => setPreviewUpKeHoach(null)}
        onUpdateItem={(idx, f, v) => handleUpdatePreviewItem('kehoach', idx, f, v)}
        onDeleteItem={(idx) => handleDeletePreviewItem('kehoach', idx)}
        projectName={projects.find(p => p.id === selectedProjectId)?.ten || ''}
        projectAbbr={projects.find(p => p.id === selectedProjectId)?.vietTat || projects.find(p => p.id === selectedProjectId)?.khoiVietTat || ''}
      />

      {confirmDelete && (
        <ConfirmModal
          isOpen={!!confirmDelete}
          title={confirmDelete.title}
          subtitle="Hành động này không thể hoàn tác"
          message={confirmDelete.message}
          type="danger"
          icon={Trash2}
          onConfirm={() => performDelete(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {alertInfo && (
        <ConfirmModal
          isOpen={!!alertInfo}
          title={alertInfo.title}
          subtitle="Thông báo hệ thống"
          message={alertInfo.message}
          type={alertInfo.type}
          icon={alertInfo.icon}
          confirmText="Đã hiểu"
          onConfirm={() => setAlertInfo(null)}
          onClose={() => setAlertInfo(null)}
          cancelText="Đóng"
        />
      )}

      {toast && (
        <div className={`toast-enter fixed bottom-6 right-6 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-[14px] font-semibold ${
          toast.type === 'error'
            ? 'bg-rose-500 text-white border-rose-400/50 shadow-rose-500/25'
            : 'bg-white text-slate-800 border-slate-200 shadow-slate-900/15'
        }`}>
          <span className="text-[16px]">{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.message}
        </div>
      )}

      <SupplySentDateModal
        isOpen={isSupplyModalOpen}
        onClose={() => setIsSupplyModalOpen(false)}
        rows={(() => {
          // Chỉ lấy các dòng phụ thuộc dự án đang chọn
          const selectedProjectInfo = projects.find(p => p.id === selectedProjectId)
          if (!selectedProjectInfo) return []
          
          let duAnMatchName = ''
          if (selectedProjectInfo.khoiId) {
             const vt = selectedProjectInfo.khoiVietTat || selectedProjectInfo.vietTat
             duAnMatchName = vt ? `${vt}. ${selectedProjectInfo.ten}` : selectedProjectInfo.ten
          }

          return rows.filter(r => {
            if (!r.parentId) return false
            if (selectedProjectInfo.khoiId) {
              return (r.duAn || '').trim() === duAnMatchName.trim()
            }
            return r.projectId === selectedProjectId
          })
        })()}
        projectName={projects.find(p => p.id === selectedProjectId)?.ten || ''}
        projectAbbr={projects.find(p => p.id === selectedProjectId)?.vietTat || projects.find(p => p.id === selectedProjectId)?.khoiVietTat || ''}
        onUpdate={handleUpdateSupplyDate}
      />
    </>
  )
}

function ComingSoonSheet({ title, icon: Icon, color }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-slate-50/50">
      <div className={`w-20 h-20 rounded-3xl ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-10 h-10 text-white opacity-80" />
      </div>
      <div className="text-center">
        <h2 className="text-[18px] font-black text-slate-700 mb-1">{title}</h2>
        <p className="text-slate-400 text-[14px]">Module này đang được phát triển</p>
      </div>
      <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 text-[14px] font-semibold shadow-sm">
        🚧 Sắp ra mắt
      </div>
    </div>
  )
}

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true)
  const [activeSheet, setActiveSheet] = useState('chi-tiet-cong-viec')
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('SGC_AUTH_USER_v1')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })

  const [branding, setBranding] = useState(() => {
    try {
      const d = localStorage.getItem(LOGO_CONFIG_KEY)
      return d ? JSON.parse(d) : DEFAULT_BRANDING
    } catch { return DEFAULT_BRANDING }
  })

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Đảm bảo app không bao giờ bị treo màn hình trắng — timeout tối đa 5 giây
    const safetyTimer = setTimeout(() => {
      setIsAppLoading(false)
    }, 5000)

    async function init() {
      try {
        const supabase = getSupabase()
        if (!supabase) {
          clearTimeout(safetyTimer)
          await new Promise(r => setTimeout(r, 600))
          setIsAppLoading(false)
          return
        }

        // Fetch system config (id=1)
        try {
          const { data, error } = await supabase.from(TABLES.LOGO).select('*').eq('id', 1).maybeSingle()
          
          if (!error && data) {
            const config = {
              logoUrl: data.logourl || DEFAULT_BRANDING.logoUrl,
              appName: data.appname || DEFAULT_BRANDING.appName,
              primaryColor: data.primarycolor || DEFAULT_BRANDING.primaryColor,
            }
            setBranding(config)
            localStorage.setItem(LOGO_CONFIG_KEY, JSON.stringify(config))
            
            if (data.pcudays !== undefined && data.pcudays !== null) {
              setSettings(prev => {
                const updated = { ...prev, pcuDays: data.pcudays }
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
                return updated
              })
            }
          }
        } catch (fetchErr) {
          console.warn('System config fetch failed:', fetchErr.message)
        }

        await new Promise(r => setTimeout(r, 600))
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        clearTimeout(safetyTimer)
        setIsAppLoading(false)
      }
    }

    init()

    return () => clearTimeout(safetyTimer)
  }, [])

  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY)
      return s ? JSON.parse(s) : { pcuDays: DEFAULT_PCU_DAYS, currentUser: '' }
    } catch { return { pcuDays: DEFAULT_PCU_DAYS, currentUser: '' } }
  })

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    const channel = supabase
      .channel('rt-system-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.LOGO }, (payload) => {
        console.log('[Realtime] Logo table change:', payload)
        const data = payload.new || payload.old
        if (data && data.id === 1) {
          if (data.pcudays !== undefined && data.pcudays !== null) {
            setSettings(prev => {
              const updated = { ...prev, pcuDays: data.pcudays }
              localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
              return updated
            })
          }
          if (data.logourl || data.appname || data.primarycolor) {
            setBranding(prev => {
              const config = {
                logoUrl: data.logourl || prev.logoUrl,
                appName: data.appname || prev.appName,
                primaryColor: data.primarycolor || prev.primaryColor,
              }
              localStorage.setItem(LOGO_CONFIG_KEY, JSON.stringify(config))
              return config
            })
          }
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))

    // Persist to Supabase for global application
    const supabase = getSupabase()
    if (supabase) {
      try {
        // Fetch current to avoid overwriting branding
        const { data: current, error: fetchErr } = await supabase.from(TABLES.LOGO).select('*').eq('id', 1).maybeSingle()
        
        const payload = {
          id: 1,
          pcudays: newSettings.pcuDays ?? 7,
          logourl: current?.logourl || branding.logoUrl || '',
          appname: current?.appname || branding.appName || '',
          primarycolor: current?.primarycolor || branding.primaryColor || '',
          updated_at: new Date().toISOString()
        }
        
        console.log('[App] Saving global settings:', payload)
        const { error: saveErr } = await supabase.from(TABLES.LOGO).upsert([payload])
        
        if (saveErr) {
          console.error('[App] Supabase settings save error:', saveErr)
          // Alert user that cloud sync failed
          alert(`Lưu ngoại tuyến thành công nhưng không thể đồng bộ lên đám mây: ${saveErr.message}. Vui lòng kiểm tra kết nối hoặc bảng ad_cau_hinh_logo.`)
        } else {
          console.log('[App] Global settings synced successfully')
        }
      } catch (err) {
        console.error('[App] Failed to sync settings to cloud:', err)
      }
    }
  }

  const handleLogin = (newUser) => {
    setUser(newUser)
    localStorage.setItem('SGC_AUTH_USER_v1', JSON.stringify(newUser))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('SGC_AUTH_USER_v1')
  }

  if (isAppLoading) {
    return <LoadingScreen branding={branding} />
  }

  if (!user) {
    return <Login onLogin={handleLogin} branding={branding} />
  }

  const renderSheet = () => {
    switch (activeSheet) {
      case 'quan-ly-tai-khoan':   return <QuanLyTaiKhoan branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} currentUser={user} />
      case 'data-vat-tu-ncc':    return <DataVatTuNCC branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'chi-tiet-cong-viec': return <ChiTietCongViec settings={settings} onSaveSettings={handleSaveSettings} branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} user={user} />
      case 'bao-cao-canh-bao':   return <BaoCaoCanhBao branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'cau-hinh-du-an':     return <CauHinhDuAn branding={branding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      case 'cau-hinh-logo':       return <CauHinhLogo onBrandingChange={setBranding} onOpenSidebar={() => setIsSidebarOpen(true)} />
      default:
        return (
          <ComingSoonSheet
            title={activeSheet.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            icon={Layers}
            color="bg-slate-400"
          />
        )
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        onNavigate={setActiveSheet} 
        activeSheet={activeSheet} 
        branding={branding} 
        user={user} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />
      
      {/* Content Area - Moves when sidebar opens if we wanted, but for now we'll use a fixed width layout pattern */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="flex-1 min-h-0 flex flex-col">
          {renderSheet()}
        </div>
        {/* Thanh ghi chú SGC Company */}
        <footer className="h-7 bg-white border-t border-slate-200 flex items-center px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
            <span className="text-[12px] font-black text-slate-400 font-roboto uppercase tracking-[0.2em]">
              SGC Company
            </span>
          </div>
        </footer>
      </main>
    </div>
  )
}
