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
    <main className="auth-shell">
      <section className="auth-rail">
        <Link href="/" className="auth-brand">
          <span>Promptly</span>
        </Link>
        <div className="auth-statement">
          <p>Prompt operations</p>
          <h2>One source of truth for every prompt.</h2>
        </div>
        <footer>
          <span>Version · test · ship</span>
          <span>Private workspace</span>
        </footer>
      </section>
      <section className="auth-panel">
        <div className="auth-form">
          <header>
            <h1>Welcome back</h1>
            <p>
              Enter your credentials to sign in to your account
            </p>
          </header>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
          <p className="auth-switch">
            <Link
              href="/auth/register"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
