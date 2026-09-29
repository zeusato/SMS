import { describe, it, expect } from "vitest";
import { seed } from "./seed";
import { transaction } from "./transaction";
import {
  defaultCondition,
  evaluate,
  rule,
  newConfig,
  newAction,
  compile,
  validate,
  scheduleRuns,
  simulate,
  copy,
  makeBatch,
  status,
  subjects,
  conflicts,
  NOW,
  allowed,
  type Condition,
} from "./domain";
function valid() {
  const c = newConfig();
  c.name = "Kịch bản kiểm thử";
  c.purpose = "Kiểm tra toàn bộ luồng thiết lập và vận hành.";
  c.condition = defaultCondition();
  return c;
}
describe("evaluator", () => {
  it("matches the exact 120-customer fixture at both thresholds", () => {
    const s = seed(),
      c = defaultCondition();
    const counts = () =>
      s.customers.reduce(
        (a, x) => {
          a[evaluate(c, x.values).verdict]++;
          return a;
        },
        { match: 0, no_match: 0, unknown: 0 },
      );
    expect(counts()).toEqual({ match: 33, no_match: 82, unknown: 5 });
    if (c.kind === "group" && c.children[0].kind === "rule")
      c.children[0].right = { kind: "literal", value: 500000000, unit: "VND" };
    expect(counts()).toEqual({ match: 16, no_match: 99, unknown: 5 });
    expect(subjects(s, "account")).toHaveLength(132);
  });
  it("preserves unknown, zero and three-valued groups", () => {
    const a = rule("equity.availableCash", 0);
    expect(evaluate(a, { "equity.availableCash": 0 }).verdict).toBe("match");
    expect(evaluate(a, {}).verdict).toBe("unknown");
    const c: Condition = {
      id: "g",
      kind: "group",
      op: "all",
      children: [a, rule("profile.marketingConsent", true)],
    };
    expect(evaluate(c, { "profile.marketingConsent": false }).verdict).toBe(
      "no_match",
    );
    c.op = "any";
    expect(evaluate(c, { "profile.marketingConsent": true }).verdict).toBe(
      "match",
    );
  });
  it("rejects division by zero and dimensional errors", () => {
    const c = rule();
    if (c.kind !== "rule") throw Error();
    c.left = {
      kind: "math",
      op: "div",
      left: { kind: "literal", value: 100, unit: "VND" },
      right: { kind: "literal", value: 0, unit: "NONE" },
    };
    expect(evaluate(c, {}).verdict).toBe("unknown");
    c.left = { kind: "literal", value: 100, unit: "DAYS" };
    expect(evaluate(c, {}).verdict).toBe("unknown");
  });
  it("supports exists, between and dates", () => {
    const r = rule("equity.availableCash", 20);
    if (r.kind !== "rule") throw Error();
    r.op = "exists";
    expect(evaluate(r, {}).verdict).toBe("no_match");
    r.op = "between";
    r.extra = { kind: "literal", value: 40, unit: "VND" };
    expect(evaluate(r, { "equity.availableCash": 30 }).verdict).toBe("match");
    expect(evaluate(r, { "equity.availableCash": 50 }).verdict).toBe(
      "no_match",
    );
  });
});
describe("calendar and lifecycle", () => {
  it("skips invalid month days and excludes end boundary", () => {
    const c = valid();
    c.mode = "schedule";
    c.start = "2026-01-01T00:00:00+07:00";
    c.end = "2026-06-01T00:00:00+07:00";
    c.schedule.unit = "month";
    c.schedule.monthDays = [31];
    const result = scheduleRuns(c, c.start);
    expect(
      result.runs.map((x) =>
        new Date(Date.parse(x) + 25200000).toISOString().slice(0, 10),
      ),
    ).toEqual(["2026-01-31", "2026-03-31", "2026-05-31"]);
    c.end = "2026-01-31T09:00:00+07:00";
    expect(scheduleRuns(c, c.start).runs).toHaveLength(0);
  });
  it("handles leap year, weekdays, exclusions and finite trading calendar", () => {
    const c = valid();
    c.mode = "schedule";
    c.start = "2026-01-01T00:00:00+07:00";
    c.schedule.unit = "year";
    c.schedule.months = [2];
    c.schedule.monthDays = [29];
    expect(scheduleRuns(c, c.start).runs[0]).toBe("2028-02-29T02:00:00.000Z");
    c.schedule.unit = "week";
    c.schedule.weekdays = [1];
    c.schedule.excludedDates = ["2026-01-05"];
    expect(scheduleRuns(c, c.start).runs[0]).toBe("2026-01-12T02:00:00.000Z");
    c.schedule.calendar = "trading";
    expect(scheduleRuns(c, "2028-01-01T00:00:00+07:00").runs).toHaveLength(0);
  });
  it("handles hourly anchors and business day rules", () => {
    const c = valid();
    c.mode = "schedule";
    c.schedule.unit = "hour";
    c.schedule.interval = 2;
    expect(scheduleRuns(c, NOW, 2).runs).toEqual([
      "2026-09-29T03:00:00.000Z",
      "2026-09-29T05:00:00.000Z",
    ]);
    c.start = "2026-09-26T09:00:00+07:00";
    c.schedule.unit = "day";
    c.schedule.calendar = "business";
    expect(scheduleRuns(c, c.start, 1).runs[0]).toBe(
      "2026-09-28T02:00:00.000Z",
    );
  });
  it("separates draft, paused, expired and scheduled", () => {
    const s = seed();
    expect(s.scenarios.filter((x) => status(x, NOW) === "active")).toHaveLength(
      12,
    );
    expect(s.scenarios.filter((x) => status(x, NOW) === "draft")).toHaveLength(
      4,
    );
    expect(
      s.scenarios.filter((x) => status(x, NOW) === "scheduled"),
    ).toHaveLength(3);
    const x = copy(s.scenarios[0]);
    x.control = "paused";
    expect(status(x, NOW)).toBe("paused");
    expect(status(x, "2027-01-01T00:00:00+07:00")).toBe("expired");
  });
});
describe("generated automation and runtime", () => {
  it("switches the published plan to a schedule without changing v1 history", () => {
    const s = seed(),
      sc = s.scenarios[14];
    const eid = simulate(s, sc.id, "VERSION-ONE", "cash.deposited", "C005");
    const old = copy(sc.versions[0]),
      history = copy(s.evaluations.find((e) => e.id === eid));
    const c = copy(old.config);
    c.mode = "schedule";
    c.actions[0].title = "Thông điệp phiên bản hai";
    const plan = compile(c, `${sc.id}-v2`, NOW);
    sc.versions.push({
      id: `${sc.id}-v2`,
      no: 2,
      at: NOW,
      by: "Manager",
      reason: "Kiểm thử",
      config: plan.config,
      plan,
    });
    const at = scheduleRuns(c, NOW, 1).runs[0];
    const next = simulate(s, sc.id, "SCHEDULE-V2", "", "", at);
    expect(plan.triggerRegistration.mode).toBe("schedule");
    expect(s.evaluations.find((e) => e.id === next)?.planId).toBe(plan.id);
    expect(sc.versions[0]).toEqual(old);
    expect(s.evaluations.find((e) => e.id === eid)).toEqual(history);
  });
  it("creates before-action follow-up ahead of explicit action tasks", () => {
    const s = seed(),
      sc = s.scenarios[14];
    const c = copy(sc.versions[0].config);
    c.followTiming = "before";
    c.actions = [newAction("task")];
    sc.versions[0].plan = compile(c, sc.versions[0].id, NOW);
    const id = simulate(s, sc.id, "FOLLOW-BEFORE", "cash.deposited", "C005");
    const aid = s.evaluations.find((e) => e.id === id)!.outcomes[0]
      .activationId;
    expect(
      s.tasks.filter((t) => t.activationId === aid).map((t) => t.title),
    ).toEqual([c.followTitle, c.actions[0].title]);
  });
  it("limits publishing and control to managers and deletion to admin", () => {
    expect(allowed("Editor", "publish")).toBe(false);
    expect(allowed("Editor", "control")).toBe(false);
    expect(allowed("Manager", "delete")).toBe(false);
    expect(allowed("Admin", "delete")).toBe(true);
    expect(allowed("Viewer", "edit")).toBe(false);
    expect(allowed("Viewer", "task")).toBe(false);
  });
  it("compiles only selected trigger and enabled followups; rejects incomplete draft", () => {
    const c = valid();
    c.followPeriod = true;
    const p = compile(c, "v1", NOW);
    expect(p.nodes.filter((n) => n.type === "trigger")).toHaveLength(1);
    expect(p.nodes.filter((n) => n.type.startsWith("followup"))).toHaveLength(
      2,
    );
    c.mode = "schedule";
    expect(compile(c, "v2", NOW).config.events).toEqual([]);
    expect(() => compile(newConfig(), "bad", NOW)).toThrow();
    expect(p.config.mode).toBe("event");
  });
  it("pins snapshot, deduplicates trigger, and keeps tasks distinct", () => {
    const s = seed(),
      sc = s.scenarios[14];
    const before = s.activations.length;
    const id = simulate(s, sc.id, "TEST-EVENT", "cash.deposited", "C005");
    const e = s.evaluations.find((e) => e.id === id)!;
    expect(e.outcomes).toHaveLength(1);
    expect(e.outcomes[0].activationId).toBeTruthy();
    expect(s.activations.length).toBe(before + 1);
    expect(() =>
      simulate(s, sc.id, "TEST-EVENT", "cash.deposited", "C005"),
    ).toThrow(/trùng/);
    const snapshot = e.outcomes[0].values["equity.availableCash"];
    s.customers[4].values["equity.availableCash"] = 0;
    expect(e.outcomes[0].values["equity.availableCash"]).toBe(snapshot);
    expect(
      s.tasks.filter((t) => t.activationId === e.outcomes[0].activationId),
    ).toHaveLength(1);
  });
  it("enforces reentry once and pauses before runtime", () => {
    const s = seed(),
      sc = s.scenarios[14];
    sc.versions[0].plan.config.reentry = "once";
    simulate(s, sc.id, "TEST-ONCE", "cash.deposited", "C005");
    simulate(s, sc.id, "TEST-ONCE-2", "cash.deposited", "C005");
    const latest = s.evaluations.at(-1)!;
    expect(latest.outcomes[0].verdict).toBe("suppressed");
    sc.control = "paused";
    expect(() =>
      simulate(s, sc.id, "TEST-PAUSED", "cash.deposited", "C005"),
    ).toThrow(/tạm dừng/);
  });
  it("deduplicates batches and does not complete member tasks", () => {
    const s = seed();
    const id = makeBatch(s, "SMS-0014"),
      n = s.batches.length,
      tasks = copy(s.tasks);
    expect(makeBatch(s, "SMS-0014")).toBe(id);
    expect(s.batches.length).toBe(n);
    s.batches.find((x) => x.id === id)!.reviewed = true;
    expect(s.tasks).toEqual(tasks);
  });
  it("uses actual overlapping customers as conflict evidence", () => {
    const s = seed();
    const f = conflicts(s);
    expect(f.length).toBeGreaterThanOrEqual(2);
    for (const finding of f) expect(finding.sample.length).toBeGreaterThan(0);
    const c = valid();
    c.actions = [newAction("offer")];
    expect(validate(c)).toContain("Chọn sản phẩm cho offer");
  });
});

describe("persistence transaction", () => {
  it("keeps old version and draft intact if persistence or compile fails", () => {
    const s = seed();
    const old = copy(s);
    expect(() =>
      transaction(
        s,
        (n) => {
          n.scenarios[0].control = "ended";
        },
        () => {
          throw new Error("quota");
        },
      ),
    ).toThrow("quota");
    expect(s).toEqual(old);
    expect(() =>
      transaction(
        s,
        (n) => {
          n.scenarios[0].versions[0].plan = compile(
            newConfig(),
            "invalid",
            NOW,
          );
        },
        () => {},
      ),
    ).toThrow();
    expect(s).toEqual(old);
  });
  it("rebuilds a deterministic seed within a small storage budget", () => {
    const a = seed(),
      b = seed();
    expect(a).toEqual(b);
    expect(JSON.stringify(a).length).toBeLessThan(2000000);
  });
});
