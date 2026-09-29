# Quyết định và đối chiếu yêu cầu

## Trạng thái tài liệu

Yêu cầu đã được người dùng đưa ra trong hội ý là căn cứ cao nhất. Những bổ sung được chấp nhận ở mức ý tưởng được ghi là đã thống nhất về hướng. Những lựa chọn chi tiết để code được ghi riêng là quy ước mockup và có thể điều chỉnh mà không coi là thay đổi phạm vi hệ thống thật.

## Yêu cầu và điểm thực hiện

| ID | Yêu cầu | Điểm thể hiện | Kiểm tra |
|---|---|---|---|
| R01 | Dashboard danh mục, tổng và active, thống kê và chú ý | S01 | AC01, AC04, AC29 |
| R02 | Tạo qua nhiều màn với mục đích riêng | S03–S07 | AC07 |
| R03 | Thông tin tên và danh mục | S03 | AC08 |
| R04 | Thư viện đại lượng tài sản và phi tài sản | S04, S16 | AC09–AC11 |
| R05 | Công thức so sánh, AND/OR và biểu thức | S04 | AC09–AC11 |
| R06 | Kích hoạt event hoặc thời gian, UI riêng | S05 | AC12 |
| R07 | Thư viện sự kiện chia nhóm | S05, S16 | AC13 |
| R08 | Chu kỳ, giờ, interval, ngày nghỉ và khoảng ngừng | S05 | AC14, AC15 |
| R09 | Nhiều hành động và nhiều kênh thông báo | S06 | AC16 |
| R10 | Người nhận KH, tư vấn, DVKH và cấp quản lý | S06 | AC16 |
| R11 | Khóa tài khoản, phát vay, rút tiền, giao dịch | S06 | AC26 |
| R12 | Offer sản phẩm hoặc bộ sản phẩm trên hệ giao dịch | S06, S15 | AC18; chỉ preview mô phỏng |
| R13 | Ngày bắt đầu và kết thúc | S07 | AC15, AC21 |
| R14 | Hậu xử lý từng lần hoặc theo khoảng thống kê | S07, S13 | AC19, AC24, AC32, AC33 |
| R15 | Quản lý toàn bộ, hiệu lực, trạng thái, filter đa chiều | S02 | AC05, AC06 |
| R16 | Phát hiện xung đột nội dung | S12 | AC34–AC36 |
| R17 | Sửa, không xóa bởi người thường; admin xóa lỗi | S02, S09 | AC25, AC27 |
| R18 | Soạn nội dung tại màn hoặc email editor riêng | S06, S08 | AC17, AC18 |
| R19 | Khai báo danh mục và sản phẩm dịch vụ | S14, S15 | AC37 |
| R20 | Chi tiết, lịch sử, khách liên quan và lý do | S09–S11 | AC20, AC22, AC23 |
| R21 | Có nơi cán bộ xử lý công việc | S13 | AC24, AC33 |
| R22 | Xem thử và kiểm tra trước khi hoạt động | S04, S07 | AC09, AC31 |
| R23 | Lưu phiên bản, bản sửa tách bản chạy | S09 | AC20 |
| R24 | Bộ tài liệu trình bày và plan dev trước code | Toàn bộ docs, Word | Bàn giao lượt hiện tại |
| R25 | Dùng brand assets được cung cấp | `03`, brand-assets.json, P01 | AC41 |
| R26 | Flow tạo kịch bản trực quan bằng sơ đồ | `01`, `08`, Word và figures | Hai sơ đồ hiển thị đủ, dễ đọc |
| R27 | Tự sinh tiến trình vận hành từ cấu hình, không cần CNTT làm từng job | S07, S09, `05`, `08`, P06–P07 | AC42–AC44 |

## Quy ước mockup để triển khai ngay

| ID | Quyết định tạm dùng | Lý do | Có thể đổi khi nào |
|---|---|---|---|
| D01 | 5 bước, review drawer trong bước 5 | Giữ flow người dùng đã mô tả | Khi thử UX cho thấy thiếu thông tin |
| D02 | Activation là một đối tượng đủ điều kiện; evaluation có thể nhiều đối tượng | Tránh đếm lẫn lượt quét và khách | Trước chốt KPI production |
| D03 | Một category chính và nhiều tags | Hỗ trợ dashboard cùng filter đa chiều | Nếu cần cây category nhiều cấp |
| D04 | Customer/account scope; investment scope chưa bật | Bao phủ demo mà vẫn thể hiện khả năng mở rộng | Khảo sát data model thật |
| D05 | Nhiều event theo OR, không chuỗi | Đơn giản và có ngữ nghĩa rõ | Khi có yêu cầu correlation |
| D06 | Action tuần tự, lỗi vẫn thử action sau | Hành vi deterministic cho demo | Chốt dependency/compensation thật |
| D07 | Viewer/Editor/Manager/Admin; manager công bố | Thể hiện quyền, chưa tự thêm nhiều cấp duyệt | Chốt phân quyền và maker-checker |
| D08 | Xóa admin dùng tombstone, vẫn giữ audit/history | Giữ yêu cầu lưu vết | Chốt chính sách dữ liệu và thao tác lỗi |
| D09 | Pause chặn lượt mới, việc đang có tiếp tục | Không bỏ công việc đã giao | Chốt xử lý in-flight thật |
| D10 | Đổi version áp dụng lượt mới, reentry giữ theo scenario | Chống lặp khi chỉnh cấu hình | Chốt migration và reset nghiệp vụ |
| D11 | End exclusive, UTC+7, ngày không tồn tại bỏ | Biên rõ để code và kiểm tra | Khi xác nhận lịch và múi giờ thật |
| D12 | Batch đóng băng tập dữ liệu, rerun không tạo trùng | Thống kê có thể truy lại | Chốt xử lý late-arriving data |
| D13 | Conflict trên cấu trúc/tập mẫu; semantic nghi vấn gắn fixture | Không hứa engine hiểu mọi nội dung | Khi nghiên cứu giải pháp hệ thống thật |
| D14 | Theme sáng, Fluent với logo SHS, navy #0A2762 và cam #FE8700 lấy từ asset | Dùng nhận diện đã được cung cấp | Khi có guideline chi tiết khác với màu trích từ asset |
| D15 | 24 kịch bản và 120 khách giả, localStorage | Demo phong phú và kiểm soát được | Khi cần test quy mô khác |
| D16 | Lịch giao dịch hữu hạn là fixture minh họa | Tránh coi thứ Hai–Sáu là lịch sở chính thức | Khi có nguồn lịch thật |
| D17 | AutomationPlan logic, sinh khi công bố; mô phỏng tiêu thụ plan | Chứng minh cấu hình thành vận hành mà không cần backend trong demo | Khi chốt nền tảng thực thi production |

## Những điểm cần chốt trước production

1. Chủ sở hữu sản phẩm SMS và người chịu trách nhiệm định nghĩa từng metric, event, action.
2. Chuẩn định danh khách hàng, tài khoản, danh mục, khoản đầu tư và phạm vi tổng hợp tài sản.
3. Định nghĩa chỉ tiêu, độ mới, thời điểm chốt và cách xử lý dữ liệu chưa đủ/đến trễ.
4. Quyền tạo, sửa, công bố, dừng, xóa và các hành động kiểm soát nghiệp vụ; trường hợp cần nhiều người duyệt.
5. Chính sách tiếp xúc, ưu tiên, xử lý xung đột, khả năng miễn trừ và trách nhiệm quyết định.
6. Cơ chế triển khai một phiên bản mới với các lượt đang chờ, các lịch đang chạy và task đã giao.
7. Lịch giao dịch/nghỉ, múi giờ, xử lý bỏ lỡ lịch và thay đổi lịch có hiệu lực.
8. Nguồn và vòng đời sản phẩm, offer, nội dung và quyền sử dụng kênh.
9. Nguồn tích hợp, SLA, tải, retry, replay, audit retention và phân quyền phía server.
10. Tổ chức nhận việc, thời hạn và chuẩn kết quả hậu xử lý theo từng mục tiêu.

Những câu hỏi này không chặn việc xây mockup vì D01–D17 đã quy định cách trình diễn. Chúng cần được đưa vào khảo sát thực tế trước khi các quy ước demo trở thành logic vận hành.

## Những điều chưa được quyết định

Chưa chốt ngân sách, ngày go-live, nhà cung cấp, kiến trúc backend, việc thay thế CRM, khả năng tích hợp hiện hữu hoặc dùng AI cho tạo/phân tích kịch bản. Chưa có yêu cầu làm app mobile, chatbot hay engine tư vấn đầu tư tự động. Không thêm những phạm vi này vào mockup mặc định.

## Nhật ký bộ tài liệu

29/09/2026: triển khai mockup React/TypeScript/Fluent UI trong `mockup/`, dùng nguyên bản asset SHS. Có 5 màn tạo, review dạng ngăn phải, email editor, compiler AutomationPlan và runtime mô phỏng, dashboard/quản lý, lịch sử/phiên bản, công việc/batch, conflict và danh mục. Metadata của thư viện kỹ thuật còn cố định; retry lưu số lần thử thay vì timeline riêng. [QA bản triển khai](../mockup/QA.md) ghi rõ phần đã kiểm chứng và phần chưa nghiệm thu đủ; không coi mockup là production.

29/09/2026: tạo phiên bản 0.1 từ hội ý. Bao gồm yêu cầu FE đã thống nhất, quy ước mô phỏng, định hướng thị giác, kế hoạch P01–P09 và AC01–AC40. Chưa triển khai ứng dụng mockup.

29/09/2026: phiên bản 0.2 bổ sung nhận diện SHS từ 4 asset được cung cấp, hai sơ đồ trực quan, đầu ra AutomationPlan và AC41–AC44. Cập nhật đồng bộ kế hoạch và bàn giao code; chưa triển khai ứng dụng mockup.
