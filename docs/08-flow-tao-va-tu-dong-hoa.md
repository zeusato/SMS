# Luồng tạo kịch bản và tự động hóa

## Kết quả nghiệp vụ cần đạt

Khi người dùng hoàn tất cấu hình và công bố, SMS tự sinh một tiến trình tự động mang đúng thiết lập để vận hành. Không có bước bàn giao từng kịch bản cho CNTT viết job, cron hoặc trigger riêng. CNTT xây khả năng dùng chung và tích hợp; nghiệp vụ tự tạo, sửa, công bố và quản lý các kịch bản dựa trên những khả năng đã có.

Lưu nháp chỉ giữ cấu hình chưa công bố. Công bố hợp lệ tạo phiên bản thực thi và đăng ký tiến trình. Đến ngày hiệu lực, tiến trình bắt đầu chờ sự kiện hoặc lịch. Hành động chỉ được thực hiện khi có kích hoạt phù hợp và đối tượng đủ điều kiện.

## Sơ đồ thiết lập

![Năm bước tạo và công bố](figures/01-tao-kich-ban.png)

```mermaid
flowchart TD
  S1[1 Thông tin chung\nTên danh mục mục đích người phụ trách] --> S2[2 Điều kiện thỏa mãn\nĐại lượng công thức nhóm AND OR]
  S2 --> S3[3 Cơ chế kích hoạt\nSự kiện HOẶC lịch thời gian]
  S3 --> S4[4 Hành động thực hiện\nThông báo giao việc offer kiểm soát]
  S4 --> S5[5 Hiệu lực và hậu xử lý\nBắt đầu kết thúc từng lần và theo kỳ]
  S5 --> V{Kiểm tra và công bố}
  V -->|Còn lỗi| E[Chỉ rõ bước và trường cần sửa]
  E --> S1
  V -->|Hợp lệ| P[Hệ thống tạo phiên bản thực thi]
  P --> R[Đăng ký sự kiện hoặc lịch và quy tắc hậu xử lý]
  R --> W[Tiến trình tự động chờ theo hiệu lực]
```

Mũi tên quay lại bước 1 biểu diễn quay lại wizard; lỗi cụ thể phải dẫn về đúng bước có trường sai, không bắt đi lại từ đầu. Editor email là nhánh phụ của bước 4 và quay lại đúng action. Hai chế độ hậu xử lý ở bước 5 có thể bật đồng thời.

## Sơ đồ vận hành

![Vận hành tự động](figures/02-van-hanh-tu-dong.png)

```mermaid
flowchart TD
  E[Sự kiện phù hợp] --> G[Tiến trình đã đăng ký và đang có hiệu lực]
  T[Đến mốc lịch] --> G
  G --> D[Xác định đối tượng và lấy dữ liệu]
  D --> C{Đủ điều kiện và qua chính sách}
  C -->|Không hoặc thiếu dữ liệu| N[Ghi nhận lý do và kết thúc lượt đánh giá]
  C -->|Có| A[Thực hiện các hành động đã cấu hình]
  A --> H[Hậu xử lý từng lần nếu bật]
  A --> L[Lưu kết quả và lịch sử]
  H --> L
  L --> B[Đến lịch tổng hợp\nHậu xử lý theo kỳ nếu bật]
  B --> U[Giao việc và ghi nhận kết quả]
  U --> O[Dashboard thống kê và truy vết]
  N --> O
  L --> O
```

Hậu xử lý theo kỳ là nhánh độc lập lấy các bản ghi trong cửa sổ dữ liệu; không yêu cầu từng task của mọi khách phải hoàn tất trước mới được tổng hợp. Các lượt tiếp theo tiếp tục theo event/lịch và quy tắc tái kích hoạt cho tới khi tạm dừng, hết hiệu lực hoặc kết thúc.

## Hệ thống sinh những gì khi công bố

| Đầu ra | Nội dung |
|---|---|
| Phiên bản cấu hình | Snapshot thông tin chung, điều kiện, trigger, action, hiệu lực và hậu xử lý |
| Định nghĩa tiến trình | Các bước thực thi cùng tham số, tham chiếu phiên bản và mã tiến trình |
| Đăng ký kích hoạt | Event subscription hoặc lịch cùng lịch nghỉ và quy tắc tái kích hoạt |
| Quy tắc hậu xử lý | Cách tạo task từng lần và cách tổng hợp theo kỳ |
| Trạng thái vận hành | Chờ hiệu lực, đang chờ kích hoạt, tạm dừng, hết hiệu lực hoặc đã kết thúc |

Các đầu ra được tạo trong một thao tác công bố thống nhất. Nếu cấu hình không hợp lệ hoặc không sinh được tiến trình, không công bố nửa chừng. Bản đang hoạt động trước đó tiếp tục nguyên vẹn, người dùng nhận lỗi tại draft.

## Thể hiện trong mockup

Sau Công bố, hiển thị kết quả Tiến trình tự động đã được tạo, mã tiến trình, phiên bản và nguồn kích hoạt. Trong chi tiết kịch bản có tab Tiến trình tự động thể hiện sơ đồ chỉ đọc, tham số đã gắn, trạng thái và mốc lịch tiếp theo hoặc event đang lắng nghe.

Plan được sinh từ config thật trong store, không là một hình minh họa cố định. Sửa loại trigger/action rồi công bố phải làm sơ đồ và tham số đổi tương ứng. Hành động bên ngoài được mô phỏng; giao diện không khẳng định đã triển khai job production hoặc đang chạy nền khi browser đóng.

## Mã nguồn sơ đồ

Ảnh PNG dùng trong Word được render từ hai SVG cùng tên trong `figures`. Nội dung tương ứng được giữ dưới dạng Mermaid ở trên để chỉnh sửa và trao đổi. Khi flow thay đổi, cập nhật cả nội dung, hình và tiêu chí kiểm tra.
