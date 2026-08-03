"use client";

import React from "react";
import { useLogin } from "../hooks/use-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const {
    credentials,
    errors,
    isLoading,
    successMessage,
    handleChange,
    handleSubmit,
  } = useLogin();

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Please log in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.general && (
          <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg dark:bg-red-950/30 dark:text-red-400">
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-sm bg-green-50 text-green-600 rounded-lg dark:bg-green-950/30 dark:text-green-400">
            {successMessage}
          </div>
        )}

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="email@example.com"
          value={credentials.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={credentials.password || ""}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}

