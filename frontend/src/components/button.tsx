import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "accent" | "secondary";

type ButtonProps = { variant: ButtonVariant; onInk?: boolean; children: ReactNode } & (
  | { href: string }
  | { type: "button" | "submit"; disabled?: boolean; onClick?: () => void }
);

const sharedClassName =
  "inline-flex items-center justify-center px-3 py-1.5 text-body font-semibold transition-[background-color,color,box-shadow,scale] duration-(--duration-reveal) ease-(--ease-out) active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

const onPaperClassNames: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper mouse:hover:text-accent",
  accent: "bg-accent text-ink mouse:hover:bg-ink mouse:hover:text-accent",
  secondary: "text-ink inset-ring inset-ring-ink/25 mouse:hover:inset-ring-ink",
};

const onInkClassNames: Record<ButtonVariant, string> = {
  primary: "bg-paper text-ink mouse:hover:bg-accent",
  accent: "bg-accent text-ink mouse:hover:bg-paper",
  secondary: "text-paper inset-ring inset-ring-paper/30 mouse:hover:inset-ring-paper",
};

export function Button(props: ButtonProps) {
  const variantClassName = props.onInk
    ? `${onInkClassNames[props.variant]} focus-visible:outline-paper`
    : `${onPaperClassNames[props.variant]} focus-visible:outline-ink`;
  const className = `${sharedClassName} ${variantClassName}`;

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
