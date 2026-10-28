/** App mark: four steps, one per WOOP phase. */
export function Logo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f766e" />
          <stop offset="1" stopColor="#312e81" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-bg)" />
      <path
        d="M14 46 L26 38 L38 30 L50 20"
        stroke="#f8fafc"
        strokeOpacity="0.35"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="14" cy="46" r="6" fill="#fcd34d" />
      <circle cx="26" cy="38" r="6" fill="#5eead4" />
      <circle cx="38" cy="30" r="6" fill="#fda4af" />
      <circle cx="50" cy="20" r="6" fill="#a5b4fc" />
    </svg>
  );
}
