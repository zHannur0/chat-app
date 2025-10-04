"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignUpEmailMutation } from "@/modules/auth/api/authApi";
import {
  validatePassword,
  validateConfirmPassword,
} from "@/modules/auth/lib/validation";
import ErrorMessage from "@/shared/components/ui/ErrorMessage";

const RegisterForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [signUpEmail] = useSignUpEmailMutation();

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await signUpEmail({ email, password }).unwrap();
      localStorage.setItem("idToken", res.idToken);
      router.push("/chat");
    } catch (error: any) {
      console.error("Registration failed:", error);

      // Handle different error types
      if (error?.data?.error?.includes("EMAIL_EXISTS")) {
        setErrors({ email: "This email is already registered" });
      } else if (error?.data?.error?.includes("INVALID_EMAIL")) {
        setErrors({ email: "Invalid email format" });
      } else if (error?.data?.error?.includes("WEAK_PASSWORD")) {
        setErrors({ password: "Password is too weak" });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goLogin = () => router.push("/login");

  return (
    <div className="flex flex-col w-full max-w-[380px] p-6">
      <p className="text-sm mb-2">WELCOME 👋🏻</p>
      <h1 className="text-[30px] font-bold mb-4">Create your Account.</h1>
      <div className="mt-2 flex flex-col gap-3">
        <div>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className={`w-full rounded-md bg-transparent outline-none border px-3 py-2 text-inverse ${
              errors.email ? "border-red-500" : "border-border"
            }`}
            type="email"
            autoComplete="email"
            disabled={isLoading}
          />
          <ErrorMessage message={errors.email} />
        </div>

        {/* <div>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Username"
            className={`w-full rounded-md bg-transparent outline-none border px-3 py-2 text-inverse ${
              errors.displayName ? "border-red-500" : "border-border"
            }`}
            type="text"
            autoComplete="name"
            disabled={isLoading}
          />
          <ErrorMessage message={errors.displayName} />
        </div> */}

        <div>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className={`w-full rounded-md bg-transparent outline-none border px-3 py-2 text-inverse ${
              errors.password ? "border-red-500" : "border-border"
            }`}
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
          />
          <ErrorMessage message={errors.password} />
        </div>

        <div>
          <input
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className={`w-full rounded-md bg-transparent outline-none border px-3 py-2 text-inverse ${
              errors.confirmPassword ? "border-red-500" : "border-border"
            }`}
            type="password"
            autoComplete="new-password"
            disabled={isLoading}
          />
          <ErrorMessage message={errors.confirmPassword} />
        </div>

        {errors.general && (
          <ErrorMessage message={errors.general} className="text-center" />
        )}

        <div className="flex gap-2">
          <button
            className="flex-1 rounded-md bg-primary text-white h-10 disabled:opacity-50"
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
          <button
            className="flex-1 rounded-md bg-background text-inverse border border-border h-10"
            onClick={goLogin}
            disabled={isLoading}
          >
            I have an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
