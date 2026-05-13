// Trạng thái tự động
export const TRANG_THAI = {
  CHO_XU_LY:      'Chờ xử lý',
  DA_XU_LY:       'Đã xử lý',
  QUA_HAN:        'Quá hạn',
  DA_VE_HANG_DU:  'Đã về hàng đủ',
  CHUA_VE_HANG_DU:'Chưa về hàng đủ',
}

// Màu trạng thái
export const TRANG_THAI_COLOR = {
  'Chờ xử lý':       'bg-amber-100 text-amber-800 border-amber-300',
  'Đã xử lý':        'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Quá hạn':         'bg-rose-100 text-rose-800 border-rose-300',
  'Đã về hàng đủ':   'bg-sky-100 text-sky-800 border-sky-300',
  'Chưa về hàng đủ': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
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
  'Khung',
  'Không khung',
]

// Default PCU deadline days
export const DEFAULT_PCU_DAYS = 7

export const LOCAL_STORAGE_KEY = 'VATTU_QLPCU_DATA_v1'
export const SETTINGS_KEY = 'VATTU_SETTINGS_v1'
export const CATALOG_VATTU_KEY = 'CATALOG_VATTU_DATA_v1'
export const CATALOG_NCC_KEY = 'CATALOG_NCC_DATA_v1'
export const ACCOUNTS_KEY = 'SGC_ACCOUNTS_v1'

// Supabase Table Names
export const TABLES = {
  // Nhóm Vật tư
  CHI_TIET_CONG_VIEC: 'vt_chi_tiet_cong_viec',
  DM_VATTU:           'vt_dm_vattu',
  DM_NCC:             'vt_dm_ncc',
  DU_AN:              'ad_du_an',
  // Nhóm Admin
  TAI_KHOAN:          'ad_tai_khoan',
  LOGO:               'ad_cau_hinh_logo',
}

// Bảng màu cho Khối thi công
export const PALETTE = [
  { bg: '#fff7ed', border: '#fdba74', badge: '#f97316' }, // Orange
  { bg: '#fffbeb', border: '#fde68a', badge: '#d97706' }, // Amber
  { bg: '#fefce8', border: '#fde047', badge: '#ca8a04' }, // Yellow/Gold
  { bg: '#f7fee7', border: '#d9f99d', badge: '#65a30d' }, // Lime
  { bg: '#f0fdf4', border: '#86efac', badge: '#16a34a' }, // Green
  { bg: '#ecfdf5', border: '#a7f3d0', badge: '#059669' }, // Emerald
  { bg: '#f0fdfa', border: '#5eead4', badge: '#0d9488' }, // Teal
  { bg: '#ecfeff', border: '#a5f3fc', badge: '#0891b2' }, // Cyan
  { bg: '#f0f9ff', border: '#7dd3fc', badge: '#0284c7' }, // Sky
  { bg: '#eff6ff', border: '#93c5fd', badge: '#2563eb' }, // Blue
  { bg: '#eef2ff', border: '#c7d2fe', badge: '#4f46e5' }, // Indigo
  { bg: '#f5f3ff', border: '#ddd6fe', badge: '#7c3aed' }, // Purple
  { bg: '#faf5ff', border: '#e9d5ff', badge: '#9333ea' }, // Violet
  { bg: '#fdf4ff', border: '#e879f9', badge: '#a21caf' }, // Fuchsia
  { bg: '#fdf2f8', border: '#fbcfe8', badge: '#db2777' }, // Pink
  { bg: '#fff1f2', border: '#fda4af', badge: '#e11d48' }, // Rose
  { bg: '#f8fafc', border: '#cbd5e1', badge: '#475569' }, // Slate
]
