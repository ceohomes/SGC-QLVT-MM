import { createClient } from '@supabase/supabase-js'

const SUPABASE_CONFIG_KEY = 'SUPABASE_CONFIG_v1'

// ── Config mặc định nhúng cứng (admin đã cấu hình) ──────────────
export const DEFAULT_CONFIG = {
  url: 'https://axirltsstfsztplabbaa.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aXJsdHNzdGZzenRwbGFiYmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDIxNzcsImV4cCI6MjA5Mzk3ODE3N30.4DHFDPYX_jmxd9V3AkSVzqLopPZx4HQVjaXjJ4ObwGA'
}

// ── Tự động xóa config cũ nếu trỏ sai project ──────────────────
// Chạy 1 lần khi load module — không cần can thiệp thủ công
;(function purgeStaleConfig() {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY)
    if (!saved) return
    const config = JSON.parse(saved)
    const defaultHost = new URL(DEFAULT_CONFIG.url).hostname
    const savedHost = config.url ? new URL(config.url).hostname : ''
    if (savedHost !== defaultHost) {
      localStorage.removeItem(SUPABASE_CONFIG_KEY)
      console.info('[Supabase] Config cũ sai project đã bị xóa tự động:', savedHost, '→', defaultHost)
    }
  } catch {
    // Nếu parse lỗi thì xóa luôn cho sạch
    localStorage.removeItem(SUPABASE_CONFIG_KEY)
  }
})()

export function getSupabase() {
  try {
    // Ưu tiên config admin ghi đè qua giao diện (chỉ khi cùng project)
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY)
    if (saved) {
      const config = JSON.parse(saved)
      if (config.url && config.anonKey) {
        return createClient(config.url, config.anonKey)
      }
    }
    // Dùng config mặc định nhúng cứng
    return createClient(DEFAULT_CONFIG.url, DEFAULT_CONFIG.anonKey)
  } catch (err) {
    console.error('Lỗi khởi tạo Supabase client', err)
    try {
      return createClient(DEFAULT_CONFIG.url, DEFAULT_CONFIG.anonKey)
    } catch {
      return null
    }
  }
}
