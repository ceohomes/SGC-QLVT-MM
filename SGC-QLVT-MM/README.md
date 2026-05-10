# Quản Lý Vật Tư & PCU

Ứng dụng theo dõi tiến độ vật tư và kiểm soát PCU với giao diện màu xanh Lavender.

## Tính năng
- ✅ Quản lý đầy đủ 26 cột thông tin vật tư
- ✅ Trạng thái tự động: Chờ xử lý / Đã xử lý / Quá hạn
- ✅ Báo quá hạn PCU theo số ngày cài đặt
- ✅ Import/Export Excel
- ✅ Tìm kiếm & lọc đa chiều
- ✅ Lưu dữ liệu offline (localStorage)
- ✅ Giao diện màu Lavender hiện đại

## Deploy lên Cloudflare Pages

1. Push code lên GitHub
2. Vào https://pages.cloudflare.com → New project → Connect to Git
3. Chọn repo → Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Deploy!

## Chạy local

```bash
npm install
npm run dev
```

## Lưu ý
- Dữ liệu lưu trong localStorage của trình duyệt
- Nếu muốn đồng bộ nhiều máy, cần thêm backend (Supabase/Firebase)
