from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def update(name, pairs, append=''):
    path = ROOT / name
    text = path.read_text(encoding='utf-8')
    for old, new in pairs:
        assert old in text, (name, old)
        text = text.replace(old, new)
    path.write_text(text.rstrip() + '\n' + append, encoding='utf-8')

update('README.md', [
    ('Phiên bản 0.1', 'Phiên bản 0.2'),
    ('| Tất cả |', '| Chủ nghiệp vụ và FE | [Flow tạo và tự động hóa](08-flow-tao-va-tu-dong-hoa.md) | Nhìn rõ 5 bước cấu hình và tiến trình tự sinh sau công bố |\n| Tất cả |'),
    ('3. Các tài liệu chính thức', '3. Bốn brand asset SHS tại thư mục gốc là nguồn nhận diện cho mockup. Quy tắc dùng nằm ở `03`, tọa độ và tên file ở `brand-assets.json`.\n4. Các tài liệu chính thức'),
    (', 6 trang.', ', có sơ đồ tạo kịch bản và vận hành tự động.'),
], '\nBổ sung phiên bản 0.2: dùng brand assets SHS; minh họa flow bằng hai sơ đồ; đặc tả đầu ra tiến trình tự động được sinh từ cấu hình công bố, không cần CNTT lập trình riêng từng kịch bản.\n')

update('HANDOFF.md', [
    ('→ 03 thiết kế → 05 dữ liệu', '→ 03 thiết kế và brand-assets.json → 08 flow tự động hóa → 05 dữ liệu'),
    ('Theme sáng xanh đậm, layout và token trong `03`.', 'Theme sáng với navy SHS #0A2762 và cam #FE8700, layout và token trong `03`. Sao chép nguyên bản 4 asset từ thư mục gốc vào public/brand theo brand-assets.json; dùng đúng biến thể logo và silk có tiết chế.'),
    ('10. Không tự phát triển', '10. Khi công bố hợp lệ, tự sinh AutomationPlan từ cấu hình và hiển thị tab Tiến trình tự động; sơ đồ phải phản ánh cấu hình thực, không dùng ảnh cố định. Mockup mô phỏng đầu vào và tác động ngoài; hệ thống thật vận hành tự động sau công bố.\n11. Không tự phát triển'),
])

update('02-dac-ta-san-pham-va-fe.md', [
    ('Phiên bản 0.1.', 'Phiên bản 0.2.'),
    ('| Lượt đánh giá |', '| Tiến trình tự động | Định nghĩa vận hành sinh từ phiên bản công bố: trigger, điều kiện, hành động, hiệu lực và hậu xử lý |\n| Lượt đánh giá |'),
    ('  F --> D[Chi tiết kịch bản]', '  F --> P[Kiểm tra và công bố]\n  P --> G[Tự sinh tiến trình tự động]\n  G --> D[Chi tiết kịch bản]'),
    ('## S09 Chi tiết kịch bản', 'Sau khi kiểm tra hợp lệ, Công bố tự sinh tiến trình và đăng ký nguồn kích hoạt trong cùng một thao tác. Thành công hiển thị “Tiến trình tự động đã được tạo”, mã tiến trình, phiên bản, cơ chế kích hoạt và trạng thái chờ hiệu lực/đang hoạt động. Có CTA Xem tiến trình để mở S09. Không yêu cầu người dùng tạo job hoặc nhờ CNTT cấu hình thêm. Nếu tạo/ghi tiến trình thất bại, giữ nháp và phiên bản đang chạy; không công bố một phần. Chi tiết flow ở `08`.\n\n## S09 Chi tiết kịch bản'),
    ('Tabs: Tổng quan, Cấu hình, Lịch sử thực hiện', 'Tabs: Tổng quan, Cấu hình, Tiến trình tự động, Lịch sử thực hiện'),
    ('Tạm dừng ngăn lượt mới;', 'Tab Tiến trình tự động hiển thị mã, phiên bản, trạng thái, nguồn sự kiện hoặc 5 mốc lịch tiếp theo và sơ đồ chỉ đọc sinh từ AutomationPlan. Node điều kiện/hành động/hậu xử lý mở panel cấu hình tương ứng. Có hai nhánh hậu xử lý khi cả hai được bật. Thay cấu hình rồi công bố phải tạo sơ đồ tương ứng phiên bản mới. Kịch bản còn nháp chưa có tiến trình; không vẽ trạng thái đang chạy giả.\n\nTạm dừng ngăn lượt mới;'),
])

update('04-ke-hoach-dev-mockup.md', [
    ('    domain/       types, validation, evaluator, scheduler, lifecycle', '    domain/       types, validation, plan compiler, evaluator, scheduler, lifecycle'),
    ('  e2e/', '  public/brand/   bốn asset SHS nguyên bản theo brand-assets.json\n  e2e/'),
    ('Thực hiện: scaffold; theme;', 'Thực hiện: scaffold; sao chép 4 brand asset, tạo wrapper hiển thị theo bounds; theme navy/cam SHS;'),
    ('AC01, AC02, AC03, AC29, AC30', 'AC01, AC02, AC03, AC29, AC30, AC41'),
    ('validation liên bước, publish,', 'validation liên bước, sinh AutomationPlan và đăng ký trigger khi publish theo `08`, success panel và tab Tiến trình tự động với sơ đồ từ dữ liệu, '),
    ('AC19, AC20, AC21, AC25, AC27.', 'AC19, AC20, AC21, AC25, AC27, AC42–AC44. Unit test công bố nguyên tử và version/plan liên kết đúng.'),
    ('simulation modal; evaluation pipeline;', 'simulation modal; evaluation pipeline tiêu thụ AutomationPlan đã sinh;'),
    ('- Không tự động chạy action mỗi lần React rerender.', '- Công bố hợp lệ tự sinh tiến trình logic; không có màn tạo job thủ công. Sơ đồ tiến trình và mô phỏng cùng đọc một AutomationPlan bất biến.\n- Không tự động chạy action mỗi lần React rerender.'),
])

update('05-du-lieu-va-mo-phong.md', [
    ('| EvaluationRun | id, scenarioId, versionId,', '| AutomationPlan | id, scenarioId, versionId, generatedAt, configSnapshot, nodes, edges, triggerRegistration, followupRegistrations | Một plan bất biến cho mỗi phiên bản công bố |\n| EvaluationRun | id, scenarioId, versionId, planId,'),
    ('## Cây điều kiện', '''## Tự sinh tiến trình từ cấu hình

Khi công bố, command kiểm tra quyền và toàn bộ config, tạo ScenarioVersion bất biến, compile thành AutomationPlan rồi cập nhật publishedVersionId và đăng ký trigger trong cùng một commit store. Chỉ thông báo thành công sau khi ghi persistence thành công. Nếu validation, compile hoặc persist lỗi, giữ nguyên version/plan đang hoạt động và draft; không để version mới chạy một phần.

Compiler là hàm thuần, nhận config đã chuẩn hóa và ID phiên bản. Nó tạo các node có kiểu trigger, validity, resolve_subject, condition, policy, action, followup_each, followup_period và audit; node action giữ actionId và thứ tự, node hậu xử lý chỉ xuất hiện nếu bật. Plan mang configSnapshot đầy đủ cùng nodes/edges để hiển thị và thực thi thống nhất; không parse ngược nhãn trên sơ đồ.

triggerRegistration là union event hoặc schedule, chỉ nhánh đã chọn. followupRegistrations chứa lịch tổng hợp độc lập nếu có. Khóa plan theo versionId bảo đảm nhấn công bố lặp không tạo nhiều đăng ký. Không lưu cờ active riêng dễ lệch: trạng thái được dẫn xuất từ Scenario.controlState, deletedAt, validity và việc plan thuộc publishedVersionId hiện tại.

Mô phỏng lấy plan đang có hiệu lực, xác minh nguồn đầu vào, rồi thực thi pipeline bên dưới bằng configSnapshot của plan. EvaluationRun lưu planId; sửa/công bố phiên bản mới chỉ thay nguồn cho lượt mới. Lượt đang có giữ plan cũ. Seed của mọi phiên bản đã công bố cũng phải đi qua cùng compiler.

AutomationPlan là tiến trình logic do nền tảng dùng chung vận hành, không tương đương một OS process riêng cho mỗi kịch bản. Trong mockup, compile, lưu và hiển thị plan hoạt động thật tại trình duyệt; đầu vào thời gian/sự kiện và tác động ngoài được điều khiển bằng công cụ demo. Không tuyên bố có scheduler backend chạy khi đóng trình duyệt. Hai sơ đồ nghiệp vụ và đầu ra hiển thị nằm ở `08`.

## Cây điều kiện'''),
])

update('06-demo-va-nghiem-thu.md', [
    ('review rồi công bố | Kịch bản đủ thành phần, chỉ công bố một trigger', 'review rồi công bố; mở Tiến trình tự động | Hệ thống tự sinh tiến trình đúng cấu hình, không cần tạo job hoặc CNTT can thiệp'),
    ('## Bộ test logic tối thiểu', '''| AC41 | Mở dashboard và wizard | Đúng logo SHS theo nền, navy/cam từ asset; logo không méo, silk không che dữ liệu |
| AC42 | Công bố cấu hình event rồi xem tiến trình | Plan tự sinh có ID/version, chỉ một nguồn trigger; sơ đồ có đúng action và các nhánh hậu xử lý đã bật |
| AC43 | Gây lỗi compile hoặc persist khi công bố | Giữ draft và version/plan cũ, không báo thành công hoặc đăng ký nửa chừng |
| AC44 | Đổi event sang schedule và sửa action rồi công bố v2 | Sơ đồ/đăng ký/mô phỏng theo plan v2; lịch sử v1 vẫn tham chiếu plan v1 |

## Bộ test logic tối thiểu'''),
    ('Runtime: duplicate event,', 'Compiler: plan đúng config, chỉ một trigger, followup tùy bật, công bố lỗi nguyên tử, version pinning. Runtime: duplicate event,'),
])

update('07-quyet-dinh-va-doi-chieu.md', [
    ('## Quy ước mockup để triển khai ngay', '''| R25 | Dùng brand assets được cung cấp | `03`, brand-assets.json, P01 | AC41 |
| R26 | Flow tạo kịch bản trực quan bằng sơ đồ | `01`, `08`, Word và figures | Hai sơ đồ hiển thị đủ, dễ đọc |
| R27 | Tự sinh tiến trình vận hành từ cấu hình, không cần CNTT làm từng job | S07, S09, `05`, `08`, P06–P07 | AC42–AC44 |

## Quy ước mockup để triển khai ngay'''),
    ('Theme sáng xanh đậm với Fluent | Phù hợp sản phẩm nghiệp vụ và demo | Khi có brand guideline chính thức', 'Theme sáng, Fluent với logo SHS, navy #0A2762 và cam #FE8700 lấy từ asset | Dùng nhận diện đã được cung cấp | Khi có guideline chi tiết khác với màu trích từ asset'),
    ('## Những điểm cần chốt trước production', '| D17 | AutomationPlan logic, sinh khi công bố; mô phỏng tiêu thụ plan | Chứng minh cấu hình thành vận hành mà không cần backend trong demo | Khi chốt nền tảng thực thi production |\n\n## Những điểm cần chốt trước production'),
    ('D01–D16', 'D01–D17'),
], '\n29/09/2026: phiên bản 0.2 bổ sung nhận diện SHS từ 4 asset được cung cấp, hai sơ đồ trực quan, đầu ra AutomationPlan và AC41–AC44. Cập nhật đồng bộ kế hoạch và bàn giao code; chưa triển khai ứng dụng mockup.\n')

update('_build/build_document.py', [('Phiên bản 0.1', 'Phiên bản 0.2'), ("'233D58' if ri==0", "'0A2762' if ri==0")])
print('Updated documentation and handoff to v0.2.')
