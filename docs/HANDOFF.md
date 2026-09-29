# Bàn giao cho lượt code mockup

> Cập nhật 29/09/2026: mockup đã được triển khai tại `../mockup/`. Xem [hướng dẫn chạy và demo](../mockup/README.md), [kết quả kiểm tra và giới hạn](../mockup/QA.md). Phần dưới giữ nguyên như đặc tả bàn giao ban đầu.

## Nhiệm vụ

Khi người dùng yêu cầu bắt đầu code, triển khai mockup SMS hoàn chỉnh trong `mockup/` theo bộ tài liệu này. Không hỏi lại các yêu cầu đã được chốt trong hội ý. Người dùng muốn trình bày với lãnh đạo và các bên liên quan, nên cần cả độ hoàn thiện thị giác và tương tác có kết quả xuyên màn.

Đọc theo thứ tự: README → 07 quyết định → 02 đặc tả → 03 thiết kế và brand-assets.json → 08 flow tự động hóa → 05 dữ liệu → 04 kế hoạch → 06 demo và nghiệm thu. `01` cung cấp bối cảnh trình bày, không thay thế đặc tả.

## Các ràng buộc phải giữ

1. Luôn xưng em và gọi người dùng là đại ca trong trao đổi.
2. Giữ nguyên Excel nguồn và bộ tài liệu; chưa có ứng dụng hoặc dependency ở thời điểm bàn giao này.
3. Có đúng 5 màn tạo độc lập, editor email là màn phụ quay về bước 4; review là drawer bước 5.
4. Trigger chọn một trong hai event/schedule; draft giữ lựa chọn tạm nhưng published chỉ có một mode.
5. Hậu xử lý từng lần và theo kỳ có thể cùng bật.
6. Người thường không xóa kịch bản. Admin xóa có lý do, audit và tombstone trong mockup.
7. Sửa published tạo draft/version mới. Execution cũ giữ version, snapshot và nội dung cũ.
8. FE phải chạy thật các thao tác lọc, công thức hỗ trợ, xem trước, persistence, version và task. Tác động nghiệp vụ bên ngoài chỉ mô phỏng.
9. Chỉ dùng dữ liệu khách giả. Chỉ số phải dẫn xuất từ records; không bịa KPI độc lập.
10. Khi công bố hợp lệ, tự sinh AutomationPlan từ cấu hình và hiển thị tab Tiến trình tự động; sơ đồ phải phản ánh cấu hình thực, không dùng ảnh cố định. Mockup mô phỏng đầu vào và tác động ngoài; hệ thống thật vận hành tự động sau công bố.
11. Không tự phát triển production, kết nối core, gửi tin, khóa tài khoản hoặc publish website.

## Lựa chọn đã được tạm chốt để code ngay

React + TypeScript + Vite; React Router; Fluent UI React v9 và Fluent icons; Context/useReducer; localStorage; Tiptap cho email. Theme sáng với navy SHS #0A2762 và cam #FE8700, layout và token trong `03`. Sao chép nguyên bản 4 asset từ thư mục gốc vào public/brand theo brand-assets.json; dùng đúng biến thể logo và silk có tiết chế. Không áp dụng mẫu landing page hoặc trộn UI kit.

Quy ước dữ liệu: 24 kịch bản/6 danh mục, active 12; 120 khách giả/132 tài khoản; demoNow 29/09/2026 10:00 UTC+7. Công thức demo và count chính xác nằm ở `05`. Seed phải deterministic và reset được.

## Thực hiện

Đi theo P01 đến P09 trong `04`. Hoàn thành dọc một luồng sớm, sau đó mở rộng theo từng gói. Người dùng không yêu cầu spawn subagent; không tự tạo chat mới. Dùng tool kiểm tra browser phù hợp môi trường và đọc skill trước khi điều khiển browser.

Trước khi cài dependency, kiểm tra workspace hiện tại để không ghi đè những gì đã xuất hiện sau lượt bàn giao. Chỉ cài trong `mockup/`. Nếu version thư viện thay đổi, kiểm tra nguồn chính thức, giữ nguyên hành vi sản phẩm và ghi thay đổi quyết định.

## Điều kiện hoàn thành

Các AC trong `06` đạt hoặc có giới hạn được báo rõ, demo 12 phút chạy liên tục từ reset, không dead button, không lỗi console, build/lint/unit/browser checks phù hợp đã chạy. Bàn giao đường mở app local, lệnh chạy, kết quả kiểm thử và những phần mô phỏng. Không tự dừng sau dashboard hoặc wizard rồi coi đó là mockup hoàn tất.

## Câu lệnh tiếp nối gợi ý

“Em đọc docs/HANDOFF.md và bộ đặc tả liên quan rồi code mockup SMS theo kế hoạch. Hoàn thiện đủ luồng để trình diễn, kiểm thử và mở preview cho đại ca.”
