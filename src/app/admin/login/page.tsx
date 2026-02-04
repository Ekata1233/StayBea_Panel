"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/employee/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ Login successful (cookie is already set by API)
      const role = data?.data?.user?.role?.roleName;

      // 🔀 Role-based redirect (optional)
      // if (role === "Admin") router.push("/admin/dashboard");
      // else if (role === "Manager") router.push("/manager/dashboard");
      // else 
        router.push("/");

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-whiter dark:bg-boxdark flex items-center justify-center">
      <div className="w-full max-w-6xl overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* LEFT – FORM */}
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-black dark:text-white">
                Sign In
              </h2>
              <p className="text-sm text-body">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5.5">

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Forgot password */}
              <div className="flex items-center justify-between">
                <span />
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-primary px-5 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>
          </div>

          {/* RIGHT – IMAGE */}
          <div className="relative hidden md:block">
            <Image
              src="/images/illustration/illustration-03.svg"
              alt="login"
              fill
              className="m-5"
            />
            <div className="absolute inset-0 bg-primary/20" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
