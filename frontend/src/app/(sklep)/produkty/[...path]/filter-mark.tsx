"use client";

import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";

function useShownAsSelected(isSelected: boolean) {
  const { pending } = useLinkStatus();
  if (pending) {
    return !isSelected;
  }
  return isSelected;
}

export function CheckSquare({ isChecked }: { isChecked: boolean }) {
  const isShownChecked = useShownAsSelected(isChecked);
  const stateClassName = isShownChecked ? "border-ink bg-ink" : "border-mute bg-paper";
  return <span aria-hidden="true" className={`size-2 shrink-0 rounded-box border-2 ${stateClassName}`} />;
}

export function SizeSquareFace({ isSelected, children }: { isSelected: boolean; children: ReactNode }) {
  const isShownSelected = useShownAsSelected(isSelected);
  const stateClassName = isShownSelected ? "bg-ink text-paper" : "bg-surface mouse:hover:bg-accent";
  return (
    <span
      className={`flex h-6 min-w-6 items-center justify-center rounded-box px-1 tabular-nums transition-[background-color,scale] duration-(--duration-reveal) ease-(--ease-out) active:scale-[0.94] motion-reduce:transition-none ${stateClassName}`}
    >
      {children}
    </span>
  );
}
