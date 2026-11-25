
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading: authLoading, isAuthenticated, rememberedEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Populate remembered email
  useEffect(() => {
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, [rememberedEmail]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate inputs
      if (!email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }

      if (!password) {
        setError("Password is required");
        setLoading(false);
        return;
      }

      const result = await login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (result.success) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="auth-page">
        <nav className="auth-nav">
          <Link href="/" className="browse-logo">
            <span className="browse-logo-icon">↻</span>
            <span>villa<span>reuse</span></span>
          </Link>
        </nav>
        <section className="auth-main">
          <div className="auth-card">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Loading...</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <nav className="auth-nav">
        <Link href="/" className="browse-logo">
          <span className="browse-logo-icon">↻</span>
          <span>villa<span>reuse</span></span>
        </Link>

        <Link href="/" className="auth-back-home">
          ← Back to home
        </Link>
      </nav>

      <section className="auth-main">
        <div className="auth-card">
          <div className="auth-brand-mark">↻</div>

          <p className="browse-eyebrow">WELCOME BACK</p>
          <h1>Good to see you <span>again.</span></h1>
          <p className="auth-description">
            Log in to continue sharing good things with your community.
          </p>

          {error && <div className="auth-error-message">{error}</div>}
          {success && <div className="auth-success-message">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>

              <div className="auth-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"} <span>↗</span>
            </button>
          </form>

      

          <div className="auth-divider">
            <span>NEW TO VILLA-REUSE?</span>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link href="/register">Create an account</Link>
          </p>
        </div>

        <div className="auth-side-note">
          <span className="auth-side-icon">♻</span>
          <h2>Reuse more.<br />Waste less.<br /><span>Share better.</span></h2>
          <p>
            Every item shared is a small step toward a more caring and sustainable community.
          </p>
          <div className="auth-side-decoration">
            <span>♡</span>
            <span>↻</span>
            <span>✳</span>
          </div>
        </div>
      </section>

      <footer className="auth-footer">
        <span>© 2026 VILLA-REUSE</span>
        <span>Made for the community ♡</span>
      </footer>
    </main>
  );
}
