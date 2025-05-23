import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | Promply",
  description: "Login to your Promply account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="border-b border-white/10">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-orange hover-orange">
            Promply
          </Link>
        </div>
      </header>
      <div className="container flex flex-1 w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
            <p className="text-sm text-white/70">
              Enter your credentials to sign in to your account
            </p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
          <p className="px-8 text-center text-sm text-white/70">
            <Link
              href="/auth/register"
              className="hover:text-orange underline underline-offset-4"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 