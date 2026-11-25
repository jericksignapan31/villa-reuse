
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  loadUserProfile,
  saveUserProfile,
  loadUserSettings,
  saveUserSettings,
  validateProfile,
  validatePasswordChange,
  verifyUserPassword,
  setUserPassword,
  getStoredPassword,
  type UserProfile,
  type UserSettings,
  type ProfileValidationErrors,
  type PasswordValidationErrors,
} from "@/lib/userStore";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [requestNotifications, setRequestNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<PasswordValidationErrors>(
    {}
  );

  // Form state
  const [profileErrors, setProfileErrors] = useState<ProfileValidationErrors>(
    {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load data on mount
  useEffect(() => {
    const profile = loadUserProfile();
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setAddress(profile.address);
    setProfilePicture(profile.profilePicture || "");

    const settings = loadUserSettings();
    setRequestNotifications(settings.requestNotifications);
    setMessageNotifications(settings.messageNotifications);
    setCommunityUpdates(settings.communityUpdates);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate profile
    const errors = validateProfile({ name, email, phone, address });
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    setIsSaving(true);

    // Simulate save delay
    setTimeout(() => {
      const profile: UserProfile = {
        id: "user-001",
        name,
        email,
        phone,
        address,
        profilePicture,
        joinedDate: "Nov 1, 2024",
      };

      const settings: UserSettings = {
        requestNotifications,
        messageNotifications,
        communityUpdates,
      };

      saveUserProfile(profile);
      saveUserSettings(settings);

      setIsSaving(false);
      setProfileErrors({});
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };

  const handlePasswordChangeClick = () => {
    setPasswordErrors({});
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validatePasswordChange(
      currentPassword,
      newPassword,
      confirmPassword
    );
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setIsSaving(true);

    // Simulate save delay
    setTimeout(() => {
      setUserPassword(newPassword);
      setIsSaving(false);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      setProfileErrors({ ...profileErrors }); // Trigger re-render
      setPasswordErrors({ general: "Password changed successfully!" });

      // Clear message after 3 seconds
      setTimeout(() => setPasswordErrors({}), 3000);
    }, 500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PNG, JPG, or WEBP image");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    // Create data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProfilePicture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePicture("");
  };

  return (
    <main className="settings-page">
      <div className="settings-container">
        <Link href="/dashboard" className="settings-back">
          ← Back to Dashboard
        </Link>

        <header className="settings-header">
          <p className="settings-eyebrow">ACCOUNT PREFERENCES</p>
          <h1>Settings</h1>
          <p>Manage your profile and personalize your Villa Reuse experience.</p>
        </header>

        {saveSuccess && (
          <div className="settings-success-message">
            ✅ Your changes have been saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="settings-form">
          {/* Profile */}
          <section className="settings-card">
            <div className="settings-section-heading">
              <div className="settings-section-icon">♙</div>
              <div>
                <h2>Profile Information</h2>
                <p>Update your personal information.</p>
              </div>
            </div>

            <div className="settings-fields">
              <label className={profileErrors.name ? "field-error" : ""}>
                Full Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSaving}
                />
                {profileErrors.name && (
                  <span className="settings-field-error">
                    {profileErrors.name}
                  </span>
                )}
              </label>

              {/* Profile Picture */}
              <div className="settings-profile-picture-section">
                <div className="settings-profile-picture-container">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="settings-profile-picture"
                    />
                  ) : (
                    <div className="settings-profile-picture-placeholder">
                      👤
                    </div>
                  )}
                </div>
                <div className="settings-profile-picture-actions">
                  <label className="settings-picture-upload-label">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={isSaving}
                      style={{ display: "none" }}
                    />
                    {profilePicture ? "Change Photo" : "Upload Photo"}
                  </label>
                  {profilePicture && (
                    <button
                      type="button"
                      className="settings-picture-remove-button"
                      onClick={handleRemovePhoto}
                      disabled={isSaving}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                <p className="settings-picture-hint">
                  PNG, JPG, or WEBP • Max 2MB
                </p>
              </div>

              <label className={profileErrors.email ? "field-error" : ""}>
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSaving}
                />
                {profileErrors.email && (
                  <span className="settings-field-error">
                    {profileErrors.email}
                  </span>
                )}
              </label>

              <label className={profileErrors.phone ? "field-error" : ""}>
                Phone Number
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={isSaving}
                />
                {profileErrors.phone && (
                  <span className="settings-field-error">
                    {profileErrors.phone}
                  </span>
                )}
              </label>

              <label className={profileErrors.address ? "field-error" : ""}>
                Community / Address
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your community or location"
                  disabled={isSaving}
                />
                {profileErrors.address && (
                  <span className="settings-field-error">
                    {profileErrors.address}
                  </span>
                )}
              </label>
            </div>
          </section>

          {/* Password */}
          <section className="settings-card">
            <div className="settings-section-heading">
              <div className="settings-section-icon">♧</div>
              <div>
                <h2>Password & Security</h2>
                <p>Keep your account secure.</p>
              </div>
            </div>

            <div className="settings-security-row">
              <div>
                <strong>Password</strong>
                <p>Change your password to protect your account.</p>
              </div>
              <button
                type="button"
                className="settings-secondary-button"
                onClick={handlePasswordChangeClick}
                disabled={isSaving}
              >
                Change Password
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="settings-card">
            <div className="settings-section-heading">
              <div className="settings-section-icon">♧</div>
              <div>
                <h2>Notifications</h2>
                <p>Choose what updates you want to receive.</p>
              </div>
            </div>

            <div className="settings-toggle-list">
              <label className="settings-toggle-row">
                <div>
                  <strong>Request Updates</strong>
                  <p>Notify me when my item requests change.</p>
                </div>
                <input
                  type="checkbox"
                  checked={requestNotifications}
                  onChange={(e) => setRequestNotifications(e.target.checked)}
                  disabled={isSaving}
                />
              </label>

              <label className="settings-toggle-row">
                <div>
                  <strong>Messages & Responses</strong>
                  <p>Notify me when someone responds to my request.</p>
                </div>
                <input
                  type="checkbox"
                  checked={messageNotifications}
                  onChange={(e) => setMessageNotifications(e.target.checked)}
                  disabled={isSaving}
                />
              </label>

              <label className="settings-toggle-row">
                <div>
                  <strong>Community Updates</strong>
                  <p>Receive community announcements and updates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={communityUpdates}
                  onChange={(e) => setCommunityUpdates(e.target.checked)}
                  disabled={isSaving}
                />
              </label>
            </div>
          </section>

          {/* Save */}
          <div className="settings-save-row">
            <Link href="/dashboard" className="settings-cancel-button">
              Cancel
            </Link>
            <button
              type="submit"
              className="settings-save-button"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <div className="settings-modal-header">
              <h2>Change Password</h2>
              <button
                type="button"
                className="settings-modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="settings-modal-form">
              {passwordErrors.general && (
                <div
                  className={`settings-modal-message ${
                    passwordErrors.general.includes("successfully")
                      ? "success"
                      : "error"
                  }`}
                >
                  {passwordErrors.general}
                </div>
              )}

              <label
                className={passwordErrors.currentPassword ? "field-error" : ""}
              >
                Current Password
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={isSaving}
                />
                {passwordErrors.currentPassword && (
                  <span className="settings-field-error">
                    {passwordErrors.currentPassword}
                  </span>
                )}
              </label>

              <label className={passwordErrors.newPassword ? "field-error" : ""}>
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a new password (min 6 characters)"
                  disabled={isSaving}
                />
                {passwordErrors.newPassword && (
                  <span className="settings-field-error">
                    {passwordErrors.newPassword}
                  </span>
                )}
              </label>

              <label
                className={passwordErrors.confirmPassword ? "field-error" : ""}
              >
                Confirm Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={isSaving}
                />
                {passwordErrors.confirmPassword && (
                  <span className="settings-field-error">
                    {passwordErrors.confirmPassword}
                  </span>
                )}
              </label>

              <div className="settings-modal-actions">
                <button
                  type="button"
                  className="settings-cancel-button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="settings-save-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
