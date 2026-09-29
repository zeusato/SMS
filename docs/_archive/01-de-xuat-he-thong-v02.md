# Đề xuất hệ thống quản lý kịch bản SMS

## Đề xuất để xem xét

Đề xuất xây dựng SMS để các đơn vị nghiệp vụ chủ động thiết lập và vận hành kịch bản tương tác với khách hàng dựa trên dữ liệu, sự kiện và lịch thời gian. Hệ thống cho phép cấu hình điều kiện, hành động, hiệu lực và phần việc tiếp theo trong một quy trình thống nhất, đồng thời lưu lại kết quả để kiểm tra và cải thiện.

Thành phẩm của việc thiết lập là một tiến trình tự động được hệ thống sinh ra khi công bố kịch bản hợp lệ. Tiến trình mang đầy đủ điều kiện, sự kiện hoặc lịch, hành động, hiệu lực và hậu xử lý để vận hành đúng thiết kế. Nghiệp vụ không cần chuyển từng kịch bản sang CNTT để lập trình job hoặc trigger riêng. CNTT cung cấp nền tảng cùng các nguồn dữ liệu và khả năng hành động dùng chung.

Ở giai đoạn hiện tại, đề nghị thống nhất định hướng sản phẩm, đầu mối phối hợp và phạm vi kiểm chứng bằng mockup tương tác. Sau khi kiểm chứng, các bên sẽ xác định dữ liệu khả dụng, phương án tích hợp, phạm vi triển khai đầu tiên và nguồn lực cần thiết. Chưa có cơ sở xác định ngân sách, tiến độ hệ thống thật hoặc mức tăng trưởng doanh thu.

Tài liệu dành cho ban lãnh đạo, kinh doanh, Wealth, dịch vụ khách hàng, vận hành, quản trị rủi ro, sản phẩm, dữ liệu và công nghệ. Mục đích là thống nhất hệ thống cần làm gì, người dùng sẽ vận hành như thế nào và những quyết định cần đưa ra trước khi đầu tư triển khai.

## Bối cảnh và nhu cầu

Công ty hiện cung cấp dịch vụ chứng khoán cơ sở, phái sinh, cho vay margin, ứng trước và đang mở rộng sang trái phiếu, money market, chứng chỉ quỹ cùng các sản phẩm đầu tư khác. Định hướng quản lý tài sản đòi hỏi khả năng nhìn khách hàng qua nhiều lớp tài sản, nhu cầu, kế hoạch và lịch sử tương tác.

Các điểm chạm hiện tại chủ yếu xuất phát từ tài sản và giao dịch. Để phục vụ sâu hơn, công ty cần nhận biết tình huống đáng quan tâm, xác định khách hàng liên quan và thực hiện phản ứng phù hợp. Phản ứng có thể là thông báo, giới thiệu sản phẩm, giao việc cho cán bộ phụ trách hoặc một thao tác kiểm soát nghiệp vụ.

Nếu mỗi ý tưởng đều được chuyển thành một yêu cầu CNTT riêng để xây job, tiến trình hoặc trigger, tốc độ thử nghiệm sẽ phụ thuộc vào năng lực phát triển của từng đợt. Logic phân tán cũng khiến việc quản lý thay đổi, giải thích kết quả và kiểm soát các kịch bản tác động cùng khách hàng trở nên khó khăn.

SMS cung cấp một nơi để các bên thiết lập, quan sát và quản lý những logic đó. CNTT chuẩn bị dữ liệu, sự kiện và khả năng thực hiện hành động. Nghiệp vụ kết hợp những thành phần được cung cấp thành kịch bản và điều chỉnh trong phạm vi quyền hạn.

Các hệ thống giao dịch, quản lý tài khoản, dữ liệu thị trường, CRM và kênh giao tiếp là những nguồn hoặc đích tích hợp cần khảo sát. SMS chỉ có thể thực hiện các thao tác mà các hệ thống đó thực sự cung cấp. Chưa xác nhận giao diện kết nối hoặc mức độ sẵn sàng của từng hệ thống.

## Giá trị và cách kiểm chứng

Giá trị đầu tiên là khả năng biến ý tưởng thành cấu hình có thể thử nghiệm và xem xét. Các lợi ích kinh doanh cần được đo khi thí điểm; mockup chỉ chứng minh mức rõ ràng và khả năng sử dụng của thiết kế.

| Mục tiêu | Năng lực SMS cần cung cấp | Cách kiểm chứng đề xuất |
|---|---|---|
| Rút ngắn thời gian thiết lập | Dùng lại đại lượng, sự kiện và hành động | Đo thời gian tạo và sửa kịch bản so với quy trình hiện tại |
| Tiếp cận đúng tình huống | Điều kiện, lịch, sự kiện và quy tắc tái kích hoạt | Kiểm tra tập được chọn và lý do loại trừ trên dữ liệu mẫu |
| Phục vụ khách hàng có ngữ cảnh | Giao việc kèm dữ liệu và lịch sử liên quan | Cán bộ nhận việc có đủ thông tin để xử lý |
| Kiểm soát vận hành | Phiên bản, lịch sử, quyền và cảnh báo xung đột | Truy lại được một quyết định và phiên bản đã áp dụng |
| Học từ kết quả | Ghi nhận phản hồi và hậu xử lý | Theo dõi được phần việc hoàn tất và kết quả theo mục tiêu |

Chỉ số cần phân biệt gồm lượt đánh giá, lượt kích hoạt đủ điều kiện, khách hàng duy nhất, hành động thành công và kết quả nghiệp vụ. Số lượt gửi hoặc mở tin không tự chứng minh hiệu quả quản lý tài sản.

## Phạm vi sản phẩm

SMS gồm sáu khu vực chính: dashboard, quản lý kịch bản, quy trình tạo kịch bản, chi tiết và lịch sử thực hiện, công việc hậu xử lý, danh mục và cấu hình. Nội dung thông báo được soạn ngay trong hành động hoặc bằng editor riêng.

| Khu vực | Khả năng người dùng cần có |
|---|---|
| Dashboard | Xem danh mục, số kịch bản, số đang hoạt động, thống kê và điểm cần chú ý |
| Quản lý kịch bản | Tìm kiếm, lọc đa chiều, xem hiệu lực, trạng thái, sửa, tạm dừng và rà soát xung đột |
| Tạo kịch bản | Đi qua năm màn độc lập với mục đích rõ ràng và lưu nháp xuyên suốt |
| Chi tiết và lịch sử | Xem cấu hình, phiên bản, khách hàng liên quan, lý do và kết quả từng lần thực hiện |
| Hậu xử lý | Theo dõi công việc phát sinh từng lần hoặc theo kỳ, người nhận, hạn và kết quả |
| Danh mục và cấu hình | Quản lý danh mục kịch bản, sản phẩm, dịch vụ và các thành phần dùng chung |

## Luồng tạo và công bố kịch bản

Người dùng đi qua năm màn độc lập để biến ý định nghiệp vụ thành cấu hình thực thi. Việc kiểm tra và công bố nằm ở màn cuối. Khi còn lỗi, hệ thống chỉ rõ bước cần sửa; khi hợp lệ, hệ thống tự tạo tiến trình và đăng ký chờ sự kiện hoặc lịch đã chọn.

![Sơ đồ năm bước tạo kịch bản và tự sinh tiến trình](figures/01-tao-kich-ban.png)

Tiến trình bắt đầu chờ theo hiệu lực đã đặt. Nếu ngày bắt đầu ở tương lai, trạng thái là Chờ hiệu lực; việc công bố không làm các hành động chạy ngay lập tức.

## Quy trình tạo kịch bản

### Thông tin chung

Người dùng khai báo tên, danh mục, mô tả mục đích, đơn vị và người phụ trách. Mã kịch bản được sinh để tra cứu. Nhãn giúp quản lý đa chiều bên cạnh danh mục chính.

### Điều kiện thỏa mãn

Màn hình là nơi xây công thức từ thư viện đại lượng. Đại lượng được chia theo tài sản cổ phiếu, phái sinh, nợ, trái phiếu, chứng chỉ quỹ, money market, hồ sơ và hành vi khách hàng. Mỗi đại lượng cần có định nghĩa, phạm vi và kiểu dữ liệu để người dùng chọn đúng.

Người dùng kết hợp phép tính, phép so sánh và các nhóm điều kiện tất cả hoặc ít nhất một. Màn hình diễn giải công thức thành ngôn ngữ dễ đọc và cho xem thử tập khách hàng trên dữ liệu có thời điểm xác định. Thiếu dữ liệu được hiển thị riêng, không quy thành số không.

### Cơ chế kích hoạt

Người dùng chọn một trong hai chế độ. Theo sự kiện sử dụng thư viện sự kiện chia nhóm như onboard, tiền, giao dịch, quyền, lưu ký, vay nợ và từng loại sản phẩm. Theo thời gian cho phép chọn chu kỳ giờ, ngày, tuần, tháng, năm, khoảng cách giữa các lần, giờ cụ thể và lịch nghỉ.

Cơ chế kích hoạt quyết định khi nào đánh giá. Điều kiện thỏa mãn quyết định đối tượng đủ tiêu chuẩn. Quy tắc tái kích hoạt xác định khi nào được thực hiện lại cho cùng đối tượng.

### Hành động thực hiện

Một kịch bản có thể có nhiều hành động. Thông báo được cấu hình theo người nhận và kênh, gồm khách hàng, cán bộ tư vấn, DVKH hoặc nhân sự cấp cao. Mỗi kênh có nội dung phù hợp; email có editor riêng khi cần bố cục phức tạp.

Các hành động khác gồm giao việc, hiển thị offer từ sản phẩm hoặc bộ sản phẩm đã khai báo, và kiểm soát nghiệp vụ như khóa tài khoản, phát vay, rút tiền hoặc giao dịch. Thao tác kiểm soát cần quyền tương ứng và phương án thực thi được các đơn vị nghiệp vụ thống nhất.

### Hiệu lực và hậu xử lý

Người dùng thiết lập thời gian bắt đầu, kết thúc hoặc không xác định ngày kết thúc. Hiệu lực là khoảng thời gian kịch bản được phép hoạt động. Lịch kích hoạt là những thời điểm đánh giá nằm trong khoảng đó.

Hậu xử lý có hai chế độ độc lập và có thể cùng bật. Chế độ từng lần tạo phần việc gắn với lần kích hoạt và đối tượng liên quan. Chế độ theo kỳ tổng hợp các lần kích hoạt và kết quả trong một khoảng thời gian rồi giao phần việc cần xử lý. Kỳ dữ liệu và lịch thực hiện tổng hợp được cấu hình riêng.

Trước khi hoàn tất, người dùng xem bản tổng hợp, kiểm tra lỗi cấu hình, xem trước tác động và xử lý các điểm cần chú ý. Lưu nháp được hỗ trợ trong toàn bộ quy trình.

## Tiến trình tự động sau khi công bố

SMS chuyển cấu hình đã công bố thành định nghĩa thực thi có phiên bản, đăng ký nguồn kích hoạt và tự điều phối các bước vận hành. Một sự kiện hoặc mốc lịch làm hệ thống đánh giá đúng tập đối tượng, kiểm tra điều kiện và chính sách, thực hiện hành động rồi tạo phần việc hậu xử lý. Mọi kết quả được ghi lại để tra cứu và thống kê.

![Sơ đồ tiến trình tự động vận hành sau công bố](figures/02-van-hanh-tu-dong.png)

Tiến trình tự động ở đây là một quy trình logic do nền tảng quản lý; không bắt buộc sinh một chương trình hoặc tiến trình máy chủ riêng cho mỗi kịch bản. Khi sửa và công bố phiên bản mới, hệ thống tự cập nhật định nghĩa cho những lượt tiếp theo, đồng thời giữ nguyên lịch sử phiên bản đã chạy.

Trong mockup, việc sinh định nghĩa tiến trình và hiển thị trạng thái được thực hiện trên dữ liệu local. Việc phát sự kiện, đến lịch và tác động ra hệ thống khác được mô phỏng có kiểm soát để trình diễn rõ vòng tự động hóa.

## Quản lý và quan sát

Màn quản lý thể hiện toàn bộ kịch bản với danh mục, người phụ trách, hiệu lực, trạng thái và cảnh báo. Bộ lọc kết hợp nhiều chiều như nhóm sản phẩm, nhãn, kênh, loại kích hoạt và loại hành động. Bấm vào một kịch bản sẽ mở cấu hình, thống kê, lịch sử chỉnh sửa và lịch sử thực hiện.

Người dùng thông thường được sửa theo quyền nhưng không được xóa. Kịch bản dừng hoặc hết hiệu lực vẫn tồn tại để tra cứu và thống kê. Quản trị viên có quyền xóa để xử lý thao tác lỗi; việc xóa phải có nhật ký. Chính sách xóa vật lý và lưu giữ dữ liệu của hệ thống thật cần được quyết định riêng.

Khi sửa một kịch bản đang hoạt động, bản chỉnh sửa được lưu riêng trước khi áp dụng. Các lần thực hiện giữ tham chiếu tới phiên bản và nội dung đã sử dụng. Điều này giúp số liệu và bằng chứng lịch sử không thay đổi theo cấu hình hiện tại.

Mỗi lần kích hoạt có thể mở xuống danh sách khách hàng, kết quả kiểm tra điều kiện, hành động và hậu xử lý. Người vận hành cần phân biệt chưa thực hiện, đang chờ, thành công, thất bại và bị loại trừ, đồng thời biết lý do của từng trạng thái.

## Phát hiện và xử lý xung đột

Phát hiện xung đột cần xét đối tượng, thời gian và nội dung hoặc hành động. Hai kịch bản tác động cùng khách hàng chưa đủ để kết luận mâu thuẫn. Hệ thống cần chỉ ra vùng chồng lấn và cơ sở đánh dấu.

Các xung đột có quy tắc rõ có thể kiểm tra từ cấu hình có cấu trúc. Những nghi vấn về ý nghĩa nội dung cần người có trách nhiệm rà soát. Mockup sẽ minh họa cả hai mức và thể hiện giới hạn của phép kiểm tra trên tập dữ liệu mẫu.

Người dùng mở cảnh báo để đối chiếu, điều chỉnh phạm vi, hiệu lực, nội dung hoặc ghi nhận kết luận. Việc đánh dấu đã xem xét không tự làm thay đổi kịch bản. Phần mềm cần giữ lại lý do và người xử lý.

## Nguyên tắc nền tảng

### Định nghĩa thống nhất và có thể mở rộng

Kịch bản được tạo từ các thành phần dùng chung: đối tượng, đại lượng, sự kiện, điều kiện, hành động và chính sách. Một định nghĩa đại lượng cần có cùng ý nghĩa ở mọi kịch bản. CNTT bổ sung khả năng mới khi cần dữ liệu hoặc thao tác chưa được cung cấp.

### Trạng thái và thời gian được quản lý rõ

Bản định nghĩa, lượt đánh giá, lần kích hoạt cho một đối tượng, lần thực hiện hành động và công việc hậu xử lý là các đối tượng khác nhau. Cần quản lý được chờ phản hồi, hết hạn, thử lại và tái kích hoạt mà không nhầm với việc tạo kịch bản mới.

### Kết quả có thể giải thích

Mỗi quyết định gắn với dữ liệu, thời điểm và phiên bản. Số liệu tổng quan phải truy được xuống bản ghi chi tiết. Không dùng trạng thái gửi thành công để suy ra khách đã đọc, hoặc dùng đọc tin để suy ra đã hoàn thành mục tiêu.

### Có chính sách chung cho nhiều kịch bản

Ưu tiên, hạn mức liên hệ, chống trùng và điều phối nguồn lực cần được áp dụng nhất quán. Những quy tắc cụ thể của công ty phải được các đơn vị liên quan xác định trước khi vận hành thực tế.

## Cách phối hợp giữa các bên

| Bên liên quan | Nội dung cần đóng góp |
|---|---|
| Ban lãnh đạo và chủ chương trình | Mục tiêu, phạm vi ưu tiên, đầu mối và cơ chế quyết định |
| Kinh doanh Wealth và DVKH | Điều kiện nghiệp vụ, cách tương tác, trách nhiệm nhận việc và kết quả cần đo |
| Sản phẩm và vận hành | Định nghĩa sản phẩm, sự kiện, trạng thái nghiệp vụ và hành động khả dụng |
| Dữ liệu và CNTT | Nguồn, định danh, độ mới, tích hợp và cơ chế thực thi |
| Rủi ro và các đơn vị kiểm soát liên quan | Quyền, điều kiện kiểm soát nghiệp vụ, lưu vết và phê duyệt cần thiết |

Phân công trong bảng là đề xuất để thảo luận, chưa phải bổ nhiệm hoặc cam kết nguồn lực.

## Phạm vi kiểm chứng bằng mockup

Mockup là ứng dụng FE tương tác sử dụng dữ liệu giả lập nhất quán. Người xem có thể đi từ dashboard vào danh sách, tạo một kịch bản qua năm màn, thử điều kiện, soạn nội dung, lưu và kích hoạt mô phỏng, kiểm tra lịch sử, nhận việc hậu xử lý, sửa phiên bản và đối chiếu xung đột.

Các bộ lọc, công thức được hỗ trợ, biểu mẫu, lịch xem trước, trạng thái và dữ liệu giữa màn hình cần hoạt động thực sự trong trình duyệt. Gửi thông báo, khóa tài khoản, xuất bản offer lên ứng dụng giao dịch và kết nối dữ liệu được mô phỏng. Nhãn dữ liệu minh họa phải hiện rõ trong môi trường trình diễn.

Định hướng hình ảnh là giao diện nghiệp vụ sáng, rõ và có độ hoàn thiện cao. Điểm nhấn nằm ở vùng xây điều kiện, diễn giải và xem trước kết quả, bản đối chiếu xung đột và đường đi từ số liệu tổng quan tới từng hành động. Bố cục cần đọc tốt trên màn hình laptop và máy chiếu.

## Đường triển khai đề xuất

| Giai đoạn | Sản phẩm bàn giao | Điều kiện chuyển tiếp |
|---|---|---|
| Kiểm chứng ý tưởng | Mockup và biên bản phản hồi | Các bên hiểu thống nhất luồng, khái niệm và trách nhiệm |
| Khảo sát khả năng thực hiện | Danh mục dữ liệu, sự kiện, hành động và tích hợp | Xác định được nguồn và chủ sở hữu của các khả năng ưu tiên |
| Xác định phạm vi triển khai đầu | Yêu cầu chi tiết, kiến trúc và kế hoạch nguồn lực | Chốt đầu ra, tiêu chí đo và những giới hạn cần thiết |
| Thí điểm và đánh giá | Phạm vi vận hành có kiểm soát cùng báo cáo kết quả | Có bằng chứng về chất lượng dữ liệu, xử lý và giá trị nghiệp vụ |

Kế hoạch dev mockup được tách thành các gói công việc có đầu vào, đầu ra và tiêu chí nghiệm thu. Thời lượng thực hiện sẽ được ước lượng khi xác định người làm và điều kiện môi trường; tài liệu này không gắn ngày hoàn thành chưa được cam kết.

## Các quyết định cần đưa ra

Ở vòng trình bày đầu tiên, cần thống nhất phạm vi SMS, chủ sở hữu nghiệp vụ, nhóm tham gia kiểm chứng và tiêu chí đánh giá mockup. Sau đó cần chốt cấp đối tượng xét điều kiện, cách định nghĩa chỉ tiêu, quyền xuất bản và kiểm soát nghiệp vụ, nguyên tắc ưu tiên khi xung đột, lịch nghiệp vụ và chính sách lưu giữ.

Các quy ước kỹ thuật giúp xây mockup ngay đã được ghi riêng để không biến thành quyết định mặc định cho hệ thống thật. Việc triển khai production sẽ cần bổ sung khảo sát hệ thống hiện hữu và yêu cầu phi chức năng dựa trên tải, nguồn dữ liệu và mức độ quan trọng của hành động.

## Tài liệu tham chiếu

Trao đổi yêu cầu hình thành SMS ngày 29/09/2026 và tệp SHS_Cay_noi_dung_va_kich_ban_cham_soc_KH.xlsx trong thư mục dự án. Tệp có 48 kịch bản đề xuất và các quy tắc chăm sóc, là một nguồn tình huống tham khảo trong phạm vi rộng hơn của SMS.

Các tài liệu kèm theo gồm đặc tả sản phẩm và FE, định hướng thiết kế, kế hoạch dev mockup, mô hình dữ liệu mô phỏng, kịch bản demo và nghiệm thu, cùng sổ quyết định. Đây là cơ sở bàn giao để xây và đánh giá mockup.
