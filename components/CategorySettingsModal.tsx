"use client";

import { useState } from "react";
import { useSections } from "@/hooks/useSections";
import type { Section } from "@/types";

type CategorySettingsModalProps = {
  section: Section | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CategorySettingsModal({ section, isOpen, onClose, onSuccess }: CategorySettingsModalProps) {
  const { updateSection, deleteSection } = useSections();
  const [mode, setMode] = useState<"edit" | "delete">("edit");
  const [icon, setIcon] = useState(section?.icon || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!section) return;

    setIsSubmitting(true);
    try {
      await updateSection(section.id, { icon: icon.trim() || undefined });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!section) return;

    setIsSubmitting(true);
    try {
      await deleteSection(section.id);
      onSuccess();
      onClose();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !section) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-kiosk-primary">Category Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-kiosk-muted text-kiosk-primary hover:bg-kiosk-accent hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`flex-1 rounded-xl py-3 font-semibold transition ${
              mode === "edit"
                ? "bg-kiosk-primary text-white"
                : "bg-kiosk-muted text-kiosk-primary hover:bg-kiosk-light"
            }`}
          >
            Edit Icon
          </button>
          <button
            type="button"
            onClick={() => setMode("delete")}
            className={`flex-1 rounded-xl py-3 font-semibold transition ${
              mode === "delete"
                ? "bg-red-500 text-white"
                : "bg-kiosk-muted text-kiosk-primary hover:bg-kiosk-light"
            }`}
          >
            Delete
          </button>
        </div>

        {mode === "edit" ? (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="mb-4">
              <p className="text-lg font-medium text-gray-700 mb-2">Category: {section.name}</p>
            </div>
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-gray-700">Icon (emoji)</span>
              <input
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                placeholder="e.g. ☕"
                maxLength={2}
              />
            </label>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl bg-kiosk-muted py-4 text-lg font-bold text-kiosk-primary transition hover:bg-kiosk-light"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-2xl bg-kiosk-primary py-4 text-lg font-bold text-white transition hover:bg-kiosk-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-lg font-medium text-gray-700 mb-2">Category: {section.name}</p>
              <p className="text-sm text-gray-500">
                This will permanently delete this category and all its items. This action cannot be undone.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full rounded-2xl bg-red-500 py-4 text-lg font-bold text-white transition hover:bg-red-600"
              >
                Delete Category
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-lg font-semibold text-red-600">
                  Are you sure you want to delete "{section.name}"?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-2xl bg-kiosk-muted py-4 text-lg font-bold text-kiosk-primary transition hover:bg-kiosk-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="flex-1 rounded-2xl bg-red-500 py-4 text-lg font-bold text-white transition hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
