import { describe, expect, it } from "vitest";
import {
  evaluate,
  evalExpr,
  historyKey,
  NOW,
  snapshotValues,
  validateCondition,
  type ChangeExpr,
  type Condition,
} from "./domain";
import { conditionTokens, parseFormula, type RuleCondition } from "./formula";
import { withDemoHistory } from "./seed";

function change(
  direction: "increase" | "decrease" = "increase",
  measure: "absolute" | "percent" = "percent",
  threshold = 10,
): RuleCondition {
  return {
    id: "change",
    kind: "rule",
    left: {
      kind: "change",
      id: "equity.cash",
      direction,
      measure,
      period: "7d",
    },
    op: "gte",
    right: {
      kind: "literal",
      value: threshold,
      unit: measure === "percent" ? "PERCENT" : "VND",
    },
  };
}
const values = (current: number | null, before: number | null) => ({
  "equity.cash": current,
  [historyKey("equity.cash", "7d")]: before,
});

describe("value change conditions", () => {
  it.each([
    ["increase", "percent", 110, 100, 10, "match"],
    ["increase", "percent", 109, 100, 10, "no_match"],
    ["decrease", "percent", 90, 100, 10, "match"],
    ["decrease", "percent", 100, 90, 10, "no_match"],
    ["increase", "absolute", 150000000, 100000000, 50000000, "match"],
    ["decrease", "absolute", 50000000, 100000000, 50000000, "match"],
    ["increase", "absolute", 10, 0, 10, "match"],
    ["decrease", "percent", 0, 100, 100, "match"],
    ["increase", "percent", -90, -100, 10, "match"],
    ["decrease", "percent", -110, -100, 10, "match"],
  ] as const)(
    "evaluates %s by %s (%s vs %s)",
    (direction, measure, current, before, threshold, verdict) => {
      expect(
        evaluate(change(direction, measure, threshold), values(current, before))
          .verdict,
      ).toBe(verdict);
    },
  );
  it("never classifies a fall or unchanged value as an increase below a threshold", () => {
    const c = { ...change(), op: "lt" };
    expect(evaluate(c, values(90, 100)).verdict).toBe("no_match");
    expect(evaluate(c, values(100, 100)).verdict).toBe("no_match");
    expect(evaluate(c, values(105, 100)).verdict).toBe("match");
  });
  it("reports missing history, missing current values and zero percent baselines separately", () => {
    expect(evaluate(change(), { "equity.cash": 100 })).toMatchObject({
      verdict: "unknown",
      reason: expect.stringContaining("thiếu giá trị tại 7 ngày trước"),
    });
    expect(evaluate(change(), values(null, 100)).verdict).toBe("unknown");
    expect(evaluate(change(), values(100, 0))).toMatchObject({
      verdict: "unknown",
      reason: expect.stringContaining("giá trị gốc bằng 0"),
    });
    expect(evaluate(change(), values(0, 0)).verdict).toBe("unknown");
  });
  it("uses the selected period and distinguishes percentage points from relative percentages", () => {
    const expr: ChangeExpr = {
      kind: "change",
      id: "equity.cash",
      measure: "absolute",
      direction: "increase",
      period: "1d",
    };
    expect(
      evalExpr(
        expr,
        { ...values(110, 100), [historyKey("equity.cash", "1d")]: 105 },
        NOW,
      ).value,
    ).toBe(5);
    const metric = { ...expr, id: "debt.marginRatio" };
    const ratios = {
      "debt.marginRatio": 60,
      [historyKey("debt.marginRatio", "1d")]: 50,
    };
    expect(evalExpr(metric, ratios, NOW)).toMatchObject({
      value: 10,
      unit: "PERCENT",
    });
    expect(
      evalExpr({ ...metric, measure: "percent" }, ratios, NOW),
    ).toMatchObject({ value: 20, unit: "PERCENT" });
  });
  it("validates nonnegative thresholds, upper bounds, units and numeric metrics", () => {
    expect(validateCondition(change())).toEqual([]);
    expect(validateCondition(change("decrease", "absolute"))).toEqual([]);
    expect(validateCondition(change("increase", "percent", -10))).not.toEqual(
      [],
    );
    expect(
      validateCondition({
        ...change(),
        right: { kind: "literal", value: 10, unit: "VND" },
      }),
    ).not.toEqual([]);
    expect(
      validateCondition({
        ...change(),
        op: "between",
        extra: { kind: "literal", value: 5, unit: "PERCENT" },
      }),
    ).not.toEqual([]);
    expect(
      validateCondition({
        ...change(),
        left: {
          kind: "change",
          id: "profile.marketingConsent",
          direction: "increase",
          measure: "percent",
          period: "1d",
        },
      }),
    ).not.toEqual([]);
  });
  it("round-trips mixed current-value and change rules and pins only history used in a run", () => {
    const c: Condition = {
      id: "g",
      kind: "group",
      op: "any",
      children: [
        change(),
        { ...change("decrease", "absolute", 50), id: "fall" },
      ],
    };
    const restored = parseFormula(conditionTokens(c)).condition!;
    const source = {
      ...values(110, 100),
      [historyKey("equity.cash", "30d")]: 20,
    };
    const snapshot = snapshotValues(restored, source);
    expect(snapshot).toEqual(values(110, 100));
    source[historyKey("equity.cash", "7d")] = 200;
    expect(evaluate(restored, snapshot).verdict).toBe("match");
  });
  it("upgrades demo history without replacing existing snapshots or explicit missing values", () => {
    const c = {
      id: "C001",
      name: "Demo",
      accountId: "A001",
      products: [],
      values: values(110, null),
    };
    const upgraded = withDemoHistory(c, 0);
    expect(upgraded.values[historyKey("equity.cash", "7d")]).toBeNull();
    expect(withDemoHistory(upgraded, 0)).toEqual(upgraded);
    expect(c.values).toEqual(values(110, null));
  });
});
