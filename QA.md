# Kiểm tra bản mockup — 29/09/2026

## Cập nhật cấu trúc — 30/09/2026

- 65/65 unit tests đạt: gồm công thức lồng nhau, điều kiện tăng/giảm, tệp khách hàng, runtime sự kiện/lịch, xung đột offer sản phẩm/dịch vụ, chuyển dữ liệu cũ và phân nhóm công việc theo phiên bản lịch sử.
- 12/12 Playwright tests đạt với Chrome cài sẵn: 7 luồng hồi quy công thức/wizard, 3 luồng về dashboard/drilldown, khai báo–xem trước–công bố dịch vụ, thư viện 5/4/3 và tệp khách hàng, cùng 2 luồng phân nhóm công việc, kết hợp bộ lọc, tìm kiếm và phân trang.
- TypeScript, ESLint và Vite build đạt. Bundle chính khoảng 1,17 MB trước gzip; Vite vẫn cảnh báo kích thước bundle.
- Kiểm tra trực tiếp trong Browser: dashboard có 5 tab và bộ lọc Tất cả; thư viện tách sản phẩm chính sách/dịch vụ. Bản lưu cũ có 25 kịch bản được mở và bổ sung cấu trúc mới, không đặt lại dữ liệu.
- Các kiểm thử thêm đảm bảo: cả 5 hành trình luôn có đủ 6 nhóm kể cả khi số đếm bằng 0; đổi hành trình giữ danh mục, công bố được tổ hợp Wealth + Dịch vụ & vận hành; reload giữ tệp/hành trình/offer; tệp riêng gồm kịch bản toàn bộ khi thống kê; lọc tài khoản giữ đúng định danh; chuyển offer hỗn hợp giữ thứ tự hành động và lịch sử, chạy chuyển đổi lần nữa không nhân đôi.
- Kiểm tra Browser trên bản lưu cũ: Wealth có 0 kịch bản vẫn hiện đủ 6 nhóm; Cần chú ý chia thành 3 phần và công việc quá hạn có liên kết theo nhóm. Mở nhóm Giám sát & kế hoạch giữ bộ lọc quá hạn và hiển thị đúng nhóm. Ảnh tại `screenshots/all-six-groups.png` và `screenshots/grouped-tasks.png`.
- Lệnh thực thi trong môi trường này dùng trực tiếp entrypoint Node của tsc, ESLint, Vitest, Vite và Playwright do npm shim máy local không hoạt động. Playwright dùng cấu hình phụ trong `screenshots/` chọn channel Chrome.

Phần dưới ghi lại lượt kiểm tra ban đầu ngày 29/09; các số lượng test và ghi chú chưa chạy CLI bên dưới là lịch sử, được thay thế bởi kết quả cập nhật trên.

## Kết quả thực thi

- `npm run build`: TypeScript và Vite production build đạt.
- `npm run lint`: ESLint đạt.
- `npm test`: **18/18 unit tests đạt**.
- Kiểm tra UI thực tế bằng Browser trong Codex: các luồng dưới đây đã thao tác trên ứng dụng đang chạy. Đây không phải tuyên bố đã chạy trọn 44 AC ban đầu.
- Lượt mở tab sạch cuối: dashboard đúng 24/12; truy vấn console error trả về danh sách rỗng.
- 3 Playwright smoke specs có sẵn trong `e2e/`; chưa chạy bộ CLI trong môi trường bàn giao. Không cộng các specs này vào số test đạt.

## Các luồng đã thao tác trên trình duyệt

| Nhóm | Kết quả quan sát |
|---|---|
| Dashboard, quản lý | Mở dashboard, tìm tên kịch bản, kết quả lọc đúng; reload giữ cấu hình đã lưu |
| Wizard | Tạo SMS-0025 qua 5 màn độc lập, lưu nháp, mở editor phụ và quay về đúng hành động |
| Điều kiện | Công thức 300 triệu trả 33/82/5; 500 triệu trả 16/99/5; trả lại 300 triệu về đúng kết quả ban đầu |
| Trigger | Chuyển event/schedule có giao diện riêng và lịch tiếp theo; bản nháp giữ lựa chọn khi reload |
| Email | Đổi tiêu đề, chọn bố cục, preview C005/C017, lưu quay về; rời editor với nội dung chưa lưu hiển thị xác nhận, chọn ở lại giữ nội dung |
| Công bố v1 | Review, công bố, tự sinh PLAN-SMS-0025-v1 và sơ đồ đúng nguồn sự kiện/action/hai nhánh hậu xử lý |
| Thực thi | EV-DEMO-001/C005 sinh 1 đánh giá, 1 kích hoạt, NOTI + EMAIL hoàn tất mô phỏng, 1 công việc và snapshot điều kiện |
| Chống trùng | Chạy lại cùng mã hiện thông báo đã xử lý, không tạo lượt mới |
| Công việc | Nhận việc, nhập kết quả, hoàn tất; nhận thông báo thành công |
| Phiên bản | Sửa bản đang hoạt động, đổi sang lịch ngày và nội dung email; công bố v2; graph hiển thị “Mỗi 1 ngày”, lịch sử phiên bản có v1 và v2 |
| Responsive | Kiểm tra DOM và ảnh ở 1440×900, 1366×768, 1024×768, 768×1024; các trang được kiểm tra không tràn ngang toàn trang |
| Reset | Đưa dữ liệu thử về seed 24 kịch bản/12 active để bắt đầu buổi demo |

Các ảnh được lưu trong `screenshots/`, gồm dashboard, công xưởng điều kiện, editor email, review công bố và tiến trình. Một số ảnh chụp tại thời điểm đã tạo SMS-0025 nên hiển thị 25 kịch bản; bản seed vẫn là 24.

## Phạm vi unit tests

Evaluator đúng count và logic ba trạng thái; VÀ/HOẶC, null/zero, biểu thức sai đơn vị và chia 0; khoảng giá trị; lịch tháng/ngày 31, năm nhuận, ngày nghỉ, giờ neo, ranh giới hiệu lực; trạng thái vòng đời; compiler chỉ đăng ký một mode; nhánh hậu xử lý; runtime snapshot, chống trùng, tái kích hoạt và pause; plan v2 không sửa lịch sử v1; công việc tạo trước hành động; quyền theo vai trò; batch chống trùng/không đóng việc thành viên; conflict có tập khách giao nhau; transaction rollback khi compile/lưu lỗi; seed deterministic và dưới 2 MB JSON.

## Giới hạn và phạm vi cần kiểm tra thêm

- Chưa tuyên bố nghiệm thu đầy đủ AC01–AC44: quản trị xóa/tombstone, catalog CRUD, retry lỗi, tất cả tổ hợp filter và toàn bộ bàn phím chưa được chạy thành một bộ hồi quy UI tự động.
- Lỗi quota/compile rollback được kiểm thử ở lớp transaction thuần, chưa chủ động làm đầy localStorage của trình duyệt.
- Thư viện đại lượng/sự kiện/hành động là danh mục cố định; chỉnh metadata tại UI và registry adapter động là bước mở rộng.
- Retry cập nhật trạng thái và số lần thử trong ActionRun; chưa có timeline chi tiết riêng cho từng lần thử.
- Nghi vấn nội dung CF04 dùng cặp ý định minh họa được gắn nhãn; không phải mô hình phân tích ngôn ngữ. Cảnh báo trên dữ liệu mẫu cần người dùng rà soát.
- Lịch giao dịch, resolver sản phẩm và dữ liệu tài khoản dùng fixture quy định. Bộ lịch không đại diện lịch giao dịch chính thức.
- Trong quá trình cập nhật mã, có lỗi hot refresh mất định danh Context. Đã giữ định danh Context qua HMR và bổ sung màn khôi phục; kiểm tra lượt cuối dùng tab mới để tách log phát triển cũ.
- Build hiện có một bundle chính khoảng 1 MB trước gzip do UI kit/editor; tách tải theo route là tối ưu cho giai đoạn tiếp theo, không ảnh hưởng phạm vi chạy local.

Không thực hiện bất kỳ tác động nào tới hệ thống giao dịch, dịch vụ nhắn tin hoặc dữ liệu khách hàng thật.
