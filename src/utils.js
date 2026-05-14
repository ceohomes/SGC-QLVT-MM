import { TRANG_THAI } from './constants'

// Parse date string dd/mm/yyyy -> Date object
export function parseDate(str) {
  if (!str || typeof str !== 'string') return null
  const parts = str.trim().split('/')
  if (parts.length !== 3) return null
  const [d, m, y] = parts.map(Number)
  if (!d || !m || !y) return null
  return new Date(y, m - 1, d)
}

// Format Date -> dd/mm/yyyy
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

// Function to handle Excel date (serial number, Date object, or string)
export function formatExcelDate(val) {
  if (val === null || val === undefined || val === '') return ''
  
  // Date object from XLSX with cellDates: true
  if (val instanceof Date) {
    return formatDate(val)
  }
  
  // Excel Serial Number
  if (typeof val === 'number' && val > 30000) { // arbitrary threshold to distinguish from small counts
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return formatDate(d)
  }
  
  // Potential ISO string or other date string format
  const str = String(val).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str.substring(0, 10))
    if (!isNaN(d.getTime())) return formatDate(d)
  }
  
  return str
}

// Parse number string (handles . as thousand separator and , as decimal)
export function parseNumber(val) {
  if (val === null || val === undefined || val === '') return 0
  if (typeof val === 'number') return val
  // Remove thousand separators (dots) and replace decimal comma with dot
  const clean = String(val).replace(/\./g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

// Format number with dots as thousand separators and comma as decimal separator (vi-VN)
export function formatNum(val) {
  if (val === null || val === undefined || val === '') return ''
  const n = parseNumber(val)
  if (isNaN(n)) return val
  
  // Use toLocaleString with specific options to ensure consistency
  // minimumFractionDigits: 0, maximumFractionDigits: 10 allows it to show what's there
  return n.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 10
  })
}

// Today as string
export function todayStr() {
  return formatDate(new Date())
}

// Add days to date string
export function addDays(dateStr, days) {
  const d = parseDate(dateStr)
  if (!d) return ''
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

// Calculate auto status cho DÒNG PHỤ (parentId có giá trị)
// Chỉ dùng: Chờ xử lý, Đã xử lý, Quá hạn
export function calcTrangThaiDongPhu(row, pcuDays = 7) {
  // Nếu có ngày PCU trả -> Đã xử lý
  if (row.ngayPcuTra && row.ngayPcuTra.trim()) {
    return TRANG_THAI.DA_XU_LY
  }

  // Nếu KHÔNG có ngày gửi PCU -> Chưa gửi cung ứng
  if (!row.ngayGuiPcu || !row.ngayGuiPcu.trim()) {
    return TRANG_THAI.CHUA_GUI_PCU
  }

  // Nếu có ngày gửi PCU -> check hạn
  const sent = parseDate(row.ngayGuiPcu)
  if (sent) {
    const deadline = new Date(sent)
    deadline.setDate(deadline.getDate() + pcuDays)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (today > deadline) {
      return TRANG_THAI.QUA_HAN
    }
  }

  return TRANG_THAI.CHO_XU_LY
}

// Calculate auto status cho DÒNG CHÍNH (không có parentId)
// Chỉ dùng: Đã về hàng đủ, Chưa về hàng đủ
export function calcTrangThaiDongChinh(row) {
  const kl = parseNumber(row.khoiLuong)
  const klNT = parseNumber(row.khoiLuongNhapTay)

  // Nếu khối lượng > 0 và đã về đủ/vượt -> Đã về hàng đủ
  if (kl > 0 && klNT >= kl) {
    return TRANG_THAI.DA_VE_HANG_DU
  }

  // Nếu có ngày về thực tế -> check khối lượng (trường hợp kl == 0)
  if (row.ngayVeThucTe && row.ngayVeThucTe.trim()) {
    if (kl === 0 || klNT >= kl) {
      return TRANG_THAI.DA_VE_HANG_DU
    }
  }

  return TRANG_THAI.CHUA_VE_HANG_DU
}

// Hàm tổng hợp: tự chọn đúng hàm tính dựa vào loại dòng
export function calcTrangThai(row, pcuDays = 7) {
  if (row.parentId) {
    // Chỉ áp dụng logic dòng phụ (PCU) cho dòng kế hoạch
    if (row.subMode === 'thucte') {
      return calcTrangThaiDongChinh(row)
    }
    return calcTrangThaiDongPhu(row, pcuDays)
  }
  return calcTrangThaiDongChinh(row)
}

// Calculate PCU deadline date string
export function calcPcuDeadline(ngayGuiPCU, pcuDays) {
  if (!ngayGuiPCU || !ngayGuiPCU.trim()) return ''
  return addDays(ngayGuiPCU, pcuDays)
}

// Calculate khối lượng còn thiếu
export function calcKhoiLuongConThieu(khoiLuong, khoiLuongNhapTay) {
  const kl = parseNumber(khoiLuong)
  const klNT = parseNumber(khoiLuongNhapTay)
  const diff = kl - klNT
  if (kl === 0) return ''
  return formatNum(diff)
}

// Convert camelCase object to snake_case
export function toSnakeCase(obj) {
  if (!obj) return obj
  const result = {}
  const exceptions = {
    tenVattu: 'ten_vattu',
    tenNcc: 'ten_ncc',
    tenChuyenVienKqlvt: 'ten_chuyen_vien_kqlvt',
    tenCvpcuThucHien: 'ten_cvpcu_thuc_hien',
    tenCpcuPcu: 'ten_cpcu_pcu',
    tenNccThucTe: 'ten_ncc_thuc_te',
    khoiTen: 'khoi_ten',
    khoiVietTat: 'khoi_viet_tat'
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('computed')) continue // Bỏ qua các trường tính toán tạm thời
    if (key === 'trangThai') continue // Trạng thái cũng là trường tính toán
    
    if (exceptions[key]) {
      result[exceptions[key]] = value
    } else {
      const snake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      result[snake] = value
    }
  }
  return result
}

// Convert snake_case object to camelCase
export function toCamelCase(obj) {
  if (!obj) return obj
  const result = {}
  const exceptions = {
    ten_vattu: 'tenVattu',
    ten_ncc: 'tenNcc',
    ten_chuyen_vien_kqlvt: 'tenChuyenVienKqlvt',
    ten_cvpcu_thuc_hien: 'tenCvpcuThucHien',
    ten_cpcu_pcu: 'tenCpcuPcu',
    ten_ncc_thuc_te: 'tenNccThucTe',
    khoi_ten: 'khoiTen',
    khoi_viet_tat: 'khoiVietTat'
  }

  for (const [key, value] of Object.entries(obj)) {
    if (exceptions[key]) {
      result[exceptions[key]] = value
    } else {
      const camel = key.replace(/(_\w)/g, match => match[1].toUpperCase())
      result[camel] = value
    }
  }
  return result
}

// Generate unique ID
export function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Check if date string is valid (strict dd/mm/yyyy format and reasonable year)
export function isValidDate(str) {
  if (!str || typeof str !== 'string') return false
  const s = str.trim()
  // Strict regex for d/m/yyyy or dd/mm/yyyy
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return false
  
  const d = parseDate(s)
  if (!d || isNaN(d.getTime())) return false
  
  // Logical check for day/month/year
  const parts = s.split('/')
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const year = parseInt(parts[2], 10)
  
  // Date constructor can overflow (e.g. 32/01 -> 01/02), so we check back
  if (d.getDate() !== day || (d.getMonth() + 1) !== month || d.getFullYear() !== year) return false
  
  // Reasonable year check (e.g. 1900 to 2100)
  if (year < 1900 || year > 2100) return false
  
  return true
}

// Check if PCU is overdue
export function isPcuOverdue(ngayGuiPCU, ngayPcuTra, pcuDays) {
  if (!ngayGuiPCU || ngayPcuTra) return false // no send date or already returned -> not overdue
  const sent = parseDate(ngayGuiPCU)
  if (!sent) return false
  const deadline = new Date(sent)
  deadline.setDate(deadline.getDate() + pcuDays)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today > deadline
}
