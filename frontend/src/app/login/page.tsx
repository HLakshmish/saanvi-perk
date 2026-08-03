import React from "react";
import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | Saanvi Perk",
  description: "Secure login portal for the Saanvi Perk HRMS.",
};

export default function LoginPage() {
  return <LoginForm />;
}
