"use client";

import Link from "next/link";
import { useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";

const OPEN_DELAY_MS = 120;

type MegaNavDepartment = {
  id: number;
  href: string;
  label: string;
  count: string;
  panel: ReactNode;
};

export function MegaNav({ departments }: { departments: MegaNavDepartment[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const departmentLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isOpen = openIndex !== null;

  function open(index: number) {
    clearTimeout(openTimer.current);
    const panel = panelRefs.current[index];
    if (panel) {
      setPanelHeight(panel.offsetHeight);
    }
    setOpenIndex(index);
  }

  function openOnHover(index: number) {
    if (isOpen) {
      open(index);
      return;
    }
    openTimer.current = setTimeout(() => open(index), OPEN_DELAY_MS);
  }

  function close() {
    clearTimeout(openTimer.current);
    setOpenIndex(null);
  }

  function openWhenFocusEnters(event: FocusEvent<HTMLLIElement>, index: number) {
    const focusCameFromOutside = !event.currentTarget.contains(event.relatedTarget);
    if (focusCameFromOutside) {
      open(index);
    }
  }

  function closeWhenFocusLeaves(event: FocusEvent<HTMLDivElement>) {
    const focusStaysInside = event.currentTarget.contains(event.relatedTarget);
    if (!focusStaysInside) {
      close();
    }
  }

  function closeOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || openIndex === null) {
      return;
    }
    close();
    departmentLinkRefs.current[openIndex]?.focus();
  }

  return (
    <div onMouseLeave={close} onBlur={closeWhenFocusLeaves} onKeyDown={closeOnEscape}>
      <ul className="flex flex-wrap gap-x-4">
        {departments.map((department, index) => (
          <li
            key={department.id}
            data-state={openIndex === index ? "open" : "closed"}
            className="group/department"
            onMouseEnter={() => openOnHover(index)}
            onFocus={(event) => openWhenFocusEnters(event, index)}
            onClick={close}
          >
            <Link
              ref={(link) => {
                departmentLinkRefs.current[index] = link;
              }}
              href={department.href}
              className="relative inline-flex items-baseline gap-1 pt-1 pb-2 font-semibold"
            >
              <OpenDot />
              <span className="link-line">{department.label}</span>
              <span className="text-small font-normal text-mute tabular-nums">{department.count}</span>
            </Link>
            <div
              ref={(panel) => {
                panelRefs.current[index] = panel;
              }}
              data-mega-panel
              className={`absolute inset-x-0 top-full z-20 px-2 pt-4 pb-5 transition-[opacity,translate,visibility] duration-(--duration-panel) ease-(--ease-out) max-md:hidden motion-reduce:transition-none md:px-5 ${panelPlacement(index, openIndex)}`}
            >
              {department.panel}
            </div>
          </li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        style={{ height: panelHeight }}
        className={`absolute inset-x-0 top-full z-10 bg-surface transition-[height,opacity] duration-(--duration-panel) ease-(--ease-out) max-md:hidden motion-reduce:transition-none ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
    </div>
  );
}

function panelPlacement(index: number, openIndex: number | null) {
  if (openIndex === index) {
    return "translate-x-0 opacity-100";
  }
  const closedClassName = "pointer-events-none invisible opacity-0";
  if (openIndex === null) {
    return `translate-x-0 ${closedClassName}`;
  }
  if (index < openIndex) {
    return `-translate-x-4 ${closedClassName}`;
  }
  return `translate-x-4 ${closedClassName}`;
}

function OpenDot() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-1/2 -left-1.5 size-1 -translate-y-1 scale-0 rounded-full bg-accent transition-transform duration-(--duration-hide) ease-(--ease-out) group-data-[state=open]/department:scale-100 group-data-[state=open]/department:duration-(--duration-reveal) motion-reduce:transition-none"
    />
  );
}
