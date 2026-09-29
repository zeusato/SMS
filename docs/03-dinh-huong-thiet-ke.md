# Định hướng thiết kế mockup SMS

## Ý đồ thiết kế

Giao diện là công cụ điều hành cho công ty chứng khoán và dịch vụ quản lý tài sản. Người xem cần cảm nhận được khả năng làm chủ hệ thống qua dữ liệu rõ, thao tác chính xác và đường đi xuyên suốt. Hướng thiết kế là nền sáng, cấu trúc chắc, khoảng trắng có chủ đích, kết hợp xanh navy và cam từ brand assets SHS do người dùng cung cấp. Các quy tắc UI dưới đây là đề xuất áp dụng asset vào SMS; chưa có brand guideline đầy đủ để coi mọi token là quy chuẩn thương hiệu chính thức.

## Brand assets đã nhận

| File gốc tại thư mục dự án | Nội dung đã kiểm tra | Cách dùng |
|---|---|---|
| `Logo light.png` | Logo màu, chữ SHS navy, nền trong suốt | Sidebar và những nền sáng |
| `Logo dark.png` | Logo màu, chữ SHS trắng, nền trong suốt | Chỉ dùng khi đặt trên nền navy hoặc nền tối có tương phản |
| `Logo n slogan.png` | Logo và slogan Kiến tạo Tài chính thịnh vượng | Điểm mở đầu dashboard ở kích thước đọc được hoặc màn giới thiệu demo |
| `silk.png` | Dải silk cam vàng, nền trong suốt | Điểm nhấn thương hiệu tiết chế ở vùng mở đầu; không phủ lên bảng hay công thức |

Khi code, sao chép nguyên bản vào `mockup/public/brand/`, đặt alias lần lượt `shs-light.png`, `shs-dark.png`, `shs-slogan.png`, `shs-silk.png`. Không đổi màu, vẽ lại, bóp méo hoặc ghi đè nguồn. Giữ chữ SMS riêng cạnh logo để nhận diện ứng dụng. Không dùng cả logo thường và logo slogan cạnh nhau gây lặp.

Các PNG có khoảng trong suốt khá lớn. Dùng wrapper SVG với viewBox theo bounding box để hiển thị gọn, hoặc wrapper CSS tương đương; giữ file nguồn nguyên vẹn. Metadata pixel nằm trong `brand-assets.json`. Tên dark/light chỉ mục đích nền: logo dark có chữ trắng nên sẽ mất chữ trên nền trắng.

Logo thường có chiều rộng phần nhìn thấy khoảng 112–128 px trong sidebar. Logo slogan chỉ xuất hiện nếu phần nhìn thấy rộng ít nhất 360 px, không ép slogan vào sidebar. Silk dùng một vị trí trong dashboard, kích thước có kiểm soát, không lặp nền ở mọi màn. Không đặt chữ nghiệp vụ trên phần màu đậm của silk.

Nền component là Fluent UI React v9, được tùy biến bằng theme và layout của SMS. Dùng một hệ component xuyên suốt. Với sản phẩm nhiều bảng và wizard, không áp dụng bố cục landing page, hero lớn hoặc các khối marketing.

## Những khoảnh khắc cần tạo ấn tượng

1. Dashboard nhìn được cả cấu trúc danh mục và tình trạng vận hành trong một viewport, bấm số liệu đi đúng vào bản ghi liên quan.
2. Thêm một đại lượng vào công thức, đổi toán tử hoặc ngưỡng, đọc diễn giải và chạy xem thử để thấy tập khách hàng thay đổi có lý do.
3. Chuyển giữa sự kiện và thời gian thấy hai bộ giao diện thực sự khác nhau; lịch hiển thị các lần chạy tiếp theo.
4. Mở editor email, chèn biến, đổi khách mẫu và thấy nội dung được cá nhân hóa; lưu trở về không mất tiến độ.
5. Mở một cảnh báo xung đột và nhìn được bằng chứng đối chiếu, thay vì chỉ một nhãn đỏ chung chung.
6. Đi từ lượt kích hoạt tới action, nội dung đã gửi mô phỏng, task và kết quả hoàn tất; dashboard phản ánh thay đổi đó.

Mỗi khoảnh khắc phải có tương tác chạy được. Animation hỗ trợ hiểu thay đổi, không thay thế nghiệp vụ.

## Token và nền tảng hình ảnh

| Token | Giá trị đề xuất | Sử dụng |
|---|---|---|
| canvas | `#F5F7FA` | Nền làm việc |
| surface | `#FFFFFF` | Form, bảng, panel |
| surfaceSubtle | `#EEF2F6` | Vùng đọc, secondary selection |
| text | `#142538` | Nội dung chính |
| textSecondary | `#526579` | Mô tả, metadata |
| border | `#DCE3EB` | Phân tách và input |
| brand | `#0A2762` | Navy lấy từ logo, dùng CTA chính và trạng thái lựa chọn |
| brandSoft | `#EDF2FA` | Nền selection theo navy |
| brandAccent | `#FE8700` | Cam lấy từ logo, điểm nhấn và bước đang thực hiện |
| brandAccentSoft | `#FFF3E3` | Nền nhấn nhẹ, chữ navy |
| success | `#176B47` | Trạng thái tốt, thỏa điều kiện |
| warning | `#8A5900` | Cần chú ý, chưa đủ dữ liệu |
| danger | `#B42332` | Lỗi, xung đột xác định |
| radius | 6 / 10 / 14 px | Input / panel / dialog |
| spacing | 4 / 8 / 12 / 16 / 24 / 32 px | Khoảng cách có quy luật |

Font dùng Segoe UI, fallback Arial/sans-serif; kiểm tra đầy đủ dấu tiếng Việt. Không phụ thuộc tải font mạng trong buổi trình bày. Tiêu đề trang 28/34 px semibold, section 18/26, body 14/22, metadata 12/18. Số lớn dashboard 32/38, số tiền dùng tabular-nums. Nội dung điều kiện và lỗi tối thiểu 13 px.

Input cao 36 px, primary button 38 px, dòng bảng 52 px ở chế độ thường. Dấu trạng thái luôn kèm chữ hoặc icon; không dựa riêng vào màu. Text chính cần tương phản 4.5:1. Bóng chỉ dùng cho lớp nổi, dropdown, drawer; bảng và form phân vùng bằng nền/spacing/border nhẹ.

Icon dùng `@fluentui/react-icons`, cùng nét và kích thước 20 px; đây là lựa chọn đồng bộ với Fluent cho sản phẩm này. Không sử dụng emoji hoặc tự vẽ logo SHS. Dùng logo gốc cùng tên SMS và dòng Scenario Management System. Nút navy dùng chữ trắng; trên cam dùng chữ navy để giữ tương phản. Không dùng cam làm chữ nhỏ trên nền trắng.

## Khung ứng dụng

Desktop mục tiêu 1440 × 900, kiểm tra thêm 1366 × 768 và 1920 × 1080. Sidebar sáng 224 px có logo light cùng tên SMS, 4 mục chính và công cụ demo ở cuối. Topbar 60 px chứa breadcrumb, tìm kiếm phạm vi trang và persona. Nội dung có padding 28 px, chiều rộng tối đa 1680 px. Khung nhìn luôn có nhãn Dữ liệu minh họa và mốc demo nhỏ nhưng đọc được.

Sidebar cùng theme sáng, active item dùng brandSoft và vạch nhấn xanh. Giữ độ tương phản của shell thấp hơn nội dung chính. Không đặt tiêu đề trang và action vào một vùng hero lớn. Primary CTA nằm cùng hàng với title ở góc phải; tác vụ phụ gom vào menu có nhãn rõ.

Tablet 1024 px: thu sidebar còn icon với tooltip, panel xem trước chuyển sang drawer. Dưới 768 px: nav drawer, form một cột, table cuộn trong vùng riêng. Mockup ưu tiên desktop, nhưng không được tràn toàn trang hay che nút điều hướng trên màn hẹp.

## Bố cục các màn trọng tâm

### Dashboard

Trên cùng là title/period/CTA. Dưới là một dải chỉ số gọn, tránh biến mọi chỉ số thành thẻ lớn. Vùng chính chia 8/4: bên trái danh mục dạng ma trận 2 cột × 3 hàng; bên phải Cần chú ý. Mỗi ô danh mục là điểm điều hướng thật, có tổng và active với typography phân cấp.

Nửa dưới có biểu đồ xu hướng trải rộng 8 cột và danh sách hoạt động gần đây 4 cột. Nếu viewport thấp, ưu tiên ma trận danh mục và 3 cảnh báo đầu tiên trước biểu đồ. Không đưa hàng chục KPI vào một màn.

```text
┌ Sidebar ┬ Tổng quan                   Kỳ thống kê      Tạo kịch bản ┐
│         ├ Tổng KB   Active   Kích hoạt   KH duy nhất   Việc quá hạn ┤
│         ├ Danh mục A      Danh mục B   ┬ Cần chú ý                 │
│         │ Danh mục C      Danh mục D   │ Xung đột / Lỗi / Quá hạn   │
│         │ Danh mục E      Danh mục F   │ Bấm để xử lý               │
│         ├ Xu hướng kích hoạt          ┼ Hoạt động gần đây         │
└─────────┴─────────────────────────────┴────────────────────────────┘
```

### Công xưởng điều kiện

Wizard có stepper 5 bước trên vùng nội dung. Ba panel có ranh giới rõ: thư viện, cây điều kiện, diễn giải/xem thử. Thư viện dùng tree hoặc accordion tìm kiếm được. Đại lượng là dòng có tên và đơn vị, không phải các thẻ trang trí chiếm diện tích.

Nhóm AND/OR thể hiện bằng đường nối dọc mảnh, nền rất nhẹ và nhãn Tất cả/Ít nhất một. Điều kiện có bố cục tuyến tính, nút thêm nằm đúng cấp. Nhóm được chọn có focus outline. Khi hover một đại lượng, panel định nghĩa xuất hiện gọn; không tự bật tooltip che toán tử.

Kết quả xem thử là dải Thỏa/Không thỏa/Thiếu dữ liệu và danh sách khách. Chọn một người sẽ tô tương ứng các nhánh điều kiện đạt/chưa đạt cùng giá trị cụ thể. Đây là điểm nhấn thị giác của demo.

```text
┌ Thư viện 260 ┬ Cây điều kiện                  ┬ Diễn giải 320       ┐
│ Tìm đại lượng│ Cấp xét: Khách hàng             │ Câu nghiệp vụ       │
│ Cổ phiếu     │ TẤT CẢ                          │ Mốc dữ liệu         │
│ Phái sinh    │ ├ [Đại lượng] [>=] [Giá trị]    │ Xem thử             │
│ Nợ           │ └ ÍT NHẤT MỘT                   │ Thỏa / Không / Thiếu│
│ Hồ sơ        │   ├ [Điều kiện]                 │ Danh sách đối tượng │
│ Hành vi      │   └ [Điều kiện]                 │ Giải thích lựa chọn │
└──────────────┴─────────────────────────────────┴─────────────────────┘
```

### Trigger

Hai tab có icon sự kiện và lịch, summary nằm cùng vị trí ở cả hai. Theo sự kiện dùng thư viện trái và cấu hình giữa; theo thời gian dùng form trái và lịch xem trước phải. Lịch 5 lần tới hiển thị ngày, thứ, giờ và lý do ngày bị bỏ khi phù hợp.

### Hành động và editor

Action hiển thị dạng danh sách đánh số theo thứ tự chạy. Mỗi action tóm tắt người nhận/kênh hoặc sản phẩm, có Expand để sửa. Chọn kênh thay phần soạn thảo; không đặt mọi form email/SMS/noti mở cùng lúc.

Editor riêng có cột thuộc tính 240 px, vùng soạn khoảng 640 px và preview chuyển desktop/mobile. Dùng khung email có whitespace, title, đoạn, CTA, footer đơn giản. Không dựng trình thiết kế email kéo thả toàn năng trong mockup.

### Quản lý và xung đột

Bảng quản lý có filter bar hai tầng: search/view ở trên, chips dưới; filter nâng cao mở panel. Một row hiển thị tên và mã ở hai dòng, trạng thái dạng badge nhỏ, warning có số và tooltip. Bulk selection chỉ xuất hiện nếu đã có tác vụ bulk thực sự; không làm checkbox rỗng chức năng.

Đối chiếu xung đột chia hai cột đối xứng, chung hàng cho hiệu lực, đối tượng và action để dễ nhìn khác biệt. Khối bằng chứng phía dưới liệt kê khách mẫu chung, phạm vi thời gian và ruleId. Kết luận rà soát nằm cuối; không đặt cảnh báo đỏ tràn màn.

### Chi tiết thực hiện

Header tóm tắt đối tượng, phiên bản, nguồn kích hoạt và trạng thái. Bên trái dòng thời gian; bên phải snapshot và action đang chọn. Nội dung đã render mở trong drawer. Hậu xử lý là link thực đến task, không chỉ một badge.

## Chuyển động và phản hồi

- Hover/focus 100–140 ms; mở drawer/tab 160–220 ms; thêm nhóm điều kiện 180 ms.
- Chỉ animate opacity và transform cho chuyển lớp, không animate liên tục biểu đồ hoặc số liệu.
- Xem thử có progress ngắn theo thao tác thật; không thêm chờ giả dài để làm màu.
- Tôn trọng prefers-reduced-motion. Không thay đổi dữ liệu, tự chuyển trang hoặc chạy lại demo bằng timer nền.
- Sau save/publish/complete task có toast rõ đối tượng và link liên quan. Validation hiển thị tại trường, kèm tổng hợp đầu màn khi submit.

## Tiêu chí hoàn thiện thị giác

1. Toàn bộ màn dùng một bộ font, spacing, radius và trạng thái.
2. Không có nút chưa hoạt động, biểu đồ không giải thích được hoặc số liệu không dẫn tới cơ sở.
3. Mốc dữ liệu, hiệu lực và kỳ thống kê có nhãn riêng; người trình bày không cần giải thích để che mâu thuẫn.
4. Nội dung tiếng Việt hoàn chỉnh, không lorem ipsum hoặc tên khách hàng thật.
5. Wizard giữ vị trí stepper/footer khi nội dung dài, không che dropdown hay lỗi.
6. Bàn phím dùng được với các thao tác chính; focus trở về đúng nút khi đóng dialog/drawer.
7. Screenshot kiểm tra riêng dashboard, công thức lồng nhóm, editor, xung đột, lịch sử và task tại 1440 × 900 và 1366 × 768.

## Cơ sở chọn nền component

[Fluent 2 hướng dẫn phát triển React](https://fluent2.microsoft.design/get-started/develop) mô tả Fluent UI React v9 và cách cung cấp theme qua FluentProvider. SMS sử dụng nền đó cho thành phần nhập liệu và tương tác; bố cục và token bên trên là đề xuất riêng của mockup.
