import { useState, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router";
import {
  Home24Regular,
  Flow24Regular,
  TaskListSquareLtr24Regular,
  Library24Regular,
  Settings20Regular,
  Search20Regular,
  ChevronRight16Regular,
  Navigation20Regular,
  ArrowClockwise20Regular,
} from "@fluentui/react-icons";
import { useStore, download } from "./store";
import { date, localInput, newConfig, allowed } from "./domain";
import { Button, Logo, Choice, Text, Modal, Confirm } from "./ui";
import { Overview, ScenarioList } from "./overview";
import { Builder, EmailEditor } from "./builder";
import {
  ScenarioDetail,
  EvaluationDetail,
  ActivationDetail,
  Tasks,
  ConflictPage,
  Catalogs,
} from "./operations";
export function App() {
  const { state, act, error, notice, clear, reset } = useStore();
  const [settings, setSettings] = useState(false),
    [confirm, setConfirm] = useState(false),
    [mobile, setMobile] = useState(false);
  const location = useLocation(),
    nav = useNavigate();
  const [search, setSearch] = useState("");
  useEffect(() => {
    setMobile(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const section = location.pathname.startsWith("/overview")
    ? "Tổng quan"
    : location.pathname.startsWith("/tasks")
      ? "Công việc"
      : location.pathname.startsWith("/catalogs")
        ? "Danh mục cấu hình"
        : "Kịch bản";
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <Link to="/overview" className="brand">
          <Logo />
          <span className="brand-name">Scenario Management System</span>
        </Link>
        <div className="workspace-label">KHÔNG GIAN ĐIỀU HÀNH</div>
        <nav>
          {[
            ["/overview", "Tổng quan", Home24Regular],
            ["/scenarios", "Kịch bản", Flow24Regular],
            ["/tasks", "Công việc", TaskListSquareLtr24Regular],
            ["/catalogs/categories", "Danh mục cấu hình", Library24Regular],
          ].map(([to, label, Icon]) => (
            <NavLink
              key={String(to)}
              to={String(to)}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Icon />
              <span>{String(label)}</span>
              {label === "Kịch bản" && (
                <span className="nav-count">
                  {state.scenarios.filter((s) => !s.deleted).length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="environment">
            <span className="status-dot" />
            <div>
              Không gian minh họa
              <small>Dữ liệu giả lập · Lưu trên trình duyệt</small>
            </div>
          </div>
          <Button
            appearance="subtle"
            icon={<Settings20Regular />}
            onClick={() => setSettings(true)}
          >
            Công cụ trình diễn
          </Button>
          <span className="sidebar-caption">SHS · WEALTH EXPERIENCE</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <Button
            className="mobile-toggle"
            appearance="subtle"
            icon={<Navigation20Regular />}
            aria-label="Mở điều hướng"
            onClick={() => setMobile(!mobile)}
          />
          <div className="breadcrumb">
            <span>SMS</span>
            <ChevronRight16Regular />
            <span>{section}</span>
            {location.pathname.includes("/drafts/") && (
              <>
                <ChevronRight16Regular />
                <b>Tạo kịch bản</b>
              </>
            )}
          </div>
          <div className="topbar-right">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                nav("/scenarios?q=" + encodeURIComponent(search));
              }}
              className="global-search"
            >
              <Search20Regular />
              <input
                aria-label="Tìm kịch bản toàn hệ thống"
                placeholder="Tìm kịch bản…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
            <span className="demo-pill">DEMO</span>
            <div className="persona">
              <span className="avatar">{state.persona.slice(0, 1)}</span>
              <select
                aria-label="Vai trò trình diễn"
                value={state.persona}
                onChange={(e) =>
                  act("", "", (s) => {
                    s.persona = e.target.value;
                  })
                }
              >
                {["Manager", "Editor", "Viewer", "Admin"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/scenarios" element={<ScenarioList />} />
            <Route path="/scenarios/new" element={<CreateDraft />} />
            <Route
              path="/scenarios/drafts/:draftId/:step"
              element={<Builder />}
            />
            <Route
              path="/scenarios/drafts/:draftId/actions/:actionId/email"
              element={<EmailEditor />}
            />
            <Route
              path="/scenarios/:scenarioId/evaluations/:evaluationId"
              element={<EvaluationDetail />}
            />
            <Route path="/scenarios/:scenarioId" element={<ScenarioDetail />} />
            <Route
              path="/activations/:activationId"
              element={<ActivationDetail />}
            />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/conflicts/:conflictId" element={<ConflictPage />} />
            <Route path="/catalogs/:kind" element={<Catalogs />} />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Không tìm thấy trang</h1>
                  <Link to="/overview">Về tổng quan</Link>
                </div>
              }
            />
          </Routes>
          <footer className="page-footer">
            <span>SHS Scenario Management System</span>
            <span>Mốc demo: {date(state.now)} · UTC+7</span>
          </footer>
        </main>
      </div>
      {(error || notice) && (
        <div
          className={`toast ${error ? "toast-error" : ""}`}
          role={error ? "alert" : "status"}
        >
          <span>{error || notice}</span>
          {error && (
            <Button
              size="small"
              onClick={() =>
                download(
                  localStorage.getItem("sms.mock.v1") || state,
                  "sms-backup.json",
                )
              }
            >
              Xuất bản lưu
            </Button>
          )}
          <Button
            size="small"
            appearance="subtle"
            aria-label="Đóng thông báo"
            onClick={clear}
          >
            ×
          </Button>
        </div>
      )}
      <Modal
        open={settings}
        onClose={() => setSettings(false)}
        title="Công cụ trình diễn"
      >
        <p>
          Thay đổi mốc dữ liệu và vai trò để kiểm chứng trạng thái. Tiến thời
          gian không tự gửi thông báo hoặc chạy hành động.
        </p>
        <Text
          label="Đồng hồ demo · UTC+7"
          type="datetime-local"
          value={localInput(state.now)}
          onChange={(v) =>
            v &&
            act("Đã cập nhật đồng hồ demo", "", (s) => {
              s.now = v + ":00+07:00";
            })
          }
        />
        <Choice
          label="Vai trò"
          value={state.persona}
          onChange={(v) =>
            act("", "", (s) => {
              s.persona = v;
            })
          }
          options={["Manager", "Editor", "Viewer", "Admin"]}
        />
        <div className="stack">
          <Button onClick={() => download(state, "sms-demo.json")}>
            Xuất dữ liệu hiện tại
          </Button>
          <Button
            icon={<ArrowClockwise20Regular />}
            onClick={() => setConfirm(true)}
          >
            Đặt lại dữ liệu minh họa
          </Button>
        </div>
      </Modal>
      <Confirm
        open={confirm}
        title="Đặt lại không gian trình diễn?"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          reset();
          setConfirm(false);
          setSettings(false);
          nav("/overview");
        }}
      >
        <p>
          Các thay đổi thử nghiệm trong ứng dụng này sẽ được thay bằng bộ dữ
          liệu ban đầu.
        </p>
      </Confirm>
    </div>
  );
}
function CreateDraft() {
  const { state, act } = useStore();
  const nav = useNavigate();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!allowed(state.persona, "edit")) {
      nav("/scenarios", { replace: true });
      return;
    }
    const id = `SMS-${String(Math.max(24, ...state.scenarios.map((s) => Number(s.code.slice(4)))) + 1).padStart(4, "0")}`;
    if (
      act("Đã tạo bản nháp mới", "edit", (s) =>
        s.scenarios.push({
          id,
          code: id,
          draft: newConfig(s.now),
          versions: [],
          control: "enabled",
          updated: s.now,
        }),
      )
    )
      nav(`/scenarios/drafts/${id}/basics`, { replace: true });
    else nav("/scenarios", { replace: true });
  }, [act, nav, state.persona, state.scenarios]);
  return <p>Đang tạo bản nháp…</p>;
}
