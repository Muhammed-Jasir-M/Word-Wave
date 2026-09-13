"use client";

import React, { useState } from "react";
import { Trash2, Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { AudioPreviewProps } from "@/types";
import { formatTime, formatFileSize } from "@/utils/formatters";
import { AudioPlayer } from "./AudioPlayer";
import { ConfirmModal } from "./ConfirmModal";

export function AudioPreview({
  audio,
  onAnalyse,
  onDiscard,
  discardText = "Discard Audio",
  isAnalyzing = false,
  analysisError = null,
}: AudioPreviewProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const handleOpenDiscardModal = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDiscard = () => {
    setIsConfirmModalOpen(false);
    onDiscard();
  };

  const handleCloseModal = () => {
    setIsConfirmModalOpen(false);
  };

  const modalTitle =
    audio.source === "recording"
      ? "Discard this recording?"
      : "Discard this audio file?";

  const modalDescription =
    audio.source === "recording"
      ? "This will throw away your current audio take. This action cannot be undone."
      : "This will throw away your selected file. You can then select or drop a new audio file. This action cannot be undone.";

  return (
    <div className="space-y-4 sm:space-y-5 py-1">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 truncate" title={audio.name}>
            {audio.source === "recording" ? "Audio Preview" : audio.name}
          </h3>
        </div>

        {/* Metadata Badges */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium self-start sm:self-center shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {formatTime(audio.duration)}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {formatFileSize(audio.size)}
          </span>
        </div>
      </div>

      {/* Analysis Error Alert */}
      {analysisError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-950 mb-1">Analysis Error</p>
            <p className="leading-relaxed text-rose-900">{analysisError}</p>
            <div className="mt-3">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => onAnalyse(audio)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player */}
      <AudioPlayer src={audio.audioUrl} initialDuration={audio.duration} />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleOpenDiscardModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          {discardText}
        </button>

        <button
          type="button"
          disabled={isAnalyzing}
          onClick={() => onAnalyse(audio)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyse with AI
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title={modalTitle}
        description={modalDescription}
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={handleConfirmDiscard}
        onCancel={handleCloseModal}
      />
    </div>
  );
}
