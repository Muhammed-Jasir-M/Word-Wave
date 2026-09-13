"use client";

import React, { useState } from "react";
import { Square, AlertCircle, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import { AudioRecorderProps } from "@/types";
import { formatTime } from "@/utils/formatters";
import { AudioPreview } from "./AudioPreview";
import { ConfirmModal } from "./ConfirmModal";

export function AudioRecorder({
  recorder,
  onCancel,
  onAnalyse,
  isAnalyzing,
  analysisError,
}: AudioRecorderProps) {
  const {
    status,
    recordingTime,
    error,
    payload,
    isPermissionPending,
    startRecording,
    stopRecording,
    discardRecording,
    clearError,
  } = recorder;

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const handleBackClick = () => {
    if (status === "recorded") {
      setIsConfirmModalOpen(true);
    } else {
      discardRecording();
      if (onCancel) onCancel();
    }
  };

  const handleConfirmBackDiscard = () => {
    setIsConfirmModalOpen(false);
    discardRecording();
    if (onCancel) onCancel();
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all relative">
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

      {/* Permission Pending State */}
      {isPermissionPending && (
        <div className="text-center py-6 sm:py-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Requesting Microphone Access</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
              Please click &quot;Allow&quot; in your browser prompt to begin recording.
            </p>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {!isPermissionPending && error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-950 mb-1">Microphone Access Notice</p>
            <p className="leading-relaxed text-amber-900">{error}</p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  clearError();
                  startRecording();
                }}
                className="min-h-11 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
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

      {/* Active RECORDING State */}
      {!isPermissionPending && status === "recording" && (
        <div className="text-center py-4 sm:py-6 space-y-4 sm:space-y-5">
          {/* Animated pulsing recording banner */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            Recording in progress...
          </div>

          {/* Animated waveform bars */}
          <div className="flex items-center justify-center gap-1.5 h-10 py-1" aria-hidden="true">
            <span className="w-1.5 bg-rose-500 rounded-full h-4 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 bg-rose-600 rounded-full h-8 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 bg-rose-500 rounded-full h-10 animate-bounce" style={{ animationDelay: "300ms" }} />
            <span className="w-1.5 bg-rose-600 rounded-full h-6 animate-bounce" style={{ animationDelay: "450ms" }} />
            <span className="w-1.5 bg-rose-500 rounded-full h-3 animate-bounce" style={{ animationDelay: "200ms" }} />
          </div>

          {/* Live Timer Display */}
          <div>
            <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-900">
              {formatTime(recordingTime)}
            </span>
            <p className="text-xs text-slate-500 font-medium mt-1">Max limit: 10 minutes</p>
          </div>

          {/* Stop Action */}
          <div>
            <button
              type="button"
              onClick={stopRecording}
              aria-label="Stop recording"
              className="min-h-11 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
            >
              <Square className="w-4 h-4 fill-white text-white" />
              Stop Recording
            </button>
          </div>
        </div>
      )}

      {/* RECORDED State */}
      {!isPermissionPending && status === "recorded" && payload && (
        <AudioPreview
          audio={payload}
          onAnalyse={onAnalyse || (() => alert("AI analysis"))}
          onDiscard={discardRecording}
          discardText="Discard & Record Again"
          isAnalyzing={isAnalyzing}
          analysisError={analysisError}
        />
      )}

      {/* Discard Confirmation Modal for Back Button */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Discard this recording?"
        description="This will throw away your current audio take. This action cannot be undone."
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={handleConfirmBackDiscard}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
}
