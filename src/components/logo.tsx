export function Logo() {
  return (
    <div className="flex items-center gap-3" aria-label="Docs Zen Logo">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="hsl(var(--primary) / 0.1)"
        />
        <path
          d="M14 2V8H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 15L11 17L15 13"
          stroke="hsl(var(--accent-foreground))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="font-headline text-xl font-bold tracking-tight text-foreground">
        Docs Zen
      </span>
    </div>
  );
}
