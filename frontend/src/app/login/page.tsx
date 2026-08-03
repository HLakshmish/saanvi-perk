import React from "react";
import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | Saanvi Perk",
  description: "Secure login portal for the Saanvi Perk HRMS.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full">
        <LoginForm />
      </div>
    </div>
  );
}
