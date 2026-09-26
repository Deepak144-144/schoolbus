import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", dot = false, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-secondary/10 text-secondary",
      primary: "bg-accent/10 text-accent",
      success: "bg-green-500/10 text-green-600",
      warning: "bg-warning/10 text-warning",
      danger: "bg-emergency/10 text-emergency",
      info: "bg-blue-500/10 text-blue-600",
      neutral: "bg-gray-400/10 text-gray-600",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "mr-1 h-2 w-2 rounded-full",
              {
                "bg-green-500": variant === "success" || variant === "default",
                "bg-amber-500": variant === "warning",
                "bg-red-500": variant === "danger",
                "bg-blue-500": variant === "info",
                "bg-accent": variant === "primary",
              }
            )}
          />
        )}
        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
