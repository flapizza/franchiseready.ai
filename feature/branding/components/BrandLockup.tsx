import Link from "next/link";

type BrandLockupProps = {
  href?: string;
  compact?: boolean;
  showTagline?: boolean;
  theme?: "light" | "dark";
};

export function BrandLockup({
  href = "/",
  compact = false,
  showTagline = true,
  theme = "light",
}: BrandLockupProps) {
  const content = (
    <div className="inline-flex items-center gap-4">

      <div className="relative shrink-0">

        <div className="absolute inset-0 rounded-2xl bg-teal-400/20 blur-lg" />

        <svg
          viewBox="0 0 64 64"
          className={compact ? "h-10 w-10" : "h-14 w-14"}
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="fg-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#63F2D3"
              />

              <stop
                offset="100%"
                stopColor="#18C6A3"
              />
            </linearGradient>
          </defs>

          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="18"
            fill="#0F172A"
          />

          <path
            d="
              M46 20
              C42 15 37 13 31 13
              C21 13 14 20 14 32
              C14 44 22 51 33 51
              C40 51 46 48 49 42
              L40 42
              C38 44 35 45 32 45
              C25 45 21 40 21 32
              C21 24 26 19 33 19
              C37 19 41 21 43 25
              L34 25
              L34 31
              L50 31
              L50 18
              Z
            "
            fill="url(#fg-gradient)"
          />

          <rect
            x="43"
            y="36"
            width="2.5"
            height="10"
            rx="1"
            fill="#63F2D3"
          />

          <rect
            x="47"
            y="33"
            width="2.5"
            height="13"
            rx="1"
            fill="#63F2D3"
          />

          <rect
            x="51"
            y="29"
            width="2.5"
            height="17"
            rx="1"
            fill="#63F2D3"
          />

        </svg>

      </div>

      <div>

        <div
  className={`font-black tracking-tight ${
    compact ? "text-lg" : "text-2xl"
  } ${
    theme === "dark"
      ? "text-white"
      : "text-slate-900"
  }`}
>
          Fran
          <span className="text-teal-500">
            Groove
          </span>{" "}
          AI
        </div>

        {showTagline && (
          <div
  className={`uppercase tracking-[0.24em] ${
    compact
      ? "text-[10px]"
      : "text-xs"
  } ${
    theme === "dark"
      ? "text-slate-400"
      : "text-slate-500"
  }`}
>
            The AI Operating System
            <br />
            for Franchise Consultants
          </div>
        )}

      </div>

    </div>
  );

  return (
    <Link
      href={href}
      className="inline-flex"
    >
      {content}
    </Link>
  );
}