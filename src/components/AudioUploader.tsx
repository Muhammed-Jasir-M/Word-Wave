"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, AlertCircle, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import { AudioUploaderProps } from "@/types";
import { SUPPORTED_AUDIO_FORMATS } from "@/constants";
import { AudioPreview } from "./AudioPreview";
import { ConfirmModal } from "./ConfirmModal";

export function AudioUploader({
  uploader,
  onCancel,
  onAnalyse,
  isAnalyzing,
  uploadProgress,
  analysisError,
}: AudioUploaderProps) {
  const { status, error, payload, processFile, discardFile, clearError } =
    uploader;

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileSelect(droppedFile);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleBackClick = () => {
    if (status === "uploaded") {
      setIsConfirmModalOpen(true);
    } else {
      discardFile();
      if (onCancel) onCancel();
    }
  };

  const handleConfirmBackDiscard = () => {
    setIsConfirmModalOpen(false);
    discardFile();
    if (onCancel) onCancel();
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all relative">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload audio file"
      />

      {/* Back button badge */}
      {onCancel && (
        <div className="mb-4">
          <button
            type="button"
            onClick={handleBackClick}
            className="min-h-11 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-950 mb-1">
              Audio Upload Notice
            </p>
            <p className="leading-relaxed text-amber-900">{error}</p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  clearError();
                  handleTriggerFileInput();
                }}
                className="min-h-11 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Select Another File
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="min-h-11 px-3.5 py-2 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validating State */}
      {status === "validating" && (
        <div className="text-center py-8 sm:py-10 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Validating Audio File
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
              Checking format, file size, and audio duration...
            </p>
          </div>
        </div>
      )}

      {/* Idle / Dropzone State */}
      {status === "idle" && !error && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerFileInput}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleTriggerFileInput();
            }
          }}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
            isDragOver
              ? "border-indigo-500 bg-indigo-50/70 scale-[0.99]"
              : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30"
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100/80 border border-indigo-200/60 flex items-center justify-center text-indigo-600 mb-3.5">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            Upload an audio file
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Drag & drop your file here, or{" "}
            <span className="font-semibold text-indigo-600 hover:underline">
              browse
            </span>
          </p>

          <div className="mt-4 flex flex-wrap justify-center items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Supported:</span>
            {SUPPORTED_AUDIO_FORMATS.map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono text-[10px] font-semibold"
              >
                {fmt}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-slate-600 mt-3 font-medium">
            Max size: 25 MB • Max duration: 10 minutes
          </p>
        </div>
      )}

      {/* Uploaded / Preview State */}
      {status === "uploaded" && payload && (
        <AudioPreview
          audio={payload}
          onAnalyse={onAnalyse || (() => alert("AI analysis"))}
          onDiscard={discardFile}
          discardText="Discard & Upload Another"
          isAnalyzing={isAnalyzing}
          uploadProgress={uploadProgress}
          analysisError={analysisError}
        />
      )}

      {/* Discard Confirmation Modal for Back Button */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Discard this audio file?"
        description="This will throw away your selected file. You can then select or drop a new audio file. This action cannot be undone."
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={handleConfirmBackDiscard}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
}
