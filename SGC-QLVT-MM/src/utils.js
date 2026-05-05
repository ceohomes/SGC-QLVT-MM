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

// Calculate auto status
export function calcTrangThai(row, pcuDays = 7) {
  // Nếu đã có ngày về thực tế -> Đã xử lý
  if (row.ngayVeThucTe && row.ngayVeThucTe.trim()) {
    return TRANG_THAI.DA_XU_LY
  }

  // Nếu có ngày gửi PCU -> check hạn
  if (row.ngayGuiPCU && row.ngayGuiPCU.trim()) {
    const sent = parseDate(row.ngayGuiPCU)
    if (sent) {
      // Hạn PCU trả = ngày gửi + pcuDays
      const deadline = new Date(sent)
      deadline.setDate(deadline.getDate() + pcuDays)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (today > deadline) {
        return TRANG_THAI.QUA_HAN
      }
    }
  }

  return TRANG_THAI.CHO_XU_LY
}

// Calculate PCU deadline date string
export function calcPcuDeadline(ngayGuiPCU, pcuDays) {
  if (!ngayGuiPCU || !ngayGuiPCU.trim()) return ''
  return addDays(ngayGuiPCU, pcuDays)
}

// Calculate khối lượng còn thiếu
export function calcKhoiLuongConThieu(khoiLuong, khoiLuongNhapTay) {
  const kl = parseFloat(String(khoiLuong || '').replace(',', '.')) || 0
  const klNT = parseFloat(String(khoiLuongNhapTay || '').replace(',', '.')) || 0
  const diff = kl - klNT
  if (kl === 0) return ''
  return diff.toLocaleString('vi-VN', { maximumFractionDigits: 2 })
}

// Generate unique ID
export function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Format number with commas
export function formatNum(val) {
  if (!val && val !== 0) return ''
  const n = parseFloat(String(val).replace(/[.,]/g, '').replace(',', '.'))
  if (isNaN(n)) return val
  return n.toLocaleString('vi-VN')
}

// Check if date string is valid
export function isValidDate(str) {
  if (!str || !str.trim()) return false
  const d = parseDate(str)
  return d !== null && !isNaN(d.getTime())
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
