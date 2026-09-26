import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "warning";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses = {
      primary:
        "bg-accent text-white hover:bg-accent/90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg",
      secondary:
        "bg-card text-secondary hover:bg-accent/10 border border-border",
      outline:
        "border border-border bg-card hover:bg-accent/10 text-primary",
      ghost:
        "text-secondary hover:bg-accent/10 hover:text-primary",
      danger:
        "bg-emergency text-white hover:bg-emergency/90 hover:scale-105",
      success:
        "bg-green-600 text-white hover:bg-green-600/90 hover:scale-105",
      warning:
        "bg-warning text-white hover:bg-warning/90 hover:scale-105",
    };

    const sizeClasses = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-4 text-sm",
      lg: "h-13 px-6 text-base",
      xl: "h-15 px-8 text-lg font-semibold",
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          "ring-offset-background",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : leftIcon ? (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
