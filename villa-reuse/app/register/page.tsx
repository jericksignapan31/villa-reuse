
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import {
  validateRegistration,
  RegistrationValidationErrors,
} from "@/lib/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading: authLoading, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegistrationValidationErrors>({});
  const [success, setSuccess] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    try {
      // Validate form
      const validationErrors = validateRegistration({
        fullName,
        email,
        password,
        confirmPassword,
        agreeToTerms,
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Register user
      const result = await register({
        fullName,
        email: email.trim(),
        password,
        confirmPassword,
        agreeToTerms,
      });

      if (result.success) {
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setErrors({ email: result.error });
      }
    } catch (err) {
      setErrors({ email: "An error occurred. Please try again." });
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

      <section className="auth-main register-main">
        <div className="auth-card register-card">
          <div className="auth-brand-mark">↻</div>

          <p className="browse-eyebrow">JOIN THE COMMUNITY</p>
          <h1>Create your <span>account.</span></h1>
          <p className="auth-description">
            Start sharing, exchanging, and giving useful things a new home.
          </p>

          {success && <div className="auth-success-message">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="fullname">Full name</label>
              <input
                id="fullname"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
                minLength={2}
              />
              {errors.fullName && (
                <span className="auth-error">{errors.fullName}</span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              {errors.email && (
                <span className="auth-error">{errors.email}</span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <div className="auth-password-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
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
              {errors.password && (
                <span className="auth-error">{errors.password}</span>
              )}
              <span className="register-hint">
                Use at least 8 characters.
              </span>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-password">Confirm password</label>
              <div className="auth-password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="auth-error">{errors.confirmPassword}</span>
              )}
            </div>

            <label className="auth-remember register-terms">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                disabled={loading}
                required
              />
              <span>
                I agree to the community guidelines and understand that
                VILLA-REUSE is a platform for responsible sharing.
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className="auth-error">{errors.agreeToTerms}</span>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"} <span>↗</span>
            </button>
          </form>

          <div className="auth-divider">
            <span>ALREADY A MEMBER?</span>
          </div>

          <p className="auth-switch">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>

        <div className="auth-side-note register-side-note">
          <span className="auth-side-icon">♡</span>
          <h2>Good things<br />grow when<br /><span>we share.</span></h2>
          <p>
            Join people in your community who believe useful things deserve
            another chance.
          </p>

          <div className="register-stat">
            <div className="register-stat-icon">↻</div>
            <div>
              <strong>A little kindness goes a long way.</strong>
              <span>Reuse · Share · Connect</span>
            </div>
          </div>

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
