import { useState } from "react";
import { Dropdown, Option } from "@fluentui/react-components";
import {
  Add20Regular,
  Delete20Regular,
  Copy20Regular,
  Search20Regular,
  Play20Regular,
  BranchFork20Regular,
} from "@fluentui/react-icons";
import { useStore } from "./store";
import {
  type Config,
  type Condition,
  type Expr,
  type Customer,
  metrics,
  rule,
  uid,
  copy,
  ops,
  describe,
  evaluate,
  subjects,
  exprLabel,
  money,
  defaultCondition,
  normalize,
  validateCondition,
  changePeriods,
  type ChangePeriod,
} from "./domain";
import { FormulaEditor, metricDragType } from "./formula-editor";
import { groupLabel } from "./taxonomy";
import {
  conditionTokens,
  parseFormula,
  type FormulaToken,
  type RuleCondition,
} from "./formula";
import {
  Button,
  Input,
  Select,
  Choice,
  Panel,
  Badge,
  Modal,
  Notice,
} from "./ui";
export function Expression({
  expr,
  onChange,
  label,
  level = 0,
}: {
  expr: Expr;
  onChange: (v: Expr) => void;
  label: string;
  level?: number;
}) {
  return (
    <div
      className={`expression ${expr.kind === "math" ? "expression-math" : ""}`}
    >
      <Select
        className={label === "Vế trái" ? "condition-kind" : undefined}
        aria-label={
          label === "Vế trái" ? "Loại điều kiện" : `${label} loại giá trị`
        }
        value={expr.kind}
        onChange={(_, d) =>
          onChange(
            d.value === "metric"
              ? {
                  kind: "metric",
                  id: expr.kind === "change" ? expr.id : "equity.availableCash",
                }
              : d.value === "change"
                ? {
                    kind: "change",
                    id:
                      (expr.kind === "metric" || expr.kind === "change") &&
                      metrics.some(
                        (m) => m.id === expr.id && m.type === "number",
                      )
                        ? expr.id
                        : "equity.cash",
                    direction: "increase",
                    measure: "percent",
                    period: "1d",
                  }
                : d.value === "literal"
                  ? { kind: "literal", value: 0, unit: "VND" }
                  : {
                      kind: "math",
                      op: "sub",
                      left: { kind: "metric", id: "equity.cash" },
                      right: { kind: "metric", id: "debt.principal" },
                    },
          )
        }
      >
        <option value="metric">
          {label === "Vế trái" ? "Giá trị hiện tại" : "Đại lượng"}
        </option>
        {(label === "Vế trái" || expr.kind === "change") && (
          <option value="change">Biến động tăng/giảm</option>
        )}
        <option value="literal">Giá trị</option>
        {level < 2 && <option value="math">Phép tính</option>}
      </Select>
      {expr.kind === "metric" || expr.kind === "change" ? (
        <>
          <Dropdown
            className="metric-picker"
            aria-label={label}
            value={metrics.find((m) => m.id === expr.id)?.label || expr.id}
            selectedOptions={[expr.id]}
            onOptionSelect={(_, d) =>
              d.optionValue && onChange({ ...expr, id: d.optionValue })
            }
          >
            {metrics
              .filter((m) => expr.kind !== "change" || m.type === "number")
              .map((m) => (
                <Option key={m.id} value={m.id} text={m.label}>
                  {m.label}
                </Option>
              ))}
          </Dropdown>
          {expr.kind === "change" && (
            <div className="change-settings">
              <Choice
                label="Chiều biến động"
                value={expr.direction}
                onChange={(value) =>
                  onChange({
                    ...expr,
                    direction: value as "increase" | "decrease",
                  })
                }
                options={[
                  ["increase", "Tăng"],
                  ["decrease", "Giảm"],
                ]}
              />
              <Choice
                label="Cách đo biến động"
                value={expr.measure}
                onChange={(value) =>
                  onChange({
                    ...expr,
                    measure: value as "absolute" | "percent",
                  })
                }
                options={[
                  ["percent", "Theo phần trăm (%)"],
                  ["absolute", "Theo số tuyệt đối"],
                ]}
              />
              <Choice
                label="Mốc so sánh"
                value={expr.period}
                onChange={(value) =>
                  onChange({ ...expr, period: value as ChangePeriod })
                }
                options={Object.entries(changePeriods)}
              />
              <p className="hint">
                {expr.measure === "percent"
                  ? "Tỷ lệ = mức chênh lệch theo chiều đã chọn / trị tuyệt đối giá trị gốc × 100%. Giá trị gốc bằng 0 hoặc thiếu dữ liệu sẽ được báo riêng."
                  : "So sánh mức chênh lệch theo chiều đã chọn, cùng đơn vị với đại lượng. Đại lượng tỷ lệ được tính bằng điểm phần trăm."}{" "}
                Chỉ thỏa khi giá trị thực sự{" "}
                {expr.direction === "increase" ? "tăng" : "giảm"}.
              </p>
            </div>
          )}
        </>
      ) : expr.kind === "literal" ? (
        <>
          <Input
            aria-label={label}
            type={typeof expr.value === "number" ? "number" : "text"}
            value={String(expr.value ?? "")}
            onChange={(_, d) =>
              onChange({
                ...expr,
                value:
                  typeof expr.value === "number"
                    ? Number(d.value)
                    : typeof expr.value === "boolean"
                      ? d.value === "true"
                      : d.value,
              })
            }
          />
          <Select
            className="expression-unit"
            aria-label={`${label} đơn vị`}
            value={expr.unit}
            onChange={(_, d) => onChange({ ...expr, unit: d.value })}
          >
            {["VND", "PERCENT", "DAYS", "COUNT", "NONE"].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </>
      ) : (
        <div className="math-content">
          <Select
            aria-label="Phép tính"
            value={expr.op}
            onChange={(_, d) => onChange({ ...expr, op: d.value })}
          >
            {[
              ["add", "Cộng (+)"],
              ["sub", "Trừ (−)"],
              ["mul", "Nhân (×)"],
              ["div", "Chia (÷)"],
              ["ratio", "Tính tỷ lệ (%)"],
              ["daysSince", "Số ngày kể từ"],
            ].map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </Select>
          <Expression
            label={`${label} A`}
            expr={expr.left}
            onChange={(left) => onChange({ ...expr, left })}
            level={level + 1}
          />
          {expr.op !== "daysSince" && (
            <Expression
              label={`${label} B`}
              expr={expr.right}
              onChange={(right) => onChange({ ...expr, right })}
              level={level + 1}
            />
          )}
        </div>
      )}
    </div>
  );
}
function duplicateCondition(node: Condition): Condition {
  const cloned = { ...copy(node), id: uid(node.kind === "group" ? "g" : "c") };
  return cloned.kind === "group"
    ? { ...cloned, children: cloned.children.map(duplicateCondition) }
    : cloned;
}
function ConditionTree({
  node,
  onChange,
  onRemove,
  depth = 1,
  onSelect,
  selected,
}: {
  node: Condition;
  onChange: (v: Condition) => void;
  onRemove?: () => void;
  depth?: number;
  onSelect: (id: string) => void;
  selected: string;
}) {
  if (node.kind === "group")
    return (
      <div
        className={`condition-group ${selected === node.id ? "group-selected" : ""}`}
      >
        <div className="group-header">
          <span className="group-connector">
            <BranchFork20Regular />
          </span>
          <Select
            aria-label={`Kết hợp nhóm cấp ${depth}`}
            value={node.op}
            onChange={(_, d) =>
              onChange({ ...node, op: d.value as "all" | "any" })
            }
          >
            <option value="all">TẤT CẢ điều kiện (VÀ)</option>
            <option value="any">ÍT NHẤT MỘT (HOẶC)</option>
          </Select>
          <Button
            size="small"
            appearance={selected === node.id ? "primary" : "subtle"}
            onClick={() => onSelect(node.id)}
          >
            Chọn nhóm
          </Button>
          {onRemove && (
            <Button
              icon={<Delete20Regular />}
              appearance="subtle"
              aria-label="Xóa nhóm"
              onClick={onRemove}
            />
          )}
        </div>
        <div className="group-children">
          {node.children.map((child, i) => (
            <ConditionTree
              key={child.id}
              node={child}
              depth={child.kind === "group" ? depth + 1 : depth}
              selected={selected}
              onSelect={onSelect}
              onChange={(v) =>
                onChange({
                  ...node,
                  children: node.children.map((x, j) => (j === i ? v : x)),
                })
              }
              onRemove={() =>
                onChange({
                  ...node,
                  children: node.children.filter((x) => x.id !== child.id),
                })
              }
            />
          ))}
          {!node.children.length && (
            <div className="condition-empty">
              Chọn đại lượng từ thư viện bên trái
              <br />
              <small>hoặc thêm điều kiện để bắt đầu</small>
            </div>
          )}
        </div>
        <div className="group-buttons">
          <Button
            size="small"
            appearance="subtle"
            icon={<Add20Regular />}
            onClick={() =>
              onChange({ ...node, children: [...node.children, rule()] })
            }
          >
            Điều kiện
          </Button>
          <Button
            size="small"
            appearance="subtle"
            icon={<BranchFork20Regular />}
            onClick={() => {
              const g: Condition = {
                id: uid("g"),
                kind: "group",
                op: "any",
                children: [rule()],
              };
              onChange({ ...node, children: [...node.children, g] });
              onSelect(g.id);
            }}
          >
            Nhóm điều kiện
          </Button>
          {onRemove && (
            <Button
              size="small"
              appearance="subtle"
              icon={<Copy20Regular />}
              onClick={() =>
                onChange({
                  ...node,
                  children: [
                    ...node.children,
                    ...node.children.map(duplicateCondition),
                  ],
                })
              }
            >
              Nhân bản nhánh
            </Button>
          )}
        </div>
      </div>
    );
  const m =
    node.left.kind === "metric" || node.left.kind === "change"
      ? metrics.find((m) => m.id === (node.left as { id: string }).id)
      : undefined;
  return (
    <div className="condition-row">
      <div className="condition-row-top">
        <span>
          {m?.group || "Biểu thức"}{" "}
          <small>
            {m?.unit === "VND" ? "· VND" : m?.unit === "DAYS" ? "· Ngày" : ""}
          </small>
        </span>
        {onRemove && (
          <Button
            size="small"
            appearance="subtle"
            icon={<Delete20Regular />}
            aria-label={`Xóa điều kiện ${exprLabel(node.left)}`}
            onClick={onRemove}
          />
        )}
      </div>
      <Expression
        expr={node.left}
        label="Vế trái"
        onChange={(left) => {
          const metric =
            left.kind === "metric" || left.kind === "change"
              ? metrics.find((m) => m.id === left.id)
              : undefined;
          if (left.kind === "change") {
            const unit =
              left.measure === "percent" ? "PERCENT" : metric?.unit || "NONE";
            const preserve =
              node.left.kind === "change" &&
              node.left.id === left.id &&
              node.left.measure === left.measure;
            onChange({
              ...node,
              left,
              op: ["gte", "gt", "lte", "lt", "eq", "between"].includes(node.op)
                ? node.op
                : "gte",
              right: preserve
                ? node.right
                : {
                    kind: "literal",
                    value: left.measure === "percent" ? 10 : 0,
                    unit,
                  },
              extra:
                node.op === "between"
                  ? preserve
                    ? node.extra
                    : {
                        kind: "literal",
                        value: left.measure === "percent" ? 20 : 500000000,
                        unit,
                      }
                  : undefined,
            });
            return;
          }
          onChange({
            ...node,
            left,
            right: metric
              ? {
                  kind: "literal",
                  value:
                    metric.type === "boolean"
                      ? true
                      : metric.type === "number"
                        ? 0
                        : metric.type === "date"
                          ? "2026-09-01T00:00:00+07:00"
                          : "Priority",
                  unit: metric.unit,
                }
              : node.right,
          });
        }}
      />
      <div className="rule-comparison">
        <Select
          aria-label="Toán tử so sánh"
          value={node.op}
          onChange={(_, d) =>
            onChange({
              ...node,
              op: d.value,
              extra:
                d.value === "between"
                  ? {
                      kind: "literal",
                      value:
                        node.left.kind === "change" &&
                        node.left.measure === "percent"
                          ? 20
                          : 500000000,
                      unit:
                        node.left.kind === "change" &&
                        node.left.measure === "percent"
                          ? "PERCENT"
                          : m?.unit || "VND",
                    }
                  : undefined,
            })
          }
        >
          {Object.entries(ops)
            .filter(
              ([id]) =>
                node.left.kind !== "change" ||
                ["gte", "gt", "lte", "lt", "eq", "between"].includes(id),
            )
            .map(([id, t]) => (
              <option key={id} value={id}>
                {t}
              </option>
            ))}
        </Select>
        {!["exists", "missing"].includes(node.op) &&
          (node.left.kind === "change" && node.right.kind === "literal" ? (
            <Input
              aria-label="Ngưỡng biến động"
              type="number"
              min={0}
              value={node.right.value === null ? "" : String(node.right.value)}
              contentAfter={
                node.left.measure === "percent"
                  ? "%"
                  : m?.unit === "PERCENT"
                    ? "điểm %"
                    : m?.unit
              }
              onChange={(_, data) =>
                onChange({
                  ...node,
                  right: {
                    kind: "literal",
                    value: data.value === "" ? null : Number(data.value),
                    unit:
                      node.left.kind === "change" &&
                      node.left.measure === "percent"
                        ? "PERCENT"
                        : m?.unit || "NONE",
                  },
                })
              }
            />
          ) : m?.type === "boolean" && node.right.kind === "literal" ? (
            <Select
              aria-label="Giá trị điều kiện"
              value={String(node.right.value)}
              onChange={(_, d) =>
                onChange({
                  ...node,
                  right: {
                    kind: "literal",
                    value: d.value === "true",
                    unit: "NONE",
                  },
                })
              }
            >
              <option value="true">Đúng</option>
              <option value="false">Sai</option>
            </Select>
          ) : (
            <Expression
              expr={node.right}
              label="Giá trị điều kiện"
              onChange={(right) => onChange({ ...node, right })}
            />
          ))}
      </div>
      {node.extra &&
        (node.left.kind === "change" && node.extra.kind === "literal" ? (
          <Input
            aria-label="Ngưỡng trên"
            type="number"
            min={0}
            value={node.extra.value === null ? "" : String(node.extra.value)}
            contentAfter={
              node.left.measure === "percent"
                ? "%"
                : m?.unit === "PERCENT"
                  ? "điểm %"
                  : m?.unit
            }
            onChange={(_, data) =>
              onChange({
                ...node,
                extra: {
                  kind: "literal",
                  value: data.value === "" ? null : Number(data.value),
                  unit:
                    node.left.kind === "change" &&
                    node.left.measure === "percent"
                      ? "PERCENT"
                      : m?.unit || "NONE",
                },
              })
            }
          />
        ) : (
          <Expression
            expr={node.extra}
            label="Ngưỡng trên"
            onChange={(extra) => onChange({ ...node, extra })}
          />
        ))}
    </div>
  );
}
export function Trace({
  node,
  customer,
  now,
}: {
  node: Condition;
  customer: Customer;
  now: string;
}) {
  const r = evaluate(node, customer.values, now);
  return (
    <div className="trace-node">
      <div>
        <Badge value={r.verdict} />
        <b>
          {node.kind === "group"
            ? node.op === "all"
              ? "Tất cả điều kiện"
              : "Ít nhất một điều kiện"
            : exprLabel(node.left)}
        </b>
      </div>
      {node.kind === "group" ? (
        node.children.map((c) => (
          <Trace key={c.id} node={c} customer={customer} now={now} />
        ))
      ) : (
        <p>{r.reason}</p>
      )}
    </div>
  );
}
export function Conditions({
  config,
  onChange,
}: {
  config: Config;
  onChange: (v: Config) => void;
}) {
  const { state } = useStore();
  const advanced = config.conditionMode === "advanced";
  const tokens = config.conditionFormula ?? conditionTokens(config.condition);
  const formulaResult = parseFormula(tokens);
  const formulaInvalid =
    advanced &&
    (!!formulaResult.error ||
      !!(
        formulaResult.condition &&
        validateCondition(formulaResult.condition).length
      ));
  const pristineEmpty =
    tokens.length === 0 &&
    config.condition.kind === "group" &&
    config.condition.children.length === 0;
  const [cursor, setCursor] = useState(tokens.length);
  const [editing, setEditing] = useState<{
    condition: RuleCondition;
    index: number;
    isNew: boolean;
  } | null>(null);
  const [search, setSearch] = useState(""),
    [group, setGroup] = useState("Cổ phiếu"),
    [selected, setSelected] = useState(config.condition.id);
  const [result, setResult] = useState<
      { customer: Customer; verdict: string }[] | null
    >(null),
    [snapshot, setSnapshot] = useState(""),
    [customer, setCustomer] = useState<Customer | null>(null),
    [resultFilter, setResultFilter] = useState("all"),
    [customerSearch, setCustomerSearch] = useState("");
  function hasGroup(node: Condition, id: string): boolean {
    return (
      node.kind === "group" &&
      (node.id === id || node.children.some((c) => hasGroup(c, id)))
    );
  }
  function append(node: Condition, newNode: Condition): Condition {
    if (node.kind !== "group") return node;
    if (
      node.id ===
      (hasGroup(config.condition, selected) ? selected : config.condition.id)
    )
      return { ...node, children: [...node.children, newNode] };
    return { ...node, children: node.children.map((c) => append(c, newNode)) };
  }
  function updateFormula(next: FormulaToken[]) {
    const parsed = parseFormula(next);
    onChange({
      ...config,
      conditionMode: "advanced",
      conditionFormula: next,
      condition:
        parsed.condition && !validateCondition(parsed.condition).length
          ? parsed.condition
          : config.condition,
    });
  }
  function addMetric(id: string, position = cursor) {
    const metric = metrics.find((m) => m.id === id);
    if (!metric) return;
    const added = rule(
      id,
      metric.type === "boolean"
        ? true
        : metric.type === "number"
          ? 0
          : metric.type === "date"
            ? "2026-09-01T00:00:00+07:00"
            : "Priority",
    );
    if (advanced && added.kind === "rule") {
      setEditing({
        condition: added,
        index: Math.min(position, tokens.length),
        isNew: true,
      });
    } else {
      onChange({
        ...config,
        condition:
          config.condition.kind === "group"
            ? append(config.condition, added)
            : {
                id: uid("g"),
                kind: "group",
                op: "all",
                children: [config.condition, added],
              },
      });
    }
  }
  const counts = (v: string) =>
    result?.filter((x) => x.verdict === v).length || 0;
  return (
    <div className="condition-workshop">
      <Panel
        title="Thư viện đại lượng"
        sub={
          advanced
            ? "Kéo vào công thức hoặc bấm để thêm"
            : `${metrics.length} đại lượng · 8 nhóm`
        }
        className="metric-library"
      >
        <Input
          contentBefore={<Search20Regular />}
          aria-label="Tìm đại lượng"
          placeholder="Tìm đại lượng…"
          value={search}
          onChange={(_, d) => setSearch(d.value)}
        />
        <div className="metric-groups">
          {[...new Set(metrics.map((m) => m.group))].map((g) => (
            <button
              key={g}
              className={g === group ? "selected" : ""}
              onClick={() => setGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="metric-items">
          {metrics
            .filter((m) =>
              search
                ? normalize(m.label).includes(normalize(search))
                : m.group === group,
            )
            .map((m) => (
              <button
                title={m.definition}
                key={m.id}
                draggable={advanced}
                onDragStart={(event) => {
                  event.dataTransfer.setData(metricDragType, m.id);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => addMetric(m.id)}
              >
                <span>
                  {m.label}
                  <small>{m.unit === "NONE" ? m.type : m.unit}</small>
                </span>
                <Add20Regular />
              </button>
            ))}
          {search &&
            !metrics.some((m) =>
              normalize(m.label).includes(normalize(search)),
            ) && <p className="hint">Không tìm thấy đại lượng phù hợp.</p>}
        </div>
      </Panel>
      <div className="formula-panel">
        <div className="formula-top">
          <Choice
            label="Cấp đối tượng xét điều kiện"
            value={config.scope}
            onChange={(v) =>
              onChange({ ...config, scope: v as Config["scope"] })
            }
            options={[
              ["customer", "Khách hàng"],
              ["account", "Tài khoản"],
            ]}
          />
          <Button
            appearance="subtle"
            size="small"
            onClick={() => {
              const c = defaultCondition();
              const nextTokens = conditionTokens(c);
              onChange({
                ...config,
                condition: c,
                conditionFormula: advanced ? nextTokens : undefined,
              });
              setSelected(c.id);
              setCursor(nextTokens.length);
            }}
          >
            Dùng công thức trình diễn
          </Button>
        </div>
        <div
          className="condition-mode-switch"
          role="group"
          aria-label="Chế độ thiết lập điều kiện"
        >
          <Button
            appearance={!advanced ? "primary" : "subtle"}
            aria-pressed={!advanced}
            disabled={!!formulaInvalid && !pristineEmpty}
            title={
              formulaInvalid
                ? "Hoàn thiện công thức trước khi chuyển chế độ"
                : undefined
            }
            onClick={() => {
              onChange({
                ...config,
                conditionMode: "basic",
                conditionFormula: undefined,
              });
              setSelected(config.condition.id);
            }}
          >
            Cơ bản
          </Button>
          <Button
            appearance={advanced ? "primary" : "subtle"}
            aria-pressed={advanced}
            onClick={() => {
              if (advanced) return;
              const next = conditionTokens(config.condition);
              onChange({
                ...config,
                conditionMode: "advanced",
                conditionFormula: next,
              });
              setCursor(next.length);
            }}
          >
            Nâng cao
          </Button>
        </div>
        {advanced ? (
          <FormulaEditor
            tokens={tokens}
            cursor={cursor}
            onCursor={setCursor}
            onChange={updateFormula}
            onAddMetric={addMetric}
            onEdit={(index) => {
              const token = tokens[index];
              if (token.kind === "condition")
                setEditing({
                  condition: copy(token.condition),
                  index,
                  isNew: false,
                });
            }}
            onRestore={() => {
              const next = conditionTokens(config.condition);
              updateFormula(next);
              setCursor(next.length);
            }}
          />
        ) : (
          <>
            <ConditionTree
              node={config.condition}
              selected={selected}
              onSelect={setSelected}
              onChange={(condition) => onChange({ ...config, condition })}
            />
            <p className="hint">
              Chọn một nhóm để thêm đại lượng vào đúng nhánh. Dùng chế độ nâng
              cao để lắp ghép bằng VÀ, HOẶC và dấu ngoặc.
            </p>
          </>
        )}
      </div>
      <Panel title="Diễn giải & xem thử" className="preview-panel">
        <span className="eyebrow">ĐỐI TƯỢNG CẦN TÌM</span>
        {formulaInvalid ? (
          <Notice>
            Hoàn thiện công thức bên cạnh để cập nhật diễn giải và xem thử.
          </Notice>
        ) : (
          <p className="formula-prose">{describe(config.condition)}</p>
        )}
        <div className="preview-divider" />
        <p className="hint">
          Dữ liệu mẫu ·{" "}
          {subjects(state, config.scope, config.customerGroup).length}{" "}
          {config.scope === "customer" ? "khách hàng" : "tài khoản"} ·{" "}
          {groupLabel(config.customerGroup)}
        </p>
        <Button
          appearance="primary"
          icon={<Play20Regular />}
          disabled={!!formulaInvalid}
          onClick={() => {
            setResult(
              subjects(state, config.scope, config.customerGroup).map((c) => ({
                customer: c,
                verdict: evaluate(config.condition, c.values, state.now)
                  .verdict,
              })),
            );
            setSnapshot(
              JSON.stringify({
                condition: config.condition,
                scope: config.scope,
                customerGroup: config.customerGroup,
              }),
            );
          }}
        >
          Xem thử đối tượng
        </Button>
        {result && !formulaInvalid && (
          <>
            {snapshot !==
              JSON.stringify({
                condition: config.condition,
                scope: config.scope,
                customerGroup: config.customerGroup,
              }) && (
              <Notice>Kết quả cần cập nhật sau khi sửa công thức.</Notice>
            )}
            <div className="preview-counts">
              {[
                ["match", "Thỏa"],
                ["no_match", "Không thỏa"],
                ["unknown", "Thiếu dữ liệu"],
              ].map(([id, t]) => (
                <button
                  key={id}
                  className={id}
                  onClick={() =>
                    setResultFilter(resultFilter === id ? "all" : id)
                  }
                  aria-pressed={resultFilter === id}
                >
                  <strong>{counts(id)}</strong>
                  <small>{t}</small>
                </button>
              ))}
            </div>
            <Choice
              label="Lọc kết quả xem thử"
              value={resultFilter}
              onChange={setResultFilter}
              options={[
                ["all", "Tất cả kết quả"],
                ["match", "Thỏa điều kiện"],
                ["no_match", "Không thỏa"],
                ["unknown", "Thiếu dữ liệu"],
              ]}
            />
            <Input
              aria-label="Tìm khách hàng mẫu"
              placeholder="Mã hoặc tên khách hàng…"
              value={customerSearch}
              onChange={(_, d) => setCustomerSearch(d.value)}
            />
            <div className="preview-customers">
              {[...result]
                .filter(
                  (r) =>
                    (resultFilter === "all" || r.verdict === resultFilter) &&
                    normalize(r.customer.id + " " + r.customer.name).includes(
                      normalize(customerSearch),
                    ),
                )
                .sort(
                  (a, b) =>
                    ({ match: 0, unknown: 1, no_match: 2 })[
                      a.verdict as "match"
                    ] -
                    { match: 0, unknown: 1, no_match: 2 }[b.verdict as "match"],
                )
                .slice(0, 30)
                .map((r) => (
                  <button
                    key={r.customer.id}
                    onClick={() => setCustomer(r.customer)}
                  >
                    <span className="customer-initial">
                      {r.customer.id.slice(-2)}
                    </span>
                    <span>
                      <b>{r.customer.name}</b>
                      <small>
                        {r.customer.id} ·{" "}
                        {money(r.customer.values["equity.availableCash"])}
                      </small>
                    </span>
                    <span className={`verdict-dot ${r.verdict}`} />
                  </button>
                ))}
            </div>
            <p className="hint">
              Hiển thị 30 đối tượng đầu, ưu tiên thỏa và thiếu dữ liệu.
            </p>
          </>
        )}
      </Panel>
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.isNew ? "Thiết lập điều kiện" : "Chỉnh sửa điều kiện"}
        actions={
          <>
            <Button onClick={() => setEditing(null)}>Hủy</Button>
            <Button
              appearance="primary"
              disabled={
                !editing || !!validateCondition(editing.condition).length
              }
              onClick={() => {
                if (!editing || validateCondition(editing.condition).length)
                  return;
                const next = [...tokens];
                const token: FormulaToken = {
                  id: editing.condition.id,
                  kind: "condition",
                  condition: editing.condition,
                };
                next.splice(editing.index, editing.isNew ? 0 : 1, token);
                updateFormula(next);
                setCursor(editing.index + 1);
                setEditing(null);
              }}
            >
              {editing?.isNew ? "Thêm vào công thức" : "Cập nhật điều kiện"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="formula-condition-dialog">
            <p className="hint">
              Thiết lập phép so sánh cho đại lượng này. Điều kiện sẽ xuất hiện
              dưới dạng một khối thu gọn trong công thức.
            </p>
            <ConditionTree
              node={editing.condition}
              selected=""
              onSelect={() => {}}
              onChange={(condition) => {
                if (condition.kind === "rule")
                  setEditing({ ...editing, condition });
              }}
            />
            {!!validateCondition(editing.condition).length && (
              <Notice error>
                {validateCondition(editing.condition).join(". ")}
              </Notice>
            )}
          </div>
        )}
      </Modal>
      <Modal
        open={!!customer}
        onClose={() => setCustomer(null)}
        title={
          customer
            ? `${customer.name} · ${customer.id}`
            : "Giải thích điều kiện"
        }
        wide
      >
        {customer && (
          <>
            <Notice>
              Giải thích theo công thức hiện tại. Dữ liệu giả lập tại mốc demo.
            </Notice>
            <Trace
              node={config.condition}
              customer={customer}
              now={state.now}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
