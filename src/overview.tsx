import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowRight20Regular,
  ShieldCheckmark24Regular,
  CompassNorthwest24Regular,
  News24Regular,
  DataTrending24Regular,
  PeopleTeam24Regular,
  Heart24Regular,
  Warning20Regular,
  Filter20Regular,
  Search20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  Bookmark20Regular,
} from "@fluentui/react-icons";
import { useStore } from "./store";
import {
  status,
  getConfig,
  date,
  money,
  normalize,
  conflicts,
  allowed,
  activationStatus,
  addDays,
} from "./domain";
import {
  Header,
  Panel,
  Badge,
  NewButton,
  Logo,
  Button,
  Input,
  Choice,
  Modal,
  Text,
  Empty,
  Checks,
} from "./ui";
const catIcons = [
  ShieldCheckmark24Regular,
  CompassNorthwest24Regular,
  News24Regular,
  DataTrending24Regular,
  PeopleTeam24Regular,
  Heart24Regular,
];
export function Overview() {
  const { state } = useStore();
  const [period, setPeriod] = useState("14");
  const all = state.scenarios.filter((s) => !s.deleted),
    active = all.filter((s) => status(s, state.now) === "active");
  const from = Date.parse(addDays(state.now, -Number(period)));
  const acts = state.activations.filter(
    (a) =>
      Date.parse(a.at) >= from && Date.parse(a.at) <= Date.parse(state.now),
  );
  const overdue = state.tasks.filter(
      (t) =>
        t.status !== "completed" && Date.parse(t.due) < Date.parse(state.now),
    ),
    failed = acts.filter((a) => activationStatus(a) === "failed");
  const findings = conflicts(state).filter((f) => !f.review);
  const trend = Array.from({ length: Number(period) }, (_, i) => {
    const d = addDays(state.now, -Number(period) + i + 1).slice(0, 10);
    return {
      day: d,
      count: acts.filter((a) => a.at.slice(0, 10) === d).length,
    };
  });
  const max = Math.max(1, ...trend.map((x) => x.count));
  return (
    <>
      <Header
        eyebrow="SCENARIO MANAGEMENT SYSTEM"
        title="Tổng quan điều hành"
        sub="Chủ động kết nối. Đồng hành đúng thời điểm."
      >
        <Choice
          label="Kỳ thống kê"
          value={period}
          onChange={setPeriod}
          options={[
            ["7", "7 ngày gần nhất"],
            ["14", "14 ngày gần nhất"],
          ]}
        />
        {allowed(state.persona, "edit") && <NewButton />}
      </Header>
      <div className="intro-strip">
        <div>
          <span className="status-dot" />
          <span>{active.length} kịch bản đang sẵn sàng vận hành</span>
          <span className="quiet">·</span>
          <span className="quiet">Mốc dữ liệu {date(state.now)}</span>
        </div>
        <Logo slogan />
        <img className="silk" src="/brand/shs-silk.png" alt="" />
      </div>
      <div className="metrics-strip">
        {[
          [all.length, "Tổng kịch bản", "Hiện tại", "/scenarios"],
          [
            active.length,
            "Đang hoạt động",
            "Hiện tại",
            "/scenarios?status=active",
          ],
          [
            acts.length,
            "Lượt kích hoạt",
            `${period} ngày gần nhất`,
            "/scenarios?view=history",
          ],
          [
            new Set(acts.map((a) => a.customerId)).size,
            "Khách hàng tiếp cận",
            "Duy nhất trong kỳ",
            "/scenarios?view=history",
          ],
          [
            overdue.length,
            "Công việc quá hạn",
            "Cần được xử lý",
            "/tasks?status=overdue",
          ],
        ].map(([n, label, sub, to], i) => (
          <Link
            className={`metric ${i === 4 ? "attention" : ""}`}
            key={String(label)}
            to={String(to)}
          >
            <span>{label}</span>
            <strong>
              {money(Number(n))}
              <ArrowRight20Regular />
            </strong>
            <small>{sub}</small>
          </Link>
        ))}
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Danh mục kịch bản"
          sub="Quản lý các điểm chạm theo mục tiêu nghiệp vụ"
          action={
            <Link className="text-link" to="/scenarios">
              Xem tất cả <ArrowRight20Regular />
            </Link>
          }
        >
          <div className="category-grid">
            {state.categories.map((cat, i) => {
              const items = all.filter(
                  (s) => getConfig(s)?.category === cat.id,
                ),
                n = items.filter(
                  (s) => status(s, state.now) === "active",
                ).length;
              const Icon = catIcons[i % 6];
              return (
                <div className="category-card" key={cat.id}>
                  <div className="category-top">
                    <span className={`category-icon tone-${i}`}>
                      <Icon />
                    </span>
                    <Link
                      className="category-name"
                      aria-label={`Xem danh mục ${cat.name}`}
                      to={`/scenarios?category=${cat.id}`}
                    >
                      {cat.name}
                    </Link>
                  </div>
                  <p>{cat.description}</p>
                  <div className="category-bottom">
                    <Link to={`/scenarios?category=${cat.id}`}>
                      <b>{items.length.toString().padStart(2, "0")}</b>
                      <span>kịch bản</span>
                    </Link>
                    <Link
                      className="active-count"
                      to={`/scenarios?category=${cat.id}&status=active`}
                    >
                      <i />
                      {n} đang hoạt động
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel
          title="Cần chú ý"
          sub="Những nội dung cần được rà soát"
          className="attention-panel"
        >
          <div className="attention-summary">
            <Warning20Regular />
            <span>
              <b>{findings.length + failed.length + overdue.length}</b> nội dung
              cần xử lý
            </span>
          </div>
          {findings.slice(0, 2).map((f) => (
            <Link
              className="attention-item"
              key={f.id}
              to={`/conflicts/${f.id}`}
            >
              <span className="mini-icon orange">
                <Warning20Regular />
              </span>
              <div>
                <b>{f.kind}</b>
                <p>{getConfig(f.a).name}</p>
                <small>{f.sample.length} khách hàng mẫu giao nhau</small>
              </div>
              <ArrowRight20Regular />
            </Link>
          ))}
          {failed.length > 0 && (
            <Link
              className="attention-item"
              to={`/activations/${failed[0].id}`}
            >
              <span className="mini-icon red">!</span>
              <div>
                <b>{failed.length} lượt có hành động thất bại</b>
                <p>Kiểm tra kết quả và thử lại</p>
                <small>Thông báo mô phỏng</small>
              </div>
              <ArrowRight20Regular />
            </Link>
          )}
          {overdue.length > 0 && (
            <Link className="attention-item" to="/tasks?status=overdue">
              <span className="mini-icon blue">↗</span>
              <div>
                <b>{overdue.length} công việc quá hạn</b>
                <p>Cần cập nhật tiến độ xử lý</p>
                <small>Đi tới bàn làm việc</small>
              </div>
              <ArrowRight20Regular />
            </Link>
          )}
          <div className="attention-footer">
            <ShieldCheckmark24Regular />
            <p>
              Mỗi quyết định đều có dấu vết.
              <br />
              <b>Kiểm tra nguồn và phiên bản thực thi.</b>
            </p>
          </div>
        </Panel>
        <Panel
          title="Nhịp hoạt động"
          sub={`Lượt kích hoạt theo ngày · ${period} ngày gần nhất`}
          action={<Badge value="active" label="Dữ liệu từ lịch sử" />}
        >
          <div className="chart">
            <div className="chart-y">
              <span>{max}</span>
              <span>{Math.round(max / 2)}</span>
              <span>0</span>
            </div>
            <div className="chart-bars">
              {trend.map((t) => (
                <Link
                  title={`${t.day}: ${t.count} lượt`}
                  key={t.day}
                  to={`/scenarios?view=history&day=${t.day}`}
                >
                  <div
                    style={{
                      height: `${Math.max(1, (t.count / max) * 126)}px`,
                    }}
                  />
                  <small>
                    {t.day.slice(8)}/{t.day.slice(5, 7)}
                  </small>
                </Link>
              ))}
            </div>
          </div>
          <details className="chart-data">
            <summary>Xem bảng số liệu</summary>
            <div className="data-grid">
              {trend.map((t) => (
                <span key={t.day}>
                  {t.day}: <b>{t.count}</b>
                </span>
              ))}
            </div>
          </details>
        </Panel>
        <Panel title="Hoạt động gần đây" sub="Các lượt kích hoạt mới nhất">
          <div className="activity-list">
            {[...acts]
              .sort((a, b) => b.at.localeCompare(a.at))
              .slice(0, 4)
              .map((a) => (
                <Link key={a.id} to={`/activations/${a.id}`}>
                  <span className="timeline-dot" />
                  <div>
                    <b>
                      {
                        getConfig(
                          state.scenarios.find((s) => s.id === a.scenarioId)!,
                        ).name
                      }
                    </b>
                    <small>
                      {a.customerId} · {date(a.at)}
                    </small>
                  </div>
                </Link>
              ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
export function ScenarioList() {
  const { state, act } = useStore();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(false),
    [save, setSave] = useState(false),
    [viewName, setViewName] = useState("");
  const set = (key: string, value: string) =>
    setParams((p) => {
      if (value) p.set(key, value);
      else p.delete(key);
      p.delete("page");
      return p;
    });
  const findings = conflicts(state);
  const query = params.get("q") || "",
    view = params.get("view") || "list";
  const matchFacet = (key: string, value: string) =>
    !params.get(key) || params.get(key)!.split(",").includes(value);
  let list = state.scenarios.filter((s) => {
    const c = getConfig(s);
    if (!c) return false;
    return (
      (!s.deleted || params.get("status") === "deleted") &&
      normalize(c.name + " " + s.code).includes(normalize(query)) &&
      matchFacet("category", c.category) &&
      matchFacet("status", status(s, state.now)) &&
      matchFacet("trigger", c.mode) &&
      matchFacet("owner", c.owner) &&
      matchFacet("unit", c.unit) &&
      (!params.get("product") ||
        c.actions.some((a) =>
          a.products.some((id) =>
            params
              .get("product")!
              .split(",")
              .includes(state.products.find((p) => p.id === id)?.group || ""),
          ),
        )) &&
      (!params.get("tag") ||
        c.tags.some((x) => params.get("tag")!.split(",").includes(x))) &&
      (!params.get("channel") ||
        c.actions.some((a) =>
          a.channels.some((ch) =>
            params.get("channel")!.split(",").includes(ch),
          ),
        )) &&
      (!params.get("action") ||
        c.actions.some((a) =>
          params.get("action")!.split(",").includes(a.type),
        )) &&
      (!params.get("conflict") ||
        findings.some((f) => f.a.id === s.id || f.b.id === s.id)) &&
      (!params.get("from") ||
        !c.end ||
        Date.parse(c.end) >= Date.parse(params.get("from")!)) &&
      (!params.get("to") ||
        Date.parse(c.start) <=
          Date.parse(params.get("to")! + "T23:59:59+07:00"))
    );
  });
  list = list.sort((a, b) =>
    params.get("sort") === "name"
      ? getConfig(a).name.localeCompare(getConfig(b).name, "vi")
      : params.get("sort") === "count"
        ? state.activations.filter((x) => x.scenarioId === b.id).length -
          state.activations.filter((x) => x.scenarioId === a.id).length
        : b.updated.localeCompare(a.updated),
  );
  const page = Math.max(1, Number(params.get("page") || 1)),
    pages = Math.max(1, Math.ceil(list.length / 12));
  const facets = [...params.entries()].filter(
    ([k]) => !["q", "page", "sort", "view", "day"].includes(k),
  );
  const histories = [...state.evaluations]
    .filter(
      (e) =>
        list.some((s) => s.id === e.scenarioId) &&
        (!params.get("day") || e.at.slice(0, 10) === params.get("day")),
    )
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <Header
        eyebrow="THIẾT LẬP & VẬN HÀNH"
        title="Quản lý kịch bản"
        sub="Một nơi để thiết lập, theo dõi và cải tiến mọi điểm chạm."
      >
        {allowed(state.persona, "edit") && <NewButton />}
      </Header>
      <div className="list-status">
        {[
          ["", "Tất cả"],
          ["active", "Đang hoạt động"],
          ["draft", "Bản nháp"],
          ["paused", "Tạm dừng"],
          ["scheduled", "Chờ hiệu lực"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={(params.get("status") || "") === id ? "selected" : ""}
            onClick={() => set("status", id)}
          >
            {label}
            <span>
              {
                state.scenarios.filter(
                  (s) => !s.deleted && (!id || status(s, state.now) === id),
                ).length
              }
            </span>
          </button>
        ))}
      </div>
      <Panel>
        <div className="table-toolbar">
          <Input
            aria-label="Tìm tên hoặc mã kịch bản"
            contentBefore={<Search20Regular />}
            placeholder="Tìm tên hoặc mã kịch bản…"
            value={query}
            onChange={(_, d) => set("q", d.value)}
          />
          <Button icon={<Filter20Regular />} onClick={() => setFilters(true)}>
            Bộ lọc{facets.length ? ` (${facets.length})` : ""}
          </Button>
          <Choice
            label="Sắp xếp"
            value={params.get("sort") || "updated"}
            onChange={(v) => set("sort", v)}
            options={[
              ["updated", "Mới cập nhật"],
              ["name", "Tên kịch bản"],
              ["count", "Lượt kích hoạt"],
            ]}
          />
          <Button
            appearance="subtle"
            icon={<Bookmark20Regular />}
            onClick={() => setSave(true)}
          >
            Lưu chế độ xem
          </Button>
          <div className="segmented">
            <button
              className={view === "list" ? "selected" : ""}
              onClick={() => set("view", "list")}
            >
              Danh sách
            </button>
            <button
              className={view === "history" ? "selected" : ""}
              onClick={() => set("view", "history")}
            >
              Lịch sử
            </button>
          </div>
        </div>
        {facets.length > 0 && (
          <div className="filter-chips">
            {facets.map(([key, val]) => (
              <button key={key} onClick={() => set(key, "")}>
                {key}: {val} <span>×</span>
              </button>
            ))}
            <Button
              appearance="subtle"
              size="small"
              onClick={() => setParams({})}
            >
              Xóa tất cả
            </Button>
          </div>
        )}
        {(state.views[state.persona] || []).length > 0 && (
          <div className="saved-views">
            {state.views[state.persona].map((v, i) => (
              <Button
                key={i}
                size="small"
                appearance="subtle"
                onClick={() => setParams(v.query)}
              >
                {v.name}
              </Button>
            ))}
          </div>
        )}
        {view === "history" ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Lượt đánh giá</th>
                  <th>Kịch bản</th>
                  <th>Thời điểm</th>
                  <th>Đối tượng</th>
                  <th>Kích hoạt</th>
                </tr>
              </thead>
              <tbody>
                {histories.slice(0, 60).map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link
                        to={`/scenarios/${e.scenarioId}/evaluations/${e.id}`}
                      >
                        {e.triggerId}
                      </Link>
                    </td>
                    <td>{e.scenarioId}</td>
                    <td>{date(e.at)}</td>
                    <td>{e.outcomes.length}</td>
                    <td>{e.outcomes.filter((o) => o.activationId).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!histories.length && <Empty />}
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="scenario-table">
                <thead>
                  <tr>
                    <th>Kịch bản</th>
                    <th>Danh mục</th>
                    <th>Kích hoạt</th>
                    <th>Trạng thái</th>
                    <th>Hiệu lực</th>
                    <th>Lượt chạy</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list
                    .slice(
                      (Math.min(page, pages) - 1) * 12,
                      Math.min(page, pages) * 12,
                    )
                    .map((s) => {
                      const c = getConfig(s),
                        fs = findings.filter(
                          (f) => f.a.id === s.id || f.b.id === s.id,
                        );
                      return (
                        <tr key={s.id}>
                          <td>
                            <Link
                              className="row-title"
                              to={
                                s.versions.length
                                  ? `/scenarios/${s.id}`
                                  : `/scenarios/drafts/${s.id}/basics`
                              }
                            >
                              {c.name || "Kịch bản chưa đặt tên"}
                            </Link>
                            <small>
                              {s.code} <span>·</span> {c.owner}
                            </small>
                            {s.draft && s.versions.length > 0 && (
                              <span className="draft-note">
                                Có bản sửa nháp
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="category-tag">{c.category}</span>
                          </td>
                          <td>
                            <span className="trigger-text">
                              {c.mode === "event"
                                ? "Theo sự kiện"
                                : "Theo thời gian"}
                            </span>
                          </td>
                          <td>
                            <Badge value={status(s, state.now)} />
                          </td>
                          <td>
                            <small>
                              {date(c.start).split(" ")[1] || date(c.start)}
                              <br />
                              {c.end
                                ? "→ " + date(c.end).split(" ")[1]
                                : "Không giới hạn"}
                            </small>
                          </td>
                          <td className="numeric">
                            {
                              state.activations.filter(
                                (a) => a.scenarioId === s.id,
                              ).length
                            }
                          </td>
                          <td>
                            {fs.length ? (
                              <Link
                                className="conflict-number"
                                title="Xem xung đột"
                                to={`/conflicts/${fs[0].id}`}
                              >
                                <Warning20Regular />
                                {fs.length}
                              </Link>
                            ) : (
                              <Link
                                aria-label={`Mở ${s.code}`}
                                to={`/scenarios/${s.id}`}
                              >
                                <ChevronRight20Regular />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {!list.length && (
              <Empty
                title="Không có kịch bản phù hợp"
                sub="Thử thay đổi hoặc xóa bớt điều kiện lọc."
              />
            )}
            <div className="table-footer">
              <span>
                {list.length} kịch bản · Trang {Math.min(page, pages)}/{pages}
              </span>
              <div>
                <Button
                  icon={<ChevronLeft20Regular />}
                  aria-label="Trang trước"
                  disabled={page <= 1}
                  onClick={() =>
                    setParams((p) => {
                      p.set("page", String(page - 1));
                      return p;
                    })
                  }
                />
                <Button
                  icon={<ChevronRight20Regular />}
                  aria-label="Trang sau"
                  disabled={page >= pages}
                  onClick={() =>
                    setParams((p) => {
                      p.set("page", String(page + 1));
                      return p;
                    })
                  }
                />
              </div>
            </div>
          </>
        )}
      </Panel>
      <Modal
        open={filters}
        onClose={() => setFilters(false)}
        title="Lọc kịch bản đa chiều"
        wide
      >
        <div className="form-grid">
          {[
            [
              "category",
              "Danh mục",
              state.categories.map((c) => [c.id, c.name]),
            ],
            [
              "trigger",
              "Cơ chế kích hoạt",
              [
                ["event", "Theo sự kiện"],
                ["schedule", "Theo thời gian"],
              ],
            ],
            ["channel", "Kênh", ["email", "noti", "sms"]],
            [
              "product",
              "Nhóm sản phẩm được offer",
              [...new Set(state.products.map((p) => p.group || "Khác"))],
            ],
            [
              "action",
              "Hành động",
              [
                ["notification", "Thông báo"],
                ["offer", "Offer sản phẩm"],
                ["task", "Giao việc"],
                ["control", "Kiểm soát"],
              ],
            ],
            [
              "owner",
              "Người phụ trách",
              [
                ...new Set(
                  state.scenarios
                    .map((s) => getConfig(s)?.owner)
                    .filter(Boolean),
                ),
              ],
            ],
            [
              "unit",
              "Đơn vị",
              [
                ...new Set(
                  state.scenarios
                    .map((s) => getConfig(s)?.unit)
                    .filter(Boolean),
                ),
              ],
            ],
            [
              "tag",
              "Nhãn",
              [
                ...new Set(
                  state.scenarios.flatMap((s) => getConfig(s)?.tags || []),
                ),
              ],
            ],
          ].map(([key, label, options]) => (
            <Checks
              key={String(key)}
              label={String(label)}
              values={(params.get(String(key)) || "")
                .split(",")
                .filter(Boolean)}
              onChange={(v) => set(String(key), v.join(","))}
              options={options as (string | [string, string])[]}
            />
          ))}
          <Text
            label="Hiệu lực giao từ ngày"
            type="date"
            value={params.get("from") || ""}
            onChange={(v) => set("from", v)}
          />
          <Text
            label="Đến ngày"
            type="date"
            value={params.get("to") || ""}
            onChange={(v) => set("to", v)}
          />
          <Choice
            label="Xung đột"
            value={params.get("conflict") || ""}
            onChange={(v) => set("conflict", v)}
            options={[
              ["", "Tất cả"],
              ["yes", "Có cảnh báo cần rà soát"],
            ]}
          />
        </div>
      </Modal>
      <Modal
        open={save}
        title="Lưu chế độ xem"
        onClose={() => setSave(false)}
        actions={
          <Button
            appearance="primary"
            disabled={!viewName.trim()}
            onClick={() => {
              act("Đã lưu chế độ xem", "", (s) => {
                s.views[s.persona] = [
                  ...(s.views[s.persona] || []),
                  { name: viewName, query: params.toString() },
                ];
              });
              setSave(false);
              setViewName("");
            }}
          >
            Lưu
          </Button>
        }
      >
        <Text label="Tên chế độ xem" value={viewName} onChange={setViewName} />
      </Modal>
    </>
  );
}
