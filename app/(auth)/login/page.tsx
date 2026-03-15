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
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4">
      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#7C5CFF]/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] left-[30%] w-[300px] h-[300px] bg-[#22D3EE]/3 rounded-full blur-[60px]" />
      </div>

      <div className="relative w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-[#7C5CFF] blur-xl opacity-40 scale-110" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B6FFF] to-[#6D4DF5] flex items-center justify-center shadow-[0_2px_0_rgba(255,255,255,0.15)_inset]">
              <CheckSquare className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-[#F4F4F5] font-bold text-[22px] tracking-tight">TaskFlow</h1>
          <p className="text-[#52525B] text-[13px] mt-1">Welcome back</p>
        </div>

        {/* Card */}
        <div className="bg-[#111116] border border-[#ffffff08] rounded-2xl p-6 shadow-[0_24px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#F43F5E]/8 border border-[#F43F5E]/20 text-[#F43F5E] text-[13px] animate-fade-in">
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
                  className="text-[#52525B] hover:text-[#A1A1AA] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors">
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
        <p className="text-center text-[12px] text-[#52525B] mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#7C5CFF] hover:text-[#8B6FFF] font-medium transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
