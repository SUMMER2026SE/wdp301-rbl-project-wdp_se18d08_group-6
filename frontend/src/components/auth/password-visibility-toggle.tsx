"use client";

type PasswordVisibilityToggleProps = {
  visible: boolean;
  label: string;
  onToggle: () => void;
  className?: string;
};

export function PasswordVisibilityToggle({ visible, label, onToggle, className }: PasswordVisibilityToggleProps) {
  return (
    <button
      aria-label={`${visible ? "Ẩn" : "Hiện"} ${label}`}
      className={`absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-sm p-1 text-sand transition hover:text-ink focus-ring ${className ?? ""}`}
      type="button"
      onClick={onToggle}
    >
      {visible ? (
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l18 18" />
          <path d="M10.58 10.58A2 2 0 0 0 12 15a2 2 0 0 0 1.42-.58" />
          <path d="M9.88 5.08A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a18.46 18.46 0 0 1-4.09 5.5" />
          <path d="M6.61 6.61A18.5 18.5 0 0 0 2 12s3 7 10 7a11 11 0 0 0 4.79-1.06" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}
