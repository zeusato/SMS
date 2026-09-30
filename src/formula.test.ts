import { describe, expect, it } from "vitest";
import {
  conditionTokens,
  matchingParentheses,
  moveFormulaToken,
  parseFormula,
  type FormulaToken,
} from "./formula";
import {
  defaultCondition,
  evaluate,
  newConfig,
  rule,
  validate,
  validateCondition,
  type Condition,
} from "./domain";

const a = rule("equity.cash", 10),
  b = rule("debt.principal", 20),
  c = rule("equity.availableCash", 30);
function tokens(
  ...items: (Condition | "and" | "or" | "open" | "close")[]
): FormulaToken[] {
  return items.flatMap((item, index) =>
    typeof item === "string"
      ? [{ id: `t${index}`, kind: item }]
      : conditionTokens(item),
  );
}
function parsed(input: FormulaToken[]): Condition {
  const result = parseFormula(input);
  if (!result.condition) throw Error(result.error);
  return result.condition;
}

describe("advanced condition formulas", () => {
  it("evaluates A AND (B OR C) and AND precedence over OR for all truth values", () => {
    const nested = parsed(tokens(a, "and", "open", b, "or", c, "close"));
    const precedence = parsed(tokens(a, "or", b, "and", c));
    for (const av of [false, true])
      for (const bv of [false, true])
        for (const cv of [false, true]) {
          const values = {
            "equity.cash": av ? 10 : 0,
            "debt.principal": bv ? 20 : 0,
            "equity.availableCash": cv ? 30 : 0,
          };
          expect(evaluate(nested, values).verdict).toBe(
            av && (bv || cv) ? "match" : "no_match",
          );
          expect(evaluate(precedence, values).verdict).toBe(
            av || (bv && cv) ? "match" : "no_match",
          );
        }
    expect(
      evaluate(nested, {
        "equity.cash": 10,
        "debt.principal": null,
        "equity.availableCash": 0,
      }).verdict,
    ).toBe("unknown");
    expect(
      evaluate(nested, {
        "equity.cash": 10,
        "debt.principal": null,
        "equity.availableCash": 30,
      }).verdict,
    ).toBe("match");
  });

  it.each([
    { input: tokens(), index: 0 },
    { input: tokens("and", a), index: 0 },
    { input: tokens(a, "or"), index: 2 },
    { input: tokens(a, "and", "or", b), index: 2 },
    { input: tokens(a, b), index: 1 },
    { input: tokens(a, "open", b, "close"), index: 1 },
    { input: tokens("open", "close"), index: 1 },
    { input: tokens(a, "close"), index: 1 },
    { input: tokens("open", a), index: 0 },
    { input: tokens("close", a), index: 0 },
    { input: tokens("open", a, "and", "close"), index: 3 },
  ])(
    "rejects malformed formulas at their exact location ($index)",
    ({ input, index }) => {
      expect(parseFormula(input)).toMatchObject({
        error: expect.any(String),
        index,
      });
      expect(parseFormula(input).condition).toBeUndefined();
    },
  );

  it("round-trips nested basic groups without changing three-valued evaluation", () => {
    const original: Condition = {
      id: "outer",
      kind: "group",
      op: "all",
      children: [
        a,
        {
          id: "inner",
          kind: "group",
          op: "any",
          children: [b, c],
        },
      ],
    };
    const roundTrip = parsed(
      conditionTokens(parsed(conditionTokens(original))),
    );
    for (const av of [0, 10, null])
      for (const bv of [0, 20, null])
        for (const cv of [0, 30, null]) {
          const values = {
            "equity.cash": av,
            "debt.principal": bv,
            "equity.availableCash": cv,
          };
          expect(evaluate(roundTrip, values).verdict).toEqual(
            evaluate(original, values).verdict,
          );
        }
  });

  it("preserves math, ranges, units and deep nesting", () => {
    const range = rule();
    if (range.kind !== "rule") throw Error();
    range.left = {
      kind: "math",
      op: "sub",
      left: { kind: "metric", id: "equity.cash" },
      right: { kind: "metric", id: "debt.principal" },
    };
    range.op = "between";
    range.extra = { kind: "literal", value: 500000000, unit: "VND" };
    let deep: Condition = range;
    for (let i = 0; i < 6; i++)
      deep = {
        id: `g${i}`,
        kind: "group",
        op: i % 2 ? "all" : "any",
        children: [deep, { ...c, id: `r${i}` }],
      };
    const restored = parsed(conditionTokens(deep));
    expect(validateCondition(deep)).toEqual([]);
    expect(validateCondition(restored)).toEqual([]);
    expect(JSON.stringify(restored)).toContain(JSON.stringify(range));
  });

  it("keeps empty groups invalid when switching modes", () => {
    const node: Condition = {
      id: "root",
      kind: "group",
      op: "all",
      children: [a, { id: "empty", kind: "group", op: "any", children: [] }],
    };
    expect(parseFormula(conditionTokens(node)).error).toBeTruthy();
  });

  it("blocks proceeding or publishing an unfinished saved formula despite an older valid condition", () => {
    const config = {
      ...newConfig(),
      condition: defaultCondition(),
      conditionMode: "advanced" as const,
      conditionFormula: tokens(a, "and", "open", b),
    };
    expect(validate(config, 1)).toEqual([
      expect.stringContaining("Thiếu dấu đóng ngoặc"),
    ]);
    expect(validate(JSON.parse(JSON.stringify(config)), 1)).toEqual(
      validate(config, 1),
    );
    config.conditionFormula = tokens(a, "and", "open", b, "or", c, "close");
    expect(validate(config, 1)).toEqual([]);
  });

  it("moves tokens to the chosen insertion gap and matches nested parentheses", () => {
    const input = tokens(a, "and", b);
    expect(moveFormulaToken(input, 0, 3).map((t) => t.id)).toEqual([
      input[1].id,
      input[2].id,
      input[0].id,
    ]);
    expect(moveFormulaToken(input, 2, 0).map((t) => t.id)).toEqual([
      input[2].id,
      input[0].id,
      input[1].id,
    ]);
    expect(moveFormulaToken(input, 1, 2)).toEqual(input);
    expect(moveFormulaToken(input, 0, -1)).toEqual(input);
    const pairs = matchingParentheses(
      tokens("open", a, "or", "open", b, "and", c, "close", "close"),
    );
    expect([...pairs]).toEqual([
      [3, 7],
      [7, 3],
      [0, 8],
      [8, 0],
    ]);
  });
});
