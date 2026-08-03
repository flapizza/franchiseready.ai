type Props = {
  title: string;
  value: string;
};

export function MetricCard({
  title,
  value,
}: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </section>
  );
}