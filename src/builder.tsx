import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useBlocker } from "react-router";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Add20Regular,
  ArrowLeft20Regular,
  Checkmark20Regular,
  Calendar20Regular,
  Flash20Regular,
  Mail20Regular,
  Delete20Regular,
  ArrowUp20Regular,
  ArrowDown20Regular,
  Save20Regular,
  Flow20Regular,
} from "@fluentui/react-icons";
import { useStore, download } from "./store";
import {
  type Config,
  type Action,
  copy,
  owners,
  units,
  events,
  date,
  localInput,
  newAction,
  allowed,
  validate,
  scheduleRuns,
  describe,
  renderBody,
  normalize,
} from "./domain";
import {
  Header,
  Button,
  Panel,
  Text,
  Area,
  Choice,
  Checks,
  Checkbox,
  Modal,
  Notice,
  Empty,
  Logo,
} from "./ui";
import { Conditions } from "./conditions";
import { EmailDocument } from "./EmailDocument";
import {
  journeys,
  customerGroupOptions,
  groupLabel,
  journeyLabel,
  categorySupportsJourney,
  serviceGroups,
  catalogAvailable,
} from "./taxonomy";
const steps = [
  ["basics", "Thông tin chung", "Định danh & mục tiêu"],
  ["conditions", "Điều kiện thỏa mãn", "Đối tượng nào phù hợp?"],
  ["trigger", "Cơ chế kích hoạt", "Khi nào cần phản ứng?"],
  ["actions", "Hành động thực hiện", "Thực hiện điều gì?"],
  ["lifecycle", "Hiệu lực & hậu xử lý", "Vận hành đến khi nào?"],
];
export function Builder() {
  const { draftId = "", step = "basics" } = useParams();
  const store = useStore(),
    nav = useNavigate();
  const source = store.state.scenarios.find((s) => s.id === draftId);
  const [config, setConfig] = useState<Config | null>(() =>
      source?.draft ? copy(source.draft) : null,
    ),
    [errors, setErrors] = useState<string[]>([]),
    [review, setReview] = useState(false),
    [reason, setReason] = useState(""),
    [saved, setSaved] = useState(true);
  const dirty = useRef(false);
  const blocker = useBlocker(() => dirty.current);
  const index = steps.findIndex((s) => s[0] === step);
  const saveRef = useRef(store.saveDraft);
  saveRef.current = store.saveDraft;
  useEffect(() => {
    if (!dirty.current || !config) return;
    const timer = setTimeout(() => {
      const ok = saveRef.current(draftId, config);
      setSaved(ok);
      if (ok) dirty.current = false;
    }, 600);
    return () => clearTimeout(timer);
  }, [config, draftId]);
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, []);
  if (!config || !source || index < 0)
    return (
      <Empty
        title="Không tìm thấy bản nháp"
        sub="Kịch bản có thể đã công bố hoặc đường dẫn không còn hợp lệ."
      >
        <Link to="/scenarios">Về quản lý kịch bản</Link>
      </Empty>
    );
  const set = (c: Config) => {
    dirty.current = true;
    setSaved(false);
    setConfig(c);
  };
  const patch = (v: Partial<Config>) => set({ ...config, ...v });
  const persist = () => {
    const ok = store.saveDraft(draftId, config);
    setSaved(ok);
    if (ok) dirty.current = false;
    return ok;
  };
  const go = (i: number) => {
    const errs =
      i > index
        ? Array.from({ length: i }, (_, n) => validate(config, n)).flat()
        : [];
    if (errs.length) {
      setErrors([...new Set(errs)]);
      return;
    }
    if (persist()) {
      setErrors([]);
      nav(`/scenarios/drafts/${draftId}/${steps[i][0]}`);
    }
  };
  return (
    <>
      <Modal
        open={blocker.state === "blocked"}
        title="Lưu thay đổi trước khi rời trang?"
        onClose={() => blocker.state === "blocked" && blocker.reset()}
        actions={
          <>
            <Button
              onClick={() => blocker.state === "blocked" && blocker.reset()}
            >
              Ở lại
            </Button>
            <Button
              appearance="primary"
              onClick={() => {
                if (persist() && blocker.state === "blocked") blocker.proceed();
              }}
            >
              Lưu và rời trang
            </Button>
          </>
        }
      >
        <p>
          Bản nháp đang có thay đổi chưa lưu. Lưu lại để tiếp tục ở màn hình
          khác.
        </p>
      </Modal>
      <Header
        eyebrow={`${draftId} / ${source.versions.length ? "BẢN SỬA" : "KỊCH BẢN MỚI"}`}
        title="Thiết lập kịch bản"
        sub="Biến ý định nghiệp vụ thành một tiến trình tự động."
      >
        <span className={`save-status ${saved ? "" : "pending"}`}>
          <span className="status-dot" />
          {saved ? "Đã lưu bản nháp" : "Đang lưu thay đổi…"}
        </span>
        <Button
          onClick={() => {
            if (persist()) nav("/scenarios");
          }}
        >
          Đóng
        </Button>
      </Header>
      <div className="wizard-stepper">
        {steps.map(([id, title, sub], i) => (
          <button
            key={id}
            className={`${i === index ? "current" : ""} ${i < index ? "done" : ""}`}
            onClick={() => go(i)}
            aria-current={i === index ? "step" : undefined}
          >
            <span className="step-number">
              {i < index ? <Checkmark20Regular /> : i + 1}
            </span>
            <span>
              <b>{title}</b>
              <small>{sub}</small>
            </span>
          </button>
        ))}
      </div>
      {errors.length > 0 && (
        <Notice error>
          <b>Cần hoàn thiện trước khi tiếp tục</b>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Notice>
      )}
      {!allowed(store.state.persona, "edit") && (
        <Notice error>
          Vai trò hiện tại chỉ có quyền xem. Đổi sang Editor hoặc Manager trong
          thanh trên để chỉnh sửa.
        </Notice>
      )}
      <div className="wizard-content">
        {index === 0 && (
          <div className="basics-layout">
            <Panel
              title="Thông tin cơ bản"
              sub="Giúp đội ngũ hiểu rõ mục tiêu và trách nhiệm của kịch bản."
            >
              <div className="form-grid">
                <div className="span-2">
                  <Text
                    label="Tên kịch bản *"
                    placeholder="Ví dụ: Rà soát kế hoạch sử dụng tiền"
                    value={config.name}
                    onChange={(name) => patch({ name })}
                    hint="Một tên rõ mục đích, dễ tìm kiếm. Từ 5 đến 120 ký tự."
                  />
                </div>
                <Choice
                  label="Tệp khách hàng áp dụng *"
                  value={config.customerGroup}
                  onChange={(customerGroup) => patch({ customerGroup })}
                  options={[
                    ["", "Chọn tệp khách hàng…"],
                    ...customerGroupOptions,
                  ]}
                  hint="Chỉ khách hàng thuộc tệp này được xét điều kiện và kích hoạt kịch bản."
                />
                <Choice
                  label="Hành trình khách hàng *"
                  value={config.journey}
                  onChange={(journey) =>
                    patch({
                      journey,
                      category: store.state.categories.some(
                        (c) =>
                          c.id === config.category &&
                          c.active &&
                          categorySupportsJourney(c, journey),
                      )
                        ? config.category
                        : "",
                    })
                  }
                  options={[
                    ["", "Chọn bước hành trình…"],
                    ...journeys.map(
                      ([id, label]) => [id, label] as [string, string],
                    ),
                  ]}
                />
                <Choice
                  label="Danh mục kịch bản *"
                  value={config.category}
                  onChange={(category) => patch({ category })}
                  options={[
                    [
                      "",
                      config.journey
                        ? "Chọn danh mục…"
                        : "Chọn hành trình trước",
                    ],
                    ...store.state.categories
                      .filter(
                        (c) =>
                          c.active &&
                          categorySupportsJourney(c, config.journey),
                      )
                      .map((c) => [c.id, c.name] as [string, string]),
                  ]}
                />
                <Text
                  label="Mã kịch bản"
                  value={draftId}
                  onChange={() => {}}
                  disabled
                />
                <div className="span-2">
                  <Area
                    label="Mục đích của kịch bản *"
                    value={config.purpose}
                    onChange={(purpose) => patch({ purpose })}
                    hint="Mô tả tình huống cần nhận biết và kết quả mong muốn. Từ 20 đến 800 ký tự."
                  />
                </div>
                <Choice
                  label="Đơn vị phụ trách"
                  value={config.unit}
                  onChange={(unit) =>
                    patch({ unit, owner: owners[units.indexOf(unit) * 2] })
                  }
                  options={units}
                />
                <Choice
                  label="Người phụ trách *"
                  value={config.owner}
                  onChange={(owner) => patch({ owner })}
                  options={owners.slice(
                    units.indexOf(config.unit) * 2,
                    units.indexOf(config.unit) * 2 + 2,
                  )}
                />
                <div className="span-2">
                  <Text
                    label="Nhãn quản lý"
                    value={config.tags.join(", ")}
                    onChange={(v) =>
                      patch({
                        tags: v
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean)
                          .slice(0, 8),
                      })
                    }
                    hint="Phân cách bằng dấu phẩy · Tối đa 8 nhãn"
                  />
                </div>
              </div>
            </Panel>
            <aside className="builder-aside">
              <div className="aside-symbol">
                <Flow20Regular />
              </div>
              <span className="eyebrow">TỪ CẤU HÌNH ĐẾN VẬN HÀNH</span>
              <h2>
                Một lần thiết lập.
                <br />
                Chủ động mỗi điểm chạm.
              </h2>
              <p>
                Mỗi kịch bản kết nối dữ liệu, thời điểm và hành động trong một
                quy trình có thể kiểm soát.
              </p>
              <ol>
                <li>Xác định đúng đối tượng</li>
                <li>Phản ứng đúng thời điểm</li>
                <li>Theo dõi đến kết quả cuối cùng</li>
              </ol>
              <div className="aside-note">
                <b>Công bố để bắt đầu</b>
                <p>
                  Sau khi hoàn tất, hệ thống tự sinh tiến trình theo cấu hình
                  của kịch bản.
                </p>
              </div>
            </aside>
          </div>
        )}
        {index === 1 && <Conditions config={config} onChange={set} />}
        {index === 2 && <Trigger config={config} onChange={set} />}
        {index === 3 && (
          <Actions
            config={config}
            onChange={set}
            draftId={draftId}
            beforeEditor={persist}
          />
        )}
        {index === 4 && <Lifecycle config={config} onChange={set} />}
      </div>
      <div className="wizard-footer">
        <Button
          icon={<ArrowLeft20Regular />}
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          Quay lại
        </Button>
        <span>
          Bước {index + 1}/5 · {steps[index][1]}
        </span>
        <div>
          <Button
            icon={<Save20Regular />}
            onClick={() => {
              persist();
              setErrors([]);
            }}
          >
            Lưu nháp
          </Button>
          <Button
            appearance="primary"
            disabled={!allowed(store.state.persona, "edit")}
            onClick={() => {
              if (index < 4) go(index + 1);
              else {
                const e = validate(config);
                setErrors(e);
                if (!e.length && persist()) setReview(true);
              }
            }}
          >
            {index === 4 ? "Xem lại và công bố" : "Tiếp tục"}{" "}
            <span aria-hidden>→</span>
          </Button>
        </div>
      </div>
      <Modal
        open={review}
        onClose={() => setReview(false)}
        title="Xem lại trước khi công bố"
        drawer
        actions={
          <>
            <Button onClick={() => setReview(false)}>Tiếp tục chỉnh sửa</Button>
            <Button
              appearance="primary"
              disabled={!allowed(store.state.persona, "publish")}
              onClick={() => {
                if (persist() && store.publish(draftId, reason)) {
                  dirty.current = false;
                  nav(`/scenarios/${draftId}?tab=process&created=1`);
                }
              }}
            >
              Công bố & tạo tiến trình
            </Button>
          </>
        }
      >
        <ConfigSummary config={config} />
        <Area label="Lý do công bố" value={reason} onChange={setReason} />
        <Notice>
          Hệ thống sẽ tự tạo tiến trình và đăng ký{" "}
          {config.mode === "event" ? "sự kiện" : "lịch thời gian"} từ cấu hình
          này. Các tác động ra bên ngoài được mô phỏng trong bản demo.
        </Notice>
        {!allowed(store.state.persona, "publish") && (
          <Notice error>Cần vai trò Manager hoặc Admin để công bố.</Notice>
        )}
      </Modal>
      {store.error && (
        <Button onClick={() => download(config, `${draftId}-draft.json`)}>
          Xuất bản nháp chưa lưu
        </Button>
      )}
    </>
  );
}
export function ConfigSummary({ config: c }: { config: Config }) {
  const { state } = useStore();
  return (
    <div className="config-summary">
      <div>
        <small>01 · THÔNG TIN CHUNG</small>
        <h3>{c.name}</h3>
        <p>{c.purpose}</p>
        <span>
          {groupLabel(c.customerGroup)} · {journeyLabel(c.journey)} ·{" "}
          {c.category} · {c.owner}
        </span>
      </div>
      <div>
        <small>02 · ĐIỀU KIỆN</small>
        <p>{describe(c.condition)}</p>
      </div>
      <div>
        <small>03 · KÍCH HOẠT</small>
        <p>
          {c.mode === "event"
            ? c.events
                .map((id) => events.find((e) => e.id === id)?.label || id)
                .join(" / ")
            : `Theo lịch: mỗi ${c.schedule.interval} ${c.schedule.unit}, lúc ${c.schedule.times.join(", ")}`}
        </p>
      </div>
      <div>
        <small>04 · HÀNH ĐỘNG</small>
        {c.actions.map((a, i) => (
          <p key={a.id}>
            {i + 1}. {a.title} ·{" "}
            {a.type === "notification"
              ? a.channels.join(" + ")
              : a.type === "service_offer"
                ? "Offer dịch vụ"
                : a.type === "offer"
                  ? "Offer sản phẩm chính sách"
                  : a.type}
            {(a.type === "offer" || a.type === "service_offer") && (
              <span className="summary-offer-items">
                {(a.type === "offer" ? a.products : a.services || [])
                  .map(
                    (id) =>
                      (a.type === "offer"
                        ? state.products
                        : state.services
                      ).find((item) => item.id === id)?.name || id,
                  )
                  .join(" · ")}
              </span>
            )}
          </p>
        ))}
      </div>
      <div>
        <small>05 · HIỆU LỰC & HẬU XỬ LÝ</small>
        <p>
          {date(c.start)} → {date(c.end)}
        </p>
        <p>
          {c.followEach ? "Có hậu xử lý từng lần" : "Không hậu xử lý từng lần"}{" "}
          · {c.followPeriod ? "Có tổng hợp theo kỳ" : "Không tổng hợp theo kỳ"}
        </p>
      </div>
    </div>
  );
}
function Trigger({
  config: c,
  onChange,
}: {
  config: Config;
  onChange: (c: Config) => void;
}) {
  const { state } = useStore();
  const [group, setGroup] = useState("Tiền"),
    [search, setSearch] = useState("");
  const patch = (v: Partial<Config>) => onChange({ ...c, ...v }),
    sch = (v: Partial<Config["schedule"]>) =>
      patch({ schedule: { ...c.schedule, ...v } });
  const runs = scheduleRuns(c, state.now);
  return (
    <>
      <div className="trigger-tabs">
        <button
          className={c.mode === "event" ? "selected" : ""}
          onClick={() => patch({ mode: "event" })}
        >
          <Flash20Regular />
          <div>
            <b>Theo sự kiện</b>
            <small>Phản ứng khi một sự kiện phát sinh</small>
          </div>
          <span className="radio-dot" />
        </button>
        <button
          className={c.mode === "schedule" ? "selected" : ""}
          onClick={() => patch({ mode: "schedule" })}
        >
          <Calendar20Regular />
          <div>
            <b>Theo thời gian</b>
            <small>Đánh giá theo lịch được thiết lập</small>
          </div>
          <span className="radio-dot" />
        </button>
      </div>
      {c.mode === "event" ? (
        <div className="trigger-event-layout">
          <Panel title="Thư viện sự kiện">
            <Text label="Tìm sự kiện" value={search} onChange={setSearch} />
            <div className="event-groups">
              {[...new Set(events.map((e) => e.group))].map((g) => (
                <button
                  className={group === g ? "selected" : ""}
                  key={g}
                  onClick={() => setGroup(g)}
                >
                  {g}
                  <small>{events.filter((e) => e.group === g).length}</small>
                </button>
              ))}
            </div>
          </Panel>
          <Panel
            title={search ? "Kết quả tìm kiếm" : group}
            sub="Chọn một hoặc nhiều sự kiện. Bất kỳ sự kiện đã chọn đều có thể khởi động đánh giá."
          >
            <div className="event-items">
              {events
                .filter((e) =>
                  search
                    ? normalize(e.label).includes(normalize(search))
                    : e.group === group,
                )
                .map((e) => (
                  <label
                    className={`event-item ${c.events.includes(e.id) ? "selected" : ""}`}
                    key={e.id}
                  >
                    <Checkbox
                      label={e.label}
                      checked={c.events.includes(e.id)}
                      onChange={(_, d) =>
                        patch({
                          events: d.checked
                            ? [...c.events, e.id]
                            : c.events.filter((x) => x !== e.id),
                        })
                      }
                    />
                    <small>{e.id}</small>
                  </label>
                ))}
            </div>
            <Text
              label="Giá trị sự kiện tối thiểu (VND)"
              type="number"
              value={c.minAmount}
              onChange={(v) => patch({ minAmount: Math.max(0, Number(v)) })}
              hint="Áp dụng cho giá trị amount của sự kiện trong bản mô phỏng."
            />
          </Panel>
          <Panel title="Nguồn đã chọn">
            <div className="selected-events">
              {c.events.map((id) => (
                <div key={id}>
                  <Flash20Regular />
                  <span>{events.find((e) => e.id === id)?.label}</span>
                  <button
                    aria-label={`Bỏ ${id}`}
                    onClick={() =>
                      patch({ events: c.events.filter((x) => x !== id) })
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <Notice>
              Sự kiện cá nhân chỉ xét khách hàng hoặc tài khoản liên quan. Công
              bố NAV quỹ xét tập khách nắm giữ sản phẩm.
            </Notice>
          </Panel>
        </div>
      ) : (
        <div className="two-columns">
          <Panel
            title="Thiết lập lịch đánh giá"
            sub="Múi giờ Asia/Ho_Chi_Minh · UTC+7"
          >
            <div className="form-grid">
              <Choice
                label="Chu kỳ"
                value={c.schedule.unit}
                onChange={(v) => sch({ unit: v })}
                options={[
                  ["hour", "Hàng giờ"],
                  ["day", "Hàng ngày"],
                  ["week", "Hàng tuần"],
                  ["month", "Hàng tháng"],
                  ["year", "Hàng năm"],
                ]}
              />
              <Text
                label="Khoảng lặp (mỗi N chu kỳ)"
                type="number"
                value={c.schedule.interval}
                onChange={(v) => sch({ interval: Number(v) })}
              />
              {c.schedule.unit !== "hour" && (
                <Text
                  label="Giờ chạy"
                  value={c.schedule.times.join(", ")}
                  onChange={(v) =>
                    sch({
                      times: v
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                  hint="Ví dụ: 09:00, 14:30"
                />
              )}
              {c.schedule.unit === "week" && (
                <Checks
                  label="Thứ trong tuần"
                  values={c.schedule.weekdays.map(String)}
                  onChange={(v) => sch({ weekdays: v.map(Number) })}
                  options={[
                    ["1", "T2"],
                    ["2", "T3"],
                    ["3", "T4"],
                    ["4", "T5"],
                    ["5", "T6"],
                    ["6", "T7"],
                    ["0", "CN"],
                  ]}
                />
              )}
              {["month", "year"].includes(c.schedule.unit) && (
                <Text
                  label="Ngày trong tháng"
                  value={c.schedule.monthDays.join(", ")}
                  onChange={(v) =>
                    sch({
                      monthDays: v
                        .split(",")
                        .map(Number)
                        .filter((x) => x >= 1 && x <= 31),
                    })
                  }
                  hint="Phân cách bằng dấu phẩy; bỏ qua ngày không tồn tại."
                />
              )}
              {c.schedule.unit === "year" && (
                <Text
                  label="Tháng trong năm"
                  value={c.schedule.months.join(", ")}
                  onChange={(v) =>
                    sch({
                      months: v
                        .split(",")
                        .map(Number)
                        .filter((x) => x >= 1 && x <= 12),
                    })
                  }
                />
              )}
              <Choice
                label="Lịch áp dụng"
                value={c.schedule.calendar}
                onChange={(v) => sch({ calendar: v })}
                options={[
                  ["all", "Mọi ngày"],
                  ["business", "Ngày làm việc (T2–T6)"],
                  ["trading", "Ngày giao dịch · Minh họa"],
                ]}
              />
              <Text
                label="Ngày loại trừ"
                value={c.schedule.excludedDates.join(", ")}
                onChange={(v) =>
                  sch({
                    excludedDates: v
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                  })
                }
                hint="YYYY-MM-DD, YYYY-MM-DD"
              />
              <Text
                label="Tạm nghỉ từ ngày"
                type="date"
                value={c.schedule.pauseFrom}
                onChange={(v) => sch({ pauseFrom: v })}
              />
              <Text
                label="Đến trước ngày"
                type="date"
                value={c.schedule.pauseTo}
                onChange={(v) => sch({ pauseTo: v })}
              />
            </div>
          </Panel>
          <Panel
            title="5 thời điểm tiếp theo"
            sub="Được tính từ cấu hình lịch và hiệu lực hiện tại"
          >
            <div className="next-runs">
              {runs.runs.map((r, i) => (
                <div key={r}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <Calendar20Regular />
                  <b>{date(r)}</b>
                </div>
              ))}
            </div>
            {runs.reason && <Notice>{runs.reason}</Notice>}
            <p className="hint">
              Hiệu lực được xác nhận tại bước 5. Thay đổi hiệu lực sẽ cập nhật
              lại các mốc này.
            </p>
            {c.schedule.calendar === "trading" && (
              <Notice>
                Lịch giao dịch là dữ liệu minh họa hữu hạn 2026–2027, chưa kết
                nối lịch sở giao dịch.
              </Notice>
            )}
          </Panel>
        </div>
      )}
      <Panel
        title="Quy tắc tái kích hoạt"
        sub="Kiểm soát việc thực hiện lặp lại cho cùng một đối tượng."
        className="reentry-panel"
      >
        <div className="form-grid">
          <Choice
            label="Cho phép thực hiện lại"
            value={c.reentry}
            onChange={(v) => patch({ reentry: v })}
            options={[
              ["each", "Mỗi sự kiện / lượt lịch hợp lệ"],
              ["once", "Một lần trong vòng đời kịch bản"],
              ["cooldown", "Sau một khoảng nghỉ"],
              ["reenter", "Thoát điều kiện rồi thỏa trở lại"],
            ]}
          />
          {c.reentry === "cooldown" && (
            <Text
              label="Khoảng nghỉ (giờ)"
              type="number"
              value={c.cooldown}
              onChange={(v) => patch({ cooldown: Number(v) })}
            />
          )}
        </div>
      </Panel>
    </>
  );
}
function Actions({
  config: c,
  onChange,
  draftId,
  beforeEditor,
}: {
  config: Config;
  onChange: (c: Config) => void;
  draftId: string;
  beforeEditor: () => boolean;
}) {
  const { state } = useStore(),
    nav = useNavigate();
  const [preview, setPreview] = useState<Action | null>(null);
  const update = (id: string, p: Partial<Action>) =>
    onChange({
      ...c,
      actions: c.actions.map((a) => (a.id === id ? { ...a, ...p } : a)),
    });
  return (
    <div className="actions-layout">
      <div>
        <div className="section-intro">
          <h2>Thiết kế phản ứng của kịch bản</h2>
          <p>
            Các hành động chạy theo thứ tự. Một hành động lỗi không chặn hành
            động kế tiếp trong demo.
          </p>
        </div>
        {c.actions.map((a, i) => (
          <Panel
            className="action-card"
            key={a.id}
            title={`${String(i + 1).padStart(2, "0")} · ${a.title}`}
            action={
              <div className="inline-actions">
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<ArrowUp20Regular />}
                  aria-label="Đưa hành động lên"
                  disabled={i === 0}
                  onClick={() => {
                    const list = [...c.actions];
                    [list[i - 1], list[i]] = [list[i], list[i - 1]];
                    onChange({ ...c, actions: list });
                  }}
                />
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<ArrowDown20Regular />}
                  aria-label="Đưa hành động xuống"
                  disabled={i === c.actions.length - 1}
                  onClick={() => {
                    const list = [...c.actions];
                    [list[i + 1], list[i]] = [list[i], list[i + 1]];
                    onChange({ ...c, actions: list });
                  }}
                />
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<Delete20Regular />}
                  aria-label="Xóa hành động"
                  onClick={() =>
                    onChange({
                      ...c,
                      actions: c.actions.filter((x) => x.id !== a.id),
                    })
                  }
                />
              </div>
            }
          >
            <Text
              label="Tên hành động"
              value={a.title}
              onChange={(title) => update(a.id, { title })}
            />
            {a.type === "notification" && (
              <>
                <Checks
                  label="Người nhận"
                  values={a.recipients}
                  onChange={(recipients) => update(a.id, { recipients })}
                  options={[
                    "Khách hàng",
                    "Tư vấn đầu tư",
                    "Dịch vụ khách hàng",
                    "Nhân sự cấp cao",
                  ]}
                />
                <Checks
                  label="Kênh thông báo"
                  values={a.channels}
                  onChange={(channels) => update(a.id, { channels })}
                  options={[
                    ["email", "Email"],
                    ["noti", "Thông báo ứng dụng"],
                    ["sms", "SMS"],
                  ]}
                />
                {a.channels.map((ch) => (
                  <div className="channel-content" key={ch}>
                    <div className="channel-heading">
                      <b>
                        {ch === "noti"
                          ? "Thông báo ứng dụng"
                          : ch.toUpperCase()}
                      </b>
                      <Button
                        size="small"
                        appearance="subtle"
                        onClick={() => setPreview(a)}
                      >
                        Xem trước
                      </Button>
                    </div>
                    {ch === "email" ? (
                      <>
                        <Text
                          label="Tiêu đề email"
                          value={a.subject}
                          onChange={(subject) => update(a.id, { subject })}
                        />
                        <Button
                          icon={<Mail20Regular />}
                          onClick={() => {
                            if (beforeEditor())
                              nav(
                                `/scenarios/drafts/${draftId}/actions/${a.id}/email`,
                              );
                          }}
                        >
                          Mở trình soạn thảo email
                        </Button>
                      </>
                    ) : (
                      <Area
                        label={`Nội dung ${ch}`}
                        value={a.body[ch]}
                        onChange={(v) =>
                          update(a.id, { body: { ...a.body, [ch]: v } })
                        }
                        hint={`${a.body[ch]?.length || 0} ký tự · Dùng {{customer.name}} để chèn tên`}
                      />
                    )}
                    {ch !== "email" && (
                      <div className="variable-buttons">
                        {[
                          "customer.name",
                          "equity.availableCash",
                          "scenario.name",
                        ].map((v) => (
                          <Button
                            key={v}
                            appearance="subtle"
                            size="small"
                            onClick={() =>
                              update(a.id, {
                                body: {
                                  ...a.body,
                                  [ch]: a.body[ch] + ` {{${v}}}`,
                                },
                              })
                            }
                          >{`+ {{${v}}}`}</Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
            {a.type === "offer" && (
              <>
                <Choice
                  label="Vị trí hiển thị"
                  value={a.placement}
                  onChange={(placement) => update(a.id, { placement })}
                  options={["Trang chủ", "Trang tài sản", "Trang sản phẩm"]}
                />
                <Choice
                  label="Chọn nhanh bộ sản phẩm"
                  value=""
                  onChange={(id) => {
                    const bundle = state.bundles.find((b) => b.id === id);
                    if (bundle)
                      update(a.id, { products: bundle.products || [] });
                  }}
                  options={[
                    ["", "Chọn bộ sản phẩm…"],
                    ...state.bundles
                      .filter((b) => b.active)
                      .map((b) => [b.id, b.name] as [string, string]),
                  ]}
                />
                <div className="product-picker">
                  {state.products.map((p) => (
                    <label key={p.id}>
                      <Checkbox
                        label={p.name}
                        checked={a.products.includes(p.id)}
                        disabled={
                          !catalogAvailable(p, state.now) &&
                          !a.products.includes(p.id)
                        }
                        onChange={(_, d) =>
                          update(a.id, {
                            products: d.checked
                              ? [...a.products, p.id]
                              : a.products.filter((x) => x !== p.id),
                          })
                        }
                      />
                      {!catalogAvailable(p, state.now) && (
                        <small>Hết hiệu lực</small>
                      )}
                    </label>
                  ))}
                </div>
                <Button onClick={() => setPreview(a)}>
                  Xem offer trên ứng dụng giao dịch
                </Button>
              </>
            )}
            {a.type === "service_offer" && (
              <>
                <Choice
                  label="Vị trí hiển thị dịch vụ"
                  value={a.placement}
                  onChange={(placement) => update(a.id, { placement })}
                  options={["Trang chủ", "Trang tài sản", "Trang dịch vụ"]}
                />
                <p className="hint">
                  Chọn dịch vụ phù hợp với nhu cầu của tệp khách hàng. Có thể
                  kết hợp nhiều loại hình.
                </p>
                {serviceGroups.map((group) => (
                  <fieldset className="service-offer-group" key={group}>
                    <legend>{group}</legend>
                    <div className="product-picker">
                      {state.services
                        .filter((service) => service.group === group)
                        .map((service) => (
                          <label key={service.id}>
                            <Checkbox
                              label={service.name}
                              checked={(a.services || []).includes(service.id)}
                              disabled={
                                !catalogAvailable(service, state.now) &&
                                !(a.services || []).includes(service.id)
                              }
                              onChange={(_, data) =>
                                update(a.id, {
                                  services: data.checked
                                    ? [...(a.services || []), service.id]
                                    : (a.services || []).filter(
                                        (id) => id !== service.id,
                                      ),
                                })
                              }
                            />
                            {!catalogAvailable(service, state.now) && (
                              <small>Hết hiệu lực</small>
                            )}
                          </label>
                        ))}
                    </div>
                  </fieldset>
                ))}
                <Button onClick={() => setPreview(a)}>
                  Xem offer dịch vụ trên ứng dụng
                </Button>
              </>
            )}
            {a.type === "task" && (
              <>
                <p>
                  Giao cho {c.owner}. Phần việc này phát sinh trong lượt kích
                  hoạt, độc lập với hậu xử lý.
                </p>
                <Text
                  label="Hoàn thành trong (ngày)"
                  type="number"
                  value={a.dueDays}
                  onChange={(v) => update(a.id, { dueDays: Number(v) })}
                />
              </>
            )}
            {a.type === "control" && (
              <>
                <Choice
                  label="Thao tác kiểm soát"
                  value={a.control}
                  onChange={(control) => update(a.id, { control })}
                  options={[
                    "Khóa tài khoản",
                    "Khóa phát vay",
                    "Khóa rút tiền",
                    "Khóa giao dịch",
                  ]}
                />
                <Area
                  label="Lý do kiểm soát nghiệp vụ *"
                  value={a.reason || ""}
                  onChange={(reason) => update(a.id, { reason })}
                />
                <Notice>
                  Chỉ ghi nhật ký mô phỏng; không tác động tài khoản hoặc hệ
                  thống giao dịch thật.
                </Notice>
              </>
            )}
          </Panel>
        ))}
      </div>
      <Panel
        title="Thêm hành động"
        sub="Kết hợp nhiều hình thức phản ứng"
        className="action-library"
      >
        {[
          ["notification", "Thông báo", "Email, SMS, ứng dụng"],
          ["task", "Giao việc", "Tư vấn, chăm sóc, vận hành"],
          [
            "offer",
            "Offer sản phẩm chính sách",
            "Chính sách giao dịch và bộ sản phẩm",
          ],
          [
            "service_offer",
            "Offer dịch vụ",
            "Tư vấn đầu tư, danh mục mẫu, quản lý tài sản",
          ],
          ["control", "Kiểm soát nghiệp vụ", "Thao tác khẩn cấp theo quyền"],
        ].map(([type, title, sub]) => (
          <button
            key={type}
            disabled={type === "control" && !allowed(state.persona, "control")}
            onClick={() =>
              onChange({
                ...c,
                actions: [...c.actions, newAction(type as Action["type"])],
              })
            }
          >
            <span className="mini-icon">
              <Add20Regular />
            </span>
            <span>
              <b>{title}</b>
              <small>{sub}</small>
            </span>
          </button>
        ))}
        <Notice>
          Mỗi hành động có kết quả riêng và được lưu cùng phiên bản kịch bản.
        </Notice>
      </Panel>
      <Modal
        open={!!preview}
        title="Xem trước nội dung"
        onClose={() => setPreview(null)}
      >
        {preview &&
          (preview.type === "offer" || preview.type === "service_offer" ? (
            <div className="phone-preview">
              <Logo />
              <small>
                {preview.type === "service_offer"
                  ? "DỊCH VỤ DÀNH CHO BẠN"
                  : "CHÍNH SÁCH DÀNH CHO BẠN"}
              </small>
              <h2>{preview.title}</h2>
              {(preview.type === "offer"
                ? preview.products
                : preview.services || []
              ).map((id) => (
                <div key={id} className="offer-preview-product">
                  {(preview.type === "offer"
                    ? state.products
                    : state.services
                  ).find((p) => p.id === id)?.name || id}
                </div>
              ))}
              <p>Minh họa vị trí {preview.placement}</p>
            </div>
          ) : (
            <>
              {preview.channels.map((ch) => (
                <div className="message-preview" key={ch}>
                  <b>{ch.toUpperCase()}</b>
                  <p>
                    {renderBody(preview.body[ch], state.customers[4], c.name)}
                  </p>
                </div>
              ))}
            </>
          ))}
      </Modal>
    </div>
  );
}
function Lifecycle({
  config: c,
  onChange,
}: {
  config: Config;
  onChange: (c: Config) => void;
}) {
  const { state } = useStore();
  const patch = (v: Partial<Config>) => onChange({ ...c, ...v });
  return (
    <div className="two-columns">
      <div>
        <Panel
          title="Thời gian hiệu lực"
          sub="Tiến trình sẵn sàng từ ngày bắt đầu và dừng nhận lượt mới khi hết hiệu lực."
        >
          <div className="form-grid">
            <Text
              label="Bắt đầu * · UTC+7"
              type="datetime-local"
              value={c.start ? localInput(c.start) : ""}
              onChange={(v) => patch({ start: v ? v + ":00+07:00" : "" })}
            />
            <Text
              label="Kết thúc · UTC+7"
              type="datetime-local"
              value={c.end ? localInput(c.end) : ""}
              onChange={(v) => patch({ end: v ? v + ":00+07:00" : "" })}
            />
          </div>
          <p className="hint">
            Bỏ trống kết thúc để vận hành không giới hạn. Không chạy tại đúng
            mốc kết thúc.
          </p>
        </Panel>
        <Panel title="Hậu xử lý sau mỗi lần kích hoạt">
          <Checkbox
            label="Tạo phần việc hậu xử lý từng lần"
            checked={c.followEach}
            onChange={(_, d) => patch({ followEach: !!d.checked })}
          />
          {c.followEach && (
            <div className="stack">
              <Text
                label="Tên công việc hậu xử lý"
                value={c.followTitle}
                onChange={(followTitle) => patch({ followTitle })}
              />
              <div className="form-grid">
                <Choice
                  label="Thời điểm tạo việc"
                  value={c.followTiming}
                  onChange={(followTiming) => patch({ followTiming })}
                  options={[
                    ["before", "Khi đã kích hoạt"],
                    ["after", "Sau khi hành động kết thúc"],
                  ]}
                />
                <Choice
                  label="Kết quả áp dụng"
                  value={c.followResult}
                  onChange={(followResult) => patch({ followResult })}
                  options={[
                    ["all", "Tất cả"],
                    ["completed", "Thành công"],
                    ["failed", "Có lỗi"],
                  ]}
                />
                <Choice
                  label="Người xử lý"
                  value={c.followOwner}
                  onChange={(followOwner) => patch({ followOwner })}
                  options={owners}
                />
                <Text
                  label="Hạn xử lý (ngày)"
                  type="number"
                  value={c.dueDays}
                  onChange={(v) => patch({ dueDays: Number(v) })}
                />
              </div>
            </div>
          )}
        </Panel>
        <Panel title="Tổng hợp và xử lý theo kỳ">
          <Checkbox
            label="Bật hậu xử lý theo kỳ"
            checked={c.followPeriod}
            onChange={(_, d) => patch({ followPeriod: !!d.checked })}
          />
          {c.followPeriod && (
            <>
              <div className="form-grid">
                <Choice
                  label="Cửa sổ tổng hợp"
                  value={c.period}
                  onChange={(period) => patch({ period })}
                  options={[
                    ["day", "Ngày trước"],
                    ["week", "Tuần trước (T2–CN)"],
                    ["month", "Tháng trước"],
                    ["custom", "Khoảng ngày cụ thể"],
                  ]}
                />
                <Choice
                  label="Bản ghi cần xử lý"
                  value={c.periodFilter}
                  onChange={(periodFilter) => patch({ periodFilter })}
                  options={[
                    ["all", "Tất cả"],
                    ["failed", "Hành động thất bại"],
                    ["pending", "Chưa xử lý xong"],
                  ]}
                />
                {c.period === "custom" && (
                  <>
                    <Text
                      label="Cửa sổ từ ngày"
                      type="date"
                      value={c.periodFrom}
                      onChange={(periodFrom) => patch({ periodFrom })}
                    />
                    <Text
                      label="Đến trước ngày"
                      type="date"
                      value={c.periodTo}
                      onChange={(periodTo) => patch({ periodTo })}
                    />
                  </>
                )}
              </div>
              <Notice>
                Kỳ dữ liệu được đóng băng khi tạo báo cáo. Rà soát báo cáo không
                tự đóng các công việc từng khách.
              </Notice>
              <p>
                Người nhận: {c.followOwner} · Hạn: {c.dueDays} ngày · Lịch tổng
                hợp đầu kỳ kế tiếp lúc 09:00 (quy ước demo).
              </p>
            </>
          )}
        </Panel>
      </div>
      <Panel title="Sẵn sàng tự động hóa" className="review-preview">
        <span className="automation-icon">
          <Flow20Regular />
        </span>
        <h2>{c.name || "Kịch bản mới"}</h2>
        <ConfigSummary config={c} />
        {c.mode === "schedule" && (
          <>
            <h3>Mốc kích hoạt đầu tiên</h3>
            <p>
              {scheduleRuns(c, state.now, 1).runs.map(date).join("") ||
                "Chưa xác định được mốc phù hợp"}
            </p>
          </>
        )}
      </Panel>
    </div>
  );
}
export function EmailEditor() {
  const { draftId = "", actionId = "" } = useParams();
  const { state, saveDraft } = useStore();
  const nav = useNavigate();
  const draft = state.scenarios.find((s) => s.id === draftId)?.draft;
  const action = draft?.actions.find((a) => a.id === actionId);
  const [subject, setSubject] = useState(action?.subject || ""),
    [customerId, setCustomerId] = useState("C005"),
    [mobile, setMobile] = useState(false),
    [dirty, setDirty] = useState(false);
  const [plain, setPlain] = useState(action?.body.email || "");
  const [preheader, setPreheader] = useState(action?.preheader || ""),
    [ctaLabel, setCtaLabel] = useState(action?.ctaLabel || ""),
    [ctaUrl, setCtaUrl] = useState(action?.ctaUrl || ""),
    [doc, setDoc] = useState<object | null>(action?.email || null);
  const [confirm, setConfirm] = useState(false);
  const leaveDirty = useRef(dirty);
  leaveDirty.current = dirty;
  const blocker = useBlocker(() => leaveDirty.current);
  const editor = useEditor({
    extensions: [StarterKit],
    content: action?.email || {
      type: "doc",
      content: (action?.body.email || "").split("\n").map((text) => ({
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      })),
    },
    onUpdate: ({ editor: e }) => {
      setPlain(e.getText());
      setDoc(e.getJSON());
      setDirty(true);
    },
  });
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);
  if (!draft || !action) return <Empty title="Không tìm thấy nội dung email" />;
  const customer = state.customers.find((c) => c.id === customerId)!;
  const back = () => nav(`/scenarios/drafts/${draftId}/actions`);
  return (
    <>
      <Header
        eyebrow={`${draftId} / HÀNH ĐỘNG / EMAIL`}
        title="Soạn nội dung email"
        sub="Thiết kế thông điệp và xem trước bằng dữ liệu khách hàng mẫu."
      >
        <Button onClick={() => (dirty ? setConfirm(true) : back())}>Hủy</Button>
        <Button
          appearance="primary"
          icon={<Save20Regular />}
          onClick={() => {
            if (
              saveDraft(draftId, {
                ...draft,
                actions: draft.actions.map((a) =>
                  a.id === actionId
                    ? {
                        ...a,
                        subject,
                        preheader,
                        ctaLabel,
                        ctaUrl,
                        email: editor?.getJSON() || null,
                        body: { ...a.body, email: plain },
                      }
                    : a,
                ),
              })
            ) {
              leaveDirty.current = false;
              setDirty(false);
              back();
            }
          }}
        >
          Lưu và quay lại
        </Button>
      </Header>
      <div className="email-layout">
        <Panel title="Thiết lập email">
          <Text
            label="Tiêu đề email"
            value={subject}
            onChange={(v) => {
              setSubject(v);
              setDirty(true);
            }}
          />
          <Text
            label="Dòng xem trước (preheader)"
            value={preheader}
            onChange={(v) => {
              setPreheader(v);
              setDirty(true);
            }}
          />
          <Text
            label="Nhãn nút CTA"
            value={ctaLabel}
            onChange={(v) => {
              setCtaLabel(v);
              setDirty(true);
            }}
          />
          <Text
            label="Liên kết CTA"
            value={ctaUrl}
            onChange={(v) => {
              setCtaUrl(v);
              setDirty(true);
            }}
          />
          <Choice
            label="Bố cục gợi ý"
            value=""
            onChange={(v) => {
              if (!v) return;
              editor?.commands.setContent({
                type: "doc",
                content: [
                  {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [
                      {
                        type: "text",
                        text:
                          v === "info"
                            ? "Thông tin dành cho quý khách"
                            : v === "offer"
                              ? "Giải pháp cho kế hoạch của quý khách"
                              : "Cùng SHS lên kế hoạch",
                      },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Kính chào {{customer.name}}," },
                    ],
                  },
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text:
                          v === "invite"
                            ? "SHS mong muốn trao đổi cùng quý khách về kế hoạch sử dụng tài sản. Số dư tiền khả dụng hiện tại: {{equity.availableCash}}. Chuyên viên phụ trách sẽ đồng hành cùng quý khách tìm hiểu các lựa chọn phù hợp."
                            : v === "offer"
                              ? "Mời quý khách tìm hiểu những giải pháp phù hợp với kế hoạch và nhu cầu đầu tư của mình cùng chuyên viên SHS."
                              : "SHS gửi đến quý khách thông tin liên quan đến {{scenario.name}}. Vui lòng liên hệ chuyên viên phụ trách khi cần hỗ trợ thêm.",
                      },
                    ],
                  },
                ],
              });
              setDirty(true);
            }}
            options={[
              ["", "Chọn bố cục"],
              ["info", "Thông tin"],
              ["invite", "Mời trao đổi"],
              ["offer", "Giới thiệu giải pháp"],
            ]}
          />
          <h3>Chèn biến cá nhân hóa</h3>
          {["customer.name", "equity.availableCash", "scenario.name"].map(
            (v) => (
              <Button
                key={v}
                className="variable-button"
                appearance="subtle"
                onClick={() =>
                  editor?.chain().focus().insertContent(`{{${v}}}`).run()
                }
              >{`{{${v}}}`}</Button>
            ),
          )}
          <Notice>
            Chỉ dùng biến có nguồn dữ liệu. Preview thể hiện rõ giá trị còn
            thiếu.
          </Notice>
        </Panel>
        <Panel title="Nội dung thông điệp">
          <div className="editor-toolbar">
            <Button
              aria-label="In đậm"
              appearance={editor?.isActive("bold") ? "primary" : "subtle"}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <b>B</b>
            </Button>
            <Button
              aria-label="In nghiêng"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <i>I</i>
            </Button>
            <Button
              onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              H2
            </Button>
            <Button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              Danh sách
            </Button>
            <Button onClick={() => editor?.chain().focus().undo().run()}>
              Hoàn tác
            </Button>
          </div>
          <EditorContent editor={editor} />
        </Panel>
        <Panel
          title="Xem trước"
          action={
            <Button size="small" onClick={() => setMobile(!mobile)}>
              {mobile ? "Desktop" : "Mobile"}
            </Button>
          }
        >
          <Choice
            label="Khách hàng mẫu"
            value={customerId}
            onChange={setCustomerId}
            options={["C005", "C017", "C011"].map((id) => [
              id,
              state.customers.find((c) => c.id === id)!.name,
            ])}
          />
          <div className={`email-preview ${mobile ? "mobile" : ""}`}>
            <div className="email-brand">
              <Logo />
            </div>
            <small>SHS · ĐỒNG HÀNH CÙNG QUÝ KHÁCH</small>
            <h2>{renderBody(subject, customer, draft.name)}</h2>
            <p className="email-preheader">{preheader}</p>
            <div className="email-preview-text">
              {doc ? (
                <EmailDocument
                  document={doc}
                  customer={customer}
                  scenario={draft.name}
                />
              ) : (
                renderBody(plain, customer, draft.name)
              )}
            </div>
            {ctaLabel && (
              <span className="email-cta" title={ctaUrl}>
                {ctaLabel}
              </span>
            )}
            <div className="email-footer">
              SHS · Kiến tạo Tài chính thịnh vượng
              <br />
              Nội dung minh họa, chưa được gửi đi.
            </div>
          </div>
        </Panel>
      </div>
      <Modal
        open={confirm || blocker.state === "blocked"}
        onClose={() => {
          setConfirm(false);
          if (blocker.state === "blocked") blocker.reset();
        }}
        title="Bỏ thay đổi email chưa lưu?"
        actions={
          <>
            <Button
              onClick={() => {
                setConfirm(false);
                if (blocker.state === "blocked") blocker.reset();
              }}
            >
              Ở lại
            </Button>
            <Button
              appearance="primary"
              onClick={() => {
                leaveDirty.current = false;
                setDirty(false);
                if (blocker.state === "blocked") blocker.proceed();
                else back();
              }}
            >
              Bỏ thay đổi và quay lại
            </Button>
          </>
        }
      >
        <p>Nội dung email sẽ giữ như trước khi mở trình soạn thảo.</p>
      </Modal>
    </>
  );
}
