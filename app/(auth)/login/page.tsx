"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckSquare, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/tasks");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-4">
      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-[#7C3AED]/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-[15%] right-[20%] w-[400px] h-[400px] bg-[#0891B2]/6 rounded-full blur-[80px]" />
        <div className="absolute top-[60%] left-[60%] w-[300px] h-[300px] bg-[#8B5CF6]/5 rounded-full blur-[60px]" />
      </div>

      <div className="relative w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-[#7C3AED]/30 blur-xl scale-110" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-[0_4px_16px_rgba(124,58,237,0.4)]">
              <CheckSquare className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-[#1E1B4B] font-bold text-[22px] tracking-tight">TaskFlow</h1>
          <p className="text-[#9CA3AF] text-[13px] mt-1">Welcome back</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E4E0F5] rounded-2xl p-6 shadow-[0_8px_32px_rgba(124,58,237,0.08),0_2px_8px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-[13px] animate-fade-in">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              error={errors.email?.message}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              {...register("password")}
              error={errors.password?.message}
              autoComplete="current-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-xs text-[#9CA3AF] hover:text-[#7C3AED] transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={isSubmitting}
              className="w-full"
            >
              Sign in
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-[12px] text-[#9CA3AF] mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#7C3AED] hover:text-[#6D28D9] font-medium transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
