import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginCredentials, LoginErrors } from "../types/auth.types";
import { loginUser } from "../api/auth.api";

export function useLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!credentials.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    } else if ((credentials.password || "").length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await loginUser(credentials);
      if (response.success && response.user) {
        const { role } = response.user;

        // Route mapping per role
        const routeMap: Record<string, string> = {
          owner: "/owner/dashboard",
          superadmin: "/superadmin/dashboard",
          admin: "/admin/dashboard",
          employee: "/employee/dashboard",
        };

        const destination = routeMap[role] || "/admin/dashboard";
        setSuccessMessage("Login successful! Redirecting...");

        setTimeout(() => {
          router.push(destination);
        }, 600);
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.error || "Login failed",
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    credentials,
    errors,
    isLoading,
    successMessage,
    handleChange,
    handleSubmit,
  };
}
