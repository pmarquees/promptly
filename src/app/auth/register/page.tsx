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
    <main className="auth-shell">
      <section className="auth-rail">
        <Link href="/" className="auth-brand">
          <span>Promptly</span>
        </Link>
        <div className="auth-statement">
          <p>Build a prompt system</p>
          <h2>Make iteration observable, not accidental.</h2>
        </div>
        <footer>
          <span>Version · test · ship</span>
          <span>Private workspace</span>
        </footer>
      </section>
      <section className="auth-panel">
        <div className="auth-form">
          <header>
            <h1>Create an account</h1>
            <p>
              Enter your information to create an account
            </p>
          </header>
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
          </Suspense>
          <p className="auth-switch">
            <Link
              href="/auth/login"
            >
              Already have an account? Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
