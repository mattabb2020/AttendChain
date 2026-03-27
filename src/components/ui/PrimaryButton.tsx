"use client";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
}

export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
}: PrimaryButtonProps) {
  const base =
    "min-h-[48px] px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-primary text-white shadow-md shadow-primary/15 hover:bg-primary/90 hover:shadow-lg",
    secondary:
      "bg-emerald-600 text-white shadow-md shadow-emerald-600/15 hover:bg-emerald-500 hover:shadow-lg",
    outline:
      "border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary bg-white",
    ghost:
      "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
