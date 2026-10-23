import Link from "next/link";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary";

type ButtonProps = { variant: ButtonVariant; children: ReactNode } & (
  | { href: string }
  | { type: "button" | "submit"; disabled?: boolean; onClick?: () => void }
);

const sharedClassName =
  "inline-block rounded-box px-3 py-1.5 text-small font-semibold text-ink mouse:hover:brightness-95 active:scale-[0.97] transition-[filter,scale] duration-(--duration-reveal) ease-(--ease-out) focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface",
};

export function Button(props: ButtonProps) {
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
