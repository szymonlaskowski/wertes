export function NormPlate({ norm }: { norm: string }) {
  return (
    <span className="inline-block bg-surface px-1 text-small font-semibold whitespace-nowrap tabular-nums">
      {norm}
    </span>
  );
}
