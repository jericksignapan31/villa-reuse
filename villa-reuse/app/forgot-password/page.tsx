"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/authStore";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = requestPasswordReset(email);
      if (result.success) {
        setMessage(result.message || "Password reset link sent to your email");
        
        // For demo, generate and show the token
        const demoToken = "reset_" + Math.random().toString(36).substring(2, 15);
        setGeneratedToken(demoToken);
        
        setEmail("");
        setTimeout(() => {
          setStep("reset");
          setMessage("");
        }, 2000);
      } else {
        setError(result.error || "Failed to process request");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Validate inputs
      if (!token.trim()) {
        setError("Reset token is required");
        setLoading(false);
        return;
      }

      if (!newPassword) {
        setError("New password is required");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Import the reset function dynamically to avoid circular imports
      const { resetPassword } = await import("@/lib/authStore");
      
      const result = resetPassword({
        token: token.trim(),
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <nav className="auth-nav">
        <Link href="/" className="browse-logo">
          <span className="browse-logo-icon">↻</span>
          <span>villa<span>reuse</span></span>
        </Link>

        <Link href="/login" className="auth-back-home">
          ← Back to login
        </Link>
      </nav>

      <section className="auth-main">
        <div className="auth-card">
          <div className="auth-brand-mark">↻</div>

          {step === "request" ? (
            <>
              <p className="browse-eyebrow">PASSWORD RESET</p>
              <h1>Forgot your <span>password?</span></h1>
              <p className="auth-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && <div className="auth-error-message">{error}</div>}
              {message && <div className="auth-success-message">{message}</div>}

              <form className="auth-form" onSubmit={handleRequestReset}>
                <div className="auth-field">
                  <label htmlFor="reset-email">Email address</label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit-button"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send reset link"} <span>↗</span>
                </button>
              </form>

              <div className="auth-hint-box">
                <p><strong>Demo Note:</strong> In a real app, you'd receive an email. For demo purposes, a token will be generated for you to use.</p>
              </div>
            </>
          ) : (
            <>
              <p className="browse-eyebrow">RESET PASSWORD</p>
              <h1>Create a new <span>password.</span></h1>
              <p className="auth-description">
                Enter the reset token and choose a new password.
              </p>

              {error && <div className="auth-error-message">{error}</div>}
              {message && <div className="auth-success-message">{message}</div>}

              <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="auth-field">
                  <label htmlFor="reset-token">Reset token</label>
                  <input
                    id="reset-token"
                    type="text"
                    placeholder="Paste your reset token here"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={loading}
                    required
                  />
                  {generatedToken && (
                    <div className="auth-hint-box">
                      <p><strong>Your demo token:</strong></p>
                      <code style={{ wordBreak: "break-all", fontSize: "12px" }}>
                        {generatedToken}
                      </code>
                      <p style={{ marginTop: "8px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setToken(generatedToken);
                          }}
                          style={{ color: "var(--color-primary)", textDecoration: "underline", border: "none", background: "none", cursor: "pointer" }}
                        >
                          Use this token
                        </button>
                      </p>
                    </div>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="new-password">New password</label>
                  <div className="auth-password-wrapper">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                  <span className="register-hint">
                    Use at least 6 characters.
                  </span>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirm-new-password">Confirm password</label>
                  <div className="auth-password-wrapper">
                    <input
                      id="confirm-new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                      minLength={6}
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
                </div>

                <button
                  type="submit"
                  className="auth-submit-button"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset password"} <span>↗</span>
                </button>
              </form>

              <div className="auth-divider">
                <span>REMEMBER YOUR PASSWORD?</span>
              </div>

              <p className="auth-switch">
                Go back to <Link href="/login">log in</Link>
              </p>
            </>
          )}
        </div>

        <div className="auth-side-note">
          <span className="auth-side-icon">↻</span>
          <h2>Need help?<br />We're here<br /><span>for you.</span></h2>
          <p>
            Your security is important to us. Reset your password safely and get back to sharing with your community.
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
