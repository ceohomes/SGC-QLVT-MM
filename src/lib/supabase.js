import { createClient } from '@supabase/supabase-js'

const SUPABASE_CONFIG_KEY = 'SUPABASE_CONFIG_v1'

export function getSupabase() {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY)
    if (!saved) return null
    
    const config = JSON.parse(saved)
    if (!config.url || !config.anonKey) return null
    
    return createClient(config.url, config.anonKey)
  } catch (err) {
    console.error('Lỗi khởi tạo Supabase client', err)
    return null
  }
}
