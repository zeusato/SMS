import { Fragment, useState, type DragEvent } from "react";
import { Dismiss16Regular, ArrowUndo20Regular } from "@fluentui/react-icons";
import { Button, Notice } from "./ui";
import {
  describe,
  exprLabel,
  opSymbols,
  uid,
  validateCondition,
  changePeriods,
  type Expr,
} from "./domain";
import {
  matchingParentheses,
  moveFormulaToken,
  parseFormula,
  type FormulaToken,
} from "./formula";

export const metricDragType = "application/x-sms-metric";
const tokenDragType = "application/x-sms-formula-token";
const symbols = { and: "VÀ", or: "HOẶC", open: "(", close: ")" };

function valueLabel(expr: Expr, percentagePoints = false): string {
  if (expr.kind !== "literal") return exprLabel(expr);
  if (typeof expr.value === "boolean") return expr.value ? "Đúng" : "Sai";
  const value =
    typeof expr.value === "number"
      ? new Intl.NumberFormat("vi-VN", {
          notation: expr.unit === "VND" ? "compact" : "standard",
          maximumFractionDigits: 2,
        }).format(expr.value)
      : String(expr.value ?? "");
  const unit = { VND: "VND", PERCENT: "%", DAYS: "ngày", COUNT: "", NONE: "" }[
    expr.unit
  ];
  return `${value}${unit ? ` ${percentagePoints && expr.unit === "PERCENT" ? "điểm %" : unit}` : ""}`;
}

export function FormulaEditor({
  tokens,
  cursor,
  onCursor,
  onChange,
  onEdit,
  onAddMetric,
  onRestore,
}: {
  tokens: FormulaToken[];
  cursor: number;
  onCursor: (index: number) => void;
  onChange: (tokens: FormulaToken[]) => void;
  onEdit: (index: number) => void;
  onAddMetric: (id: string, index: number) => void;
  onRestore: () => void;
}) {
  const [activeParen, setActiveParen] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const result = parseFormula(tokens);
  const pairs = matchingParentheses(tokens);
  const invalidRules = tokens.flatMap((token, index) =>
    token.kind === "condition"
      ? validateCondition(token.condition).map((error) => ({ error, index }))
      : [],
  );
  const issue = result.error
    ? { error: result.error, index: result.index }
    : invalidRules[0];
  const insertion = Math.min(cursor, tokens.length);

  function insert(kind: "and" | "or" | "open" | "close") {
    const next = [...tokens];
    next.splice(insertion, 0, { id: uid("token"), kind });
    onChange(next);
    onCursor(insertion + 1);
  }
  function remove(index: number) {
    onChange(tokens.filter((_, i) => i !== index));
    onCursor(Math.min(index, tokens.length - 1));
  }
  function accepts(event: DragEvent) {
    return [metricDragType, tokenDragType].some((type) =>
      event.dataTransfer.types.includes(type),
    );
  }
  function drop(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(null);
    const metric = event.dataTransfer.getData(metricDragType);
    const tokenId = event.dataTransfer.getData(tokenDragType);
    if (metric) onAddMetric(metric, index);
    else if (tokenId) {
      const from = tokens.findIndex((token) => token.id === tokenId);
      if (from < 0) return;
      onChange(moveFormulaToken(tokens, from, index));
      onCursor(index > from ? index : index + 1);
    }
  }
  function gap(index: number) {
    return (
      <button
        type="button"
        className={`formula-gap ${insertion === index ? "current" : ""} ${dragOver === index ? "drag-over" : ""} ${issue?.index === index && index === tokens.length ? "has-error" : ""}`}
        aria-label={`Chèn tại vị trí ${index + 1}`}
        aria-pressed={insertion === index}
        title={`Chèn tại vị trí ${index + 1} · Có thể thả đại lượng vào đây`}
        onClick={() => onCursor(index)}
        onFocus={() => onCursor(index)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            onCursor(
              Math.max(
                0,
                Math.min(
                  tokens.length,
                  insertion + (event.key === "ArrowLeft" ? -1 : 1),
                ),
              ),
            );
          } else if (event.key === "Backspace" && insertion > 0) {
            event.preventDefault();
            remove(insertion - 1);
          } else if (event.key === "Delete" && insertion < tokens.length) {
            event.preventDefault();
            remove(insertion);
          }
        }}
        onDragOver={(event) => {
          if (accepts(event)) {
            event.preventDefault();
            event.stopPropagation();
            setDragOver(index);
          }
        }}
        onDragLeave={() => setDragOver(null)}
        onDrop={(event) => drop(event, index)}
      >
        <span aria-hidden="true">+</span>
      </button>
    );
  }
  return (
    <section
      className="advanced-formula"
      aria-label="Trình soạn công thức nâng cao"
    >
      <div className="formula-editor-heading">
        <div>
          <span className="eyebrow">CÔNG THỨC ĐIỀU KIỆN</span>
          <h3>Lắp ghép theo cách của bạn</h3>
        </div>
        <span className="formula-count">
          {tokens.filter((t) => t.kind === "condition").length} điều kiện
        </span>
      </div>
      <p className="hint">
        Kéo hoặc bấm đại lượng bên trái, rồi ghép bằng toán tử và dấu ngoặc. Bấm
        một điều kiện để chỉnh.
      </p>
      <div
        className="formula-toolbar"
        role="group"
        aria-label="Chèn toán tử và dấu ngoặc"
      >
        {(["and", "or", "open", "close"] as const).map((kind) => (
          <Button
            key={kind}
            className={`formula-insert-${kind}`}
            aria-label={
              kind === "open"
                ? "Chèn dấu mở ngoặc"
                : kind === "close"
                  ? "Chèn dấu đóng ngoặc"
                  : `Chèn ${symbols[kind]}`
            }
            onClick={() => insert(kind)}
          >
            {symbols[kind]}
          </Button>
        ))}
        <span>Chèn tại vị trí {insertion + 1}</span>
      </div>
      <div
        className={`formula-canvas ${issue ? "formula-incomplete" : ""}`}
        role="group"
        aria-label="Công thức điều kiện"
        aria-describedby="formula-help"
        onKeyDown={(event) => {
          if (
            !event.ctrlKey &&
            !event.metaKey &&
            (event.key === "(" || event.key === ")")
          ) {
            event.preventDefault();
            insert(event.key === "(" ? "open" : "close");
          }
        }}
        onDragOver={(event) => {
          if (accepts(event)) event.preventDefault();
        }}
        onDrop={(event) => drop(event, insertion)}
      >
        <span className="formula-equals" aria-hidden="true">
          =
        </span>
        {tokens.map((token, index) => {
          const percentagePoints =
            token.kind === "condition" &&
            token.condition.left.kind === "change" &&
            token.condition.left.measure === "absolute";
          const isParen = token.kind === "open" || token.kind === "close";
          const paired =
            activeParen === index ||
            (activeParen !== null && pairs.get(activeParen) === index);
          const label =
            token.kind === "condition"
              ? describe(token.condition)
              : symbols[token.kind];
          return (
            <Fragment key={token.id}>
              {gap(index)}
              <div
                className={`formula-token token-${token.kind} ${isParen && paired ? "paren-paired" : ""} ${issue?.index === index ? "token-error" : ""}`}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(tokenDragType, token.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onMouseEnter={() => setActiveParen(isParen ? index : null)}
                onMouseLeave={() => setActiveParen(null)}
              >
                <button
                  type="button"
                  className="formula-token-main"
                  aria-label={
                    token.kind === "condition"
                      ? `Chỉnh điều kiện ${label}`
                      : `Thành phần ${index + 1}: ${label}`
                  }
                  title={
                    token.kind === "condition"
                      ? `Bấm để chỉnh: ${label}`
                      : isParen
                        ? "Dấu ngoặc · Kéo để di chuyển"
                        : "Bấm để đổi VÀ / HOẶC"
                  }
                  onFocus={() => setActiveParen(isParen ? index : null)}
                  onBlur={() => setActiveParen(null)}
                  onClick={() => {
                    onCursor(index + 1);
                    if (token.kind === "condition") onEdit(index);
                    else if (!isParen)
                      onChange(
                        tokens.map((t, i) =>
                          i === index
                            ? {
                                ...token,
                                kind: token.kind === "and" ? "or" : "and",
                              }
                            : t,
                        ),
                      );
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Delete" || event.key === "Backspace") {
                      event.preventDefault();
                      event.stopPropagation();
                      remove(index);
                    }
                    if (
                      event.altKey &&
                      (event.key === "ArrowLeft" || event.key === "ArrowRight")
                    ) {
                      event.preventDefault();
                      const to =
                        event.key === "ArrowLeft" ? index - 1 : index + 2;
                      onChange(moveFormulaToken(tokens, index, to));
                      onCursor(Math.max(0, Math.min(tokens.length, to)));
                    }
                  }}
                >
                  {token.kind === "condition" ? (
                    <>
                      <b>
                        {exprLabel(
                          token.condition.left.kind === "change"
                            ? { kind: "metric", id: token.condition.left.id }
                            : token.condition.left,
                        )}
                      </b>
                      <span>
                        {token.condition.left.kind === "change" &&
                          `${token.condition.left.direction === "increase" ? "Tăng" : "Giảm"} `}
                        {opSymbols[token.condition.op]}
                        {!["exists", "missing"].includes(token.condition.op) &&
                          ` ${valueLabel(token.condition.right, percentagePoints)}`}
                        {token.condition.extra &&
                          ` đến ${valueLabel(token.condition.extra, percentagePoints)}`}
                      </span>
                      {token.condition.left.kind === "change" && (
                        <span>
                          so với{" "}
                          {changePeriods[
                            token.condition.left.period
                          ].toLowerCase()}
                        </span>
                      )}
                    </>
                  ) : (
                    symbols[token.kind]
                  )}
                </button>
                <button
                  type="button"
                  className="formula-token-remove"
                  aria-label={`Xóa thành phần ${index + 1}: ${label}`}
                  onClick={() => remove(index)}
                >
                  <Dismiss16Regular />
                </button>
              </div>
            </Fragment>
          );
        })}
        {gap(tokens.length)}
        {!tokens.length && (
          <span className="formula-placeholder">
            Thả đại lượng đầu tiên vào đây
          </span>
        )}
      </div>
      <div
        className={`formula-status ${issue ? "incomplete" : "valid"}`}
        role="status"
        aria-label="Trạng thái công thức"
      >
        <span className="status-dot" />
        {issue
          ? "Công thức chưa hoàn chỉnh"
          : "Công thức hợp lệ · Đã cập nhật điều kiện"}
      </div>
      {issue && tokens.length > 0 && (
        <Notice error>
          <button
            className="formula-error-link"
            onClick={() => onCursor(issue.index)}
          >
            Vị trí {issue.index + 1}: {issue.error}
          </button>
          <p>
            Hoàn thiện công thức để xem thử, chuyển sang cơ bản hoặc tiếp tục.
            Bản nháp vẫn được lưu.
          </p>
        </Notice>
      )}
      <p className="hint" id="formula-help">
        Ngoặc được tính trước, sau đó VÀ, rồi HOẶC. Bấm dấu + giữa các khối để
        chọn vị trí chèn. Kéo khối hoặc dùng Alt + ← / → để di chuyển.
      </p>
      {issue && (
        <Button
          size="small"
          appearance="subtle"
          icon={<ArrowUndo20Regular />}
          onClick={onRestore}
        >
          Khôi phục công thức hợp lệ gần nhất
        </Button>
      )}
    </section>
  );
}
