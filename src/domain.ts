import { parseFormula, type FormulaToken } from "./formula";

export type Value = number | string | boolean | null;
export const changePeriods = {
  previous: "Lần cập nhật trước",
  "1d": "1 ngày trước",
  "7d": "7 ngày trước",
  "30d": "30 ngày trước",
} as const;
export type ChangePeriod = keyof typeof changePeriods;
export type ChangeExpr = {
  kind: "change";
  id: string;
  direction: "increase" | "decrease";
  measure: "absolute" | "percent";
  period: ChangePeriod;
};
export const historyKey = (id: string, period: ChangePeriod) =>
  `history.${period}.${id}`;
export type Expr =
  | { kind: "metric"; id: string }
  | { kind: "literal"; value: Value; unit: string }
  | ChangeExpr
  | { kind: "math"; op: string; left: Expr; right: Expr };
export type Condition =
  | { id: string; kind: "group"; op: "all" | "any"; children: Condition[] }
  | {
      id: string;
      kind: "rule";
      left: Expr;
      op: string;
      right: Expr;
      extra?: Expr;
    };
export type Verdict = "match" | "no_match" | "unknown";
export type Metric = {
  id: string;
  label: string;
  group: string;
  unit: string;
  type: "number" | "boolean" | "date" | "text";
  definition: string;
};
export type Customer = {
  id: string;
  name: string;
  accountId: string;
  values: Record<string, Value>;
  products: string[];
};
export type Schedule = {
  unit: string;
  interval: number;
  times: string[];
  weekdays: number[];
  monthDays: number[];
  months: number[];
  calendar: string;
  excludedDates: string[];
  pauseFrom: string;
  pauseTo: string;
};
export type Action = {
  id: string;
  type: "notification" | "task" | "offer" | "control";
  title: string;
  recipients: string[];
  channels: string[];
  body: Record<string, string>;
  subject: string;
  preheader?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  priority?: string;
  reason?: string;
  email: object | null;
  products: string[];
  placement: string;
  control: string;
  dueDays: number;
};
export type Config = {
  name: string;
  category: string;
  purpose: string;
  owner: string;
  unit: string;
  tags: string[];
  scope: "customer" | "account";
  condition: Condition;
  conditionMode?: "basic" | "advanced";
  conditionFormula?: FormulaToken[];
  mode: "event" | "schedule";
  events: string[];
  minAmount: number;
  schedule: Schedule;
  reentry: string;
  cooldown: number;
  actions: Action[];
  start: string;
  end: string;
  followEach: boolean;
  followPeriod: boolean;
  followTiming: string;
  followResult: string;
  followTitle: string;
  followOwner: string;
  dueDays: number;
  period: string;
  periodFilter: string;
  periodFrom: string;
  periodTo: string;
};
export type Plan = {
  id: string;
  versionId: string;
  config: Config;
  nodes: { id: string; type: string; label: string }[];
  edges: { from: string; to: string }[];
  triggerRegistration:
    | { mode: "event"; eventIds: string[] }
    | { mode: "schedule"; schedule: Schedule };
  generatedAt: string;
};
export type Version = {
  id: string;
  no: number;
  at: string;
  by: string;
  reason: string;
  config: Config;
  plan: Plan;
};
export type Scenario = {
  id: string;
  code: string;
  draft?: Config;
  versions: Version[];
  control: "enabled" | "paused" | "ended";
  deleted?: string;
  updated: string;
};
export type Outcome = {
  subjectId: string;
  customerId: string;
  name: string;
  verdict: Verdict | "suppressed";
  reason: string;
  values: Record<string, Value>;
  activationId?: string;
};
export type Evaluation = {
  id: string;
  scenarioId: string;
  versionId: string;
  planId: string;
  triggerId: string;
  eventType: string;
  at: string;
  outcomes: Outcome[];
};
export type Run = {
  id: string;
  actionId: string;
  type: string;
  channel: string;
  recipient: string;
  body: string;
  status: "completed" | "failed";
  attempts: number;
  simulated: true;
};
export type Activation = {
  id: string;
  evaluationId: string;
  scenarioId: string;
  versionId: string;
  customerId: string;
  subjectId: string;
  at: string;
  runs: Run[];
};
export type Task = {
  id: string;
  scenarioId: string;
  activationId?: string;
  batchId?: string;
  title: string;
  owner: string;
  due: string;
  status: "open" | "in_progress" | "completed";
  outcome: string;
};
export type Batch = {
  id: string;
  scenarioId: string;
  versionId: string;
  from: string;
  to: string;
  at: string;
  members: string[];
  completed: number;
  failed: number;
  reviewed: boolean;
};
export type CatalogItem = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  group?: string;
  end?: string;
  products?: string[];
};
export type State = {
  schemaVersion: 1;
  now: string;
  persona: string;
  scenarios: Scenario[];
  customers: Customer[];
  evaluations: Evaluation[];
  activations: Activation[];
  tasks: Task[];
  batches: Batch[];
  categories: CatalogItem[];
  products: CatalogItem[];
  bundles: CatalogItem[];
  audit: { id: string; at: string; actor: string; message: string }[];
  reviews: Record<string, string>;
  views: Record<string, { name: string; query: string }[]>;
};
export const NOW = "2026-09-29T10:00:00+07:00";
export const units = ["Wealth", "Dịch vụ khách hàng", "Kinh doanh", "Vận hành"];
export const owners = [
  "Chuyên viên Wealth 01",
  "Chuyên viên Wealth 02",
  "Chuyên viên DVKH 01",
  "Chuyên viên DVKH 02",
  "Chuyên viên Kinh doanh 01",
  "Chuyên viên Kinh doanh 02",
  "Chuyên viên Vận hành 01",
  "Chuyên viên Vận hành 02",
];
let seedSequence: number | null = null;
export function withSeedIds<T>(build: () => T): T {
  seedSequence = 0;
  try {
    return build();
  } finally {
    seedSequence = null;
  }
}
export const uid = (prefix = "id") =>
  `${prefix}-${seedSequence === null ? crypto.randomUUID().slice(0, 8) : String(++seedSequence).padStart(6, "0")}`;
export const copy = <T>(v: T): T => structuredClone(v);
export const money = (v: Value) =>
  v === null
    ? "Chưa có dữ liệu"
    : typeof v === "number"
      ? new Intl.NumberFormat("vi-VN").format(v)
      : typeof v === "boolean"
        ? v
          ? "Đúng"
          : "Sai"
        : v;
export const date = (s: string) =>
  s
    ? new Date(s).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Không giới hạn";
export const addDays = (s: string, n: number) =>
  new Date(new Date(s).getTime() + n * 86400000).toISOString();
export const localInput = (s: string) =>
  new Date(new Date(s).getTime() + 7 * 3600000).toISOString().slice(0, 16);
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
const metricGroups: [string, string, string][] = [
  [
    "Cổ phiếu",
    "equity",
    "totalAssets:Tổng tài sản,nav:Tài sản ròng (NAV),cash:Tiền mặt,availableCash:Tiền khả dụng,saleReceivable:Tiền bán chờ về,dividendReceivable:Tiền cổ tức chờ về,blockedCash:Tiền phong tỏa,securitiesValue:Giá trị chứng khoán,buyPending:Chứng khoán mua chờ về,rightsPending:Chứng khoán quyền chờ về,blockedSecurities:Chứng khoán phong tỏa",
  ],
  [
    "Phái sinh",
    "derivatives",
    "assets:Tài sản phái sinh,cash:Tiền phái sinh,marginUsed:Ký quỹ sử dụng,availableMargin:Ký quỹ khả dụng,unrealizedPnL:Lãi lỗ chưa thực hiện",
  ],
  [
    "Nợ",
    "debt",
    "principal:Dư nợ gốc,interest:Lãi phải trả,daysToDue:Số ngày đến hạn,marginRatio:Tỷ lệ ký quỹ",
  ],
  [
    "Trái phiếu",
    "bond",
    "marketValue:Giá trị trái phiếu,principal:Gốc trái phiếu,couponReceivable:Lãi chờ nhận,daysToMaturity:Số ngày đến đáo hạn",
  ],
  [
    "Chứng chỉ quỹ",
    "fund",
    "marketValue:Giá trị CCQ,units:Số chứng chỉ quỹ,subscriptionPending:Mua chờ phân bổ,redemptionPending:Bán chờ về",
  ],
  [
    "Money market",
    "mm",
    "balance:Số dư MM,accruedIncome:Thu nhập dự thu,daysToMaturity:Số ngày đến đáo hạn,available:Giá trị khả dụng",
  ],
  [
    "Hồ sơ",
    "profile",
    "openedAt:Ngày mở tài khoản,birthDate:Ngày sinh,daysUntilBirthday:Ngày tới sinh nhật,gender:Giới tính,segment:Phân khúc,riskProfile:Hồ sơ rủi ro,marketingConsent:Đồng ý nhận nội dung tự nguyện,hasOpenComplaint:Có khiếu nại đang mở",
  ],
  [
    "Hành vi",
    "behavior",
    "avgTradeValue30d:GTGD bình quân 30 ngày,firstTradeAt:Ngày giao dịch đầu,lastTradeAt:Ngày giao dịch cuối,tradeCount30d:Số giao dịch 30 ngày,lastContactAt:Ngày liên hệ gần nhất",
  ],
];
export const metrics: Metric[] = metricGroups.flatMap(
  ([group, prefix, items]) =>
    items.split(",").map((item) => {
      const [key, label] = item.split(":");
      const type = /At$|Date$/.test(key)
        ? "date"
        : /Consent|Complaint/.test(key)
          ? "boolean"
          : /gender|segment|riskProfile/.test(key)
            ? "text"
            : "number";
      return {
        id: `${prefix}.${key}`,
        label,
        group,
        type,
        unit:
          type !== "number"
            ? "NONE"
            : /days/i.test(key)
              ? "DAYS"
              : /Ratio/.test(key)
                ? "PERCENT"
                : /Count|units/.test(key)
                  ? "COUNT"
                  : "VND",
        definition: `${label} tại mốc dữ liệu sau cập nhật. ${prefix === "profile" ? "Thuộc hồ sơ khách hàng." : "Tổng hợp theo phạm vi khách hàng hoặc tài khoản đã chọn."}`,
      };
    }),
);
const eventGroups: [string, string][] = [
  [
    "Onboard",
    "account.opened:Mở tài khoản,profile.updated:Cập nhật hồ sơ,riskProfile.updated:Cập nhật hồ sơ rủi ro",
  ],
  [
    "Tiền",
    "cash.deposited:Nộp tiền,cash.withdrawn:Rút tiền,cash.saleSettled:Tiền bán về,cash.advanceGranted:Ứng trước tiền,cash.dividendPaid:Tiền cổ tức về,fee.custodyCharged:Thu phí lưu ký,fee.smsCharged:Thu phí SMS,cash.blocked:Phong tỏa tiền,cash.unblocked:Giải phong tỏa tiền",
  ],
  [
    "Giao dịch",
    "order.placed:Đặt lệnh,order.filled:Khớp lệnh,order.rejected:Lệnh bị từ chối,order.cancelled:Hủy lệnh",
  ],
  [
    "Quyền và cổ tức",
    "right.announced:Công bố quyền,right.registered:Đăng ký quyền,right.expiring:Quyền sắp hết hạn,dividend.confirmed:Xác nhận cổ tức",
  ],
  [
    "Lưu ký",
    "custody.received:Nhận lưu ký,custody.transferred:Chuyển lưu ký,securities.blocked:Phong tỏa chứng khoán,securities.unblocked:Giải phong tỏa chứng khoán",
  ],
  [
    "Vay nợ",
    "loan.disbursed:Giải ngân,loan.repaid:Trả nợ,loan.dueSoon:Nợ sắp đến hạn,margin.thresholdCrossed:Chạm ngưỡng ký quỹ",
  ],
  [
    "Trái phiếu",
    "bond.purchased:Mua trái phiếu,bond.couponPaid:Trả lãi trái phiếu,bond.matured:Đáo hạn trái phiếu",
  ],
  [
    "CCQ",
    "fund.subscribed:Mua chứng chỉ quỹ,fund.redeemed:Bán chứng chỉ quỹ,fund.navPublished:Công bố NAV quỹ",
  ],
  [
    "Money market",
    "mm.placed:Gửi MM,mm.matured:Đáo hạn MM,mm.incomePaid:Nhận thu nhập MM",
  ],
];
export const events = eventGroups.flatMap(([group, items]) =>
  items.split(",").map((item) => {
    const [id, label] = item.split(":");
    return { id, label, group };
  }),
);
export const ops: Record<string, string> = {
  gte: "Lớn hơn hoặc bằng",
  gt: "Lớn hơn",
  lte: "Nhỏ hơn hoặc bằng",
  lt: "Nhỏ hơn",
  eq: "Bằng",
  neq: "Khác",
  between: "Trong khoảng",
  in: "Thuộc danh sách",
  notIn: "Không thuộc danh sách",
  exists: "Có dữ liệu",
  missing: "Chưa có dữ liệu",
};
export const opSymbols: Record<string, string> = {
  gte: "≥",
  gt: ">",
  lte: "≤",
  lt: "<",
  eq: "=",
  neq: "≠",
  between: "trong khoảng",
  in: "thuộc",
  notIn: "không thuộc",
  exists: "có dữ liệu",
  missing: "chưa có dữ liệu",
};
export function rule(
  metricId = "equity.availableCash",
  value: Value = 300000000,
): Condition {
  return {
    id: uid("c"),
    kind: "rule",
    left: { kind: "metric", id: metricId },
    op: typeof value === "number" ? "gte" : "eq",
    right: {
      kind: "literal",
      value,
      unit: metrics.find((m) => m.id === metricId)?.unit || "NONE",
    },
  };
}
export function defaultCondition(): Condition {
  return {
    id: uid("g"),
    kind: "group",
    op: "all",
    children: [
      rule(),
      rule("profile.marketingConsent", true),
      rule("profile.hasOpenComplaint", false),
    ],
  };
}
export function newAction(type: Action["type"] = "notification"): Action {
  return {
    id: uid("action"),
    type,
    title:
      type === "notification"
        ? "Thông báo cho khách hàng"
        : type === "task"
          ? "Liên hệ và ghi nhận nhu cầu"
          : type === "offer"
            ? "Giới thiệu giải pháp phù hợp"
            : "Kiểm soát nghiệp vụ",
    recipients: ["Khách hàng"],
    channels: ["noti"],
    body: {
      noti: "Kính chào {{customer.name}}, SHS sẵn sàng đồng hành cùng kế hoạch tài chính của quý khách.",
      sms: "SHS kính chào {{customer.name}}. Chuyên viên phụ trách sẽ liên hệ hỗ trợ quý khách.",
      email:
        "Kính chào {{customer.name}},\n\nSHS mời quý khách trao đổi về kế hoạch sử dụng tài sản. Tiền khả dụng tại thời điểm rà soát: {{equity.availableCash}} VND.\n\nTrân trọng,\nĐội ngũ SHS",
    },
    subject: "Cùng SHS hoạch định kế hoạch tài chính",
    preheader: "Đồng hành cùng kế hoạch tài chính của quý khách",
    ctaLabel: "Trao đổi với chuyên viên",
    ctaUrl: "https://www.shs.com.vn",
    priority: "normal",
    reason: "",
    email: null,
    products: [],
    placement: "Trang chủ",
    control: "Khóa phát vay",
    dueDays: 2,
  };
}
export function newConfig(now = NOW): Config {
  return {
    name: "",
    category: "GS",
    purpose: "",
    owner: owners[0],
    unit: units[0],
    tags: [],
    scope: "customer",
    condition: { id: uid("g"), kind: "group", op: "all", children: [] },
    mode: "event",
    events: ["cash.deposited"],
    minAmount: 0,
    schedule: {
      unit: "day",
      interval: 1,
      times: ["09:00"],
      weekdays: [1],
      monthDays: [1],
      months: [1],
      calendar: "all",
      excludedDates: [],
      pauseFrom: "",
      pauseTo: "",
    },
    reentry: "each",
    cooldown: 24,
    actions: [newAction()],
    start: now,
    end: "",
    followEach: true,
    followPeriod: false,
    followTiming: "after",
    followResult: "all",
    followTitle: "Trao đổi và ghi nhận nhu cầu khách hàng",
    followOwner: owners[0],
    dueDays: 2,
    period: "day",
    periodFilter: "all",
    periodFrom: "",
    periodTo: "",
  };
}
export function exprLabel(e: Expr): string {
  if (e.kind === "change")
    return `${metrics.find((m) => m.id === e.id)?.label || e.id} ${e.direction === "increase" ? "tăng" : "giảm"}${e.measure === "percent" ? " (%)" : ""} so với ${changePeriods[e.period].toLowerCase()}`;
  if (e.kind === "metric")
    return metrics.find((m) => m.id === e.id)?.label || e.id;
  if (e.kind === "literal") return String(money(e.value));
  return e.op === "daysSince"
    ? `Số ngày kể từ ${exprLabel(e.left)}`
    : `(${exprLabel(e.left)} ${{ add: "+", sub: "−", mul: "×", div: "÷", ratio: "÷" }[e.op] || e.op} ${exprLabel(e.right)})${e.op === "ratio" ? " × 100%" : ""}`;
}
export function describe(c: Condition): string {
  if (c.kind === "rule" && c.left.kind === "change") {
    const change = c.left;
    const unit =
      change.measure === "percent"
        ? "%"
        : metrics.find((m) => m.id === change.id)?.unit;
    return `${exprLabel({ kind: "metric", id: change.id })} ${change.direction === "increase" ? "tăng" : "giảm"} ${opSymbols[c.op]} ${exprLabel(c.right)}${c.extra ? ` đến ${exprLabel(c.extra)}` : ""} ${unit === "PERCENT" ? "điểm %" : unit === "NONE" || unit === "COUNT" ? "" : unit} so với ${changePeriods[change.period].toLowerCase()}`;
  }
  return c.kind === "group"
    ? `(${c.children.map(describe).join(c.op === "all" ? " VÀ " : " HOẶC ")})`
    : `${exprLabel(c.left)} ${opSymbols[c.op]} ${["exists", "missing"].includes(c.op) ? "" : exprLabel(c.right)}${c.extra ? " đến " + exprLabel(c.extra) : ""}`;
}
export function evalExpr(
  e: Expr,
  values: Record<string, Value>,
  now: string,
): { value: Value; unit: string; reason?: string } {
  if (e.kind === "literal") return { value: e.value, unit: e.unit };
  if (e.kind === "metric")
    return {
      value: values[e.id] ?? null,
      unit: metrics.find((m) => m.id === e.id)?.unit || "NONE",
    };
  if (e.kind === "change") {
    const metric = metrics.find((m) => m.id === e.id);
    const unit = e.measure === "percent" ? "PERCENT" : metric?.unit || "NONE";
    const current = values[e.id],
      baseline = values[historyKey(e.id, e.period)];
    if (metric?.type !== "number")
      return {
        value: null,
        unit,
        reason: "Chỉ đại lượng dạng số mới có điều kiện biến động",
      };
    if (typeof current !== "number" || !Number.isFinite(current))
      return {
        value: null,
        unit,
        reason: `${metric.label}: thiếu giá trị hiện tại`,
      };
    if (typeof baseline !== "number" || !Number.isFinite(baseline))
      return {
        value: null,
        unit,
        reason: `${metric.label}: thiếu giá trị tại ${changePeriods[e.period].toLowerCase()}`,
      };
    if (e.measure === "percent" && baseline === 0)
      return {
        value: null,
        unit,
        reason: `${metric.label}: giá trị gốc bằng 0, không thể tính biến động %`,
      };
    const delta =
      e.direction === "increase" ? current - baseline : baseline - current;
    const value =
      e.measure === "percent" ? (delta / Math.abs(baseline)) * 100 : delta;
    return {
      value: Number.isFinite(value) ? value : null,
      unit,
      reason: `${metric.label}: hiện tại ${money(current)}, ${changePeriods[e.period].toLowerCase()} ${money(baseline)}; ${e.direction === "increase" ? "mức tăng" : "mức giảm"} ${money(value)} ${unit === "PERCENT" ? "%" : unit}`,
    };
  }
  const a = evalExpr(e.left, values, now),
    b = evalExpr(e.right, values, now);
  if (a.value === null)
    return { value: null, unit: a.unit, reason: "Thiếu dữ liệu" };
  if (e.op === "daysSince") {
    const t = Date.parse(String(a.value));
    return {
      value: Number.isFinite(t)
        ? Math.floor((Date.parse(now) + 25200000) / 86400000) -
          Math.floor((t + 25200000) / 86400000)
        : null,
      unit: "DAYS",
    };
  }
  if (typeof a.value !== "number" || typeof b.value !== "number")
    return { value: null, unit: a.unit, reason: "Thiếu dữ liệu hoặc sai kiểu" };
  if (["add", "sub", "ratio"].includes(e.op) && a.unit !== b.unit)
    return { value: null, unit: a.unit, reason: "Không cùng đơn vị" };
  if (e.op === "mul" && a.unit !== "NONE" && b.unit !== "NONE")
    return {
      value: null,
      unit: a.unit,
      reason: "Không nhân hai đại lượng có đơn vị",
    };
  if (["div", "ratio"].includes(e.op) && b.value === 0)
    return { value: null, unit: a.unit, reason: "Không thể chia cho 0" };
  if (e.op === "div" && b.unit !== "NONE" && a.unit !== b.unit)
    return { value: null, unit: a.unit, reason: "Không cùng đơn vị" };
  const value =
    e.op === "add"
      ? a.value + b.value
      : e.op === "sub"
        ? a.value - b.value
        : e.op === "mul"
          ? a.value * b.value
          : e.op === "ratio"
            ? (a.value / b.value) * 100
            : a.value / b.value;
  return {
    value: Number.isFinite(value) ? value : null,
    unit:
      e.op === "ratio"
        ? "PERCENT"
        : e.op === "div" && a.unit === b.unit
          ? "NONE"
          : a.unit === "NONE"
            ? b.unit
            : a.unit,
  };
}
export function evaluate(
  c: Condition,
  values: Record<string, Value>,
  now = NOW,
): { verdict: Verdict; reason: string } {
  if (c.kind === "group") {
    if (!c.children.length)
      return { verdict: "unknown", reason: "Nhóm điều kiện rỗng" };
    const r = c.children.map((x) => evaluate(x, values, now));
    const verdict =
      c.op === "all"
        ? r.some((x) => x.verdict === "no_match")
          ? "no_match"
          : r.some((x) => x.verdict === "unknown")
            ? "unknown"
            : "match"
        : r.some((x) => x.verdict === "match")
          ? "match"
          : r.some((x) => x.verdict === "unknown")
            ? "unknown"
            : "no_match";
    return {
      verdict,
      reason:
        r
          .filter((x) => x.verdict !== "match")
          .map((x) => x.reason)
          .join("; ") || "Thỏa tất cả điều kiện",
    };
  }
  const a = evalExpr(c.left, values, now),
    b = evalExpr(c.right, values, now);
  if (["exists", "missing"].includes(c.op))
    return {
      verdict: (c.op === "exists" ? a.value !== null : a.value === null)
        ? "match"
        : "no_match",
      reason: `${exprLabel(c.left)}: ${money(a.value)}`,
    };
  if (a.value === null || b.value === null)
    return {
      verdict: "unknown",
      reason: a.reason || `${exprLabel(c.left)} chưa có dữ liệu`,
    };
  if (a.unit !== b.unit || typeof a.value !== typeof b.value)
    return {
      verdict: "unknown",
      reason: `${exprLabel(c.left)}: sai kiểu hoặc đơn vị`,
    };
  if (c.left.kind === "change" && typeof a.value === "number" && a.value <= 0)
    return {
      verdict: "no_match",
      reason: `${a.reason}. Giá trị không ${c.left.direction === "increase" ? "tăng" : "giảm"} so với mốc so sánh.`,
    };
  let ok = false;
  let av = a.value as string | number,
    bv = b.value as string | number;
  const leftMetric =
    c.left.kind === "metric"
      ? metrics.find((m) => m.id === (c.left as { id: string }).id)
      : undefined;
  if (leftMetric?.type === "date") {
    av = Date.parse(String(av));
    bv = Date.parse(String(bv));
    if (!Number.isFinite(av) || !Number.isFinite(bv))
      return { verdict: "unknown", reason: "Ngày không hợp lệ" };
  }
  if (c.op === "between") {
    const h = c.extra
      ? evalExpr(c.extra, values, now)
      : { value: null, unit: a.unit };
    if (h.value === null || h.unit !== a.unit)
      return { verdict: "unknown", reason: "Thiếu ngưỡng trên" };
    ok = av >= bv && av <= (h.value as string | number);
  } else if (c.op === "in" || c.op === "notIn") {
    ok = String(bv)
      .split(",")
      .map((x) => x.trim())
      .includes(String(av));
    if (c.op === "notIn") ok = !ok;
  } else
    ok =
      c.op === "eq"
        ? a.value === b.value
        : c.op === "neq"
          ? a.value !== b.value
          : c.op === "gte"
            ? av >= bv
            : c.op === "gt"
              ? av > bv
              : c.op === "lte"
                ? av <= bv
                : av < bv;
  return {
    verdict: ok ? "match" : "no_match",
    reason: `${a.reason || `${exprLabel(c.left)} = ${money(a.value)}`}; yêu cầu ${opSymbols[c.op]} ${money(b.value)}${c.extra ? ` đến ${exprLabel(c.extra)}` : ""}`,
  };
}
export function subjects(state: State, scope: Config["scope"]): Customer[] {
  return scope === "customer"
    ? state.customers
    : state.customers.flatMap((c, i) => [
        { ...c, id: c.accountId },
        ...((i + 1) % 10 === 0
          ? [
              {
                ...c,
                id: `D${c.id.slice(1)}`,
                values: {
                  ...c.values,
                  ...Object.fromEntries(
                    metrics
                      .filter((m) => m.group === "Cổ phiếu")
                      .map((m) => [m.id, null]),
                  ),
                },
              },
            ]
          : []),
      ]);
}
export function snapshotValues(
  condition: Condition,
  values: Record<string, Value>,
): Record<string, Value> {
  const requiredHistory = new Set<string>();
  function expression(expr: Expr) {
    if (expr.kind === "change")
      requiredHistory.add(historyKey(expr.id, expr.period));
    else if (expr.kind === "math") {
      expression(expr.left);
      expression(expr.right);
    }
  }
  function visit(node: Condition) {
    if (node.kind === "group") node.children.forEach(visit);
    else {
      expression(node.left);
      expression(node.right);
      if (node.extra) expression(node.extra);
    }
  }
  visit(condition);
  return Object.fromEntries(
    Object.entries(values).filter(
      ([key]) => !key.startsWith("history.") || requiredHistory.has(key),
    ),
  );
}
export function status(s: Scenario, now: string) {
  const c = s.versions.at(-1)?.config;
  if (s.deleted) return "deleted";
  if (!c) return "draft";
  if (s.control === "ended") return "ended";
  if (c.end && Date.parse(now) >= Date.parse(c.end)) return "expired";
  if (s.control === "paused") return "paused";
  if (Date.parse(now) < Date.parse(c.start)) return "scheduled";
  return "active";
}
export const statusLabels: Record<string, string> = {
  active: "Đang hoạt động",
  draft: "Bản nháp",
  scheduled: "Chờ hiệu lực",
  paused: "Tạm dừng",
  expired: "Hết hiệu lực",
  ended: "Đã kết thúc",
  deleted: "Đã xóa quản trị",
  match: "Thỏa điều kiện",
  no_match: "Không thỏa",
  unknown: "Thiếu dữ liệu",
  suppressed: "Bị chính sách loại",
  completed: "Hoàn tất",
  failed: "Thất bại",
  open: "Chờ xử lý",
  in_progress: "Đang xử lý",
};
export const getConfig = (s: Scenario) => s.versions.at(-1)?.config || s.draft!;
export function scheduleRuns(c: Config, after: string, count = 5) {
  const p = c.schedule,
    result: string[] = [];
  const start = new Date(c.start),
    end = c.end ? Date.parse(c.end) : Infinity;
  const from = Math.max(Date.parse(after), start.getTime());
  const shiftedStart = new Date(start.getTime() + 25200000);
  const anchor = Date.UTC(
    shiftedStart.getUTCFullYear(),
    shiftedStart.getUTCMonth(),
    shiftedStart.getUTCDate(),
  );
  const accept = (t: number) => {
    const loc = new Date(t + 25200000),
      ymd = loc.toISOString().slice(0, 10);
    if (t < from || t >= end) return false;
    if (p.calendar === "trading" && (ymd < "2026-01-01" || ymd > "2027-12-31"))
      return false;
    if (p.calendar !== "all" && [0, 6].includes(loc.getUTCDay())) return false;
    if (
      p.calendar === "trading" &&
      [
        "2026-01-01",
        "2026-04-30",
        "2026-05-01",
        "2026-09-02",
        "2027-01-01",
      ].includes(ymd)
    )
      return false;
    return (
      !p.excludedDates.includes(ymd) &&
      !(p.pauseFrom && ymd >= p.pauseFrom && ymd < (p.pauseTo || "9999"))
    );
  };
  if (p.interval < 1 || !Number.isInteger(p.interval))
    return { runs: [], reason: "Khoảng lặp phải là số nguyên dương" };
  if (p.unit === "hour") {
    let t =
      start.getTime() +
      Math.max(
        0,
        Math.ceil((from - start.getTime()) / (p.interval * 3600000)),
      ) *
        p.interval *
        3600000;
    for (
      let k = 0;
      k < 43830 && t < end && result.length < count;
      k++, t += p.interval * 3600000
    )
      if (accept(t)) result.push(new Date(t).toISOString());
  } else {
    const first = new Date(from + 25200000);
    const base = Date.UTC(
      first.getUTCFullYear(),
      first.getUTCMonth(),
      first.getUTCDate(),
    );
    for (let d = 0; d < 1827 && result.length < count; d++) {
      const day = new Date(base + d * 86400000),
        days = Math.round((day.getTime() - anchor) / 86400000),
        months =
          (day.getUTCFullYear() - shiftedStart.getUTCFullYear()) * 12 +
          day.getUTCMonth() -
          shiftedStart.getUTCMonth();
      const anchorMon =
        anchor - ((shiftedStart.getUTCDay() + 6) % 7) * 86400000;
      const weeks = Math.floor((day.getTime() - anchorMon) / 604800000);
      const ok =
        p.unit === "day"
          ? days % p.interval === 0
          : p.unit === "week"
            ? weeks % p.interval === 0 && p.weekdays.includes(day.getUTCDay())
            : p.unit === "month"
              ? months % p.interval === 0 &&
                p.monthDays.includes(day.getUTCDate())
              : (day.getUTCFullYear() - shiftedStart.getUTCFullYear()) %
                  p.interval ===
                  0 &&
                p.months.includes(day.getUTCMonth() + 1) &&
                p.monthDays.includes(day.getUTCDate());
      if (ok)
        for (const time of [...p.times].sort()) {
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) continue;
          const t = Date.parse(
            day.toISOString().slice(0, 10) + "T" + time + ":00+07:00",
          );
          if (accept(t) && !result.includes(new Date(t).toISOString()))
            result.push(new Date(t).toISOString());
          if (result.length === count) break;
        }
    }
  }
  return {
    runs: result,
    reason:
      result.length < count
        ? p.calendar === "trading"
          ? "Không đủ mốc trong lịch giao dịch minh họa 2026–2027."
          : "Không đủ mốc trong khoảng hiệu lực hoặc 5 năm tiếp theo."
        : "",
  };
}
export function validateCondition(c: Condition): string[] {
  if (c.kind === "group")
    return [
      ...(!c.children.length ? ["Thêm ít nhất một điều kiện"] : []),
      ...c.children.flatMap((x) => validateCondition(x)),
    ];
  if (c.left.kind === "change") {
    if (!["gte", "gt", "lte", "lt", "eq", "between"].includes(c.op))
      return ["Chọn phép so sánh mức biến động hợp lệ"];
    if (
      c.right.kind !== "literal" ||
      typeof c.right.value !== "number" ||
      !Number.isFinite(c.right.value) ||
      c.right.value < 0
    )
      return ["Ngưỡng biến động phải là số không âm"];
    if (
      c.op === "between" &&
      (!c.extra ||
        c.extra.kind !== "literal" ||
        typeof c.extra.value !== "number" ||
        !Number.isFinite(c.extra.value) ||
        c.extra.value < c.right.value ||
        c.extra.unit !== c.right.unit)
    )
      return ["Ngưỡng trên phải cùng đơn vị và lớn hơn hoặc bằng ngưỡng dưới"];
  }
  const sample = Object.fromEntries(
    metrics.map((m) => [
      m.id,
      m.type === "number"
        ? 1
        : m.type === "boolean"
          ? true
          : m.type === "date"
            ? NOW
            : "Priority",
    ]),
  );
  for (const metric of metrics.filter((m) => m.type === "number"))
    for (const period of Object.keys(changePeriods) as ChangePeriod[])
      sample[historyKey(metric.id, period)] = 2;
  const r = evaluate(c, sample);
  return r.verdict === "unknown" ? [r.reason] : [];
}
export function validate(c: Config, step?: number): string[] {
  const errors: string[] = [];
  const check = (n: number) => step === undefined || step === n;
  if (check(0)) {
    if (c.name.trim().length < 5 || c.name.length > 120)
      errors.push("Tên cần từ 5 đến 120 ký tự");
    if (c.purpose.trim().length < 20 || c.purpose.length > 800)
      errors.push("Mục đích cần từ 20 đến 800 ký tự");
    if (!c.category || !c.owner)
      errors.push("Chọn danh mục và người phụ trách");
  }
  if (check(1)) {
    const formula = c.conditionFormula
      ? parseFormula(c.conditionFormula)
      : undefined;
    if (formula?.error) errors.push(`Công thức điều kiện: ${formula.error}`);
    else errors.push(...validateCondition(formula?.condition ?? c.condition));
  }
  if (check(2)) {
    if (c.mode === "event" && !c.events.length)
      errors.push("Chọn ít nhất một sự kiện");
    if (c.mode === "schedule") {
      if (!Number.isInteger(c.schedule.interval) || c.schedule.interval < 1)
        errors.push("Chu kỳ phải là số nguyên dương");
      if (c.schedule.unit !== "hour" && !c.schedule.times.length)
        errors.push("Chọn giờ chạy");
      if (c.schedule.unit === "week" && !c.schedule.weekdays.length)
        errors.push("Chọn thứ trong tuần");
      if (
        ["month", "year"].includes(c.schedule.unit) &&
        !c.schedule.monthDays.length
      )
        errors.push("Chọn ngày trong tháng");
      if (c.schedule.unit === "year" && !c.schedule.months.length)
        errors.push("Chọn tháng");
      if (c.schedule.times.some((t) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)))
        errors.push("Giờ chạy không hợp lệ");
    }
    if (c.reentry === "cooldown" && c.cooldown < 1)
      errors.push("Khoảng nghỉ tối thiểu 1 giờ");
  }
  if (check(3)) {
    if (!c.actions.length) errors.push("Thêm ít nhất một hành động");
    for (const a of c.actions) {
      if (!a.title.trim()) errors.push("Điền tên hành động");
      if (a.type === "notification") {
        if (!a.channels.length || !a.recipients.length)
          errors.push("Chọn kênh và người nhận");
        for (const ch of a.channels) {
          if (!a.body[ch]?.trim()) errors.push(`Chưa có nội dung ${ch}`);
          for (const token of (a.body[ch] || "").matchAll(/\{\{(.*?)\}\}/g))
            if (
              ![
                "customer.name",
                "equity.availableCash",
                "scenario.name",
              ].includes(token[1])
            )
              errors.push(`Biến không hỗ trợ: ${token[1]}`);
        }
        if (a.channels.includes("email") && !a.subject.trim())
          errors.push("Điền tiêu đề email");
      }
      if (a.ctaUrl && !/^https?:\/\//i.test(a.ctaUrl))
        errors.push("Liên kết CTA cần bắt đầu bằng http:// hoặc https://");
      if (a.type === "control" && !a.reason?.trim())
        errors.push("Điền lý do thao tác kiểm soát");
      if (a.type === "offer" && !a.products.length)
        errors.push("Chọn sản phẩm cho offer");
    }
  }
  if (check(4)) {
    if (!c.start || !Number.isFinite(Date.parse(c.start)))
      errors.push("Chọn ngày bắt đầu hợp lệ");
    if (c.end && Date.parse(c.end) <= Date.parse(c.start))
      errors.push("Kết thúc phải sau bắt đầu");
    if (
      c.followEach &&
      (!c.followTitle.trim() || !c.followOwner || c.dueDays < 1)
    )
      errors.push("Điền công việc, người nhận và hạn hậu xử lý");
    if (
      c.followPeriod &&
      c.period === "custom" &&
      (!c.periodFrom || !c.periodTo || c.periodFrom >= c.periodTo)
    )
      errors.push("Chọn cửa sổ tổng hợp hợp lệ");
  }
  return [...new Set(errors)];
}
export function compile(c: Config, versionId: string, at: string): Plan {
  const errors = validate(c);
  if (errors.length) throw new Error(errors.join(" · "));
  const config = copy(c);
  if (config.conditionFormula)
    config.condition = parseFormula(config.conditionFormula).condition!;
  if (config.mode === "event") config.schedule = newConfig(at).schedule;
  else config.events = [];
  const nodes = [
    {
      id: "trigger",
      type: "trigger",
      label:
        c.mode === "event"
          ? c.events
              .map((id) => events.find((e) => e.id === id)?.label || id)
              .join(" / ")
          : `Mỗi ${c.schedule.interval} ${c.schedule.unit === "day" ? "ngày" : c.schedule.unit === "week" ? "tuần" : c.schedule.unit === "month" ? "tháng" : c.schedule.unit === "year" ? "năm" : "giờ"}`,
    },
    { id: "validity", type: "validity", label: "Kiểm tra hiệu lực" },
    {
      id: "resolve",
      type: "resolve_subject",
      label:
        c.scope === "customer" ? "Xác định khách hàng" : "Xác định tài khoản",
    },
    { id: "condition", type: "condition", label: "Đánh giá điều kiện" },
    { id: "policy", type: "policy", label: "Kiểm tra tái kích hoạt" },
    ...c.actions.map((a) => ({ id: a.id, type: "action", label: a.title })),
    { id: "audit", type: "audit", label: "Lưu kết quả và lịch sử" },
    ...(c.followEach
      ? [{ id: "each", type: "followup_each", label: c.followTitle }]
      : []),
    ...(c.followPeriod
      ? [
          {
            id: "period",
            type: "followup_period",
            label: "Tổng hợp và xử lý theo kỳ",
          },
        ]
      : []),
  ];
  const linear = nodes.filter((n) => !n.type.startsWith("followup"));
  const edges = linear
    .slice(1)
    .map((n, i) => ({ from: linear[i].id, to: n.id }));
  for (const n of nodes.filter((n) => n.type.startsWith("followup")))
    edges.push({
      from:
        n.type === "followup_each" && c.followTiming === "before"
          ? "policy"
          : "audit",
      to: n.id,
    });
  return {
    id: `PLAN-${versionId}`,
    versionId,
    config,
    nodes,
    edges,
    triggerRegistration:
      c.mode === "event"
        ? { mode: "event", eventIds: [...c.events] }
        : { mode: "schedule", schedule: copy(c.schedule) },
    generatedAt: at,
  };
}
export function allowed(persona: string, action: string) {
  return action === "delete"
    ? persona === "Admin"
    : action === "publish" || action === "control"
      ? ["Manager", "Admin"].includes(persona)
      : action === "task"
        ? persona !== "Viewer"
        : persona !== "Viewer";
}
export function renderBody(body: string, c: Customer, name: string) {
  return body.replace(/\{\{(.*?)\}\}/g, (_, key) =>
    key === "customer.name"
      ? c.name
      : key === "scenario.name"
        ? name
        : key === "equity.availableCash"
          ? c.values[key] === null
            ? "[Thiếu dữ liệu]"
            : String(money(c.values[key]))
          : "[Biến không hợp lệ]",
  );
}
export function activationStatus(a: Activation) {
  return a.runs.every((r) => r.status === "completed") ? "completed" : "failed";
}
export function simulate(
  state: State,
  scenarioId: string,
  triggerId: string,
  eventType: string,
  customerId: string,
  at = state.now,
  amount = 100000000,
  seedSubjectIds?: string[],
): string {
  const s = state.scenarios.find((x) => x.id === scenarioId)!;
  if (status(s, at) !== "active")
    throw new Error("Kịch bản chưa hoạt động hoặc đã bị tạm dừng/kết thúc.");
  const v = s.versions.at(-1)!;
  const c = v.plan.config;
  if (
    state.evaluations.some(
      (e) => e.scenarioId === s.id && e.triggerId === triggerId,
    )
  )
    throw new Error("Nguồn kích hoạt này đã được xử lý. Không tạo lượt trùng.");
  if (c.mode === "event" && !triggerId.trim())
    throw new Error("Nhập mã sự kiện để kiểm soát trùng.");
  if (c.mode === "event" && !c.events.includes(eventType))
    throw new Error("Sự kiện không thuộc nguồn đã đăng ký.");
  if (
    c.mode === "schedule" &&
    !scheduleRuns(c, at, 1).runs.some((t) => Date.parse(t) === Date.parse(at))
  )
    throw new Error("Mốc này không thuộc lịch đã đăng ký.");
  const all = subjects(state, c.scope),
    target = state.customers.find((x) => x.id === customerId);
  const candidates =
    c.mode === "schedule"
      ? all
      : eventType === "fund.navPublished"
        ? all.filter((x) => x.products.includes("P05"))
        : all.filter((x) =>
            c.scope === "customer"
              ? x.id === customerId
              : x.id === target?.accountId,
          );
  const e: Evaluation = {
    id: uid("EV"),
    scenarioId: s.id,
    versionId: v.id,
    planId: v.plan.id,
    triggerId,
    eventType,
    at,
    outcomes: [],
  };
  for (const customer of candidates.filter(
    (x) => !seedSubjectIds || seedSubjectIds.includes(x.id),
  )) {
    const realId =
      c.scope === "customer"
        ? customer.id
        : state.customers.find(
            (x) =>
              x.accountId === customer.id ||
              `D${x.id.slice(1)}` === customer.id,
          )!.id;
    const result = evaluate(c.condition, customer.values, at);
    const o: Outcome = {
      subjectId: customer.id,
      customerId: realId,
      name: customer.name,
      ...result,
      values: snapshotValues(c.condition, customer.values),
    };
    if (c.mode === "event" && amount < c.minAmount) {
      o.verdict = "no_match";
      o.reason = "Giá trị sự kiện dưới ngưỡng đã cấu hình";
    }
    if (o.verdict === "match") {
      const previous = state.activations
        .filter((a) => a.scenarioId === s.id && a.subjectId === customer.id)
        .sort((a, b) => b.at.localeCompare(a.at))[0];
      const exited =
        previous &&
        state.evaluations.some(
          (ev) =>
            ev.scenarioId === s.id &&
            Date.parse(ev.at) > Date.parse(previous.at) &&
            ev.outcomes.some(
              (x) => x.subjectId === customer.id && x.verdict === "no_match",
            ),
        );
      if (
        previous &&
        (c.reentry === "once" ||
          (c.reentry === "cooldown" &&
            Date.parse(at) - Date.parse(previous.at) < c.cooldown * 3600000) ||
          (c.reentry === "reenter" && !exited))
      ) {
        o.verdict = "suppressed";
        o.reason = "Quy tắc tái kích hoạt chưa cho phép thực hiện lại";
      }
    }
    if (o.verdict === "match") {
      const a: Activation = {
        id: uid("ACT"),
        evaluationId: e.id,
        scenarioId: s.id,
        versionId: v.id,
        customerId: realId,
        subjectId: customer.id,
        at,
        runs: [],
      };
      const createFollowTask = () =>
        state.tasks.push({
          id: uid("TASK"),
          scenarioId: s.id,
          activationId: a.id,
          title: c.followTitle,
          owner: c.followOwner,
          due: addDays(at, c.dueDays),
          status: "open",
          outcome: "",
        });
      if (c.followEach && c.followTiming === "before") createFollowTask();
      for (const action of c.actions) {
        const channels =
          action.type === "notification" ? action.channels : [action.type];
        const recipients =
          action.type === "notification" ? action.recipients : ["Nội bộ"];
        for (const channel of channels)
          for (const recipient of recipients) {
            const body = renderBody(
              action.type === "notification"
                ? action.body[channel]
                : action.type === "offer"
                  ? action.products
                      .map(
                        (id) =>
                          state.products.find((p) => p.id === id)?.name || id,
                      )
                      .join(", ")
                  : action.title,
              customer,
              c.name,
            );
            const fail =
              body.includes("[Thiếu dữ liệu]") ||
              body.includes("[Biến không hợp lệ]");
            a.runs.push({
              id: uid("RUN"),
              actionId: action.id,
              type: action.type,
              channel,
              recipient,
              body,
              status: fail ? "failed" : "completed",
              attempts: 1,
              simulated: true,
            });
          }
        if (action.type === "task")
          state.tasks.push({
            id: uid("TASK"),
            scenarioId: s.id,
            activationId: a.id,
            title: action.title,
            owner: c.owner,
            due: addDays(at, action.dueDays),
            status: "open",
            outcome: "",
          });
      }
      o.activationId = a.id;
      state.activations.push(a);
      const failure = a.runs.some((r) => r.status === "failed");
      if (
        c.followEach &&
        c.followTiming !== "before" &&
        (c.followResult === "all" ||
          (c.followResult === "failed" && failure) ||
          (c.followResult === "completed" && !failure))
      )
        createFollowTask();
    }
    e.outcomes.push(o);
  }
  state.evaluations.push(e);
  return e.id;
}
export function periodWindow(c: Config, now: string) {
  const local = new Date(Date.parse(now) + 25200000);
  let to =
      Date.UTC(
        local.getUTCFullYear(),
        local.getUTCMonth(),
        local.getUTCDate(),
      ) - 25200000,
    from = to - 86400000;
  if (c.period === "week") {
    to -= ((local.getUTCDay() + 6) % 7) * 86400000;
    from = to - 604800000;
  }
  if (c.period === "month") {
    to = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - 25200000;
    from =
      Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 1, 1) - 25200000;
  }
  if (c.period === "custom") {
    from = Date.parse(c.periodFrom + "T00:00:00+07:00");
    to = Date.parse(c.periodTo + "T00:00:00+07:00");
  }
  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
}
export function makeBatch(state: State, id: string) {
  const s = state.scenarios.find((x) => x.id === id)!,
    v = s.versions.at(-1)!,
    c = v.config;
  if (!c.followPeriod) throw new Error("Kịch bản chưa bật tổng hợp theo kỳ");
  const w = periodWindow(c, state.now);
  const existing = state.batches.find(
    (b) =>
      b.scenarioId === id &&
      b.versionId === v.id &&
      b.from === w.from &&
      b.to === w.to,
  );
  if (existing) return existing.id;
  const members = state.activations.filter(
    (a) =>
      a.scenarioId === id &&
      Date.parse(a.at) >= Date.parse(w.from) &&
      Date.parse(a.at) < Date.parse(w.to) &&
      (c.periodFilter === "all" ||
        (c.periodFilter === "failed" && activationStatus(a) === "failed") ||
        (c.periodFilter === "pending" &&
          state.tasks.some(
            (t) => t.activationId === a.id && t.status !== "completed",
          ))),
  );
  const b: Batch = {
    id: uid("BATCH"),
    scenarioId: id,
    versionId: v.id,
    ...w,
    at: state.now,
    members: members.map((a) => a.id),
    failed: members.filter((a) => activationStatus(a) === "failed").length,
    completed: members.filter((a) => activationStatus(a) === "completed")
      .length,
    reviewed: false,
  };
  state.batches.push(b);
  if (members.length)
    state.tasks.push({
      id: uid("TASK"),
      scenarioId: id,
      batchId: b.id,
      title: `Rà soát tổng hợp: ${c.name}`,
      owner: c.followOwner,
      due: addDays(state.now, c.dueDays),
      status: "open",
      outcome: "",
    });
  return b.id;
}
export function conflicts(state: State) {
  const result: {
    id: string;
    a: Scenario;
    b: Scenario;
    kind: string;
    sample: string[];
    evidence: string;
    ruleId: string;
    review?: string;
  }[] = [];
  const list = state.scenarios.filter(
    (s) => s.versions.length && s.control === "enabled" && !s.deleted,
  );
  const matches = new Map(
    list.map((s) => [
      s.id,
      new Set(
        state.customers
          .filter(
            (c) =>
              evaluate(getConfig(s).condition, c.values, state.now).verdict ===
              "match",
          )
          .map((c) => c.id),
      ),
    ]),
  );
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i],
        b = list[j],
        ca = getConfig(a),
        cb = getConfig(b);
      if (
        Math.max(Date.parse(ca.start), Date.parse(cb.start)) >=
        Math.min(
          ca.end ? Date.parse(ca.end) : Infinity,
          cb.end ? Date.parse(cb.end) : Infinity,
        )
      )
        continue;
      const sample = [...matches.get(a.id)!].filter((id) =>
        matches.get(b.id)!.has(id),
      );
      if (!sample.length) continue;
      let ruleId = "",
        kind = "",
        evidence = "";
      for (const x of ca.actions)
        for (const y of cb.actions) {
          if (
            x.type === "offer" &&
            y.type === "offer" &&
            x.placement === y.placement
          ) {
            kind = "Chồng lấn vị trí offer";
            ruleId = "CF03";
            evidence = `Cùng vị trí ${x.placement}, hiệu lực và tệp mẫu giao nhau.`;
          }
          if (
            x.type === "notification" &&
            y.type === "notification" &&
            x.channels.some(
              (ch) => y.channels.includes(ch) && x.body[ch] === y.body[ch],
            ) &&
            x.recipients.some((recipient) => y.recipients.includes(recipient))
          ) {
            kind = "Có khả năng trùng thông báo";
            ruleId = "CF01";
            evidence =
              "Nội dung và kênh trùng nhau; chưa khẳng định trùng thời điểm gửi.";
          }
          if (
            (x.type === "control" && y.type === "offer") ||
            (y.type === "control" && x.type === "offer")
          ) {
            const control = x.type === "control" ? x : y;
            const offer = x.type === "offer" ? x : y;
            const blocked =
              control.control === "Khóa tài khoản" ||
              control.control === "Khóa giao dịch" ||
              (control.control === "Khóa phát vay" &&
                offer.products.some(
                  (id) =>
                    state.products.find((p) => p.id === id)?.group === "Nợ",
                ));
            if (blocked) {
              kind = "Hạn chế khả năng sử dụng offer";
              ruleId = "CF02";
              evidence = `${control.control} ảnh hưởng đến nhóm sản phẩm trong offer; tệp mẫu và hiệu lực giao nhau. Cần rà soát phạm vi áp dụng.`;
            }
          }
        }
      if (
        ca.tags.includes("Fixture: thanh khoản") &&
        cb.tags.includes("Fixture: thanh khoản") &&
        ca.tags.includes("Ý định: sử dụng tiền") !==
          cb.tags.includes("Ý định: sử dụng tiền")
      ) {
        kind = "Nghi vấn nội dung cần rà soát";
        ruleId = "CF04";
        evidence =
          "Minh họa rà soát: hai nội dung được gắn chủ đề thanh khoản và ý định đối lập trong fixture. Không phải kết quả phân tích ngôn ngữ tự động.";
      }
      if (kind) {
        const id = `${a.id}--${b.id}`,
          key = `${id}-${a.versions.at(-1)!.id}-${b.versions.at(-1)!.id}`;
        result.push({
          id,
          a,
          b,
          kind,
          sample,
          evidence,
          ruleId,
          review: state.reviews[key],
        });
      }
    }
  return result;
}
