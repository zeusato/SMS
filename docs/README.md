# Bộ tài liệu hệ thống quản lý kịch bản

Phiên bản thuyết minh hiện hành 0.3 · Tháng 9 năm 2026.

## Phương án triển khai

[Bản Word có nhận diện SHS](deliverables/SHS_Phuong_an_trien_khai_he_thong_quan_ly_kich_ban_v03.docx) là tài liệu dùng để trình bày ý tưởng và trao đổi phương án triển khai với ban lãnh đạo cùng các bên liên quan.

[Nguồn nội dung](09-phuong-an-trien-khai.md) trình bày định vị hệ thống, nguyên tắc thiết kế, phương pháp xây dựng kịch bản, nền tảng dữ liệu, luồng thiết lập và vận hành, cơ chế thực thi, quản trị, ứng dụng, lộ trình, tiêu chí nghiệm thu và trách nhiệm phối hợp. Ba sơ đồ minh họa mô hình năng lực, năm bước thiết lập và công bố, cùng luồng xử lý từ tín hiệu đến kết quả.

Nhận diện sử dụng tài sản SHS được cung cấp trong thư mục gốc. Logo và họa tiết được giữ nguyên hình ảnh nguồn; bảng và sơ đồ dùng màu thương hiệu. Tài liệu mô tả phương án đề xuất, không xác nhận các năng lực này đã được triển khai tại công ty.

## Tài liệu thiết kế và phát triển giao diện

Các tài liệu dưới đây phục vụ công việc xây dựng và kiểm chứng giao diện; các quy ước mô phỏng trong đó không mặc nhiên trở thành thiết kế vận hành chính thức.

| Nhu cầu | Tài liệu |
|---|---|
| Yêu cầu và hành vi giao diện | [Đặc tả sản phẩm và FE](02-dac-ta-san-pham-va-fe.md) |
| Thiết kế và nhận diện | [Định hướng thiết kế](03-dinh-huong-thiet-ke.md) |
| Phát triển giao diện | [Kế hoạch dev](04-ke-hoach-dev-mockup.md), [Bàn giao](HANDOFF.md) |
| Dữ liệu và hành vi mô phỏng | [Dữ liệu và mô phỏng](05-du-lieu-va-mo-phong.md) |
| Trình diễn và kiểm tra | [Demo và nghiệm thu](06-demo-va-nghiem-thu.md) |
| Các quyết định thiết kế | [Quyết định và đối chiếu](07-quyet-dinh-va-doi-chieu.md) |
| Chi tiết luồng cấu hình | [Flow tạo và tự động hóa](08-flow-tao-va-tu-dong-hoa.md) |
| Chạy ứng dụng | [Hướng dẫn ứng dụng và deploy](../README.md), [Kết quả kiểm tra](../QA.md) |

## Quản lý phiên bản

- Nội dung Word phiên bản 0.3 được sinh từ `09-phuong-an-trien-khai.md` bằng `docs/_build/build_implementation_proposal.py`.
- Các bản Word 0.1 và 0.2 được giữ lại để đối chiếu. Nội dung đề xuất 0.2 được lưu tại [_archive/01-de-xuat-he-thong-v02.md](_archive/01-de-xuat-he-thong-v02.md).
- Dữ liệu khách hàng, sản phẩm và thống kê trên giao diện trình diễn là dữ liệu mô phỏng.
- Bảng Excel nghiệp vụ trong thư mục gốc là nguồn tham khảo tình huống; các ngưỡng, lịch và quy trình trong đó cần được xác nhận khi xác lập phạm vi triển khai.
