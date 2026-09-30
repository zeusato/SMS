import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  Play20Regular,
  Edit20Regular,
  Copy20Regular,
  Pause20Regular,
  ArrowRight20Regular,
  Flash20Regular,
  Calendar20Regular,
  Flow20Regular,
  CheckmarkCircle20Regular,
  ArrowClockwise20Regular,
  Add20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";
import { useStore, retry } from "./store";
import {
  type Config,
  type Plan,
  type CatalogItem,
  type Scenario,
  type Task,
  uid,
  status,
  getConfig,
  date,
  allowed,
  conflicts,
  describe,
  events,
  metrics,
  scheduleRuns,
  localInput,
  activationStatus,
  normalize,
  copy,
} from "./domain";
import {
  Header,
  Panel,
  Button,
  Badge,
  Tabs,
  Modal,
  Confirm,
  Text,
  Area,
  Choice,
  Checks,
  Notice,
  Empty,
} from "./ui";
import { ConfigSummary } from "./builder";
import { Trace } from "./conditions";
import { groupTasks, matchesTaskStatus } from "./task-groups";
import {
  customerGroups,
  serviceGroups,
  journeyLabel,
  groupLabel,
  matchesCustomerGroup,
} from "./taxonomy";
const detailTabs: [string, string][] = [
  ["overview", "Tổng quan"],
  ["config", "Cấu hình"],
  ["process", "Tiến trình tự động"],
  ["history", "Lịch sử thực hiện"],
  ["followup", "Hậu xử lý"],
  ["versions", "Phiên bản"],
];
export function ProcessGraph({ plan }: { plan: Plan }) {
  const [selected, setSelected] = useState<Plan["nodes"][number] | null>(null);
  const main = plan.nodes.filter((n) => !n.type.startsWith("followup")),
    follow = plan.nodes.filter((n) => n.type.startsWith("followup"));
  const c = plan.config;
  return (
    <>
      <div className="process-canvas">
        <div className="process-caption">
          <span className="eyebrow">TIẾN TRÌNH ĐƯỢC SINH TỪ CẤU HÌNH</span>
          <small>
            {plan.id} · {plan.versionId}
          </small>
        </div>
        <div className="process-main">
          {main.map((n, i) => (
            <div key={n.id} className="process-node-wrap">
              {i > 0 && <div className="process-arrow">↓</div>}
              <button
                className={`process-node node-${n.type}`}
                onClick={() => setSelected(n)}
              >
                <span className="process-node-icon">
                  {n.type === "trigger" ? (
                    c.mode === "event" ? (
                      <Flash20Regular />
                    ) : (
                      <Calendar20Regular />
                    )
                  ) : n.type === "audit" ? (
                    <CheckmarkCircle20Regular />
                  ) : (
                    <Flow20Regular />
                  )}
                </span>
                <div>
                  <small>
                    {n.type === "trigger"
                      ? "NGUỒN KÍCH HOẠT"
                      : n.type === "condition"
                        ? "ĐIỀU KIỆN"
                        : n.type === "action"
                          ? "HÀNH ĐỘNG"
                          : n.type === "audit"
                            ? "KẾT QUẢ"
                            : "KIỂM TRA & ĐIỀU PHỐI"}
                  </small>
                  <b>{n.label}</b>
                  {n.type === "condition" && <p>{describe(c.condition)}</p>}
                </div>
                <ArrowRight20Regular />
              </button>
              {n.type === "condition" && (
                <span className="process-side-note">
                  Không thỏa / thiếu dữ liệu → ghi lý do
                </span>
              )}
              {n.type === "policy" &&
                plan.config.followTiming === "before" &&
                follow
                  .filter((f) => f.type === "followup_each")
                  .map((f) => (
                    <button
                      key={f.id}
                      className="process-node node-followup"
                      onClick={() => setSelected(f)}
                    >
                      <div>
                        <small>TẠO VIỆC KHI KÍCH HOẠT, TRƯỚC HÀNH ĐỘNG</small>
                        <b>{f.label}</b>
                        <p>
                          {c.followOwner} · Hạn {c.dueDays} ngày
                        </p>
                      </div>
                    </button>
                  ))}
            </div>
          ))}
        </div>
        {follow.length > 0 && (
          <>
            <div className="process-arrow">↓</div>
            <div className="process-branches">
              {follow
                .filter(
                  (n) =>
                    !(
                      n.type === "followup_each" && c.followTiming === "before"
                    ),
                )
                .map((n) => (
                  <button
                    className="process-node node-followup"
                    key={n.id}
                    onClick={() => setSelected(n)}
                  >
                    <div>
                      <small>
                        {n.type === "followup_each"
                          ? "SAU TỪNG LẦN KÍCH HOẠT"
                          : "TỔNG HỢP THEO KỲ"}
                      </small>
                      <b>{n.label}</b>
                      <p>
                        {c.followOwner} · Hạn {c.dueDays} ngày
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </>
        )}
        <div className="process-end">
          <span className="status-dot" />
          Sẵn sàng nhận lượt tiếp theo theo hiệu lực và chính sách
        </div>
      </div>
      <Modal
        open={!!selected}
        title={selected?.label || "Thông số tiến trình"}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            {selected.type === "trigger" ? (
              <>
                <p>
                  {c.mode === "event"
                    ? c.events
                        .map((id) => events.find((e) => e.id === id)?.label)
                        .join(" / ")
                    : "Kích hoạt theo lịch đã cấu hình"}
                </p>
                {c.mode === "schedule" &&
                  scheduleRuns(c, c.start).runs.map((r) => (
                    <p key={r}>{date(r)}</p>
                  ))}
              </>
            ) : selected.type === "condition" ? (
              <p>{describe(c.condition)}</p>
            ) : selected.type === "action" ? (
              <>
                {c.actions
                  .filter((a) => a.id === selected.id)
                  .map((a) => (
                    <div key={a.id}>
                      <p>
                        {a.type} · {a.channels.join(", ")}
                      </p>
                      <p>{a.recipients.join(", ")}</p>
                      <p className="pre-wrap">{a.body.noti}</p>
                    </div>
                  ))}
              </>
            ) : selected.type === "validity" ? (
              <p>
                {date(c.start)} → {date(c.end)}
              </p>
            ) : selected.type === "policy" ? (
              <p>
                Quy tắc: {c.reentry} · Khoảng nghỉ {c.cooldown} giờ. Kiểm tra
                nguồn kích hoạt trùng trước khi thực hiện.
              </p>
            ) : selected.type.startsWith("followup") ? (
              <p>
                {c.followTitle} · {c.followOwner} · {c.dueDays} ngày
              </p>
            ) : (
              <p>
                Ghi nhận đối tượng, dữ liệu, lý do, phiên bản và kết quả để truy
                vết.
              </p>
            )}
            <small>
              Tham chiếu: {plan.versionId} / {selected.id}
            </small>
          </>
        )}
      </Modal>
    </>
  );
}
export function ScenarioDetail() {
  const { scenarioId = "" } = useParams();
  const store = useStore(),
    { state } = store,
    nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [simulateOpen, setSimulateOpen] = useState(false),
    [confirmation, setConfirmation] = useState("");
  const s = state.scenarios.find((x) => x.id === scenarioId);
  if (!s)
    return (
      <Empty title="Không tìm thấy kịch bản">
        <Link to="/scenarios">Về danh sách</Link>
      </Empty>
    );
  const c = getConfig(s),
    v = s.versions.at(-1),
    tab = params.get("tab") || "overview";
  if (!c) return <Empty />;
  const findings = conflicts(state).filter(
      (f) => f.a.id === s.id || f.b.id === s.id,
    ),
    acts = state.activations.filter((a) => a.scenarioId === s.id),
    evals = state.evaluations.filter((e) => e.scenarioId === s.id),
    tasks = state.tasks.filter((t) => t.scenarioId === s.id);
  const mutate = () => {
    if (confirmation === "clone") {
      const id = store.edit(s, true);
      nav(`/scenarios/drafts/${id}/basics`);
    } else
      store.act(
        confirmation === "delete"
          ? `Xóa quản trị ${s.code}`
          : `Đã ${confirmation === "end" ? "kết thúc" : s.control === "paused" ? "tiếp tục" : "tạm dừng"} ${s.code}`,
        confirmation === "delete" ? "delete" : "edit",
        (st) => {
          const sc = st.scenarios.find((x) => x.id === s.id)!;
          if (confirmation === "end") sc.control = "ended";
          else sc.control = sc.control === "paused" ? "enabled" : "paused";
        },
      );
    setConfirmation("");
  };
  return (
    <>
      <div className="back-link">
        <Link to="/scenarios">← Quản lý kịch bản</Link>
      </div>
      <Header
        eyebrow={`${s.code} · ${journeyLabel(c.journey)} · ${groupLabel(c.customerGroup)} · ${c.category}${v ? ` · PHIÊN BẢN ${v.no}` : ""}`}
        title={c.name || "Kịch bản chưa đặt tên"}
        sub={c.purpose}
      >
        <Badge value={status(s, state.now)} />
        {allowed(state.persona, "edit") && !s.deleted && (
          <Button
            icon={<Edit20Regular />}
            onClick={() => {
              store.edit(s);
              nav(`/scenarios/drafts/${s.id}/basics`);
            }}
          >
            {s.draft ? "Mở bản nháp" : "Sửa kịch bản"}
          </Button>
        )}
        {v && (
          <Button
            appearance="primary"
            icon={<Play20Regular />}
            disabled={
              status(s, state.now) !== "active" ||
              !allowed(state.persona, "edit")
            }
            onClick={() => setSimulateOpen(true)}
          >
            Chạy mô phỏng
          </Button>
        )}
      </Header>
      {params.get("created") && (
        <div className="published-banner">
          <CheckmarkCircle20Regular />
          <div>
            <b>Tiến trình tự động đã được tạo</b>
            <p>
              {v?.plan.id} · Cấu hình đã được chuyển thành tiến trình, sẵn sàng
              vận hành theo hiệu lực.
            </p>
          </div>
          <Button
            appearance="subtle"
            aria-label="Đóng kết quả công bố"
            onClick={() => setParams({ tab: "process" })}
          >
            ×
          </Button>
        </div>
      )}
      {s.draft && v && (
        <Notice>
          Có bản sửa nháp. Phiên bản {v.no} tiếp tục vận hành cho tới khi công
          bố bản mới.
        </Notice>
      )}
      <Tabs
        items={detailTabs}
        value={tab}
        onChange={(tab) => setParams({ tab })}
      />
      {tab === "overview" && (
        <>
          <div className="metrics-strip compact">
            {[
              [acts.length, "Lượt kích hoạt"],
              [
                new Set(acts.map((a) => a.customerId)).size,
                "Khách hàng duy nhất",
              ],
              [
                acts.filter((a) => activationStatus(a) === "failed").length,
                "Lượt có lỗi",
              ],
              [
                tasks.filter((t) => t.status !== "completed").length,
                "Công việc còn mở",
              ],
            ].map(([n, label]) => (
              <button
                className="metric"
                key={String(label)}
                onClick={() =>
                  setParams({
                    tab: label === "Công việc còn mở" ? "followup" : "history",
                  })
                }
              >
                <span>{label}</span>
                <strong>{n}</strong>
              </button>
            ))}
          </div>
          <div className="two-columns">
            <Panel title="Thiết lập vận hành">
              <dl className="definition-list">
                <dt>Phụ trách</dt>
                <dd>{c.owner}</dd>
                <dt>Đơn vị</dt>
                <dd>{c.unit}</dd>
                <dt>Hiệu lực</dt>
                <dd>
                  {date(c.start)} → {date(c.end)}
                </dd>
                <dt>Kích hoạt</dt>
                <dd>
                  {c.mode === "event" ? "Theo sự kiện" : "Theo thời gian"}
                </dd>
                <dt>Nhãn</dt>
                <dd>{c.tags.join(" · ") || "Chưa gắn nhãn"}</dd>
              </dl>
              <div className="summary-rule">
                <span className="eyebrow">ĐIỀU KIỆN ÁP DỤNG</span>
                <p>{describe(c.condition)}</p>
              </div>
              <div className="inline-actions">
                {allowed(state.persona, "edit") && !s.deleted && (
                  <>
                    <Button
                      icon={<Copy20Regular />}
                      onClick={() => setConfirmation("clone")}
                    >
                      Nhân bản
                    </Button>
                    {v && s.control !== "ended" && (
                      <>
                        <Button
                          icon={<Pause20Regular />}
                          onClick={() => setConfirmation("pause")}
                        >
                          {s.control === "paused" ? "Tiếp tục" : "Tạm dừng"}
                        </Button>
                        <Button onClick={() => setConfirmation("end")}>
                          Kết thúc
                        </Button>
                      </>
                    )}
                  </>
                )}
                {allowed(state.persona, "delete") && !s.deleted && (
                  <Button
                    className="danger-text"
                    onClick={() => setConfirmation("delete")}
                  >
                    Xóa quản trị
                  </Button>
                )}
              </div>
            </Panel>
            <Panel title="Cần rà soát">
              {findings.length ? (
                findings.map((f) => (
                  <Link
                    className="attention-item"
                    key={f.id}
                    to={`/conflicts/${f.id}`}
                  >
                    <Warning20Regular />
                    <div>
                      <b>{f.kind}</b>
                      <p>{f.sample.length} khách hàng mẫu giao nhau</p>
                      <small>{f.review ? "Đã rà soát" : "Chưa rà soát"}</small>
                    </div>
                    <ArrowRight20Regular />
                  </Link>
                ))
              ) : (
                <Empty
                  title="Chưa phát hiện xung đột trên mẫu"
                  sub="Kết quả chỉ phản ánh phạm vi dữ liệu và quy tắc đang được hỗ trợ."
                />
              )}
            </Panel>
          </div>
        </>
      )}
      {tab === "config" && (
        <Panel title="Cấu hình đã công bố">
          <ConfigSummary config={c} />
        </Panel>
      )}
      {tab === "process" &&
        (v ? (
          <ProcessGraph plan={v.plan} />
        ) : (
          <Empty
            title="Chưa có tiến trình"
            sub="Hoàn tất cấu hình và công bố để tự sinh tiến trình."
          />
        ))}
      {tab === "history" && (
        <Panel
          title="Lượt đánh giá & kích hoạt"
          sub="Một lượt đánh giá có thể xét nhiều đối tượng và tạo nhiều lượt kích hoạt."
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nguồn kích hoạt</th>
                  <th>Thời điểm</th>
                  <th>Phiên bản</th>
                  <th>Đã xét</th>
                  <th>Thỏa</th>
                  <th>Thiếu dữ liệu</th>
                  <th>Bị loại</th>
                </tr>
              </thead>
              <tbody>
                {[...evals].reverse().map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link to={`/scenarios/${s.id}/evaluations/${e.id}`}>
                        {e.triggerId}
                      </Link>
                      <small>
                        {events.find((x) => x.id === e.eventType)?.label ||
                          "Theo lịch"}
                      </small>
                    </td>
                    <td>{date(e.at)}</td>
                    <td>{e.versionId.split("-").at(-1)}</td>
                    <td>{e.outcomes.length}</td>
                    <td>{e.outcomes.filter((o) => o.activationId).length}</td>
                    <td>
                      {e.outcomes.filter((o) => o.verdict === "unknown").length}
                    </td>
                    <td>
                      {
                        e.outcomes.filter((o) =>
                          ["no_match", "suppressed"].includes(o.verdict),
                        ).length
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!evals.length && (
            <Empty
              title="Chưa có lượt đánh giá"
              sub="Chạy mô phỏng để kiểm chứng phản ứng của tiến trình."
            />
          )}
        </Panel>
      )}
      {tab === "followup" && (
        <div className="two-columns">
          <Panel
            title="Công việc từng lần"
            sub={`${tasks.length} phần việc liên quan`}
          >
            <TaskTable tasks={tasks} />
          </Panel>
          <Panel
            title="Kỳ tổng hợp"
            action={
              <Button
                disabled={!c.followPeriod || !allowed(state.persona, "task")}
                onClick={() => {
                  store.batch(s.id);
                }}
              >
                Tạo / mở kỳ hiện tại
              </Button>
            }
          >
            {state.batches
              .filter((b) => b.scenarioId === s.id)
              .map((b) => (
                <div className="batch-card" key={b.id}>
                  <b>
                    {date(b.from)} → {date(b.to)}
                  </b>
                  <p>
                    {b.members.length} lượt · {b.completed} hoàn tất ·{" "}
                    {b.failed} có lỗi
                  </p>
                  <Badge
                    value={b.reviewed ? "completed" : "open"}
                    label={b.reviewed ? "Đã rà soát" : "Chưa rà soát"}
                  />
                  <Button
                    size="small"
                    onClick={() => nav(`/tasks?batchId=${b.id}`)}
                  >
                    Xem báo cáo
                  </Button>
                </div>
              ))}
            {!c.followPeriod && (
              <p>Chưa bật hậu xử lý theo kỳ trong cấu hình.</p>
            )}
          </Panel>
        </div>
      )}
      {tab === "versions" && (
        <Panel
          title="Lịch sử phiên bản"
          sub="Mỗi lần công bố giữ cấu hình và tiến trình bất biến."
        >
          {[...s.versions].reverse().map((version, i) => {
            const prior = s.versions.find((x) => x.no === version.no - 1);
            return (
              <div className="version-card" key={version.id}>
                <span className="version-number">v{version.no}</span>
                <div>
                  <h3>{i === 0 ? "Phiên bản hiện hành" : "Phiên bản trước"}</h3>
                  <p>
                    {date(version.at)} · {version.by} · {version.reason}
                  </p>
                  {prior && (
                    <div className="version-diff">
                      {(Object.keys(version.config) as (keyof Config)[])
                        .filter(
                          (k) =>
                            JSON.stringify(version.config[k]) !==
                            JSON.stringify(prior.config[k]),
                        )
                        .map((k) => (
                          <details key={k}>
                            <summary>Đã thay đổi: {k}</summary>
                            <div className="two-columns">
                              <pre>
                                {JSON.stringify(prior.config[k], null, 2)}
                              </pre>
                              <pre>
                                {JSON.stringify(version.config[k], null, 2)}
                              </pre>
                            </div>
                          </details>
                        ))}
                    </div>
                  )}
                  <details>
                    <summary>Xem cấu hình phiên bản</summary>
                    <ConfigSummary config={version.config} />
                  </details>
                </div>
              </div>
            );
          })}
          <h3>Nhật ký quản lý</h3>
          {state.audit
            .filter((a) => a.message.includes(s.code))
            .map((a) => (
              <p key={a.id}>
                {date(a.at)} · {a.actor} · {a.message}
              </p>
            ))}
        </Panel>
      )}
      <SimulateModal
        open={simulateOpen}
        onClose={() => setSimulateOpen(false)}
        scenario={s}
      />
      <Confirm
        open={!!confirmation}
        title={
          confirmation === "clone"
            ? "Nhân bản kịch bản?"
            : confirmation === "delete"
              ? "Xóa quản trị kịch bản?"
              : confirmation === "end"
                ? "Kết thúc kịch bản?"
                : s.control === "paused"
                  ? "Tiếp tục vận hành?"
                  : "Tạm dừng kịch bản?"
        }
        onClose={() => setConfirmation("")}
        requiredReason={confirmation === "delete"}
        code={confirmation === "delete" ? s.code : undefined}
        danger={confirmation === "delete" || confirmation === "end"}
        onConfirm={(reason) => {
          if (confirmation === "delete") {
            store.act(`Xóa quản trị ${s.code}: ${reason}`, "delete", (st) => {
              st.scenarios.find((x) => x.id === s.id)!.deleted = st.now;
            });
            setConfirmation("");
          } else mutate();
        }}
      >
        <p>
          {confirmation === "delete"
            ? "Kịch bản sẽ được đánh dấu đã xóa quản trị. Lịch sử thực hiện và nhật ký vẫn được giữ."
            : confirmation === "end"
              ? "Dừng nhận lượt mới và không bật lại kịch bản này. Có thể nhân bản thành kịch bản mới."
              : confirmation === "clone"
                ? "Tạo bản nháp độc lập, không mang theo lịch sử của kịch bản gốc."
                : "Thay đổi trạng thái nhận lượt mới. Các công việc đã giao tiếp tục được giữ."}
        </p>
      </Confirm>
    </>
  );
}
function SimulateModal({
  open,
  onClose,
  scenario,
}: {
  open: boolean;
  onClose: () => void;
  scenario: Scenario;
}) {
  const store = useStore(),
    nav = useNavigate();
  const c = getConfig(scenario);
  const customers = store.state.customers.filter((customer) =>
    matchesCustomerGroup(customer, c.customerGroup),
  );
  const [eventType, setEventType] = useState(c.events[0] || "schedule"),
    [trigger, setTrigger] = useState("EV-DEMO-001"),
    [customer, setCustomer] = useState(
      customers.find((customer) => customer.id === "C005")?.id ||
        customers[0]?.id ||
        "",
    ),
    [amount, setAmount] = useState(100000000),
    [at, setAt] = useState(
      c.mode === "schedule"
        ? scheduleRuns(c, store.state.now, 1).runs[0] || store.state.now
        : store.state.now,
    );
  return (
    <Modal
      open={open}
      title="Chạy mô phỏng tiến trình"
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            appearance="primary"
            icon={<Play20Regular />}
            onClick={() => {
              const id = store.run(
                scenario.id,
                c.mode === "event" ? trigger : `SCHEDULE-${at}`,
                eventType,
                customer,
                at,
                amount,
              );
              if (id) {
                onClose();
                nav(`/scenarios/${scenario.id}/evaluations/${id}`);
              }
            }}
          >
            Kích hoạt mô phỏng
          </Button>
        </>
      }
    >
      <Notice>
        Dùng dữ liệu mẫu sau sự kiện. Không gửi tin, không đặt offer hoặc khóa
        tài khoản thật.
      </Notice>
      <p className="hint">
        Tệp áp dụng: {groupLabel(c.customerGroup)} · {customers.length} khách
        hàng mẫu
      </p>
      {c.mode === "event" ? (
        <>
          <Choice
            label="Sự kiện phát sinh"
            value={eventType}
            onChange={setEventType}
            options={c.events.map((id) => [
              id,
              events.find((e) => e.id === id)?.label || id,
            ])}
          />
          <Text
            label="Mã sự kiện (để kiểm tra trùng)"
            value={trigger}
            onChange={setTrigger}
          />
          <Choice
            label="Khách hàng liên quan"
            value={customer}
            onChange={setCustomer}
            options={customers.map((c) => [c.id, `${c.id} · ${c.name}`])}
          />
          <Text
            label="Giá trị amount (VND)"
            type="number"
            value={amount}
            onChange={(v) => setAmount(Number(v))}
          />
        </>
      ) : (
        <Choice
          label="Mốc lịch đã đăng ký"
          value={at}
          onChange={setAt}
          options={scheduleRuns(c, store.state.now).runs.map((t) => [
            t,
            date(t),
          ])}
        />
      )}
      <Text
        label="Thời điểm mô phỏng · UTC+7"
        type="datetime-local"
        value={localInput(at)}
        onChange={(v) => v && setAt(v + ":00+07:00")}
      />
      <small>
        Phiên bản {scenario.versions.at(-1)?.no} ·{" "}
        {scenario.versions.at(-1)?.plan.id}
      </small>
    </Modal>
  );
}
export function EvaluationDetail() {
  const { evaluationId = "" } = useParams();
  const { state } = useStore();
  const e = state.evaluations.find((e) => e.id === evaluationId);
  const [selected, setSelected] = useState("");
  if (!e) return <Empty title="Không tìm thấy lượt đánh giá" />;
  const s = state.scenarios.find((s) => s.id === e.scenarioId)!,
    v = s.versions.find((v) => v.id === e.versionId)!;
  const o = e.outcomes.find((o) => o.subjectId === selected);
  return (
    <>
      <div className="back-link">
        <Link to={`/scenarios/${s.id}?tab=history`}>← Lịch sử kịch bản</Link>
      </div>
      <Header
        eyebrow={`${s.code} · ${e.versionId}`}
        title="Chi tiết lượt đánh giá"
        sub={`${e.triggerId} · ${date(e.at)}`}
      />
      <div className="metrics-strip compact">
        {[
          ["Đã xét", e.outcomes.length],
          ["Đã kích hoạt", e.outcomes.filter((o) => o.activationId).length],
          [
            "Không thỏa",
            e.outcomes.filter((o) => o.verdict === "no_match").length,
          ],
          [
            "Thiếu dữ liệu",
            e.outcomes.filter((o) => o.verdict === "unknown").length,
          ],
          [
            "Chính sách loại",
            e.outcomes.filter((o) => o.verdict === "suppressed").length,
          ],
        ].map(([label, n]) => (
          <div className="metric" key={String(label)}>
            <span>{label}</span>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
      <Panel
        title="Đối tượng đã đánh giá"
        sub={`${v.config.name} · ${e.planId}`}
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Đối tượng</th>
                <th>Kết quả</th>
                <th>Lý do</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {e.outcomes.map((o) => (
                <tr key={o.subjectId}>
                  <td>
                    <Button
                      appearance="subtle"
                      onClick={() => setSelected(o.subjectId)}
                    >
                      {o.name}
                    </Button>
                    <small>{o.subjectId}</small>
                  </td>
                  <td>
                    <Badge value={o.verdict} />
                  </td>
                  <td className="reason-cell">{o.reason}</td>
                  <td>
                    {o.activationId && (
                      <Link to={`/activations/${o.activationId}`}>
                        Xem lượt kích hoạt →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!e.outcomes.length && (
          <Empty
            title="Không có đối tượng liên quan"
            sub="Sự kiện không tìm thấy khách hàng hoặc tài khoản trong tập mẫu."
          />
        )}
      </Panel>
      <Modal
        open={!!o}
        onClose={() => setSelected("")}
        title={o?.name || "Giải thích"}
        wide
      >
        {o && (
          <Trace
            node={v.config.condition}
            customer={{
              id: o.customerId,
              name: o.name,
              accountId: o.subjectId,
              values: o.values,
              products: [],
            }}
            now={e.at}
          />
        )}
      </Modal>
    </>
  );
}
export function ActivationDetail() {
  const { activationId = "" } = useParams();
  const { state, act } = useStore();
  const a = state.activations.find((a) => a.id === activationId);
  const [runId, setRunId] = useState("");
  if (!a) return <Empty title="Không tìm thấy lượt kích hoạt" />;
  const s = state.scenarios.find((s) => s.id === a.scenarioId)!,
    v = s.versions.find((v) => v.id === a.versionId)!,
    e = state.evaluations.find((e) => e.id === a.evaluationId)!,
    o = e.outcomes.find((o) => o.activationId === a.id)!,
    run = a.runs.find((r) => r.id === runId);
  return (
    <>
      <div className="back-link">
        <Link to={`/scenarios/${s.id}/evaluations/${e.id}`}>
          ← Lượt đánh giá
        </Link>
      </div>
      <Header
        eyebrow={`${s.code} · ${a.versionId}`}
        title={o.name}
        sub={`${a.id} · ${date(a.at)} · ${a.subjectId}`}
      >
        <Badge value={activationStatus(a)} />
      </Header>
      <div className="execution-layout">
        <Panel title="Dòng thời gian thực hiện">
          <div className="execution-timeline">
            <div>
              <i />
              <b>Nhận nguồn kích hoạt</b>
              <p>{e.triggerId}</p>
              <small>{date(e.at)}</small>
            </div>
            <div>
              <i />
              <b>Đối tượng đủ điều kiện</b>
              <p>{o.reason}</p>
            </div>
            {a.runs.map((r) => (
              <div key={r.id}>
                <i className={r.status === "failed" ? "failed" : ""} />
                <Badge value={r.status} />
                <p>
                  {r.channel.toUpperCase()} · {r.recipient}
                </p>
                <small>{r.attempts} lần thử · Mô phỏng</small>
                <div>
                  <Button size="small" onClick={() => setRunId(r.id)}>
                    Xem nội dung
                  </Button>
                  {r.status === "failed" && (
                    <Button
                      size="small"
                      icon={<ArrowClockwise20Regular />}
                      disabled={!allowed(state.persona, "task")}
                      onClick={() =>
                        act("Đã thử lại hành động mô phỏng", "task", (st) => {
                          retry(st, a.id, r.id);
                        })
                      }
                    >
                      Thử lại
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div>
              <i />
              <b>Ghi nhận và hậu xử lý</b>
              <p>
                {state.tasks.filter((t) => t.activationId === a.id).length} phần
                việc đã tạo
              </p>
            </div>
          </div>
        </Panel>
        <div>
          <Panel
            title="Dữ liệu tại thời điểm đánh giá"
            sub="Snapshot đã đóng băng, không đổi theo phiên bản mới."
          >
            <Trace
              node={v.config.condition}
              customer={{
                id: o.customerId,
                name: o.name,
                accountId: o.subjectId,
                values: o.values,
                products: [],
              }}
              now={a.at}
            />
          </Panel>
          <Panel title="Công việc liên quan">
            <TaskTable
              tasks={state.tasks.filter((t) => t.activationId === a.id)}
            />
          </Panel>
        </div>
      </div>
      <Modal
        open={!!run}
        title="Nội dung đã thực hiện mô phỏng"
        onClose={() => setRunId("")}
      >
        {run && (
          <>
            <Badge value={run.status} />
            <p>
              {run.channel} · {run.recipient} · {run.attempts} lần thử
            </p>
            <div className="message-preview pre-wrap">{run.body}</div>
            <Notice>
              Bản chụp nội dung thuộc {a.versionId}. Không có thông báo thực
              được gửi.
            </Notice>
          </>
        )}
      </Modal>
    </>
  );
}
export function TaskTable({ tasks }: { tasks: Task[] }) {
  return tasks.length ? (
    <div className="task-list">
      {tasks.slice(0, 30).map((t) => (
        <Link className="task-row" key={t.id} to={`/tasks?taskId=${t.id}`}>
          <div>
            <b>{t.title}</b>
            <small>
              {t.owner} · Hạn {date(t.due)}
            </small>
          </div>
          <Badge value={t.status} />
          <ArrowRight20Regular />
        </Link>
      ))}
      {tasks.length > 30 && (
        <Link to={`/tasks?scenario=${tasks[0].scenarioId}`}>
          Xem toàn bộ {tasks.length} công việc →
        </Link>
      )}
    </div>
  ) : (
    <Empty title="Chưa có công việc" />
  );
}
export function Tasks() {
  const { state, act } = useStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(""),
    [outcome, setOutcome] = useState("");
  const [taskPage, setTaskPage] = useState(1);
  const filter = params.get("status") || "all",
    category = params.get("category") || "all",
    task = state.tasks.find((t) => t.id === params.get("taskId")),
    batch = state.batches.find((b) => b.id === params.get("batchId"));
  const scopedTasks = state.tasks.filter(
    (t) =>
      (!params.get("scenario") || t.scenarioId === params.get("scenario")) &&
      normalize(t.title + " " + t.owner).includes(normalize(query)),
  );
  const scopedGroups = groupTasks(state, scopedTasks);
  const groups = scopedGroups.map((group) => ({
    ...group,
    tasks: group.tasks.filter((t) => matchesTaskStatus(t, filter, state.now)),
  }));
  const selectedGroups = groups.filter(
    (g) => category === "all" || g.id === category,
  );
  const list = selectedGroups.flatMap((g) => g.tasks);
  const pages = Math.max(1, Math.ceil(list.length / 20));
  const page = Math.min(taskPage, pages);
  const pageTaskIds = new Set(
    list.slice((page - 1) * 20, page * 20).map((t) => t.id),
  );
  const selectFilter = (key: string, value: string) => {
    setTaskPage(1);
    setParams((previous) => {
      previous.set(key, value);
      previous.delete("taskId");
      previous.delete("batchId");
      return previous;
    });
  };
  return (
    <>
      <Header
        eyebrow="BÀN LÀM VIỆC"
        title="Công việc & hậu xử lý"
        sub="Theo sát từng điểm chạm, đưa phản ứng đến kết quả cuối cùng."
      />
      <div className="list-status">
        {[
          ["all", "Tất cả"],
          ["open", "Chờ xử lý"],
          ["in_progress", "Đang xử lý"],
          ["completed", "Hoàn tất"],
          ["overdue", "Quá hạn"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={filter === id ? "selected" : ""}
            onClick={() => selectFilter("status", id)}
          >
            {label}
            <span>
              {
                scopedGroups
                  .filter(
                    (group) => category === "all" || group.id === category,
                  )
                  .flatMap((group) => group.tasks)
                  .filter((t) => matchesTaskStatus(t, id, state.now)).length
              }
            </span>
          </button>
        ))}
      </div>
      <div
        className="task-group-filters"
        role="group"
        aria-label="Nhóm công việc"
      >
        <button
          className={category === "all" ? "selected" : ""}
          aria-pressed={category === "all"}
          onClick={() => selectFilter("category", "all")}
        >
          <span>Tất cả nhóm</span>
          <b>{groups.reduce((sum, group) => sum + group.tasks.length, 0)}</b>
        </button>
        {groups.map((group) => (
          <button
            key={group.id}
            className={category === group.id ? "selected" : ""}
            aria-pressed={category === group.id}
            onClick={() => selectFilter("category", group.id)}
          >
            <span>{group.name}</span>
            <b>{group.tasks.length}</b>
          </button>
        ))}
      </div>
      <Panel
        title="Danh sách công việc"
        sub="Phân nhóm theo danh mục của kịch bản tạo công việc."
        action={
          <Text
            label="Tìm công việc"
            value={query}
            onChange={(v) => {
              setTaskPage(1);
              setQuery(v);
            }}
          />
        }
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Công việc</th>
                <th>Kịch bản</th>
                <th>Phụ trách</th>
                <th>Hạn xử lý</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            {selectedGroups
              .filter((group) => group.tasks.some((t) => pageTaskIds.has(t.id)))
              .map((group) => (
                <tbody key={group.id} aria-label={group.name}>
                  <tr className="task-group-heading">
                    <th colSpan={5} scope="rowgroup">
                      {group.name}
                      <span>{group.tasks.length} công việc</span>
                    </th>
                  </tr>
                  {group.tasks
                    .filter((t) => pageTaskIds.has(t.id))
                    .map((t) => (
                      <tr key={t.id}>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => {
                              setOutcome(t.outcome);
                              setParams((p) => {
                                p.set("taskId", t.id);
                                return p;
                              });
                            }}
                          >
                            {t.title}
                          </button>
                          <small>{t.id}</small>
                        </td>
                        <td>
                          <Link to={`/scenarios/${t.scenarioId}`}>
                            {t.scenarioId}
                          </Link>
                        </td>
                        <td>{t.owner}</td>
                        <td
                          className={
                            t.status !== "completed" &&
                            Date.parse(t.due) < Date.parse(state.now)
                              ? "danger-text"
                              : ""
                          }
                        >
                          {date(t.due)}
                        </td>
                        <td>
                          <Badge value={t.status} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              ))}
          </table>
        </div>
        {!list.length && <Empty title="Không có công việc phù hợp" />}
        <div className="table-footer">
          <span>
            {list.length} công việc · Trang {page}/{pages}
          </span>
          <div>
            <Button disabled={page === 1} onClick={() => setTaskPage(page - 1)}>
              Trang trước
            </Button>
            <Button
              disabled={page >= pages}
              onClick={() => setTaskPage(page + 1)}
            >
              Trang sau
            </Button>
          </div>
        </div>
      </Panel>
      <Panel
        title="Báo cáo theo kỳ"
        sub="Tập dữ liệu đóng băng tại thời điểm tổng hợp."
      >
        <div className="batch-grid">
          {state.batches.map((b) => (
            <button
              className="batch-card"
              key={b.id}
              onClick={() => setParams({ batchId: b.id })}
            >
              <span className="eyebrow">{b.scenarioId}</span>
              <h3>
                {date(b.from).split(" ")[1]} → {date(b.to).split(" ")[1]}
              </h3>
              <p>
                {b.members.length} lượt kích hoạt · {b.failed} lượt có lỗi
              </p>
              <Badge
                value={b.reviewed ? "completed" : "open"}
                label={b.reviewed ? "Đã rà soát" : "Chưa rà soát"}
              />
            </button>
          ))}
        </div>
      </Panel>
      <Modal
        open={!!task}
        title={task?.title || "Công việc"}
        onClose={() =>
          setParams((p) => {
            p.delete("taskId");
            return p;
          })
        }
        actions={
          <>
            {task && task.status === "open" && (
              <Button
                disabled={!allowed(state.persona, "task")}
                onClick={() =>
                  act("Đã nhận công việc", "task", (s) => {
                    s.tasks.find((t) => t.id === task.id)!.status =
                      "in_progress";
                  })
                }
              >
                Nhận việc
              </Button>
            )}
            {task && task.status !== "completed" && (
              <Button
                appearance="primary"
                disabled={!outcome.trim() || !allowed(state.persona, "task")}
                onClick={() => {
                  act("Đã hoàn tất công việc", "task", (s) => {
                    const t = s.tasks.find((t) => t.id === task.id)!;
                    t.status = "completed";
                    t.outcome = outcome;
                  });
                  setParams((p) => {
                    p.delete("taskId");
                    return p;
                  });
                  setOutcome("");
                }}
              >
                Hoàn tất và lưu kết quả
              </Button>
            )}
          </>
        }
      >
        {task && (
          <>
            <Badge value={task.status} />
            <dl className="definition-list">
              <dt>Kịch bản</dt>
              <dd>{task.scenarioId}</dd>
              <dt>Người xử lý</dt>
              <dd>{task.owner}</dd>
              <dt>Hạn xử lý</dt>
              <dd>{date(task.due)}</dd>
            </dl>
            {task.activationId && (
              <Link to={`/activations/${task.activationId}`}>
                Xem lượt kích hoạt và dữ liệu liên quan →
              </Link>
            )}
            {task.batchId && (
              <Button onClick={() => setParams({ batchId: task.batchId! })}>
                Mở báo cáo kỳ
              </Button>
            )}
            {task.status === "completed" ? (
              <div className="message-preview">{task.outcome}</div>
            ) : (
              <Area
                label="Kết quả xử lý *"
                value={outcome}
                onChange={setOutcome}
                hint="Ghi nhận nội dung trao đổi và kết luận trước khi hoàn tất."
              />
            )}
          </>
        )}
      </Modal>
      <Modal
        open={!!batch}
        title="Báo cáo hậu xử lý theo kỳ"
        wide
        onClose={() =>
          setParams((p) => {
            p.delete("batchId");
            return p;
          })
        }
        actions={
          <Button
            appearance="primary"
            disabled={!!batch?.reviewed || !allowed(state.persona, "task")}
            onClick={() =>
              batch &&
              act("Đã rà soát báo cáo kỳ", "task", (s) => {
                s.batches.find((b) => b.id === batch.id)!.reviewed = true;
              })
            }
          >
            {batch?.reviewed ? "Đã rà soát" : "Đánh dấu đã rà soát"}
          </Button>
        }
      >
        {batch && (
          <>
            <p>
              {batch.scenarioId} · {date(batch.from)} → {date(batch.to)}
            </p>
            <Notice>
              Snapshot: {batch.members.length} lượt, {batch.completed} hoàn tất
              và {batch.failed} có lỗi tại {date(batch.at)}. Rà soát báo cáo
              không đóng các task thành viên.
            </Notice>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Lượt kích hoạt</th>
                    <th>Khách hàng</th>
                    <th>Trạng thái hiện tại</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.members.map((id) => {
                    const a = state.activations.find((a) => a.id === id)!;
                    return (
                      <tr key={id}>
                        <td>
                          <Link to={`/activations/${id}`}>{id}</Link>
                        </td>
                        <td>{a.customerId}</td>
                        <td>
                          <Badge value={activationStatus(a)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!batch.members.length && (
              <Empty
                title="Kỳ dữ liệu không có lượt kích hoạt"
                sub="Báo cáo 0 được lưu, không tạo phần việc xử lý trùng."
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
}
export function ConflictPage() {
  const { conflictId = "" } = useParams();
  const { state, act } = useStore();
  const [reason, setReason] = useState("");
  const f = conflicts(state).find((f) => f.id === conflictId);
  if (!f)
    return (
      <Empty
        title="Chưa đủ cơ sở hoặc không còn phát hiện trên mẫu"
        sub="Cấu hình hoặc phiên bản có thể đã thay đổi."
      >
        <Link to="/scenarios">Về quản lý kịch bản</Link>
      </Empty>
    );
  return (
    <>
      <div className="back-link">
        <Link to="/scenarios">← Quản lý kịch bản</Link>
      </div>
      <Header
        eyebrow="KIỂM SOÁT PHỐI HỢP"
        title="Đối chiếu xung đột"
        sub="Xem bằng chứng trước khi đưa ra quyết định xử lý."
      />
      <Notice>
        <b>{f.kind}</b>
        <p>{f.evidence}</p>
        <small>
          {f.ruleId} · So sánh phiên bản {f.a.versions.at(-1)?.no} và{" "}
          {f.b.versions.at(-1)?.no} · {f.sample.length} khách hàng trong tập mẫu
          giao nhau
        </small>
      </Notice>
      <div className="two-columns conflict-columns">
        {[f.a, f.b].map((s, i) => {
          const c = getConfig(s);
          return (
            <Panel
              key={s.id}
              title={`${i === 0 ? "A" : "B"} · ${c.name}`}
              sub={`${s.code} · Phiên bản ${s.versions.at(-1)?.no}`}
              action={<Link to={`/scenarios/${s.id}`}>Mở kịch bản ↗</Link>}
            >
              <dl className="definition-list">
                <dt>Hiệu lực</dt>
                <dd>
                  {date(c.start)} → {date(c.end)}
                </dd>
                <dt>Phụ trách</dt>
                <dd>{c.owner}</dd>
                <dt>Nguồn kích hoạt</dt>
                <dd>
                  {c.mode === "event" ? c.events.join(", ") : "Theo lịch"}
                </dd>
              </dl>
              <h3>Điều kiện đối tượng</h3>
              <p>{describe(c.condition)}</p>
              <h3>Hành động liên quan</h3>
              {c.actions.map((a) => (
                <div className="message-preview" key={a.id}>
                  <b>{a.title}</b>
                  <p>
                    {a.type === "notification"
                      ? a.body.noti
                      : a.type === "service_offer"
                        ? `${a.placement} · ${(a.services || []).map((id) => state.services.find((s) => s.id === id)?.name || id).join(", ")}`
                        : a.type === "offer"
                          ? `${a.placement} · ${a.products.join(", ")}`
                          : a.control}
                  </p>
                </div>
              ))}
            </Panel>
          );
        })}
      </div>
      <Panel
        title="Bằng chứng trên tập mẫu"
        sub="Không suy rộng kết quả này thành toàn bộ khách hàng thực tế."
      >
        <div className="evidence-strip">
          <strong>{f.sample.length}</strong>
          <span>
            khách hàng thỏa điều kiện
            <br />ở cả hai kịch bản
          </span>
          <Badge value="unknown" label="Cần rà soát nghiệp vụ" />
        </div>
        <div className="sample-chips">
          {f.sample.slice(0, 30).map((id) => (
            <span key={id}>{id}</span>
          ))}
        </div>
        <small>
          Hiển thị tối đa 30 mã. Kiểm tra dựa trên cấu hình có cấu trúc và tập
          dữ liệu minh họa, không dùng AI suy luận nội dung.
        </small>
      </Panel>
      <Panel title="Kết luận rà soát">
        {f.review ? (
          <Notice>
            Đã ghi nhận: {f.review}. Kết luận chỉ áp dụng cho đúng hai phiên bản
            này.
          </Notice>
        ) : (
          <>
            <Area
              label="Nhận định và hướng xử lý"
              value={reason}
              onChange={setReason}
              hint="Ví dụ: cần điều chỉnh lịch, thu hẹp đối tượng hoặc ưu tiên một offer."
            />
            <Button
              appearance="primary"
              disabled={!reason.trim() || !allowed(state.persona, "edit")}
              onClick={() =>
                act("Đã ghi nhận rà soát xung đột", "edit", (s) => {
                  s.reviews[
                    `${f.id}-${f.a.versions.at(-1)!.id}-${f.b.versions.at(-1)!.id}`
                  ] = reason;
                })
              }
            >
              Lưu kết luận rà soát
            </Button>
          </>
        )}
      </Panel>
    </>
  );
}
export function Catalogs() {
  const { kind = "categories" } = useParams();
  const { state, act } = useStore();
  const [query, setQuery] = useState(""),
    [item, setItem] = useState<CatalogItem | null>(null);
  const [catalogGroup, setCatalogGroup] = useState("all");
  const editable = ["categories", "products", "services", "bundles"].includes(
      kind,
    ),
    list =
      kind === "categories"
        ? state.categories
        : kind === "services"
          ? state.services.filter(
              (s) => catalogGroup === "all" || s.group === catalogGroup,
            )
          : kind === "customers"
            ? customerGroups.map((g) => ({ ...g, active: true }))
            : kind === "products"
              ? state.products
              : kind === "bundles"
                ? state.bundles
                : kind === "metrics"
                  ? metrics.map((m) => ({
                      id: m.id,
                      name: m.label,
                      description: m.definition,
                      active: true,
                      group: m.group,
                    }))
                  : kind === "events"
                    ? events.map((e) => ({
                        id: e.id,
                        name: e.label,
                        description:
                          e.id === "fund.navPublished"
                            ? "Đối tượng: khách nắm giữ sản phẩm P05"
                            : "Đối tượng: khách hàng / tài khoản liên quan",
                        active: true,
                        group: e.group,
                      }))
                    : [
                        "notification",
                        "task",
                        "offer",
                        "service_offer",
                        "control",
                      ].map((id, i) => ({
                        id,
                        name: [
                          "Thông báo",
                          "Giao việc",
                          "Offer sản phẩm chính sách",
                          "Offer dịch vụ",
                          "Kiểm soát nghiệp vụ",
                        ][i],
                        description:
                          "Thành phần hành động dùng chung của hệ thống.",
                        active: true,
                      }));
  const nav = useNavigate();
  return (
    <>
      <Header
        eyebrow="THƯ VIỆN DÙNG CHUNG"
        title="Danh mục cấu hình"
        sub="Chuẩn hóa các thành phần để nghiệp vụ chủ động thiết lập kịch bản."
      >
        {editable && allowed(state.persona, "edit") && (
          <Button
            appearance="primary"
            icon={<Add20Regular />}
            onClick={() =>
              setItem({
                id: uid(kind.slice(0, 3).toUpperCase()),
                name: "",
                description: "",
                active: true,
                products: [],
                group:
                  kind === "products"
                    ? "Cổ phiếu"
                    : kind === "services"
                      ? serviceGroups[0]
                      : undefined,
              })
            }
          >
            Khai báo mới
          </Button>
        )}
      </Header>
      <Tabs
        items={[
          ["categories", "Danh mục kịch bản"],
          ["products", "Sản phẩm chính sách"],
          ["services", "Dịch vụ"],
          ["bundles", "Bộ sản phẩm"],
          ["customers", "Tệp khách hàng"],
          ["metrics", "Đại lượng"],
          ["events", "Sự kiện"],
          ["actions", "Hành động"],
        ]}
        value={kind}
        onChange={(v) => {
          setQuery("");
          setCatalogGroup("all");
          nav("/catalogs/" + v);
        }}
      />
      {kind === "services" && (
        <div
          className="service-catalog-groups"
          role="group"
          aria-label="Nhóm dịch vụ"
        >
          {["all", ...serviceGroups].map((group) => (
            <Button
              key={group}
              aria-pressed={catalogGroup === group}
              appearance={catalogGroup === group ? "primary" : "secondary"}
              onClick={() => setCatalogGroup(group)}
            >
              {group === "all" ? "Tất cả dịch vụ" : group} ·{" "}
              {
                state.services.filter(
                  (service) => group === "all" || service.group === group,
                ).length
              }
            </Button>
          ))}
        </div>
      )}
      <Panel
        title={`${list.length} mục trong thư viện`}
        action={
          <Text label="Tìm trong danh mục" value={query} onChange={setQuery} />
        }
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Tên / Mã</th>
                <th>Mô tả</th>
                <th>Nhóm</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list
                .filter((x) =>
                  normalize(x.name + " " + x.id).includes(normalize(query)),
                )
                .map((x) => (
                  <tr key={x.id}>
                    <td>
                      <b>{x.name}</b>
                      <small>{x.id}</small>
                    </td>
                    <td>{x.description}</td>
                    <td>
                      {kind === "categories"
                        ? "Tất cả 5 giai đoạn"
                        : "group" in x
                          ? String(x.group || "—")
                          : "—"}
                    </td>
                    <td>
                      <Badge
                        value={x.active ? "active" : "paused"}
                        label={x.active ? "Đang sử dụng" : "Ngừng sử dụng"}
                      />
                    </td>
                    <td>
                      {editable && allowed(state.persona, "edit") && (
                        <Button size="small" onClick={() => setItem(copy(x))}>
                          Chỉnh sửa
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!editable && (
          <Notice>
            Định nghĩa kỹ thuật của đại lượng, sự kiện và hành động được quản lý
            bởi đội ngũ nền tảng. Thư viện hiện tại dùng các khả năng đã triển
            khai trong mockup.
          </Notice>
        )}
      </Panel>
      <Modal
        open={!!item}
        title="Khai báo danh mục"
        onClose={() => setItem(null)}
        actions={
          <>
            <Button onClick={() => setItem(null)}>Hủy</Button>
            <Button
              appearance="primary"
              disabled={
                !item?.name.trim() ||
                (kind === "services" &&
                  !serviceGroups.includes(item?.group || ""))
              }
              onClick={() => {
                if (
                  item &&
                  act(`Đã lưu ${item.name}`, "edit", (s) => {
                    const target =
                      kind === "categories"
                        ? s.categories
                        : kind === "services"
                          ? s.services
                          : kind === "products"
                            ? s.products
                            : s.bundles;
                    const index = target.findIndex((x) => x.id === item.id);
                    if (index < 0) target.push(item);
                    else target[index] = item;
                  })
                )
                  setItem(null);
              }}
            >
              Lưu thay đổi
            </Button>
          </>
        }
      >
        {item && (
          <>
            <Text label="Mã" value={item.id} disabled onChange={() => {}} />
            <Text
              label="Tên *"
              value={item.name}
              onChange={(name) => setItem({ ...item, name })}
            />
            <Area
              label="Mô tả"
              value={item.description}
              onChange={(description) => setItem({ ...item, description })}
            />
            {kind === "categories" && (
              <p className="hint">
                Nhóm kịch bản hiển thị trong cả 5 giai đoạn hành trình, kể cả
                khi chưa có kịch bản.
              </p>
            )}
            {kind === "services" && (
              <>
                <Choice
                  label="Nhóm dịch vụ *"
                  value={item.group || serviceGroups[0]}
                  onChange={(group) => setItem({ ...item, group })}
                  options={serviceGroups}
                />
                <Text
                  label="Hiệu lực đến"
                  type="date"
                  value={item.end || ""}
                  onChange={(end) => setItem({ ...item, end })}
                />
              </>
            )}
            {kind === "products" && (
              <>
                <Choice
                  label="Nhóm sản phẩm"
                  value={item.group || "Cổ phiếu"}
                  onChange={(group) => setItem({ ...item, group })}
                  options={[
                    "Cổ phiếu",
                    "Phái sinh",
                    "Nợ",
                    "Trái phiếu",
                    "CCQ",
                    "MM",
                  ]}
                />
                <Text
                  label="Hiệu lực đến"
                  type="date"
                  value={item.end || ""}
                  onChange={(end) => setItem({ ...item, end })}
                />
              </>
            )}
            {kind === "bundles" && (
              <Checks
                label="Sản phẩm thành viên"
                values={item.products || []}
                onChange={(products) => setItem({ ...item, products })}
                options={state.products
                  .filter((p) => p.active)
                  .map((p) => [p.id, p.name])}
              />
            )}
            <Choice
              label="Trạng thái"
              value={String(item.active)}
              onChange={(v) => setItem({ ...item, active: v === "true" })}
              options={[
                ["true", "Đang sử dụng"],
                ["false", "Ngừng sử dụng"],
              ]}
            />
            <Notice>
              Ngừng sử dụng chỉ chặn lựa chọn mới. Cấu hình phiên bản và lịch sử
              đã có vẫn được giữ.
            </Notice>
          </>
        )}
      </Modal>
    </>
  );
}
