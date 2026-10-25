"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, AlertCircle } from "lucide-react";

export interface FileDropZoneProps {
  accept?: string;
  maxSizeBytes?: number;
  onFileSelect: (file: File) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function FileDropZone({
  accept = ".csv,.xlsx,.xls",
  maxSizeBytes = 5 * 1024 * 1024, // 5MB default per TRD
  onFileSelect,
  title = "Drop your spreadsheet or file here",
  subtitle = "Supports CSV, Excel (XLSX) up to 5 MB",
  className = "",
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > maxSizeBytes) {
      setError(`File exceeds the maximum limit of ${Math.round(maxSizeBytes / (1024 * 1024))} MB.`);
      return;
    }
    setSelectedFileName(file.name);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label="Upload CSV or Excel spreadsheet"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center p-8 rounded-card border-2 border-dashed transition-all cursor-pointer text-center select-none outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isDragging
          ? "border-accent bg-accent/5 scale-[1.01]"
          : "border-hairline bg-surface hover:bg-surface-raised"
      } ${className}`}
    >
      <input
        ref={inputRef}
        id="file-dropzone-input"
        name="file"
        aria-label="Upload spreadsheet or file"
        type="file"
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center text-ink-secondary mb-3">
        {selectedFileName ? (
          <File className="w-6 h-6 text-accent" />
        ) : (
          <UploadCloud className="w-6 h-6 text-ink-secondary" />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">
          {selectedFileName || title}
        </p>
        <p className="text-xs text-ink-secondary">{subtitle}</p>
      </div>

      {error && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-danger font-medium">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
