"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, suffix, type, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-[#A1A1AA] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-[#111116] border border-[#1E1E25] text-[#F4F4F5] text-sm rounded-lg",
              "px-3 py-2.5 transition-all duration-150",
              "placeholder:text-[#52525B]",
              "hover:border-[#2A2A35]",
              "focus:outline-none focus:border-[#7C5CFF]/50 focus:ring-1 focus:ring-[#7C5CFF]/30 focus:bg-[#111116]",
              error && "border-[#F43F5E]/50 focus:border-[#F43F5E]/70 focus:ring-[#F43F5E]/20",
              icon && "pl-9",
              suffix && "pr-9",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525B]">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[#F43F5E] flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
