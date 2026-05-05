// Trạng thái tự động
export const TRANG_THAI = {
  CHO_XU_LY: 'Chờ xử lý',
  DA_XU_LY: 'Đã xử lý',
  QUA_HAN: 'Quá hạn',
}

// Màu trạng thái
export const TRANG_THAI_COLOR = {
  'Chờ xử lý': 'bg-amber-100 text-amber-800 border-amber-300',
  'Đã xử lý': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Quá hạn': 'bg-rose-100 text-rose-800 border-rose-300',
}

// Nhóm vật tư
export const NHOM_VAT_TU = [
  'Vật tư chính',
  'Vật tư phụ',
  'Thiết bị',
  'Vật tư tiêu hao',
  'Khác',
]

// Loại hợp đồng
export const LOAI_HOP_DONG = [
  'Hợp đồng mua bán',
  'Hợp đồng dịch vụ',
  'Hợp đồng thuê',
  'Hợp đồng vận chuyển',
  'Hợp đồng khác',
]

// Default PCU deadline days
export const DEFAULT_PCU_DAYS = 7

export const LOCAL_STORAGE_KEY = 'VATTU_QLPCU_DATA_v1'
export const SETTINGS_KEY = 'VATTU_SETTINGS_v1'
