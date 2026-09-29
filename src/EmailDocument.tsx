import type { ReactNode } from "react";
import type { Customer } from "./domain";
import { renderBody } from "./domain";
type DocNode = {
  type: string;
  text?: string;
  attrs?: { level?: number; href?: string };
  marks?: { type: string; attrs?: { href?: string } }[];
  content?: DocNode[];
};
export function EmailDocument({
  document,
  customer,
  scenario,
}: {
  document: object;
  customer: Customer;
  scenario: string;
}) {
  function render(node: DocNode, key: string): ReactNode {
    const children = node.content?.map((n, i) => render(n, `${key}-${i}`));
    if (node.type === "text") {
      let text: ReactNode = renderBody(node.text || "", customer, scenario);
      for (const mark of node.marks || []) {
        if (mark.type === "bold")
          text = <strong key={key + "b"}>{text}</strong>;
        if (mark.type === "italic") text = <em key={key + "i"}>{text}</em>;
        if (mark.type === "strike") text = <s key={key + "s"}>{text}</s>;
        if (
          mark.type === "link" &&
          /^https?:\/\//i.test(mark.attrs?.href || "")
        )
          text = (
            <a
              key={key + "a"}
              href={mark.attrs!.href}
              target="_blank"
              rel="noreferrer"
            >
              {text}
            </a>
          );
      }
      return <span key={key}>{text}</span>;
    }
    if (node.type === "paragraph")
      return <p key={key}>{children?.length ? children : <br />}</p>;
    if (node.type === "heading")
      return node.attrs?.level === 3 ? (
        <h3 key={key}>{children}</h3>
      ) : (
        <h2 key={key}>{children}</h2>
      );
    if (node.type === "bulletList") return <ul key={key}>{children}</ul>;
    if (node.type === "orderedList") return <ol key={key}>{children}</ol>;
    if (node.type === "listItem") return <li key={key}>{children}</li>;
    if (node.type === "hardBreak") return <br key={key} />;
    if (node.type === "blockquote")
      return <blockquote key={key}>{children}</blockquote>;
    return <div key={key}>{children}</div>;
  }
  return (
    <div className="email-document">{render(document as DocNode, "doc")}</div>
  );
}
