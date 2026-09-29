# Dữ liệu và quy tắc mô phỏng

## Hợp đồng chung

Tất cả dữ liệu demo là giả lập. Tên sản phẩm bắt đầu bằng Demo; khách hàng dùng KH0001 đến KH0120 và tên Khách hàng 001 đến 120. Không sao chép khách hàng thật hoặc giá/lợi suất thị trường vào fixture. Những tên kịch bản lấy cảm hứng từ file Excel chỉ là nội dung tham khảo.

Đồng hồ demo khởi tạo tại `2026-09-29T10:00:00+07:00`; mọi phép tính ngày và quá hạn dùng `demoNow`, không dùng trực tiếp Date.now. Người trình bày có thể tiến thời gian bằng công cụ demo. Đổi đồng hồ không chạy scheduler ngầm; chỉ đổi trạng thái hiệu lực và các số được dẫn xuất. Chạy mô phỏng là thao tác riêng.

Lưu trữ localStorage theo namespace `sms.mock.v1`, có `schemaVersion: 1`. Store chuẩn hóa ID; selectors tính dashboard, bộ lọc và lịch sử từ cùng nguồn. Việc reset chỉ xóa đúng namespace SMS rồi tạo lại seed. Không gọi localStorage.clear và không xóa dữ liệu ứng dụng khác.

## Mô hình đối tượng

| Đối tượng | Trường chính | Quan hệ |
|---|---|---|
| Scenario | id, code, categoryId, publishedVersionId, currentDraftId, controlState, deletedAt | Một mã ổn định, nhiều version |
| ScenarioVersion | id, scenarioId, versionNo, config, publishedAt, publishedBy | Bất biến sau công bố |
| ScenarioDraft | id, scenarioId, baseVersionId, config, updatedAt, completedSteps | Tách biệt published |
| ScenarioConfig | basics, scope, condition, trigger, reentry, actions, validity, followup | Đủ năm màn |
| AutomationPlan | id, scenarioId, versionId, generatedAt, configSnapshot, nodes, edges, triggerRegistration, followupRegistrations | Một plan bất biến cho mỗi phiên bản công bố |
| EvaluationRun | id, scenarioId, versionId, planId, triggerRef, evaluatedAt, outcomes | Một trigger cụ thể |
| EvaluationOutcome | subjectKey, verdict, reasons, snapshot, activationId | Bao gồm match, no_match, unknown, suppressed |
| Activation | id, evaluationId, scenarioId, versionId, subjectKey, startedAt, status | Đơn vị thống kê kích hoạt |
| ActionRun | id, activationId, actionId, channel, recipientKey, attempts, renderedSnapshot, status | Mỗi đích gửi/kênh riêng |
| FollowupTask | id, sourceType, sourceId, ruleId, assignee, dueAt, status, outcome | Từng activation hoặc period batch |
| PeriodBatch | id, scenarioId, ruleId, from, to, generatedAt, memberIds, metricsSnapshot | Cửa sổ dữ liệu bất biến |
| ConflictFinding | id, versionIds, kind, evidence, reviewStatus, reviewHistory | Kết luận gắn phiên bản |
| AuditEntry | id, entityType, entityId, operation, actor, at, reason, beforeRef, afterRef | Append only |

`subjectKey` là `customer:C001` hoặc `account:A001`. SubjectId khác CustomerId để thống kê đúng: khách hàng duy nhất là distinct customerId của các activation trong kỳ, không đếm tài khoản thành khách khác.

## Tự sinh tiến trình từ cấu hình

Khi công bố, command kiểm tra quyền và toàn bộ config, tạo ScenarioVersion bất biến, compile thành AutomationPlan rồi cập nhật publishedVersionId và đăng ký trigger trong cùng một commit store. Chỉ thông báo thành công sau khi ghi persistence thành công. Nếu validation, compile hoặc persist lỗi, giữ nguyên version/plan đang hoạt động và draft; không để version mới chạy một phần.

Compiler là hàm thuần, nhận config đã chuẩn hóa và ID phiên bản. Nó tạo các node có kiểu trigger, validity, resolve_subject, condition, policy, action, followup_each, followup_period và audit; node action giữ actionId và thứ tự, node hậu xử lý chỉ xuất hiện nếu bật. Plan mang configSnapshot đầy đủ cùng nodes/edges để hiển thị và thực thi thống nhất; không parse ngược nhãn trên sơ đồ.

triggerRegistration là union event hoặc schedule, chỉ nhánh đã chọn. followupRegistrations chứa lịch tổng hợp độc lập nếu có. Khóa plan theo versionId bảo đảm nhấn công bố lặp không tạo nhiều đăng ký. Không lưu cờ active riêng dễ lệch: trạng thái được dẫn xuất từ Scenario.controlState, deletedAt, validity và việc plan thuộc publishedVersionId hiện tại.

Mô phỏng lấy plan đang có hiệu lực, xác minh nguồn đầu vào, rồi thực thi pipeline bên dưới bằng configSnapshot của plan. EvaluationRun lưu planId; sửa/công bố phiên bản mới chỉ thay nguồn cho lượt mới. Lượt đang có giữ plan cũ. Seed của mọi phiên bản đã công bố cũng phải đi qua cùng compiler.

AutomationPlan là tiến trình logic do nền tảng dùng chung vận hành, không tương đương một OS process riêng cho mỗi kịch bản. Trong mockup, compile, lưu và hiển thị plan hoạt động thật tại trình duyệt; đầu vào thời gian/sự kiện và tác động ngoài được điều khiển bằng công cụ demo. Không tuyên bố có scheduler backend chạy khi đóng trình duyệt. Hai sơ đồ nghiệp vụ và đầu ra hiển thị nằm ở `08`.

## Cây điều kiện

Đây là hợp đồng kiểu dữ liệu trong kế hoạch, chưa phải mã ứng dụng.

```ts
type DataType = 'number' | 'date' | 'enum' | 'boolean' | 'text';
type Unit = 'VND' | 'PERCENT' | 'DAYS' | 'COUNT' | 'NONE';
type Scope = 'customer' | 'account';
type Verdict = 'match' | 'no_match' | 'unknown';
type Expr =
  | { kind: 'metric'; metricId: string }
  | { kind: 'literal'; value: number | string | boolean; unit: Unit }
  | { kind: 'arithmetic'; op: 'add' | 'sub' | 'mul' | 'div'; left: Expr; right: Expr }
  | { kind: 'daysSince'; value: Expr }
  | { kind: 'ratioPercent'; numerator: Expr; denominator: Expr };
type Condition =
  | { id: string; kind: 'group'; op: 'all' | 'any'; children: Condition[] }
  | { id: string; kind: 'compare'; op: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq'; left: Expr; right: Expr }
  | { id: string; kind: 'between'; value: Expr; low: Expr; high: Expr }
  | { id: string; kind: 'in'; value: Expr; values: Expr[]; negate: boolean }
  | { id: string; kind: 'exists'; value: Expr; expected: boolean };
```

Một source duy nhất tạo form, diễn giải, validation và evaluator. Không dùng eval, Function hoặc parse chuỗi công thức do người dùng nhập để thực thi JavaScript.

Số tiền lưu VND nguyên, tỷ lệ lưu theo điểm phần trăm (20 nghĩa là 20%), ngày lưu ISO. Formatting không thay underlying value. Cộng/trừ chỉ cùng đơn vị. Nhân số có đơn vị với scalar NONE giữ đơn vị; không nhân VND × VND. Chia hai giá trị cùng đơn vị cho scalar NONE; chia có đơn vị cho scalar giữ đơn vị. Node ratioPercent yêu cầu tử và mẫu cùng đơn vị, mẫu khác 0, trả tử chia mẫu nhân 100 với đơn vị PERCENT. Không tự so 0.2 với 20. Giao diện thể hiện node này bằng lựa chọn Tính tỷ lệ phần trăm.

Ngày được so bằng mốc UTC hoặc ngày địa phương tùy metric definition, nhất quán cả hai vế. daysSince dùng chênh ngày lịch theo múi giờ demo; không tự suy diễn điều kiện sinh nhật bằng số ngày từ ngày sinh. Metric daysUntilBirthday được cung cấp riêng.

Giá trị null, stale quá `maxAgeMinutes`, đơn vị sai hoặc chia 0 trả unknown với reason. Exists có thể kiểm tra null chủ đích; dữ liệu stale vẫn có reason riêng. `all`: có no_match thì no_match; không có no_match nhưng có unknown thì unknown; còn lại match. `any`: có match thì match; không có match nhưng có unknown thì unknown; còn lại no_match. Kết quả giữ trace từng node. Chỉ match mới có thể tạo activation.

## Thư viện đại lượng

Mỗi metric có id, label, group, dataType, unit, scopes, definition, sourceLabel, maxAgeMinutes, aggregation và availability. Không cộng các thành phần tài sản có khả năng trùng nhau nếu chưa có định nghĩa; tổng và NAV dùng metric nguồn được mô tả riêng. Không đồng nhất tiền mặt và tiền có thể sử dụng.

Danh sách dưới là tối thiểu cho mockup. Các metric số thuộc customer/account được tạo bằng resolver rõ ràng; mọi mục xuất hiện có thể chọn phải có dữ liệu hoặc tình trạng thiếu dữ liệu có chủ đích.

| Nhóm | metricId và nhãn |
|---|---|
| Cổ phiếu | equity.totalAssets Tổng tài sản; equity.nav Tài sản ròng; equity.cash Tiền mặt; equity.availableCash Tiền khả dụng; equity.saleReceivable Tiền bán chờ về; equity.dividendReceivable Tiền cổ tức chờ về; equity.blockedCash Tiền phong tỏa; equity.securitiesValue Giá trị chứng khoán; equity.buyPending Chứng khoán mua chờ về; equity.rightsPending Chứng khoán quyền chờ về; equity.blockedSecurities Chứng khoán phong tỏa |
| Phái sinh | derivatives.assets Tài sản; derivatives.cash Tiền; derivatives.marginUsed Ký quỹ sử dụng; derivatives.availableMargin Ký quỹ khả dụng; derivatives.unrealizedPnL Lãi lỗ chưa thực hiện |
| Nợ | debt.principal Dư nợ gốc; debt.interest Lãi phải trả; debt.overdue Nợ quá hạn; debt.marginRatio Tỷ lệ ký quỹ; debt.daysToDue Số ngày đến hạn |
| Trái phiếu | bond.marketValue Giá trị; bond.principal Gốc; bond.couponReceivable Lãi chờ nhận; bond.daysToMaturity Ngày tới đáo hạn |
| Chứng chỉ quỹ | fund.marketValue Giá trị; fund.units Số CCQ; fund.subscriptionPending Giá trị mua chờ; fund.redemptionPending Giá trị bán chờ |
| Money market | mm.balance Số dư; mm.accruedIncome Thu nhập dự thu; mm.daysToMaturity Ngày tới đáo hạn; mm.available Giá trị khả dụng |
| Hồ sơ | profile.openedAt Ngày mở; profile.birthDate Ngày sinh; profile.daysUntilBirthday Ngày tới sinh nhật; profile.gender Giới tính; profile.segment Phân khúc; profile.riskProfile Hồ sơ rủi ro; profile.marketingConsent Đồng ý nhận nội dung tự nguyện; profile.hasOpenComplaint Có khiếu nại mở |
| Hành vi | behavior.avgTradeValue30d GTGD bình quân 30 ngày; behavior.firstTradeAt Giao dịch đầu; behavior.lastTradeAt Giao dịch cuối; behavior.tradeCount30d Số giao dịch; behavior.lastContactAt Liên hệ gần nhất |

Thông tin hồ sơ là customer scope; khi xét account, resolver lấy hồ sơ chủ tài khoản. Các số tài sản customer là tổng tài khoản được định nghĩa, tỷ lệ không cộng. Mockup cần catalog ghi aggregation `sum`, `latest`, `ratioFromTotals`, `customerAttribute` hoặc `sourceDefined`, không tự chọn phép tổng hợp theo kiểu number.

## Thư viện sự kiện

Mỗi event có id, group, label, subjectScope, subjectKeyPath, payloadFields và occurredAt/receivedAt. Fixture event có eventId ổn định để thử chống trùng.

| Nhóm | Event ID tối thiểu |
|---|---|
| Onboard | account.opened, profile.updated, riskProfile.updated |
| Tiền | cash.deposited, cash.withdrawn, cash.saleSettled, cash.advanceGranted, cash.dividendPaid, fee.custodyCharged, fee.smsCharged, cash.blocked, cash.unblocked |
| Giao dịch | order.placed, order.filled, order.rejected, order.cancelled |
| Quyền và cổ tức | right.announced, right.registered, right.expiring, dividend.confirmed |
| Lưu ký | custody.received, custody.transferred, securities.blocked, securities.unblocked |
| Vay nợ | loan.disbursed, loan.repaid, loan.dueSoon, margin.thresholdCrossed |
| Trái phiếu | bond.purchased, bond.couponPaid, bond.matured |
| CCQ | fund.subscribed, fund.redeemed, fund.navPublished |
| MM | mm.placed, mm.matured, mm.incomePaid |

Event market-wide như fund.navPublished có affectedProductId rồi resolver xác định tập người giữ sản phẩm. Event cá nhân chỉ xét chủ thể liên quan. Nhóm chứa cùng event không được nhân bản eventId, kể cả tên có thể được tìm dưới nhiều nhãn.

## Trigger và lịch

Trigger là tagged union `event` hoặc `schedule`. Event có `eventIds[]` theo OR và `payloadFilters` gắn từng event; schedule có unit, interval, times, weekdays, monthDays, months, calendarId, excludedDates, pauseRanges và timezone. Không lưu hai nhánh cùng hoạt động.

- Theo giờ: mỗi N giờ, tính từ validity.startAt với phút của mốc đó; không đồng thời nhập nhiều times.
- Theo ngày: mỗi N ngày lịch tính từ ngày bắt đầu, chạy ở các times đã chọn.
- Theo tuần: mỗi N tuần tính từ thứ Hai của tuần bắt đầu, chọn weekdays và times.
- Theo tháng: mỗi N tháng tính từ tháng bắt đầu, chọn monthDays và times; ngày không tồn tại bỏ qua.
- Theo năm: mỗi N năm tính từ năm bắt đầu, chọn tháng/ngày và times; 29/2 bỏ qua năm không có.
- Lịch mọi ngày/ngày làm việc/ngày giao dịch rồi trừ excludedDates và pauseRanges. Các khoảng đều start inclusive, end exclusive. Lịch giao dịch dùng fixture hữu hạn; ngoài khoảng fixture báo Chưa có lịch, không đoán.
- Tìm lịch tiếp theo theo bước ngày hoặc tháng, không lặp từng phút vô hạn. Giới hạn horizon 5 năm; nếu không đủ 5 mốc trả danh sách có thể xác định và lý do.
- Múi giờ mockup chỉ Asia/Ho_Chi_Minh. Cần ghi rõ hạn chế này, không cung cấp dropdown múi giờ chưa hỗ trợ.

## Luồng mô phỏng

1. Kiểm tra kịch bản chưa bị xóa/kết thúc/tạm dừng và thời điểm nằm trong hiệu lực.
2. Chọn publishedVersion hiện hành cho lượt đánh giá mới; khóa versionId trong evaluation.
3. Từ trigger xác định candidate subjects. Dùng snapshot tương ứng thời điểm sau cập nhật sự kiện; không ghép giá trị trước và sau sự kiện tùy tiện.
4. Đánh giá payload filters, cây điều kiện và độ mới dữ liệu. Ghi match/no_match/unknown.
5. Với match, kiểm tra dedup và reentry; nếu bị chặn đổi outcome thành suppressed với reason, vẫn giữ conditionVerdict.
6. Tạo activation và action runs có snapshot nội dung. Thực hiện adapter mô phỏng; mọi kết quả đều được đánh dấu simulated.
7. Tạo task theo các rule hậu xử lý tương ứng. Số liệu dashboard đọc lại từ store.

Dedup evaluation dùng scenarioId + eventId hoặc scenarioId + scheduledAt. Dedup activation dùng scenarioId + triggerIdentity + subjectKey, không thêm version để công bố phiên bản mới không vượt kiểm soát cùng sự kiện. Action dedup dùng activationId + actionId + channel + recipientKey; retry thêm attempt trong cùng ActionRun. Task dedup dùng activationId + followupRuleId. Các kiểm soát này là mô phỏng trình duyệt, không phải cam kết exactly-once của hệ thống phân tán.

Reentry oneTime theo scenarioId và subjectKey; cooldown so activation gần nhất; onReenter chỉ sau một lượt no_match quan sát được rồi trở lại match. Unknown không reset. Đổi version không tự xóa lịch sử reentry. Quy tắc migration cần chốt cho production.

## Trạng thái và hiệu lực

Scenario.controlState là enabled, paused hoặc ended. Chưa có publishedVersion thì Nháp. Nếu có version: deletedAt ưu tiên Đã xóa quản trị; ended ưu tiên Đã kết thúc; quá endAt là Hết hiệu lực; paused là Tạm dừng; trước startAt là Chờ hiệu lực; còn lại Đang hoạt động. Draft sửa chỉ là badge bổ sung.

Activation status là running, completed, partial_failure hoặc failed theo các action runs. Completed nghĩa là các action đã xong mô phỏng, không đồng nghĩa khách đạt mục tiêu hay task hậu xử lý hoàn tất. Action notification gửi theo nhiều kênh tạo nhiều ActionRun. Task trạng thái độc lập.

## Hậu xử lý theo kỳ

Batch có cửa sổ `[from, to)` theo startedAt của activation; khóa id scenarioId + followupRuleId + from + to. Chạy lại không sinh task mới. Lọc chưa xử lý nghĩa activation còn ít nhất một followup task open/in_progress hoặc chưa có kết luận theo rule, không đồng nghĩa chưa đọc tin.

Batch lưu memberIds, snapshot metric và trạng thái tại generatedAt. Trang batch hiển thị snapshot và trạng thái hiện tại ở hai cột nếu đã thay đổi. Hoàn tất batch là đã rà soát tổng hợp; không tự đóng từng task. Cửa sổ không có bản ghi vẫn có báo cáo 0, không tự giao task xử lý nếu rule bỏ qua kỳ rỗng.

## Phát hiện xung đột có giới hạn rõ

Chỉ so published versions của các kịch bản enabled có hiệu lực giao nhau; draft hiện tại cũng được so khi preview. Công cụ xét cùng customerId kể cả điều kiện theo account. Bằng chứng giao nhau của sample subjects chỉ là kết quả trong tập mẫu.

| Rule ID | Dấu hiệu cấu trúc | Kết quả hiển thị |
|---|---|---|
| CF01 | Cùng recipient/channel/templateRef và khoảng liên hệ chồng lấn | Có khả năng trùng thông báo |
| CF02 | Một action kiểm soát có capabilityBlock X, offer khác có capabilityRequired X | Hành động hạn chế khả năng sử dụng offer |
| CF03 | Hai offer cùng placement, cùng tệp và cùng hiệu lực | Cần quyết định ưu tiên vị trí hiển thị |
| CF04 | Fixture nội dung cùng topicCode nhưng opposingIntent | Nghi vấn nội dung cần rà soát, không suy ra từ NLP |

Action/product catalog sở hữu capability tags, không so chuỗi tên tự do. Finding lưu versions, ruleId, sampleCustomerIds, overlapStart/End và assumption về thời điểm nếu lịch chưa chứng minh. Đừng gọi CF01 là trùng chắc chắn nếu chỉ giao hiệu lực dài hạn mà không xác định được thời điểm gửi. Nếu cấu hình không phân tích được, trả Chưa đủ cơ sở đánh giá.

## Kịch bản mẫu

Tạo 24 kịch bản, 4 mỗi danh mục; chúng minh họa cấu trúc, không áp dụng tất cả điều kiện văn bản trong Excel. Mọi cấu hình được dùng để chạy demo cần AST và actions đầy đủ.

| Mã | Danh mục | Tên | Trạng thái ban đầu |
|---|---|---|---|
| SMS-0001 | DV | Mở tài khoản thành công | Active |
| SMS-0002 | DV | Cập nhật quyền và cổ tức | Active |
| SMS-0003 | DV | Hồ sơ cần bổ sung | Paused |
| SMS-0004 | DV | Thông báo thay đổi dịch vụ | Ended |
| SMS-0005 | HD | Chào mừng và hướng dẫn bắt đầu | Active |
| SMS-0006 | HD | Cập nhật hồ sơ đầu tư | Active |
| SMS-0007 | HD | Hướng dẫn đọc báo cáo tài sản | Draft |
| SMS-0008 | HD | Chọn chủ đề nhận tin | Draft |
| SMS-0009 | TT | Tin liên quan mã theo dõi | Active |
| SMS-0010 | TT | Bản tin theo đăng ký | Active |
| SMS-0011 | TT | Lịch sự kiện doanh nghiệp | Scheduled |
| SMS-0012 | TT | Báo cáo chuyên đề | Expired |
| SMS-0013 | GS | Rà soát mức tập trung | Active |
| SMS-0014 | GS | Báo cáo tài sản định kỳ | Active |
| SMS-0015 | GS | Xác nhận nhu cầu sử dụng tiền | Active |
| SMS-0016 | GS | Chuẩn bị nhu cầu thanh khoản | Scheduled |
| SMS-0017 | TV | Mời tư vấn theo nhu cầu | Active |
| SMS-0018 | TV | Giới thiệu giải pháp đầu tư | Active |
| SMS-0019 | TV | Theo dõi quyết định tư vấn | Draft |
| SMS-0020 | TV | Rà soát ưu đãi dịch vụ | Paused |
| SMS-0021 | QH | Giới thiệu đầu mối hỗ trợ | Active |
| SMS-0022 | QH | Mời sự kiện chuyên đề | Scheduled |
| SMS-0023 | QH | Cập nhật nhu cầu hiện tại | Draft |
| SMS-0024 | QH | Chăm sóc chương trình giới thiệu | Expired |

Kết quả đếm ban đầu: tổng 24; active 12; draft 4; scheduled 3; paused 2; expired 2; ended 1. Active theo nhóm DV 2, HD 2, TT 2, GS 3, TV 2, QH 1. Đây là số liệu demo chủ đích, không phải số liệu từ Excel.

## Công thức sinh khách hàng

Với i từ 1 đến 120: customerId `C` + i pad 3; mỗi khách có tài khoản cổ phiếu `A` + i pad 3. Mỗi khách thứ 10 có tài khoản phái sinh `D` + i pad 3, tạo tổng 132 tài khoản. Seed theo thứ tự cố định; không dùng Math.random.

- availableCash = `(i % 6) × 100000000` VND, nhưng null khi i chia hết 17.
- securitiesValue = `(i % 10 + 1) × 200000000` VND; principal = `(i % 4) × 50000000` VND.
- cash = availableCash + 20000000 nếu biết; nav = cash + securitiesValue - principal nếu đủ dữ liệu. Các tổng sourceDefined thiếu thành phần phải để null.
- marketingConsent = i % 3 khác 0; hasOpenComplaint = i % 11 bằng 0; segment xoay Retail/Priority/Wealth; gender có Nam/Nữ/Không cung cấp và không dùng để suy diễn nhu cầu.
- debt.daysToDue = i % 45; behavior.tradeCount30d = i % 20; avgTradeValue30d = `(i % 9) × 15000000`; các ngày được sinh tương đối với demoNow theo i.
- Các đại lượng tài sản khác dùng bội số xác định theo i, resolver customer tổng hợp các account phù hợp. Profile luôn lấy từ customer. Mỗi metric fixture cần kiểm tra có resolver, metadata và unit phù hợp.

Fixture chuẩn cho điều kiện trình diễn: availableCash >= 300000000 AND marketingConsent = true AND hasOpenComplaint = false. Kết quả trên customer scope phải là 33 match, 82 no_match, 5 unknown. Đổi ngưỡng thành 500000000 phải là 16 match, 99 no_match, 5 unknown. Không cộng ngược các unknown thành no_match.

Khách C005 được chọn khi dùng cả hai ngưỡng, C017 thiếu tiền khả dụng, C011 bị loại do khiếu nại. Event `EV-DEMO-001` cash.deposited của C005/A005 có amount 100000000; snapshot tiền khả dụng sau sự kiện 500000000, trước đó 400000000. Gửi lại cùng eventId phải không tạo activation mới.

## Fixture vận hành và lỗi

Tạo lịch sử 14 ngày, mỗi ngày 4 EvaluationRun trên nhóm 12 active, luân phiên theo ID. Kịch bản event dùng một subject; schedule dùng một cohort 6 subjects. Dùng evaluator với config thực để sinh outcomes/activation, không tự đặt mọi khách là match. Snapshot lịch sử giữ tại thời điểm seeded; không đánh giá lại bằng cấu hình đã sửa.

Mỗi activation có ít nhất một notification và followup theo config. Cứ ActionRun thứ 11 có attempt thất bại; thử lại thành công theo adapter fixture. Task thứ 5 ở trạng thái in_progress, task thứ 7 open quá hạn; các task còn lại phân bố completed/open theo i. KPI lỗi và quá hạn tính từ kết quả store, không ghi số cố định trong UI.

Fixture conflict gồm ba finding liên quan các kịch bản seeded với cấu hình thực sự hỗ trợ chứng cứ: CF01 bản tin trùng, CF03 offer trùng placement và CF04 nghi vấn nội dung. Bổ sung một case CF02 trong công cụ demo cho quyền manager. Không giả lập chắc chắn một cặp có giao nhau khi sample evaluator không tìm thấy.

Các catalog khác: 4 đơn vị, 8 persona/người phụ trách, 12 sản phẩm chia 6 nhóm, 3 bundle, ít nhất 6 mẫu nội dung. Chỉ dùng dữ liệu doanh nghiệp giả lập và tên vai trò như Chuyên viên Wealth 01. Sản phẩm có status/validity/capabilityRequired. Có một sản phẩm expired để kiểm tra chọn offer.

## Phạm vi kiểm soát tính đúng

Những phần phải tính thật trong mockup: điều kiện có cấu trúc, filter, thời điểm lịch hỗ trợ, counters, hiệu lực, reentry/dedup, phiên bản và task. Những phần dùng adapter giả lập: giao nhận thông báo, thao tác core, offer trên ứng dụng giao dịch và báo cáo ngoài hệ thống. Việc giả lập phải có provenance rõ trong record.

Khi persistence bị mất, khởi tạo lại seed có thông báo. Khi schemaVersion không tương thích, cho xuất bản dữ liệu cũ trước khi reset; không tự ghi đè. Production phải bổ sung server, concurrency, quyền server, lịch dữ liệu chính thức, xử lý sự kiện trễ và tải thực; những việc đó không được tuyên bố là đã có nhờ mockup.
