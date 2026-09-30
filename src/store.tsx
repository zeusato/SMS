import {
  createContext,
  useContext,
  useReducer,
  useRef,
  type ReactNode,
  type Context as ReactContext,
} from "react";
import {
  type State,
  type Scenario,
  type Config,
  copy,
  allowed,
  compile,
  uid,
  simulate,
  makeBatch,
  validate,
  activationStatus,
  newConfig,
} from "./domain";
import { seed } from "./seed";
import { migrateState } from "./migration";
import { catalogAvailable, categorySupportsJourney } from "./taxonomy";
import { transaction } from "./transaction";
const KEY = "sms.mock.v1";
type Store = {
  state: State;
  error: string;
  notice: string;
  act: (label: string, permission: string, fn: (s: State) => void) => boolean;
  saveDraft: (id: string, c: Config) => boolean;
  create: () => string;
  edit: (s: Scenario, clone?: boolean) => string;
  publish: (id: string, reason: string) => boolean;
  run: (
    id: string,
    trigger: string,
    event: string,
    customer: string,
    at: string,
    amount: number,
  ) => string | undefined;
  batch: (id: string) => string | undefined;
  reset: () => void;
  clear: () => void;
};
// Keep the provider identity when Vite refreshes dependent editor modules.
const Context: ReactContext<Store> =
  import.meta.hot?.data.context || createContext<Store>(null!);
if (import.meta.hot) import.meta.hot.data.context = Context;
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: seed(), error: "" };
    const parsed = JSON.parse(raw);
    if (
      parsed.schemaVersion !== 1 ||
      !Array.isArray(parsed.scenarios) ||
      !parsed.scenarios.every((s: Scenario) => s.versions.every((v) => v.plan))
    )
      return {
        state: seed(),
        error:
          "Dữ liệu lưu không tương thích. Xuất bản lưu cũ trước khi đặt lại; thay đổi sẽ chưa được lưu.",
      };
    const state = migrateState(parsed as State);
    return { state, error: "" };
  } catch {
    return {
      state: seed(),
      error:
        "Không đọc được bản lưu. Có thể xuất bản lưu cũ hoặc đặt lại dữ liệu demo.",
    };
  }
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useRef<ReturnType<typeof load> | null>(null);
  if (!initial.current) initial.current = load();
  const [state, dispatch] = useReducer(
    (_s: State, next: State) => next,
    initial.current.state,
  );
  const current = useRef(state);
  current.current = state;
  const [error, setError] = useReducer(
    (_s: string, n: string) => n,
    initial.current.error,
  );
  const [notice, setNotice] = useReducer((_s: string, n: string) => n, "");
  const blocked = useRef(!!initial.current.error);
  function act(label: string, permission: string, fn: (s: State) => void) {
    try {
      if (permission && !allowed(current.current.persona, permission))
        throw new Error(
          "Vai trò hiện tại không có quyền thực hiện thao tác này.",
        );
      const next = transaction(
        current.current,
        (n) => {
          fn(n);
          if (label)
            n.audit.unshift({
              id: uid("AUDIT"),
              at: n.now,
              actor: n.persona,
              message: label,
            });
        },
        (n) => {
          if (blocked.current)
            throw new Error(
              "Bản lưu không tương thích. Hãy xuất bản lưu cũ và đặt lại trước khi chỉnh sửa.",
            );
          localStorage.setItem(KEY, JSON.stringify(n));
        },
      );
      current.current = next;
      dispatch(next);
      setError("");
      if (label) setNotice(label);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu thay đổi");
      return false;
    }
  }
  function create() {
    const id = `SMS-${String(Math.max(24, ...current.current.scenarios.map((s) => Number(s.code.slice(4)))) + 1).padStart(4, "0")}`;
    act("Đã tạo bản nháp mới", "edit", (s) =>
      s.scenarios.push({
        id,
        code: id,
        draft: newConfig(s.now),
        versions: [],
        control: "enabled",
        updated: s.now,
      }),
    );
    return id;
  }
  function saveDraft(id: string, c: Config) {
    return act("", "edit", (s) => {
      const item = s.scenarios.find((x) => x.id === id);
      if (!item) throw new Error("Không tìm thấy bản nháp");
      if (item.deleted) throw new Error("Kịch bản đã xóa quản trị");
      if (
        c.actions.some((a) => a.type === "control") &&
        !allowed(s.persona, "control")
      )
        throw new Error("Cấu hình kiểm soát nghiệp vụ cần Manager hoặc Admin");
      item.draft = copy(c);
      item.updated = s.now;
    });
  }
  function edit(sc: Scenario, clone = false) {
    if (clone) {
      const id = create();
      saveDraft(id, {
        ...copy(sc.draft || sc.versions.at(-1)!.config),
        name: `${(sc.draft || sc.versions.at(-1)!.config).name} — bản sao`,
      });
      return id;
    }
    act(`Đã mở bản sửa nháp ${sc.id}`, "edit", (s) => {
      const item = s.scenarios.find((x) => x.id === sc.id)!;
      if (item.deleted) throw new Error("Kịch bản đã xóa quản trị");
      item.draft = copy(item.draft || item.versions.at(-1)!.config);
    });
    return sc.id;
  }
  function publish(id: string, reason: string) {
    return act(`Tiến trình tự động đã được tạo cho ${id}`, "publish", (s) => {
      const sc = s.scenarios.find((x) => x.id === id)!;
      if (!sc.draft) throw new Error("Không có bản nháp để công bố");
      const c = copy(sc.draft);
      const errors = validate(c);
      if (errors.length) throw new Error(errors.join(" · "));
      if (!s.categories.some((x) => x.id === c.category && x.active))
        throw new Error("Danh mục đã ngừng sử dụng");
      if (
        !s.categories.some(
          (x) => x.id === c.category && categorySupportsJourney(x, c.journey),
        )
      )
        throw new Error("Danh mục không thuộc bước hành trình đã chọn");
      for (const a of c.actions)
        if (a.type === "offer" || a.type === "service_offer")
          for (const p of a.type === "offer" ? a.products : a.services || []) {
            const item = (a.type === "offer" ? s.products : s.services).find(
              (x) => x.id === p,
            );
            if (!item || !catalogAvailable(item, s.now))
              throw new Error(
                `Offer chứa ${a.type === "offer" ? "sản phẩm" : "dịch vụ"} đã hết hiệu lực hoặc không còn trong danh mục`,
              );
          }
      const no = sc.versions.length + 1,
        versionId = `${id}-v${no}`,
        plan = compile(c, versionId, s.now);
      sc.versions.push({
        id: versionId,
        no,
        at: s.now,
        by: s.persona,
        reason: reason || "Công bố cấu hình",
        config: plan.config,
        plan,
      });
      sc.draft = undefined;
      sc.updated = s.now;
    });
  }
  function run(
    id: string,
    trigger: string,
    event: string,
    customer: string,
    at: string,
    amount: number,
  ) {
    let result: string | undefined;
    const ok = act(`Đã mô phỏng lượt đánh giá ${id}`, "edit", (s) => {
      result = simulate(s, id, trigger, event, customer, at, amount);
    });
    return ok ? result : undefined;
  }
  function batch(id: string) {
    let result: string | undefined;
    const ok = act("Đã mở kỳ tổng hợp", "task", (s) => {
      result = makeBatch(s, id);
    });
    return ok ? result : undefined;
  }
  function reset() {
    try {
      const next = seed();
      localStorage.setItem(KEY, JSON.stringify(next));
      blocked.current = false;
      current.current = next;
      dispatch(next);
      setError("");
      setNotice("Đã đặt lại dữ liệu minh họa");
    } catch {
      setError("Không thể lưu bộ dữ liệu mới");
    }
  }
  return (
    <Context.Provider
      value={{
        state,
        error,
        notice,
        act,
        saveDraft,
        create,
        edit,
        publish,
        run,
        batch,
        reset,
        clear: () => {
          setError("");
          setNotice("");
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
export function download(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob(
      [typeof value === "string" ? value : JSON.stringify(value, null, 2)],
      { type: "application/json" },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function retry(state: State, id: string, runId: string) {
  const a = state.activations.find((x) => x.id === id)!,
    r = a.runs.find((x) => x.id === runId)!;
  if (
    r.body.includes("[Thiếu dữ liệu]") ||
    r.body.includes("[Biến không hợp lệ]")
  )
    throw new Error(
      "Cần sửa nguồn dữ liệu hoặc cấu hình cho lượt mới; snapshot cũ không đủ để thử lại thành công.",
    );
  r.status = "completed";
  r.attempts++;
  return activationStatus(a);
}
