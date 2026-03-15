"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 ease-out disabled:opacity-40 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B0B0F]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#7C5CFF] hover:bg-[#6D4DF5] active:scale-[0.98] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] hover:shadow-[0_0_16px_rgba(124,92,255,0.3)]",
        secondary:
          "bg-[#1E1E25] hover:bg-[#25252D] active:scale-[0.98] text-[#F4F4F5] border border-[#2A2A35] hover:border-[#3A3A45]",
        ghost:
          "hover:bg-white/5 active:bg-white/8 text-[#A1A1AA] hover:text-[#F4F4F5]",
        danger:
          "bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 active:scale-[0.98] text-[#F43F5E] border border-[#F43F5E]/20 hover:border-[#F43F5E]/40",
        outline:
          "border border-[#1E1E25] hover:border-[#2A2A35] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/4",
        link:
          "text-[#7C5CFF] hover:text-[#6D4DF5] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs:  "h-7 px-2.5 text-xs rounded-md",
        sm:  "h-8 px-3 text-sm rounded-lg",
        md:  "h-9 px-4 text-sm rounded-lg",
        lg:  "h-10 px-5 text-sm rounded-xl",
        xl:  "h-11 px-6 text-base rounded-xl",
        icon: "h-8 w-8 rounded-lg",
        "icon-sm": "h-7 w-7 rounded-md",
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
