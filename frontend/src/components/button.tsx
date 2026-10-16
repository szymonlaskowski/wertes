import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

type ButtonProps = { variant: ButtonVariant; children: ReactNode } & (
  | { href: string }
  | { type: "button" | "submit"; disabled?: boolean }
);

const sharedClassName =
  "inline-block border-2 px-3 py-1.5 text-small font-semibold transition-colors duration-(--duration-reveal) ease-(--ease-out) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "border-accent bg-accent text-ink hover:border-ink hover:bg-ink hover:text-accent",
  outline: "border-ink bg-paper text-ink hover:bg-ink hover:text-paper",
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
    <button type={props.type} disabled={props.disabled} className={className}>
      {props.children}
    </button>
  );
}
