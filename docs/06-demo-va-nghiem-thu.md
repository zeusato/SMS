# Kịch bản trình diễn và nghiệm thu

## Mục tiêu buổi trình bày

Sau buổi demo, người xem cần hiểu nghiệp vụ thiết lập được gì, khi nào hệ thống ra quyết định, kết quả được kiểm soát ra sao và CNTT còn cần chuẩn bị những khả năng nào. Không dùng demo để tuyên bố đã có tích hợp, hiệu quả doanh thu hoặc khả năng xử lý tải production.

Chuẩn bị trước: reset seed, persona Manager, demoNow mặc định, viewport 1440 × 900, browser zoom 100%, không có modal debug mở. Dữ liệu và thao tác bên ngoài đều được nhận diện là minh họa. Không reset giữa buổi nếu muốn giữ kịch bản mới tạo và lịch sử vừa mô phỏng.

## Mạch trình diễn khoảng 12 phút

| Thời lượng gợi ý | Thao tác | Điểm cần chứng minh |
|---|---|---|
| 0 đến 1 phút | Mở dashboard; bấm danh mục GS và active rồi quay lại | Có cấu trúc quản lý và số liệu truy được nguồn |
| 1 đến 2 phút | Mở danh sách, ghép filter kênh/trigger/người phụ trách | Quản lý đa chiều và giữ ngữ cảnh |
| 2 đến 3 phút | Tạo SMS-0025 với tên Rà soát kế hoạch sử dụng tiền, danh mục GS | Quy trình có từng bước và lưu nháp |
| 3 đến 5 phút | Xây điều kiện cash >= 300 triệu, consent đúng, không khiếu nại; xem thử; đổi 500 triệu rồi trả lại 300 triệu | 33 → 16 → 33 người thỏa, có 5 trường hợp thiếu dữ liệu; giải thích C017 và C011 |
| 5 đến 6 phút | Chọn cash.deposited; xem tab thời gian và 5 lần tới, trở về event | Hai cơ chế rõ ràng, draft không mất cấu hình |
| 6 đến 8 phút | Thêm notification email/noti; mở email editor, chèn tên, preview C005, lưu quay lại | Nội dung được thiết lập và cá nhân hóa có ngữ cảnh |
| 8 đến 9 phút | Hiệu lực từ 29/09; bật hậu từng lần và theo kỳ; review rồi công bố; mở Tiến trình tự động | Hệ thống tự sinh tiến trình đúng cấu hình, không cần tạo job hoặc CNTT can thiệp |
| 9 đến 10 phút | Chạy EV-DEMO-001 cho C005; mở activation và task; gửi lại event | Thấy toàn bộ kết quả và kiểm soát trùng |
| 10 đến 11 phút | Nhận/hoàn tất task; mở batch kỳ mẫu và dashboard | Hậu xử lý có người và kết quả, số liệu nối được |
| 11 đến 12 phút | Mở conflict mẫu; xem evidence; sửa một kịch bản và nhìn badge bản nháp | Quản lý xung đột và phiên bản có lưu vết |

Tên và nội dung ở luồng tạo chỉ phục vụ demo khả năng thiết lập, không phải kế hoạch bán sản phẩm cụ thể. Nếu người xem muốn đi sâu, mở các nhánh bổ sung sau khi hoàn tất mạch chính.

## Các nhánh trình diễn bổ sung

- Editor: mở offer và chọn một bundle, xem sản phẩm hết hiệu lực bị chặn.
- Manager: mở business control để nhìn quyền, tham số và bản ghi mô phỏng; không thực thi tác động thật.
- Admin: xóa một draft thử, nhập lý do; mở audit. Sau đó tra execution của một kịch bản có tombstone để chứng minh lịch sử không mất.
- Operator: mở failed ActionRun, thử lại và xem attempt mới trong cùng action; counter activation giữ nguyên.
- Calendar: ngày 31, lịch nghỉ, validity ngắn, fixture lịch chưa đủ dữ liệu.

## Nội dung kết thúc buổi trình bày

Thu nhận ý kiến về ba quyết định gần nhất: phạm vi thử nghiệm nghiệp vụ, đơn vị chịu trách nhiệm từng thư viện dùng chung và nhóm đánh giá mockup. Các câu hỏi về ngân sách, tích hợp và tải thực được đưa sang khảo sát production. Ghi nhận yêu cầu mới vào sổ quyết định và đối chiếu ảnh hưởng tới màn hình, dữ liệu và test.

## Tiêu chí nghiệm thu quan sát được

| ID | Thao tác kiểm tra | Kết quả cần thấy |
|---|---|---|
| AC01 | Khởi tạo sạch | 24 kịch bản, 12 active, 6 danh mục đúng phân bố |
| AC02 | Mở mọi route/deep link | Có nội dung đúng; ID sai có lối quay lại |
| AC03 | Reload và reset demo | Reload giữ dữ liệu; reset chỉ xóa namespace SMS |
| AC04 | Bấm số active ở một danh mục | Danh sách đúng category và trạng thái, đếm khớp |
| AC05 | Kết hợp nhiều filter rồi Back | Facet cùng nhóm OR/khác nhóm AND, URL giữ ngữ cảnh |
| AC06 | Lưu view và đổi persona | View thuộc người dùng, không làm đổi seed |
| AC07 | Đi qua 5 bước và quay lại | Mỗi bước route riêng, không mất input |
| AC08 | Lưu nháp có trường chưa hợp lệ | Lưu được; Tiếp tục chỉ rõ lỗi |
| AC09 | Công thức chuẩn 300 triệu | 33 match, 82 no_match, 5 unknown |
| AC10 | Đổi ngưỡng 500 triệu | 16 match, 99 no_match, 5 unknown |
| AC11 | Lồng nhóm, chia 0, sai đơn vị, null | Trace rõ, không crash hoặc biến null thành 0 |
| AC12 | Đổi event/schedule rồi publish | Draft giữ hai bản tạm, published chỉ có mode đã chọn |
| AC13 | Chọn event cá nhân và product-wide | Candidate scope đúng resolver, không quét tùy tiện |
| AC14 | Test giờ/tuần/tháng/năm và exclusion | 5 mốc đúng hoặc thông báo không đủ lịch |
| AC15 | Ngày 31, 29/2 và validity end | Bỏ ngày không tồn tại, không chạy tại end exclusive |
| AC16 | Notification nhiều recipient/kênh | Mỗi kênh có nội dung riêng; thiếu nội dung báo lỗi |
| AC17 | Email editor save/cancel/back | Cập nhật đúng action; cancel giữ nội dung cũ |
| AC18 | Chèn biến và chọn offer hết hiệu lực | Preview đúng; token thiếu/sản phẩm hết hạn có lý do |
| AC19 | Bật cả hai followup | Config cùng tồn tại và review thấy đủ |
| AC20 | Sửa active và công bố v2 | v1 giữ nguyên; draft không làm mất active trước publish |
| AC21 | Pause, resume, end, expired | Trạng thái đúng theo đồng hồ; không bắt đầu lượt mới khi bị chặn |
| AC22 | Chạy EV-DEMO-001 rồi gửi lại | Chỉ một activation; lượt trùng có giải thích |
| AC23 | Retry một action lỗi | Thêm attempt, không thêm activation/task trùng |
| AC24 | Tạo task và hoàn tất có kết quả | List/detail/dashboard cập nhật từ cùng record |
| AC25 | Editor thực hiện công bố/xóa | Bị chặn bởi command và UI, không chỉ ẩn nút |
| AC26 | Cấu hình business control bằng Manager | Có tham số, chạy simulated, không tác động core |
| AC27 | Admin xóa có lý do | Tombstone/audit; lịch sử vẫn mở được; user thường không xóa |
| AC28 | Gây lỗi persistence | Không báo đã lưu; giữ draft và cho xuất dữ liệu |
| AC29 | Bật nhãn kỳ thống kê | KPI hiện tại và số liệu trong kỳ không lẫn nhau |
| AC30 | Đổi demoNow | Active/expired/overdue đổi đúng, không chạy action ngầm |
| AC31 | Xem thử điều kiện | Không sinh evaluation thực thi, activation, action hoặc task |
| AC32 | Batch kỳ và chạy lại cùng cửa sổ | Member snapshot giữ nguyên, không tạo batch/task trùng |
| AC33 | Hoàn tất batch | Không tự đóng task từng khách; snapshot và trạng thái hiện tại phân biệt |
| AC34 | Mở một conflict | Có version, rule, phạm vi, sample evidence và mức kết luận |
| AC35 | Sửa một bên conflict đã rà soát | Kết luận cũ cần rà soát, không tự chấp nhận version mới |
| AC36 | Không tìm thấy sample overlap | Ghi chưa phát hiện trên mẫu, không hứa không có xung đột |
| AC37 | Ngừng category/product đã dùng | Không chọn mới; version/history cũ còn thông tin |
| AC38 | Bàn phím và reduced motion | Focus đúng, mở/đóng dialog có kiểm soát, không cần drag |
| AC39 | 1440/1366/1024/768 px | Không cắt chữ/nút; panel collapse, bảng cuộn riêng |
| AC40 | Chạy mạch demo từ reset | Không dead button, không lỗi console, dữ liệu đối soát |
| AC41 | Mở dashboard và wizard | Đúng logo SHS theo nền, navy/cam từ asset; logo không méo, silk không che dữ liệu |
| AC42 | Công bố cấu hình event rồi xem tiến trình | Plan tự sinh có ID/version, chỉ một nguồn trigger; sơ đồ có đúng action và các nhánh hậu xử lý đã bật |
| AC43 | Gây lỗi compile hoặc persist khi công bố | Giữ draft và version/plan cũ, không báo thành công hoặc đăng ký nửa chừng |
| AC44 | Đổi event sang schedule và sửa action rồi công bố v2 | Sơ đồ/đăng ký/mô phỏng theo plan v2; lịch sử v1 vẫn tham chiếu plan v1 |

## Bộ test logic tối thiểu

Evaluator: all/any có null, 0 thật, exists, date, enum, phép tính, chia 0, depth limit. Calendar: anchor interval, weekly alignment, timezone +7, day31, leap day, excluded date, holiday range, effective boundary. Compiler: plan đúng config, chỉ một trigger, followup tùy bật, công bố lỗi nguyên tử, version pinning. Runtime: duplicate event, schedule identity, reentry sau no_match so với unknown, cooldown, immutable version, retry, batch dedup và quyền command.

Không cần test từng dòng CSS. Browser test tập trung đường đi làm mất dữ liệu, tạo trùng hoặc sai quyền. Kiểm tra thị giác bằng screenshot cho 6 màn trọng tâm và trạng thái dài/rỗng/lỗi. Chỉ chạy lại checks khi có thay đổi liên quan hoặc lỗi chưa giải quyết.

## Ghi nhận nghiệm thu

Khi code hoàn tất, tạo báo cáo ngắn gồm build/lint/unit/E2E đã chạy, AC chưa đạt nếu có, ảnh những màn trọng tâm và giới hạn còn lại. Không đánh dấu AC đạt chỉ vì component tồn tại. Không gọi mockup hoàn chỉnh khi một hành động chính chỉ phát toast mà không tạo kết quả liên quan.
