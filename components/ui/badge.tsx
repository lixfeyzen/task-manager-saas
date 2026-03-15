import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default:  "bg-[#1E1E25] text-[#A1A1AA] border border-[#2A2A35]",
        primary:  "bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20",
        success:  "bg-[#22C55E]/12 text-[#22C55E] border border-[#22C55E]/20",
        warning:  "bg-[#F59E0B]/12 text-[#F59E0B] border border-[#F59E0B]/20",
        danger:   "bg-[#F43F5E]/12 text-[#F43F5E] border border-[#F43F5E]/20",
        cyan:     "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20",
        outline:  "border border-[#1E1E25] text-[#A1A1AA]",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[10px]",
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
