type Props = {
  children: string;
  color?: "blue" | "green" | "amber" | "red" | "gray";
};

const colors = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-slate-100 text-slate-700",
};

export function Badge({
  children,
  color = "blue",
}: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colors[color]}`}
    >
      {children}
    </span>
  );
}