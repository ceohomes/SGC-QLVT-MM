import { createClient } from '@supabase/supabase-js'

const SUPABASE_CONFIG_KEY = 'SUPABASE_CONFIG_v1'

// ── Config mặc định nhúng cứng (admin đã cấu hình) ──────────────
export const DEFAULT_CONFIG = {
  url: 'https://gjzzlwjsbyqvmpuhtllg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqenpsd2pzYnlxdm1wdWh0bGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODY2OTcsImV4cCI6MjA5Mzg2MjY5N30.Tw3A1O9dFC7NGp3glo-pO5E81_bRyZSyzFEKq98KbFM'
}

export function getSupabase() {
  try {
    // Ưu tiên config admin ghi đè qua giao diện
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY)
    if (saved) {
      const config = JSON.parse(saved)
      if (config.url && config.anonKey) {
        return createClient(config.url, config.anonKey)
      }
    }
    // Fallback về config mặc định nhúng cứng — mọi máy đều dùng được
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
