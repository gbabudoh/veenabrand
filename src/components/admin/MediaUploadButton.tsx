"use client";

import React, { useRef, useState } from "react";

interface MediaUploadButtonProps {
  /** Called with the public URL of the uploaded file. */
  onUploaded: (url: string) => void;
  /** Storage folder, e.g. "mega-menu", "footer", "products". */
  folder?: string;
  accept?: string;
  label?: string;
  /** "dark" for the dark customizer pages, "light" for the slate admin pages. */
  variant?: "dark" | "light";
}

// Uploads a file to MinIO via /api/admin/uploads and hands back its URL.
export default function MediaUploadButton({
  onUploaded,
  folder = "uploads",
  accept = "image/*",
  label = "Upload",
  variant = "dark",
}: MediaUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/admin/uploads", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }
      onUploaded(data.url);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        style={{
          ...(variant === "light"
            ? { background: "#FFFFFF", border: "1px solid #CBD5E1", color: "#0F172A", borderRadius: "6px", fontWeight: 600 }
            : { background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.2)", color: "#F6F2EA", borderRadius: "2px" }),
          padding: "0 14px",
          fontSize: "12px",
          cursor: busy ? "wait" : "pointer",
          whiteSpace: "nowrap",
          opacity: busy ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        {busy ? "Uploading..." : label}
      </button>
    </>
  );
}
