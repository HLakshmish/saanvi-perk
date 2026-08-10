import React from "react";
import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | Nexus",
  description: "Secure portal for Nexus HRMS.",
};

export default function Home() {
  return <LoginForm />;
}
