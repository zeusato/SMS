# SHS Scenario Management System — mockup tương tác

Bản demo phục vụ hội ý và trình bày định hướng SMS. Giao diện tiếng Việt, nhận diện SHS từ các asset được cung cấp. Toàn bộ dữ liệu là giả lập và lưu riêng trên trình duyệt đang dùng.

## Chạy ứng dụng

Yêu cầu Node.js 22.12+ thuộc dòng 22.x và npm. Phiên bản Node được khai báo trong `.nvmrc` và `package.json`.

```powershell
git clone https://github.com/zeusato/SMS.git
cd SMS
npm ci
npm run dev
```

Mở **http://127.0.0.1:5173/**. Cổng được cố định; nếu có ứng dụng khác dùng cổng này, dừng ứng dụng đó hoặc đổi `vite.config.ts`.

## Deploy trên Vercel

Import repository **zeusato/SMS** vào Vercel và cấp quyền truy cập repo private cho tích hợp GitHub nếu được yêu cầu. Cấu hình:

| Thiết lập | Giá trị |
|---|---|
| Production Branch | `main` |
| Root Directory | `.` — thư mục gốc, không chọn `mockup` |
| Framework Preset | Vite |
| Node.js | 22.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | Không cần cho phiên bản hiện tại |

Favicon dùng logo gốc `public/brand/LOGO.png`. Ảnh chia sẻ `public/og-image.png` có kích thước 1200 × 630; trang đã có Open Graph, Twitter Card, Apple touch icon và manifest. Khi build trên Vercel, URL ảnh lấy từ `VERCEL_PROJECT_PRODUCTION_URL`, dự phòng bằng `VERCEL_URL`. Nếu dùng domain riêng, đặt `VITE_SITE_URL=https://ten-mien-cua-ban` và redeploy. Xem `.env.example`; giá trị này là URL công khai, không phải secret. Để tự nhận domain, giữ tùy chọn cung cấp System Environment Variables của Vercel được bật.

`vercel.json` đã khai báo framework, lệnh cài/build, thư mục đầu ra và SPA rewrite theo [hướng dẫn Vite của Vercel](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas). Rewrite hỗ trợ mở trực tiếp và tải lại các đường dẫn như `/overview`, `/scenarios` và `/scenarios/drafts/.../conditions`. Khi liên kết Git, các lần push tiếp theo lên `main` là đầu vào cho production deployment của Vercel.

Sau deploy, kiểm tra tải lại `/overview`, mở danh sách kịch bản, tạo và lưu bản nháp rồi tải lại màn điều kiện. Kiểm tra logo và hình ảnh thương hiệu tải thành công. Dữ liệu trình diễn lưu theo trình duyệt và tên miền; dữ liệu ở localhost không tự chuyển lên domain Vercel.

Có thể xem bản build trên máy bằng `npm run build` rồi `npm run preview`. Workflow GitHub Actions chạy lint, unit test và build trên Linux khi push `main` hoặc mở pull request.

## Có thể trình diễn

- Dashboard có 5 tab hành trình Onboarding / Cash in / Trading / Investing / Wealth, danh mục và số đếm theo hành trình, lọc tệp khách hàng mặc định Tất cả. Bấm số đếm mở danh sách với cùng bộ lọc.
- Quản lý kịch bản: tìm kiếm, lọc đa chiều, lưu chế độ xem theo vai trò, lịch sử và phân trang.
- 5 màn thiết lập độc lập: thông tin → điều kiện → kích hoạt → hành động → hiệu lực và hậu xử lý. Bước 1 bắt buộc chọn tệp khách hàng và hành trình trước danh mục. Review nằm trong ngăn bên phải của bước 5.
- Công xưởng điều kiện: 45 đại lượng thuộc 8 nhóm, nhóm VÀ/HOẶC, biểu thức số học, cấp khách hàng/tài khoản, xem thử và giải thích từng đối tượng.
- 37 sự kiện thuộc 9 nhóm hoặc lịch giờ/ngày/tuần/tháng/năm, khoảng nghỉ và ngoại lệ lịch.
- Thông báo nhiều kênh/đối tượng; Tiptap email editor có biến, bố cục, CTA và preview; offer sản phẩm chính sách/bộ sản phẩm; offer dịch vụ riêng; giao việc; kiểm soát nghiệp vụ mô phỏng.
- Công bố tạo phiên bản và AutomationPlan có nguồn kích hoạt, nodes/edges, cấu hình bất biến và sơ đồ tương tác. Trình mô phỏng đọc cấu hình của plan được công bố.
- Nhật ký đánh giá/kích hoạt, snapshot, chống trùng, tái kích hoạt, thử lại hành động lỗi, công việc từng lần và báo cáo theo kỳ.
- Sửa tạo nháp mới bên cạnh phiên bản hiện hành. Admin xóa có lý do và tombstone; lịch sử không bị xóa theo.
- Danh mục kịch bản, sản phẩm chính sách, dịch vụ và bộ sản phẩm có tạo/sửa/ngừng sử dụng. Có thể cấu hình danh mục thuộc một hoặc nhiều hành trình. Thư viện đại lượng/sự kiện/hành động hiện dùng định nghĩa cố định.

## Tệp khách hàng và dịch vụ

- Tệp mẫu: **Careby, DYI, Hybrid, Priority, Private Wealth**; mỗi khách hàng có một tệp. Chọn Tất cả để áp dụng chung. Tệp đã chọn được dùng trong xem thử, mô phỏng sự kiện/lịch và kiểm tra giao nhau khi phát hiện xung đột.
- Khi lọc một tệp trên dashboard/danh sách, kết quả gồm kịch bản dành riêng cho tệp đó và kịch bản áp dụng cho Tất cả. Bộ lọc này chỉ áp dụng cụm danh mục/hành trình; KPI điều hành bên trên vẫn là tổng toàn hệ thống.
- **Tư vấn đầu tư (5):** cơ bản, mạo hiểm, giá trị, tăng trưởng, tạo thu nhập.
- **Danh mục mẫu (4):** phòng thủ, cân bằng, tăng trưởng, theo chủ đề.
- **Quản lý tài sản (3):** bảo toàn tài sản, quản lý tài sản cân bằng, tăng trưởng tài sản dài hạn.
- Hành động Offer dịch vụ chọn nhiều dịch vụ từ ba nhóm, có vị trí hiển thị và xem trước; dịch vụ hết hiệu lực/ngừng sử dụng không được chọn mới hoặc công bố.

## Mạch demo gợi ý

1. **Công cụ trình diễn → Đặt lại dữ liệu minh họa**: 24 kịch bản, 12 đang hoạt động, 120 khách giả/132 tài khoản. Mốc demo 29/09/2026 10:00 UTC+7.
2. Tạo kịch bản “Rà soát kế hoạch sử dụng tiền”, nhập mục đích ít nhất 20 ký tự; chọn tệp **Tất cả**, hành trình **Cash in**, danh mục **Giám sát & kế hoạch**.
3. Bước 2 chọn **Dùng công thức trình diễn → Xem thử đối tượng**. 300 triệu: 33 thỏa/82 không thỏa/5 thiếu dữ liệu. Đổi 500 triệu: 16/99/5. C005 thỏa, C017 thiếu dữ liệu, C011 không thỏa.
4. Xem cả hai cơ chế kích hoạt; chọn Nộp tiền. Thêm Email, soạn nội dung và lưu về đúng hành động.
5. Bật hậu xử lý từng lần và theo kỳ; xem lại, công bố. Mở **Tiến trình tự động** để giải thích đầu ra của việc thiết lập.
6. **Chạy mô phỏng** với EV-DEMO-001 và C005 → xem lượt kích hoạt → mở công việc → nhận việc → ghi kết quả và hoàn tất. Chạy lại cùng mã bị chặn.
7. Mở conflict mẫu từ dashboard; xem bằng chứng. Sửa kịch bản, chuyển sang lịch và công bố v2; lịch sử v1 còn nguyên.

Mạch chi tiết và tiêu chí ban đầu ở [tài liệu nghiệm thu](docs/06-demo-va-nghiem-thu.md). [QA.md](QA.md) ghi rõ phạm vi đã kiểm tra. [Bộ tài liệu](docs/README.md) chứa phương án triển khai và tài liệu thiết kế.

## Kiểm tra và cấu trúc

```powershell
npm run build
npm run lint
npm test
```

`src/domain.ts`: mô hình, evaluator, lịch, compiler và mô phỏng. `seed.ts`: dữ liệu cố định. `store.tsx`/`transaction.ts`: lưu trạng thái nguyên tử. `builder.tsx`/`conditions.tsx`: wizard và email. `operations.tsx`: vận hành và danh mục. `overview.tsx`: dashboard/quản lý. `public/brand`: bản sao nguyên gốc asset. `screenshots`: ảnh kiểm tra giao diện.

Có 10 kiểm thử UI trong `e2e/` và cấu hình Playwright để chạy lại bằng `npm run test:e2e` sau khi cài browser của Playwright (`npx playwright install chromium`). Kiểm tra ngày 30/09/2026 đã chạy bằng Chrome cài sẵn; kết quả và phạm vi ở QA.md. Unit suite tách riêng với `vitest.config.ts`.

## Ranh giới bản demo

Không có backend, core chứng khoán, gửi email/SMS, offer hay khóa tài khoản thật. Sự kiện, lượt lịch và kỳ hậu xử lý được chạy bằng nút mô phỏng; ứng dụng không chạy nền khi đóng trình duyệt. “Tự sinh tiến trình” trong mockup là compile cấu hình thành plan và vận hành mô phỏng theo plan đó.

Quyền là persona trình diễn, chưa phải xác thực/phân quyền server. localStorage không chia sẻ giữa người dùng hoặc trình duyệt. Lịch giao dịch chỉ là fixture 2026–2027. Cảnh báo xung đột dựa trên quy tắc và giao nhau của dữ liệu mẫu; CF04 là cặp ý định khai báo, không phải AI hiểu mọi nội dung. Các đại lượng/sự kiện mới và tích hợp hành động cần nền tảng production bổ sung adapter.

## Bảo toàn dữ liệu

Namespace localStorage: `sms.mock.v1`. Reset chỉ thay namespace này. Có xuất JSON qua Công cụ trình diễn; nhập JSON chưa thuộc luồng UI. Lưu/publish thất bại không commit trạng thái một phần; bản nháp còn trong bộ nhớ và có nút xuất bản nháp. Giữ nguyên Excel nguồn, brand assets gốc và bộ tài liệu dự án.

Bản lưu trước khi có hành trình/tệp được bổ sung khi đọc: tệp mặc định Tất cả, hành trình mặc định là bước đầu tiên được danh mục hỗ trợ; có thể sửa lại tại bước 1. Công thức nháp và lịch sử vẫn giữ nguyên. Dịch vụ tư vấn cũ chuyển sang thư viện dịch vụ, giữ mã và trạng thái; offer cũ chứa cả sản phẩm và dịch vụ được tách thành hai hành động liên tiếp. Vì giữ mục tư vấn cũ, bản lưu nâng cấp có thể có thêm một dịch vụ ngừng sử dụng so với 12 dịch vụ mới.
