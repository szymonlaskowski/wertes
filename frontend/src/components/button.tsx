import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary";

type ButtonProps = { variant: ButtonVariant; onInk?: boolean; children: ReactNode } & (
  | { href: string }
  | { type: "button" | "submit"; disabled?: boolean; onClick?: () => void }
);

const sharedClassName =
  "inline-flex items-center justify-center rounded-box px-3 py-1.5 text-small font-semibold text-ink transition-[background-color,color,scale] duration-(--duration-reveal) ease-(--ease-out) active:scale-[0.96] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface",
};

const hoverOnPaperClassName = "mouse:hover:bg-ink mouse:hover:text-paper";
const hoverOnInkClassName = "mouse:hover:bg-paper";

export function Button(props: ButtonProps) {
  const hoverClassName = props.onInk ? hoverOnInkClassName : hoverOnPaperClassName;
  const className = `${sharedClassName} ${variantClassNames[props.variant]} ${hoverClassName}`;

  if ("href" in props) {
    return (
      <Link href={props.href} className={className}>
        {props.children}
      </Link>
    );
  }

  return (
    <button type={props.type} disabled={props.disabled} onClick={props.onClick} className={className}>
      {props.children}
    </button>
  );
}
