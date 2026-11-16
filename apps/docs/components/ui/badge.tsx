import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground text-background shadow font-semibold",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        outline:
          "border-border bg-transparent text-foreground",
        heaven:
          "border-foreground/20 bg-foreground/5 text-foreground backdrop-blur-md font-semibold",
        muted:
          "border-border/60 bg-muted/60 text-muted-foreground",
        cyan:
          "border-foreground/20 bg-foreground/10 text-foreground font-semibold",
        amber:
          "border-foreground/20 bg-foreground/10 text-foreground",
        emerald:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
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
