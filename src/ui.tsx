import { useState, type ReactNode } from "react";
import {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogTrigger,
} from "@fluentui/react-components";
import {
  Add20Regular,
  ArrowRight20Regular,
  Dismiss20Regular,
  CheckmarkCircle20Regular,
  Warning20Regular,
} from "@fluentui/react-icons";
import { Link } from "react-router";
import { statusLabels } from "./domain";
export {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Add20Regular,
  ArrowRight20Regular,
};
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Text({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  hint,
  disabled = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "date" | "datetime-local" | "time";
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <Input
        aria-label={label}
        type={type}
        value={String(value)}
        placeholder={placeholder}
        onChange={(_, d) => onChange(d.value)}
        disabled={disabled}
      />
    </Field>
  );
}
export function Choice({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | [string, string])[];
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Select
        aria-label={label}
        value={value}
        onChange={(_, d) => onChange(d.value)}
      >
        {options.map((o) => {
          const [v, t] = Array.isArray(o) ? o : [o, o];
          return (
            <option key={v} value={v}>
              {t}
            </option>
          );
        })}
      </Select>
    </Field>
  );
}
export function Area({
  label,
  value,
  onChange,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <Textarea
        aria-label={label}
        value={value}
        onChange={(_, d) => onChange(d.value)}
        rows={rows}
      />
    </Field>
  );
}
export function Checks({
  label,
  values,
  onChange,
  options,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  options: (string | [string, string])[];
}) {
  return (
    <fieldset className="check-group">
      <legend>{label}</legend>
      {options.map((o) => {
        const [v, t] = Array.isArray(o) ? o : [o, o];
        return (
          <Checkbox
            key={v}
            label={t}
            checked={values.includes(v)}
            onChange={(_, d) =>
              onChange(
                d.checked ? [...values, v] : values.filter((x) => x !== v),
              )
            }
          />
        );
      })}
    </fieldset>
  );
}
export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`badge badge-${value}`}>
      <i />
      {label || statusLabels[value] || value}
    </span>
  );
}
export function Logo({
  dark = false,
  slogan = false,
}: {
  dark?: boolean;
  slogan?: boolean;
}) {
  return (
    <svg
      className={slogan ? "brand-slogan" : "brand-logo"}
      viewBox={
        slogan
          ? "200 220 2391 535"
          : dark
            ? "200 216 975 544"
            : "200 215 975 544"
      }
      role="img"
      aria-label={slogan ? "SHS — Kiến tạo Tài chính thịnh vượng" : "SHS"}
    >
      <image
        href={`/brand/shs-${slogan ? "slogan" : dark ? "dark" : "light"}.png`}
        width={slogan ? 2802 : 1367}
        height="975"
      />
    </svg>
  );
}
export function Header({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function Panel({
  title,
  sub,
  children,
  action,
  className = "",
}: {
  title?: string;
  sub?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-head">
          <div>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Empty({
  title = "Chưa có dữ liệu",
  sub = "Dữ liệu sẽ xuất hiện khi phát sinh hoạt động.",
  children,
}: {
  title?: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <CheckmarkCircle20Regular />
      <h3>{title}</h3>
      <p>{sub}</p>
      {children}
    </div>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  wide = false,
  drawer = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
  drawer?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(_, d) => {
        if (!d.open) onClose();
      }}
    >
      <DialogSurface
        className={drawer ? "review-drawer" : wide ? "modal-wide" : ""}
      >
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  icon={<Dismiss20Regular />}
                  aria-label="Đóng"
                />
              </DialogTrigger>
            }
          >
            {title}
          </DialogTitle>
          <DialogContent className="modal-content">{children}</DialogContent>
          <DialogActions>
            {actions || <Button onClick={onClose}>Đóng</Button>}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
export function Confirm({
  open,
  title,
  onClose,
  onConfirm,
  danger = false,
  children,
  requiredReason = false,
  code,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  danger?: boolean;
  children?: ReactNode;
  requiredReason?: boolean;
  code?: string;
}) {
  const [reason, setReason] = useState(""),
    [typed, setTyped] = useState("");
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            appearance="primary"
            className={danger ? "danger-button" : ""}
            disabled={
              (requiredReason && !reason.trim()) || !!(code && typed !== code)
            }
            onClick={() => {
              onConfirm(reason);
              setReason("");
              setTyped("");
            }}
          >
            Xác nhận
          </Button>
        </>
      }
    >
      {children}
      {requiredReason && (
        <Area label="Lý do thực hiện" value={reason} onChange={setReason} />
      )}{" "}
      {code && (
        <Text
          label={`Nhập ${code} để xác nhận`}
          value={typed}
          onChange={setTyped}
        />
      )}
    </Modal>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={error ? "inline-notice error" : "inline-notice"}
      role={error ? "alert" : undefined}
    >
      <Warning20Regular />
      <div>{children}</div>
    </div>
  );
}
export function NewButton() {
  return (
    <Link to="/scenarios/new">
      <Button appearance="primary" icon={<Add20Regular />}>
        Tạo kịch bản
      </Button>
    </Link>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map(([id, label]) => (
        <button
          key={id}
          role="tab"
          aria-selected={id === value}
          className={id === value ? "selected" : ""}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
