export function MoreSummary({ label }: { label: string }) {
  return (
    <summary className="mt-1 cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
      <span className="link-line">{label}</span>
    </summary>
  );
}
