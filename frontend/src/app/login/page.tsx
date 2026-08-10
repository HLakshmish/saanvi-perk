import React from "react";
import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | Nexus",
  description: "Secure login portal for the Nexus HRMS.",
};

export default function LoginPage() {
  return <LoginForm />;
}
