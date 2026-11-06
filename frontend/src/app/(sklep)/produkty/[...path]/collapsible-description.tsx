"use client";

import { useState } from "react";

export function CollapsibleDescription({ html }: { html: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const collapsedClassName = isExpanded ? "" : "max-h-40 overflow-hidden mask-b-from-40%";

  return (
    <div className="mt-2">
      <div
        id="opis-kategorii"
        data-collapsible
        className={`article-body ${collapsedClassName}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <button
        type="button"
        data-collapsible-toggle
        aria-expanded={isExpanded}
        aria-controls="opis-kategorii"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 font-semibold"
      >
        <span className="link-line">{isExpanded ? "Zwiń" : "Czytaj całość"}</span>
      </button>
    </div>
  );
}
