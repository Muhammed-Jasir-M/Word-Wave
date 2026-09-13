"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  UploadCloud,
  Trash2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { AudioUploaderProps } from "@/types";
import { SUPPORTED_AUDIO_FORMATS } from "@/constants";
import { formatTime, formatFileSize } from "@/utils/formatters";
import { AudioPlayer } from "./AudioPlayer";
import { ConfirmModal } from "./ConfirmModal";

export function AudioUploader({ uploader, onCancel }: AudioUploaderProps) {
  const {
    status,
    file,
    audioUrl,
    duration,
    error,
    processFile,
    discardFile,
    clearError,
  } = uploader;

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<"upload_another" | "back" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyseAI = () => {
    alert("AI analysis");
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
    // Reset file input value so re-uploading the same file triggers onChange
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

  const handleOpenDiscardModal = (action: "upload_another" | "back") => {
    setPendingAction(action);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDiscard = () => {
    setIsConfirmModalOpen(false);
    const action = pendingAction;
    setPendingAction(null);

    discardFile();

    if (action === "upload_another") {
      setTimeout(() => {
        handleTriggerFileInput();
      }, 50);
    } else if (action === "back" && onCancel) {
      onCancel();
    }
  };

  const handleCloseModal = () => {
    setIsConfirmModalOpen(false);
    setPendingAction(null);
  };

  const handleBackClick = () => {
    if (status === "uploaded") {
      handleOpenDiscardModal("back");
    } else {
      discardFile();
      if (onCancel) onCancel();
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white/95 p-4 sm:p-6 shadow-sm transition-all relative">
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80 shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-950 mb-1">Audio Upload Notice</p>
            <p className="leading-relaxed text-amber-900">{error}</p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  clearError();
                  handleTriggerFileInput();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <RefreshCw className="w-3 h-3" />
                Select Another File
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors"
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
            <h3 className="text-base font-semibold text-slate-900">Validating Audio File</h3>
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
            <span className="font-semibold text-indigo-600 hover:underline">browse</span>
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
      {status === "uploaded" && audioUrl && file && (
        <div className="space-y-4 sm:space-y-5 py-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 truncate" title={file.name}>
                {file.name}
              </h3>
            </div>

            {/* Meta badges with formatTime and formatFileSize */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium self-start sm:self-center shrink-0">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {formatTime(duration)}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>

          {/* Custom HTML5 Audio Player */}
          <AudioPlayer src={audioUrl} initialDuration={duration} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleOpenDiscardModal("upload_another")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Discard & Upload Another
            </button>

            <button
              type="button"
              onClick={handleAnalyseAI}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyse with AI
            </button>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Discard this audio file?"
        description="This will throw away your selected file. You can then select or drop a new audio file. This action cannot be undone."
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={handleConfirmDiscard}
        onCancel={handleCloseModal}
      />
    </div>
  );
}
