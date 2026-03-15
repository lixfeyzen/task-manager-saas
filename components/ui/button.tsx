"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-white",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] active:scale-[0.97] text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_2px_8px_rgba(124,58,237,0.3)] hover:shadow-[0_2px_16px_rgba(124,58,237,0.4)]",
        secondary:
          "bg-white hover:bg-[#F8F7FF] active:scale-[0.97] text-[#1E1B4B] border border-[#E4E0F5] hover:border-[#C9C2EC] shadow-sm",
        ghost:
          "hover:bg-[#F0EDFF] active:bg-[#EDE9FE] text-[#6B7280] hover:text-[#1E1B4B]",
        danger:
          "bg-[#FEE2E2] hover:bg-[#FECACA] active:scale-[0.97] text-[#DC2626] border border-[#FECACA] hover:border-[#FCA5A5]",
        outline:
          "border border-[#E4E0F5] hover:border-[#C9C2EC] text-[#6B7280] hover:text-[#1E1B4B] hover:bg-[#F8F7FF]",
        link:
          "text-[#7C3AED] hover:text-[#6D28D9] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs:       "h-7 px-2.5 text-xs rounded-md",
        sm:       "h-8 px-3 text-[13px] rounded-lg",
        md:       "h-9 px-4 text-[13px] rounded-lg",
        lg:       "h-10 px-5 text-sm rounded-xl",
        xl:       "h-11 px-6 text-base rounded-xl",
        icon:     "h-8 w-8 rounded-lg",
        "icon-sm":"h-7 w-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
