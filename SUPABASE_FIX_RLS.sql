-- ============================================================
-- FIX LỖI 401 SUPABASE - THIẾT LẬP RLS POLICY
-- Chạy toàn bộ script này trong Supabase > SQL Editor
-- ============================================================

-- ── 1. Bảng ad_tai_khoan (Quản lý tài khoản) ─────────────────
ALTER TABLE ad_tai_khoan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_tai_khoan" ON ad_tai_khoan;
CREATE POLICY "allow_all_tai_khoan"
  ON ad_tai_khoan
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 2. Bảng vt_chi_tiet_cong_viec ────────────────────────────
ALTER TABLE vt_chi_tiet_cong_viec ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_chi_tiet_cong_viec" ON vt_chi_tiet_cong_viec;
CREATE POLICY "allow_all_chi_tiet_cong_viec"
  ON vt_chi_tiet_cong_viec
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 3. Bảng vt_dm_vattu (Danh mục vật tư) ───────────────────
ALTER TABLE vt_dm_vattu ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_dm_vattu" ON vt_dm_vattu;
CREATE POLICY "allow_all_dm_vattu"
  ON vt_dm_vattu
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 4. Bảng vt_dm_ncc (Danh mục NCC) ────────────────────────
ALTER TABLE vt_dm_ncc ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_dm_ncc" ON vt_dm_ncc;
CREATE POLICY "allow_all_dm_ncc"
  ON vt_dm_ncc
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 5. Bảng vt_du_an (Dự án) ─────────────────────────────────
ALTER TABLE vt_du_an ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_du_an" ON vt_du_an;
CREATE POLICY "allow_all_du_an"
  ON vt_du_an
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── 6. Bảng ad_cau_hinh_logo (Logo/Cấu hình) ─────────────────
ALTER TABLE ad_cau_hinh_logo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_logo" ON ad_cau_hinh_logo;
CREATE POLICY "allow_all_logo"
  ON ad_cau_hinh_logo
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- ✅ XONG! Reload lại trang web sau khi chạy script này.
-- ============================================================
