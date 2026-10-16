const dotColors = {
  accent: "bg-accent",
  ink: "bg-ink",
};

export function LogoDot({ color = "accent" }: { color?: keyof typeof dotColors }) {
  return (
    <span
      aria-hidden="true"
      className={`ml-[0.06em] inline-block size-[0.16em] rounded-full ${dotColors[color]}`}
    />
  );
}
