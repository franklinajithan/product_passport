import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utilities/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        secondary: "border-transparent bg-muted text-muted-foreground",
        success: "border-transparent bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
        warning: "border-transparent bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
        destructive: "border-transparent bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
