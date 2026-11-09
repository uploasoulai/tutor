export function CoastalMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m5.2 14.8 3.5-5.8M10.2 14.8l3.5-8M15.2 14.8l3.5-10"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path d="M4.5 19h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
