# Kế hoạch phát triển mockup SMS

## Đầu ra cần đạt

Một ứng dụng FE tương tác, tiếng Việt, chạy local và trình diễn được toàn bộ luồng trong `06`. Mockup phải có dữ liệu xuyên màn hình, lưu nháp/phiên bản, kiểm tra điều kiện, mô phỏng kích hoạt và công việc. Thiết kế tuân theo `03`; không dừng ở tập ảnh hoặc các trang tĩnh rời nhau.

Thư mục ứng dụng dự kiến là `mockup/` dưới workspace hiện tại. Lượt viết tài liệu chưa tạo thư mục ứng dụng hoặc cài gói. Mọi công việc trong kế hoạch này bắt đầu khi người dùng yêu cầu code.

## Lựa chọn công nghệ

| Phần | Lựa chọn cho mockup | Lý do và giới hạn |
|---|---|---|
| App | React và TypeScript với Vite | SPA local, tránh backend chưa cần |
| Điều hướng | React Router chế độ declarative | Route riêng cho từng bước, deep link và Back |
| Component | Fluent UI React v9 và Fluent icons | Form, tab, dialog, menu, table cùng hệ |
| Styling | Fluent theme và CSS module cho bố cục | Giữ theme rõ, không trộn nhiều UI kit |
| State | Context + useReducer, normalized entities | Quy mô demo nhỏ, reducer là nơi duy nhất mutate nghiệp vụ |
| Persist | Repository localStorage có schemaVersion | Giữ dữ liệu khi refresh, reset có phạm vi |
| Email | Tiptap React và các extension cần dùng | JSON editor, biến có cấu trúc, preview có kiểm soát |
| Biểu đồ | SVG biểu đồ dữ liệu đơn giản có axis/tooltip và bảng thay thế | Không cần dashboard library cho một trend chart; không tự vẽ icon |
| Unit test | Vitest | Kiểm tra evaluator, lịch, lifecycle và dedup |
| Browser test | Playwright | Luồng 5 bước, editor quay lại, history và quyền |

Khi khởi tạo, đọc package.json trước, kiểm tra peer dependency và runtime. Chốt version tương thích bằng lockfile; không ghi version đoán trong kế hoạch. Vite hiện có yêu cầu Node cụ thể nên phải kiểm tra tài liệu chính thức tại thời điểm cài. Không cài runtime hoặc thư viện trong lượt tài liệu này.

Lệnh khởi tạo dự kiến: dùng runtime Node đã được môi trường cung cấp, scaffold Vite react-ts vào `mockup`, rồi cài React Router, Fluent và Tiptap theo tài liệu chính thức. Dependency chính không cần server hay tài khoản dịch vụ. Playwright cần browser có sẵn hoặc cơ chế browser được môi trường cho phép; nếu không dùng được phải ghi rõ phần kiểm thử chưa chạy.

## Cấu trúc thư mục dự kiến

```text
mockup/
  src/
    app/          router, providers, app shell, demo controls
    components/   form fields, status badges, table toolbar, empty states
    features/
      overview/
      scenarios/  list, details, versions
      builder/    five steps, draft lifecycle
      conditions/ metric picker, AST editor, explain panel
      triggers/   event picker, schedule form, next-run preview
      actions/    action list, notification, offer, business control
      content/    email editor, variable picker, previews
      execution/  simulation, evaluation, activation detail
      conflicts/  scan results, side-by-side comparison, review
      tasks/      individual tasks, period batches
      catalogs/   categories, products, bundles, capabilities
    domain/       types, validation, plan compiler, evaluator, scheduler, lifecycle
    data/         catalogs, deterministic seed, simulation adapters
    state/        reducer, selectors, commands, persistence
    styles/       tokens, layout, component refinements
    tests/        pure unit tests and fixtures
  public/brand/   bốn asset SHS nguyên bản theo brand-assets.json
  e2e/
  package.json
  README.md
```

Component không sửa trực tiếp localStorage. View gửi command; command kiểm tra quyền và trạng thái rồi reducer cập nhật; selectors đọc lại cùng source. Giữ domain logic độc lập React để kiểm tra được. Không tạo tầng API giả chỉ để tăng số file; repository interface đủ để thay nguồn sau này.

## Thứ tự triển khai

Các gói sau là thứ tự dependency, không phải ước lượng ngày làm. Mỗi gói phải có đường dùng được trước khi chuyển sang gói phụ thuộc. Không mở rộng production giữa chừng.

### P01 Nền ứng dụng và dữ liệu

Đầu vào: `02` phần route, `03` token, `05` entities và seed.

Thực hiện: scaffold; sao chép 4 brand asset, tạo wrapper hiển thị theo bounds; theme navy/cam SHS; shell; router; persona demo; đồng hồ cố định; model; repository; seed 24 kịch bản và 120 khách; catalogs; selectors. Kiểm tra công thức seed đã nêu trước khi xây UI.

Đầu ra: tất cả route có nội dung khung đúng, dữ liệu nhất quán, refresh giữ store, reset đúng namespace. Baseline đếm 24 tổng/12 active, không có fake summary riêng.

Nghiệm thu: AC01, AC02, AC03, AC29, AC30, AC41 trong `06`.

### P02 Dashboard và quản lý

Thực hiện: dashboard đúng bố cục, chart có dữ liệu, cảnh báo có đích; danh sách filter/sort/pagination; saved view; detail shell; category navigation. Chỉ đưa thao tác có behavior vào menu, những thao tác chưa xây ẩn trong quá trình phát triển.

Đầu ra: vòng click dashboard → filter list → detail → back giữ bộ lọc. Component hoàn thiện thị giác ở gói này để các màn sau kế thừa.

Nghiệm thu: AC04, AC05, AC06. Kiểm tra screenshot 1440 × 900 và 1366 × 768.

### P03 Wizard và công xưởng điều kiện

Thực hiện: draft command; 5 route độc lập; bước 1; bước 2 với metric library, AST editor, nhóm lồng, phép tính, validation, diễn giải và xem thử; auto-save và thoát màn. Các bước 3–5 chưa hoàn thành có scaffold nội dung cụ thể, chỉ chuyển tiếp khi được xây xong.

Đầu ra: tạo draft, refresh quay lại, thêm/sửa/xóa nhóm, xem đối tượng và trace. Evaluator phải đúng trước khi làm animation.

Nghiệm thu: AC07 đến AC11, AC28. Unit test thật cho null, nhóm lồng, kiểu/đơn vị và chia 0.

### P04 Kích hoạt

Thực hiện: event catalog, nhiều event OR, payload filter, subject resolver; calendar form tất cả recurrence đã chốt; next 5 runs, exclusion, nghỉ và hiệu lực; reentry config. Preview lịch cập nhật khi đổi hiệu lực ở bước 5.

Đầu ra: hai giao diện kích hoạt khác nhau, union lưu đúng một chế độ. Không mất dữ liệu đang soạn khi đổi tab.

Nghiệm thu: AC12 đến AC15. Unit test ngày cuối tháng, 29/2, lịch thiếu dữ liệu, timezone và start/end.

### P05 Hành động và editor

Thực hiện: action list; nhiều recipient/channel; nội dung noti/SMS; editor email riêng với biến, template, CTA và preview; offer picker/bundle; quyền business control. Điều chỉnh preview để nhìn tốt trên máy chiếu.

Đầu ra: thêm nhiều action với cấu hình khác nhau, email save-return về đúng draft/action, offer chọn sản phẩm có hiệu lực. Không đưa HTML tự do thực thi vào preview.

Nghiệm thu: AC16, AC17, AC18, AC26. Browser test giữ nháp và kết quả thay biến.

### P06 Hiệu lực công bố và phiên bản

Thực hiện: bước 5, followup cả hai mode, review drawer, validation liên bước, sinh AutomationPlan và đăng ký trigger khi publish theo `08`, success panel và tab Tiến trình tự động với sơ đồ từ dữ liệu,  clone-to-edit, compare version, pause/resume/end, admin deletion log. Thông báo lưu chưa thành công nếu quota lỗi.

Đầu ra: hoàn thành đủ flow tạo. Scenario detail và list phản ánh đúng phiên bản công bố/bản nháp. Không thêm bước duyệt nhiều cấp ngoài phạm vi.

Nghiệm thu: AC19, AC20, AC21, AC25, AC27, AC42–AC44. Unit test công bố nguyên tử và version/plan liên kết đúng.

### P07 Mô phỏng lịch sử và hậu xử lý

Thực hiện: simulation modal; evaluation pipeline tiêu thụ AutomationPlan đã sinh; adapter mock notification/offer/control; activation detail; retry attempt; individual tasks; period batches; report snapshot và work completion. Cập nhật selectors thống kê từ records thực.

Đầu ra: một đường đi hoàn chỉnh từ trigger tới task có kết quả. Phân biệt preview, evaluation và activation trong cả UI và dữ liệu.

Nghiệm thu: AC22, AC23, AC24, AC31, AC32, AC33. Unit test dedup và retry không nhân bản task.

### P08 Xung đột và danh mục

Thực hiện: conflict rules trên sample, fixture nghi vấn ngữ nghĩa có nhãn; compare, review reason, invalidate review theo version; category/product/bundle CRUD giới hạn, ngừng sử dụng, capability library read/edit metadata. Các case trong demo phải có evidence đúng.

Đầu ra: badge → so sánh → xử lý → kết quả cập nhật. Catalog changes có tác dụng với lựa chọn mới mà không sửa snapshot lịch sử.

Nghiệm thu: AC34, AC35, AC36, AC37. Kiểm tra sự khác nhau giữa không phát hiện và không xung đột.

### P09 Hoàn thiện và diễn tập

Thực hiện: hoàn thiện responsive, keyboard, focus, empty/error states; chạy demo 12 phút từ reset; sửa mọi dead end; kiểm tra package build và console; lưu ảnh màn trọng tâm. Viết README ứng dụng có lệnh chạy, reset, persona và giới hạn.

Đầu ra: app chạy được, bộ test phù hợp qua, demo liền mạch, source được bàn giao cùng chỉ dẫn. Không coi chỉ build thành công là nghiệm thu.

Nghiệm thu: toàn bộ `06`, ưu tiên AC38–AC40 và kịch bản trình diễn.

## Phạm vi phải có và phần có thể phát triển sau

Phải có: tất cả route được mô tả; 5 bước riêng; điều kiện lồng; hai trigger; đa kênh/editor; offer/control mô phỏng; hai followup; quản lý/chi tiết/history/tasks; conflict; catalogs; persistence; phiên bản và quyền demo. Không cắt một phần đã được thống nhất chỉ để làm dashboard đẹp hơn.

Cải tiến sau khi phần phải có hoàn tất: kéo thả điều kiện, import/export kịch bản để trao đổi, thiết kế email kéo thả, biểu đồ nâng cao, cấu hình policy engine đầy đủ, multi-language, collaborative editing. Các cải tiến này không nằm trong cam kết mockup hiện tại.

## Quyết định kỹ thuật để tránh triển khai lệch

- Không xây mọi wizard step trong một form dài rồi chỉ cuộn tới mục; URL, title, validation và nút điều hướng phải thể hiện màn riêng.
- Không dựng điều kiện dưới dạng prose tự do hoặc biểu thức chỉ để trưng bày. Dùng AST có nodeId ổn định.
- Không hardcode kết quả lọc, khách được chọn hoặc KPI. Seed deterministic; count lấy từ selectors/evaluator.
- Không đồng nhất paused và expired, published và active, action completed và followup completed.
- Không để email editor mất draft khi rời trang hoặc quay lại.
- Công bố hợp lệ tự sinh tiến trình logic; không có màn tạo job thủ công. Sơ đồ tiến trình và mô phỏng cùng đọc một AutomationPlan bất biến.
- Không tự động chạy action mỗi lần React rerender. Chỉ command mô phỏng mới tạo execution, có idempotency key.
- Không gắn key bằng index cho action/condition node khiến xóa một mục làm đổi nội dung mục khác.
- Không lưu mock secret/API key; app không cần credential.
- Không có nút bấm giả chỉ phát toast chung. Nếu thao tác có kết quả, cập nhật dữ liệu rồi cho xem kết quả.

## Kiểm thử và chất lượng

Unit tests tập trung logic có rủi ro sai ý nghĩa: evaluator ba trạng thái, phép tính, calendar, effective status, reentry, dedup, batch windows và version pinning. Không viết test kiểm tra từng class CSS hoặc chỉ lặp lại giá trị hardcode.

Browser tests tập trung: tạo end-to-end, editor round trip, xem thử không thực thi, publish sửa version, event trùng, task hoàn tất cập nhật dashboard, lọc/back, quyền xóa. Visual review bắt buộc cho các màn trọng tâm; kiểm tra ở 100% zoom, tiếng Việt không cắt và dialog không che nút.

Lệnh cần có trong package.json: dev, build, lint, test và test:e2e. Khi hoàn tất, báo chính xác lệnh đã chạy và những phần chưa kiểm tra. Chưa cần benchmark production hoặc load test backend.

## Rủi ro thực hiện và cách xử lý

| Rủi ro | Cách xử lý trong mockup |
|---|---|
| Công thức quá phức tạp | Giới hạn AST và độ sâu có nhãn, đủ phép đã mô tả, không cung cấp UI ngoài evaluator |
| Calendar mở rộng vô hạn | Horizon và lịch fixture có phạm vi, báo thiếu dữ liệu |
| Tài liệu và UI lệch nhau | Trace ID và AC, kiểm tra mỗi gói trước bước sau |
| Quá tập trung vào thẩm mỹ | Mỗi điểm nhấn gắn một hành vi có thể chứng minh |
| Hiểu nhầm là tích hợp thật | Nhãn demo, adapter simulated và giới thiệu rõ trong kịch bản trình bày |
| Persistence sai phiên bản | schemaVersion, export dữ liệu cũ và reset có phạm vi |

## Nguồn kỹ thuật chính thức

- [Fluent 2 cho React](https://fluent2.microsoft.design/get-started/develop): nền Fluent UI React v9 và provider/theme.
- [React Router declarative](https://reactrouter.com/start/declarative/installation): nền router cho ứng dụng SPA.
- [Vite guide](https://vite.dev/guide/): scaffold, tooling và yêu cầu môi trường cần kiểm tra khi cài.
- [Tiptap React](https://tiptap.dev/docs/editor/getting-started/install/react): tích hợp editor React với bộ gói React, ProseMirror và starter kit.

Đã tham khảo ngày 29/09/2026. Các lựa chọn cấu trúc và quy ước mockup trong tài liệu là đề xuất cho SMS, không phải yêu cầu của các thư viện.
