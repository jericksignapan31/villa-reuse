import React from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({
  isOpen,
  onConfirm,
  onCancel,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Confirm Logout</h2>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>Are you sure you want to log out?</p>
          <p className="modal-subtext">
            You'll need to log in again to access your account.
          </p>
        </div>

        <div className="modal-footer">
          <button className="modal-button modal-button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-button modal-button-danger" onClick={onConfirm}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
