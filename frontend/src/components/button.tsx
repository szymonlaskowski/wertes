import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "accent" | "secondary";

type ButtonProps = { variant: ButtonVariant; onInk?: boolean; children: ReactNode } & (
  | { href: string }
  | { type: "button" | "submit"; disabled?: boolean; onClick?: () => void }
);

const sharedClassName =
  "chamfer-control inline-flex items-center justify-center px-3 py-1.5 text-body font-semibold tracking-control uppercase transition-[background-color,color,scale] duration-(--duration-reveal) ease-(--ease-out) active:scale-[0.97] focus-visible:outline-2 focus-visible:-outline-offset-4 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

const onPaperClassNames: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper mouse:hover:text-accent focus-visible:outline-accent",
  accent: "bg-accent text-ink mouse:hover:bg-ink mouse:hover:text-accent focus-visible:outline-ink",
  secondary: "bg-surface text-ink mouse:hover:bg-ink mouse:hover:text-paper focus-visible:outline-ink",
};

const onInkClassNames: Record<ButtonVariant, string> = {
  primary: "bg-paper text-ink mouse:hover:bg-accent focus-visible:outline-ink",
  accent: "bg-accent text-ink mouse:hover:bg-paper focus-visible:outline-ink",
  secondary: "bg-paper/15 text-paper mouse:hover:bg-paper mouse:hover:text-ink focus-visible:outline-paper",
};

export function Button(props: ButtonProps) {
  const variantClassNames = props.onInk ? onInkClassNames : onPaperClassNames;
  const className = `${sharedClassName} ${variantClassNames[props.variant]}`;

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
