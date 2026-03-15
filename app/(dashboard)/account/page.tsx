"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User, Mail, Lock, Trash2, ShieldCheck, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function SectionCard({
  icon, title, description, children, danger,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border p-6 space-y-5",
      danger
        ? "bg-[#F43F5E]/4 border-[#F43F5E]/15"
        : "bg-[#111116] border-[#1E1E25]"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          danger ? "bg-[#F43F5E]/15 text-[#F43F5E]" : "bg-[#1E1E25] text-[#7C5CFF]"
        )}>
          {icon}
        </div>
        <div>
          <h3 className={cn("font-semibold text-sm", danger ? "text-[#F43F5E]" : "text-[#F4F4F5]")}>
            {title}
          </h3>
          {description && <p className="text-xs text-[#52525B] mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: profileSubmitting } } =
    useForm<ProfileForm>({
      resolver: zodResolver(profileSchema),
      defaultValues: { name: session?.user?.name ?? "", email: session?.user?.email ?? "" },
    });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: passwordSubmitting } } =
    useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: ProfileForm) => {
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await update({ name: data.name, email: data.email });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    const res = await fetch("/api/users/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      resetPassword();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setIsDeleting(true);
    await fetch("/api/users/account", { method: "DELETE" });
    window.location.href = "/login";
  };

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-[#F4F4F5] font-semibold text-xl">Account</h1>
        <p className="text-[#52525B] text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <SectionCard icon={<User className="h-4 w-4" />} title="Profile" description="Update your display name and email">
        <div className="flex items-center gap-4 py-1">
          <Avatar className="h-14 w-14">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-[#F4F4F5]">{session?.user?.name ?? "No name set"}</p>
            <p className="text-xs text-[#52525B]">{session?.user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-3">
          <Input
            label="Display name"
            {...registerProfile("name")}
            error={profileErrors.name?.message}
          />
          <Input
            label="Email address"
            type="email"
            {...registerProfile("email")}
            error={profileErrors.email?.message}
          />
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" type="submit" loading={profileSubmitting}>
              Save changes
            </Button>
            {profileSuccess && (
              <div className="flex items-center gap-1 text-xs text-[#22C55E] animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </div>
            )}
          </div>
        </form>
      </SectionCard>

      {/* Password */}
      <SectionCard icon={<Lock className="h-4 w-4" />} title="Password" description="Change your account password">
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-3">
          <Input
            label="Current password"
            type="password"
            {...registerPassword("currentPassword")}
            error={passwordErrors.currentPassword?.message}
          />
          <Input
            label="New password"
            type="password"
            {...registerPassword("newPassword")}
            error={passwordErrors.newPassword?.message}
          />
          <Input
            label="Confirm new password"
            type="password"
            {...registerPassword("confirmPassword")}
            error={passwordErrors.confirmPassword?.message}
          />
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" type="submit" loading={passwordSubmitting}>
              Update password
            </Button>
            {passwordSuccess && (
              <div className="flex items-center gap-1 text-xs text-[#22C55E] animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Password updated
              </div>
            )}
          </div>
        </form>
      </SectionCard>

      {/* Security */}
      <SectionCard icon={<ShieldCheck className="h-4 w-4" />} title="Security" description="Account security status">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#1E1E25]">
            <div>
              <p className="text-sm text-[#F4F4F5] font-medium">Email verification</p>
              <p className="text-xs text-[#52525B]">Verify your email for account recovery</p>
            </div>
            {session?.user?.email ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Unverified</Badge>
            )}
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-[#F4F4F5] font-medium">Two-factor auth</p>
              <p className="text-xs text-[#52525B]">Coming soon</p>
            </div>
            <Badge variant="default">Disabled</Badge>
          </div>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard
        icon={<AlertTriangle className="h-4 w-4" />}
        title="Danger zone"
        description="Permanently delete your account and all data"
        danger
      >
        {!deleteConfirm ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteConfirm(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#F43F5E]">
              This will permanently delete all your tasks, tags, and account data. Type{" "}
              <code className="font-mono font-bold">DELETE</code> to confirm.
            </p>
            <Input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="border-[#F43F5E]/30 focus:border-[#F43F5E]/60"
            />
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={deleteInput !== "DELETE"}
                loading={isDeleting}
                onClick={handleDeleteAccount}
              >
                Permanently delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setDeleteConfirm(false); setDeleteInput(""); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
