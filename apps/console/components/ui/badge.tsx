import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring font-mono uppercase tracking-wider select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground text-background shadow-xs",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border-destructive/20",
        outline:
          "border-border/80 text-foreground bg-background/50",
        success:
          "border-foreground/20 bg-foreground/10 text-foreground font-semibold",
        warning:
          "border-border/90 bg-muted/50 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
