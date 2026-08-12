type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

export function BrandLogo({
  size = "md",
  showWordmark = true,
}: BrandLogoProps) {
  const iconSize =
    size === "sm"
      ? "h-9 w-9"
      : size === "lg"
      ? "h-16 w-16"
      : "h-12 w-12";

  const wordmark =
    size === "sm"
      ? "text-lg"
      : size === "lg"
      ? "text-3xl"
      : "text-xl";

  const tagline =
    size === "lg"
      ? "text-xs"
      : "text-[11px]";

  return (
    <div className="inline-flex items-center gap-4">

      <div
        className={`${iconSize} shrink-0`}
      >
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
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
                stopColor="#5EEAD4"
              />

              <stop
                offset="100%"
                stopColor="#14B8A6"
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

          {/* Stylized G */}

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

          {/* Intelligence bars */}

          <rect
            x="43"
            y="36"
            width="2.5"
            height="10"
            rx="1"
            fill="#5EEAD4"
          />

          <rect
            x="47"
            y="33"
            width="2.5"
            height="13"
            rx="1"
            fill="#5EEAD4"
          />

          <rect
            x="51"
            y="29"
            width="2.5"
            height="17"
            rx="1"
            fill="#5EEAD4"
          />

        </svg>
      </div>

      {showWordmark && (
        <div>

          <div
            className={`${wordmark} font-black tracking-tight text-slate-900`}
          >
            Fran
            <span className="text-teal-500">
              Groove
            </span>{" "}
            AI
          </div>

          <div
            className={`${tagline} uppercase tracking-[0.24em] text-slate-500`}
          >
            The AI Operating System
          </div>

        </div>
      )}

    </div>
  );
}