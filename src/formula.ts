import type { Condition } from "./domain";

export type RuleCondition = Extract<Condition, { kind: "rule" }>;
export type FormulaToken =
  | { id: string; kind: "condition"; condition: RuleCondition }
  | { id: string; kind: "and" | "or" | "open" | "close" };
export type FormulaResult =
  | { condition: Condition; error?: never; index?: never }
  | { condition?: never; error: string; index: number };

// Keep every nested group explicit, including empty groups that need repair.
export function conditionTokens(node: Condition, root = true): FormulaToken[] {
  if (node.kind === "rule")
    return [{ id: node.id, kind: "condition", condition: node }];
  const children = node.children.flatMap((child, i): FormulaToken[] => [
    ...(i
      ? [
          {
            id: `${node.id}-op-${i}`,
            kind: node.op === "all" ? ("and" as const) : ("or" as const),
          },
        ]
      : []),
    ...conditionTokens(child, false),
  ]);
  return root
    ? children
    : [
        { id: `${node.id}-open`, kind: "open" },
        ...children,
        { id: `${node.id}-close`, kind: "close" },
      ];
}

// Recursive descent: parentheses first, AND before OR. Never evaluate source text.
export function parseFormula(tokens: FormulaToken[]): FormulaResult {
  let index = 0;
  let failure: { error: string; index: number } | undefined;
  function fail(error: string, at = index): null {
    failure ??= { error, index: at };
    return null;
  }
  function primary(): Condition | null {
    const token = tokens[index];
    if (!token) return fail("Thiếu điều kiện ở cuối công thức.");
    if (token.kind === "condition") {
      index++;
      return token.condition;
    }
    if (token.kind === "open") {
      const openIndex = index++;
      if (tokens[index]?.kind === "close")
        return fail("Nhóm ngoặc cần ít nhất một điều kiện.");
      const child = disjunction();
      if (!child) return null;
      if (tokens[index]?.kind !== "close")
        return fail("Thiếu dấu đóng ngoặc ) cho nhóm này.", openIndex);
      index++;
      return child;
    }
    return fail(
      token.kind === "close"
        ? "Dấu ) chưa có điều kiện hoặc dấu ( tương ứng."
        : "Cần một điều kiện trước VÀ / HOẶC.",
    );
  }
  function combine(
    kind: "and" | "or",
    operand: () => Condition | null,
  ): Condition | null {
    const first = operand();
    if (!first) return null;
    const children = [first];
    let id = "";
    while (tokens[index]?.kind === kind) {
      id ||= `formula-${tokens[index].id}`;
      index++;
      const next = operand();
      if (!next) return null;
      children.push(next);
    }
    return children.length === 1
      ? first
      : {
          id,
          kind: "group",
          op: kind === "and" ? "all" : "any",
          children,
        };
  }
  function conjunction(): Condition | null {
    return combine("and", primary);
  }
  function disjunction(): Condition | null {
    return combine("or", conjunction);
  }
  if (!tokens.length)
    return { error: "Thêm một đại lượng để bắt đầu công thức.", index: 0 };
  const condition = disjunction();
  if (failure) return failure;
  if (!condition) return { error: "Công thức chưa hoàn chỉnh.", index };
  if (index < tokens.length)
    return {
      error:
        tokens[index].kind === "close"
          ? "Thừa dấu đóng ngoặc )."
          : "Thiếu VÀ / HOẶC giữa các điều kiện hoặc nhóm ngoặc.",
      index,
    };
  return {
    condition:
      condition.kind === "group"
        ? condition
        : {
            id: `formula-root-${condition.id}`,
            kind: "group",
            op: "all",
            children: [condition],
          },
  };
}

export function moveFormulaToken(
  tokens: FormulaToken[],
  from: number,
  to: number,
): FormulaToken[] {
  if (from < 0 || from >= tokens.length || to < 0 || to > tokens.length)
    return tokens;
  const next = [...tokens];
  const [token] = next.splice(from, 1);
  next.splice(to > from ? to - 1 : to, 0, token);
  return next;
}

export function matchingParentheses(
  tokens: FormulaToken[],
): Map<number, number> {
  const stack: number[] = [],
    pairs = new Map<number, number>();
  tokens.forEach((token, index) => {
    if (token.kind === "open") stack.push(index);
    if (token.kind === "close" && stack.length) {
      const open = stack.pop()!;
      pairs.set(open, index);
      pairs.set(index, open);
    }
  });
  return pairs;
}
