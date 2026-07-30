type Props = {
  current: number;
  total: number;
};

export function ProgressBar({
  current,
  total,
}: Props) {
  const percent =
    total === 0 ? 0 : (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>
          {current} of {total}
        </span>

        <span>{Math.round(percent)}%</span>
      </div>

      <div className="h-3 w-full rounded-full bg-gray-200">
        <div
          className="h-3 rounded-full bg-blue-600 transition-all"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}