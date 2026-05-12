-- Chạy SQL này trong Supabase SQL Editor để hỗ trợ dòng phụ (sub-row) đầy đủ
-- Vào: Supabase Dashboard → SQL Editor → New Query → Paste và Run

ALTER TABLE vt_chi_tiet_cong_viec
  ADD COLUMN IF NOT EXISTS parent_id uuid,
  ADD COLUMN IF NOT EXISTS sub_idx integer DEFAULT 1;

-- Thêm index để tìm kiếm dòng phụ nhanh hơn
CREATE INDEX IF NOT EXISTS idx_ctcv_parent_id ON vt_chi_tiet_cong_viec(parent_id);

-- (Tùy chọn) Thêm foreign key để tự động xóa dòng phụ khi xóa dòng chính
-- ALTER TABLE vt_chi_tiet_cong_viec
--   ADD CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES vt_chi_tiet_cong_viec(id) ON DELETE CASCADE;
