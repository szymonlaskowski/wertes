export function NormPlate({ norm }: { norm: string }) {
  return (
    <span className="inline-block chamfer-plate bg-ink pr-1.5 pl-1 text-small font-semibold whitespace-nowrap text-accent tabular-nums">
      {norm}
    </span>
  );
}
