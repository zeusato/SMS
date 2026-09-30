import {
  type State,
  type Customer,
  type Scenario,
  NOW,
  metrics,
  owners,
  units,
  newConfig,
  defaultCondition,
  rule,
  compile,
  simulate,
  addDays,
  makeBatch,
  withSeedIds,
  historyKey,
  changePeriods,
  type ChangePeriod,
} from "./domain";
// Deterministic demo snapshots. Preserve supplied history, including explicit nulls.
export function withDemoHistory(customer: Customer, index: number): Customer {
  const values = { ...customer.values };
  for (const [periodIndex, period] of (
    Object.keys(changePeriods) as ChangePeriod[]
  ).entries()) {
    for (const [metricIndex, metric] of metrics
      .filter((m) => m.type === "number")
      .entries()) {
      const key = historyKey(metric.id, period);
      if (key in values) continue;
      const current = values[metric.id];
      const variation =
        (((index + metricIndex + periodIndex * 3) % 9) - 4) / 10;
      values[key] =
        typeof current !== "number" || (index + 1) % 23 === 0
          ? null
          : (index + 1) % 19 === 0
            ? 0
            : current === 0
              ? index % 2
                ? metric.unit === "VND"
                  ? 50000000
                  : 10
                : 0
              : Math.round((current / (1 + variation)) * 100) / 100;
    }
  }
  return { ...customer, values };
}
export function seed(): State {
  return withSeedIds(buildSeed);
}
function buildSeed(): State {
  const categories = [
    [
      "DV",
      "Dịch vụ & vận hành",
      "Thông tin dịch vụ, tài khoản và hỗ trợ khách hàng",
    ],
    ["HD", "Đồng hành & hướng dẫn", "Từng bước xây dựng trải nghiệm đầu tư"],
    ["TT", "Thông tin & thị trường", "Thông tin đúng chủ đề, đúng thời điểm"],
    ["GS", "Giám sát & kế hoạch", "Theo dõi tài sản và kế hoạch tài chính"],
    ["TV", "Tư vấn & giải pháp", "Kết nối nhu cầu với giải pháp phù hợp"],
    ["QH", "Quan hệ & gắn kết", "Duy trì mối quan hệ có chiều sâu"],
  ].map(([id, name, description]) => ({ id, name, description, active: true }));
  const customers: Customer[] = Array.from({ length: 120 }, (_, k) => {
    const i = k + 1,
      values: Customer["values"] = {};
    for (const m of metrics)
      values[m.id] =
        m.type === "number"
          ? m.unit === "VND"
            ? (i % 7) * 15000000
            : m.unit === "DAYS"
              ? i % 45
              : m.unit === "PERCENT"
                ? 30 + (i % 40)
                : i % 20
          : m.type === "boolean"
            ? false
            : m.type === "date"
              ? addDays(NOW, -i * 10)
              : "Cân bằng";
    const cash = i % 17 === 0 ? null : (i % 6) * 100000000;
    Object.assign(values, {
      "equity.availableCash": cash,
      "equity.cash": cash === null ? null : cash + 20000000,
      "equity.securitiesValue": ((i % 10) + 1) * 200000000,
      "debt.principal": (i % 4) * 50000000,
      "equity.nav":
        cash === null
          ? null
          : cash + 20000000 + ((i % 10) + 1) * 200000000 - (i % 4) * 50000000,
      "profile.marketingConsent": i % 3 !== 0,
      "profile.hasOpenComplaint": i % 11 === 0,
      "profile.gender": ["Nam", "Nữ", "Không cung cấp"][i % 3],
      "profile.segment": ["Retail", "Priority", "Wealth"][i % 3],
      "behavior.avgTradeValue30d": (i % 9) * 15000000,
      "behavior.tradeCount30d": i % 20,
    });
    return {
      id: `C${String(i).padStart(3, "0")}`,
      accountId: `A${String(i).padStart(3, "0")}`,
      name: `Khách hàng ${String(i).padStart(3, "0")}`,
      values,
      products: [`P${String((i % 12) + 1).padStart(2, "0")}`],
    };
  }).map(withDemoHistory);
  const names = [
    "Mở tài khoản thành công",
    "Cập nhật quyền và cổ tức",
    "Hồ sơ cần bổ sung",
    "Thông báo thay đổi dịch vụ",
    "Chào mừng và hướng dẫn bắt đầu",
    "Cập nhật hồ sơ đầu tư",
    "Hướng dẫn đọc báo cáo tài sản",
    "Chọn chủ đề nhận tin",
    "Tin liên quan mã theo dõi",
    "Bản tin theo đăng ký",
    "Lịch sự kiện doanh nghiệp",
    "Báo cáo chuyên đề",
    "Rà soát mức tập trung",
    "Báo cáo tài sản định kỳ",
    "Xác nhận nhu cầu sử dụng tiền",
    "Chuẩn bị nhu cầu thanh khoản",
    "Mời tư vấn theo nhu cầu",
    "Giới thiệu giải pháp đầu tư",
    "Theo dõi quyết định tư vấn",
    "Rà soát ưu đãi dịch vụ",
    "Giới thiệu đầu mối hỗ trợ",
    "Mời sự kiện chuyên đề",
    "Cập nhật nhu cầu hiện tại",
    "Chăm sóc chương trình giới thiệu",
  ];
  const active = [1, 2, 5, 6, 9, 10, 13, 14, 15, 17, 18, 21],
    draft = [7, 8, 19, 23],
    future = [11, 16, 22],
    expired = [12, 24];
  const scenarios: Scenario[] = names.map((name, k) => {
    const n = k + 1,
      id = `SMS-${String(n).padStart(4, "0")}`,
      c = newConfig(NOW);
    c.name = name;
    c.category = categories[Math.floor(k / 4)].id;
    c.purpose = `Chủ động ${name.toLowerCase()}, mang đến trải nghiệm phù hợp và ghi nhận nhu cầu khách hàng.`;
    c.condition =
      n === 15
        ? defaultCondition()
        : rule("equity.availableCash", (n % 4) * 100000000);
    c.owner = owners[k % 8];
    c.unit = units[Math.floor((k % 8) / 2)];
    c.tags = [n % 2 ? "Khách hàng ưu tiên" : "Chăm sóc định kỳ"];
    if (n === 15 || n === 16)
      c.tags.push(
        "Fixture: thanh khoản",
        n === 15 ? "Ý định: sử dụng tiền" : "Ý định: giữ thanh khoản",
      );
    c.start = future.includes(n)
      ? "2026-10-05T09:00:00+07:00"
      : "2026-01-01T09:00:00+07:00";
    c.end = expired.includes(n)
      ? "2026-09-20T00:00:00+07:00"
      : "2026-12-31T23:59:00+07:00";
    c.mode = n % 2 ? "event" : "schedule";
    c.events = [
      n === 1
        ? "account.opened"
        : n === 2
          ? "cash.dividendPaid"
          : "cash.deposited",
    ];
    c.actions[0].title = name;
    c.actions[0].body.noti = `Kính chào {{customer.name}}, SHS gửi quý khách thông tin: ${name.toLowerCase()}. Chuyên viên phụ trách sẵn sàng hỗ trợ quý khách.`;
    c.actions[0].channels = n % 3 === 0 ? ["email", "noti"] : ["noti"];
    c.followPeriod = n === 14 || n === 15;
    c.followEach = true;
    if (n === 9 || n === 10)
      c.actions[0].body.noti =
        "Bản tin theo đăng ký của {{customer.name}} đã sẵn sàng. Xem các nội dung được quan tâm cùng SHS.";
    if (n === 17 || n === 18) {
      c.actions[0].type = "offer";
      c.actions[0].products = ["P05", "P07"];
      c.actions[0].placement = "Trang chủ";
    }
    const isDraft = draft.includes(n);
    const v = {
      id: `${id}-v1`,
      no: 1,
      at: "2026-09-01T09:00:00+07:00",
      by: "Manager",
      reason: "Khởi tạo minh họa",
      config: c,
      plan: compile(c, `${id}-v1`, NOW),
    };
    return {
      id,
      code: id,
      draft: isDraft ? c : undefined,
      versions: isDraft ? [] : [v],
      control:
        n === 4
          ? "ended"
          : active.includes(n) || future.includes(n) || expired.includes(n)
            ? "enabled"
            : "paused",
      updated: NOW,
    };
  });
  const state: State = {
    schemaVersion: 1,
    now: NOW,
    persona: "Manager",
    scenarios,
    customers,
    evaluations: [],
    activations: [],
    tasks: [],
    batches: [],
    categories,
    products: Array.from({ length: 12 }, (_, i) => ({
      id: `P${String(i + 1).padStart(2, "0")}`,
      name: `Demo ${["Cổ phiếu", "Phái sinh", "Margin", "Trái phiếu", "Quỹ cân bằng", "Quỹ tăng trưởng", "Money market", "Ứng trước", "Trái phiếu kỳ hạn", "Quỹ thu nhập", "MM linh hoạt", "Dịch vụ tư vấn"][i]}`,
      description:
        "Sản phẩm minh họa cho cấu hình và trình diễn. Không phải chào bán.",
      active: i !== 11,
      group: [
        "Cổ phiếu",
        "Phái sinh",
        "Nợ",
        "Trái phiếu",
        "CCQ",
        "CCQ",
        "MM",
        "Nợ",
        "Trái phiếu",
        "CCQ",
        "MM",
        "Tư vấn",
      ][i],
      end: i === 11 ? "2026-09-01" : "2027-12-31",
    })),
    bundles: [
      {
        id: "B01",
        name: "Demo Quản lý thanh khoản",
        description: "Kết hợp các sản phẩm có thể lựa chọn",
        products: ["P05", "P07"],
        active: true,
      },
      {
        id: "B02",
        name: "Demo Đầu tư cân bằng",
        description: "Bộ sản phẩm minh họa",
        products: ["P04", "P05"],
        active: true,
      },
      {
        id: "B03",
        name: "Demo Đồng hành tài sản",
        description: "Bộ sản phẩm minh họa",
        products: ["P01", "P09", "P10"],
        active: true,
      },
    ],
    audit: [],
    reviews: {},
    views: {},
  };
  for (let d = 1; d <= 14; d++)
    for (let j = 0; j < 4; j++) {
      const s = scenarios[active[(d * 4 + j) % active.length] - 1],
        v = s.versions[0],
        at = `2026-09-${String(29 - d).padStart(2, "0")}T09:00:00+07:00`;
      simulate(
        state,
        s.id,
        `SEED-${d}-${j}`,
        v.config.events[0] || "schedule",
        `C${String([5, 7, 13, 19, 23, 29][(d + j) % 6]).padStart(3, "0")}`,
        at,
        100000000,
        v.config.mode === "schedule"
          ? ["C002", "C005", "C007", "C017", "C023", "C029"]
          : undefined,
      );
    }
  let runNo = 0;
  for (const a of state.activations)
    for (const r of a.runs) {
      runNo++;
      if (runNo % 11 === 0) r.status = "failed";
    }
  state.tasks.forEach((t, i) => {
    t.status = i % 7 === 0 ? "open" : i % 5 === 0 ? "in_progress" : "completed";
    if (t.status === "completed")
      t.outcome =
        "Đã trao đổi và ghi nhận kế hoạch sử dụng tài sản của khách hàng.";
  });
  makeBatch(state, "SMS-0014");
  state.audit.push({
    id: "AUDIT-SEED",
    at: NOW,
    actor: "Hệ thống",
    message:
      "Khởi tạo không gian trình diễn: 24 kịch bản, 120 khách hàng giả lập.",
  });
  return state;
}
