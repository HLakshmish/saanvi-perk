import React from "react";
import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | Saanvi Perk",
  description: "Secure portal for Saanvi Perk HRMS.",
};

export default function Home() {
  return <LoginForm />;
}
