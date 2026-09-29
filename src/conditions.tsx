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
} from "./domain";
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
        aria-label={`${label} loại giá trị`}
        value={expr.kind}
        onChange={(_, d) =>
          onChange(
            d.value === "metric"
              ? { kind: "metric", id: "equity.availableCash" }
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
        <option value="metric">Đại lượng</option>
        <option value="literal">Giá trị</option>
        {level < 2 && <option value="math">Phép tính</option>}
      </Select>
      {expr.kind === "metric" ? (
        <Dropdown
          className="metric-picker"
          aria-label={label}
          value={metrics.find((m) => m.id === expr.id)?.label || expr.id}
          selectedOptions={[expr.id]}
          onOptionSelect={(_, d) =>
            d.optionValue && onChange({ ...expr, id: d.optionValue })
          }
        >
          {metrics.map((m) => (
            <Option key={m.id} value={m.id} text={m.label}>
              {m.label}
            </Option>
          ))}
        </Dropdown>
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
          {depth < 3 && (
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
          )}
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
                    ...node.children.map((c) => ({ ...copy(c), id: uid("c") })),
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
    node.left.kind === "metric"
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
        <Button
          size="small"
          appearance="subtle"
          icon={<Delete20Regular />}
          aria-label={`Xóa điều kiện ${exprLabel(node.left)}`}
          onClick={onRemove}
        />
      </div>
      <Expression
        expr={node.left}
        label="Vế trái"
        onChange={(left) => {
          const metric =
            left.kind === "metric"
              ? metrics.find((m) => m.id === left.id)
              : undefined;
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
                      value: 500000000,
                      unit: m?.unit || "VND",
                    }
                  : undefined,
            })
          }
        >
          {Object.entries(ops).map(([id, t]) => (
            <option key={id} value={id}>
              {t}
            </option>
          ))}
        </Select>
        {!["exists", "missing"].includes(node.op) &&
          (m?.type === "boolean" && node.right.kind === "literal" ? (
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
      {node.extra && (
        <Expression
          expr={node.extra}
          label="Ngưỡng trên"
          onChange={(extra) => onChange({ ...node, extra })}
        />
      )}
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
  const counts = (v: string) =>
    result?.filter((x) => x.verdict === v).length || 0;
  return (
    <div className="condition-workshop">
      <Panel
        title="Thư viện đại lượng"
        sub={`${metrics.length} đại lượng · 8 nhóm`}
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
                onClick={() => {
                  const added = rule(
                    m.id,
                    m.type === "boolean"
                      ? true
                      : m.type === "number"
                        ? 0
                        : m.type === "date"
                          ? "2026-09-01T00:00:00+07:00"
                          : "Priority",
                  );
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
                }}
              >
                <span>
                  {m.label}
                  <small>{m.unit === "NONE" ? m.type : m.unit}</small>
                </span>
                <Add20Regular />
              </button>
            ))}
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
              onChange({ ...config, condition: c });
              setSelected(c.id);
            }}
          >
            Dùng công thức trình diễn
          </Button>
        </div>
        <ConditionTree
          node={config.condition}
          selected={selected}
          onSelect={setSelected}
          onChange={(condition) => onChange({ ...config, condition })}
        />
        <p className="hint">
          Chọn một nhóm để thêm đại lượng vào đúng nhánh. Tối đa 3 cấp nhóm.
        </p>
      </div>
      <Panel title="Diễn giải & xem thử" className="preview-panel">
        <span className="eyebrow">ĐỐI TƯỢNG CẦN TÌM</span>
        <p className="formula-prose">{describe(config.condition)}</p>
        <div className="preview-divider" />
        <p className="hint">
          Dữ liệu mẫu ·{" "}
          {config.scope === "customer" ? "120 khách hàng" : "132 tài khoản"}
        </p>
        <Button
          appearance="primary"
          icon={<Play20Regular />}
          onClick={() => {
            setResult(
              subjects(state, config.scope).map((c) => ({
                customer: c,
                verdict: evaluate(config.condition, c.values, state.now)
                  .verdict,
              })),
            );
            setSnapshot(
              JSON.stringify({
                condition: config.condition,
                scope: config.scope,
              }),
            );
          }}
        >
          Xem thử đối tượng
        </Button>
        {result && (
          <>
            {snapshot !==
              JSON.stringify({
                condition: config.condition,
                scope: config.scope,
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
