import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register | Promply",
  description: "Create a new Promply account",
};

export default function RegisterPage() {
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
            <h1 className="text-2xl font-semibold tracking-tight text-white">Create an account</h1>
            <p className="text-sm text-white/70">
              Enter your information to create an account
            </p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
          </Suspense>
          <p className="px-8 text-center text-sm text-white/70">
            <Link
              href="/auth/login"
              className="hover:text-orange underline underline-offset-4"
            >
              Already have an account? Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 