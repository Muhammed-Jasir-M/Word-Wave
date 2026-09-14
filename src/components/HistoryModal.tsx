"use client";

import React, { useEffect, useState } from "react";
import { HistoryModalProps } from "@/types";
import { History, X, Clock, Trash2, ArrowRight, FileText, Tag } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

type ConfirmTarget = { type: "single"; id: string } | { type: "clearAll" } | null;

export function HistoryModal({
  isOpen,
  sessions,
  onClose,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}: HistoryModalProps) {
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !confirmTarget) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, confirmTarget, onClose]);

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    if (!confirmTarget) return;
    if (confirmTarget.type === "single" && onDeleteSession) {
      onDeleteSession(confirmTarget.id);
    } else if (confirmTarget.type === "clearAll" && onClearAll) {
      onClearAll();
    }
    setConfirmTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={`relative w-full rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-scale-up transition-all duration-200 ${
          sessions.length > 1
            ? "max-w-md md:max-w-3xl lg:max-w-4xl"
            : "max-w-lg"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-100 bg-slate-50/80 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                Session History
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 font-mono shrink-0">
                {sessions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {sessions.length > 0 && onClearAll && (
              <button
                type="button"
                onClick={() => setConfirmTarget({ type: "clearAll" })}
                className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Clear All</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200/80 cursor-pointer shrink-0"
              aria-label="Close History Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          className={`p-4 sm:p-5 overflow-y-auto flex-1 ${
            sessions.length > 1
              ? "grid grid-cols-1 md:grid-cols-2 gap-3.5"
              : "space-y-3"
          }`}
        >
          {sessions.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <History className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No Saved Sessions Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Analyzed sessions will automatically appear here for quick access.
              </p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 group relative"
              >
                {/* Session Card Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {session.fileName === "Recorded Audio.webm" || session.fileName === "Recorded Audio"
                          ? "Voice Recording"
                          : session.fileName}
                      </span>
                    </div>

                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmTarget({ type: "single", id: session.id });
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title="Delete session"
                        aria-label="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Metadata Row: Words count + Chars count + Date timestamp */}
                  <div className="flex items-center justify-between text-[11px] gap-2 pt-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium shrink-0">
                      {session.result.wordCount} words • {(session.result.transcript || "").length} chars
                    </span>

                    <span className="text-slate-500 flex items-center gap-1 font-medium shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {session.timestamp}
                    </span>
                  </div>
                </div>

                {/* Summary snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 font-sans">
                  {session.result.summary}
                </p>

                {/* Action Row */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {(session.result.keyTopics || []).slice(0, 2).map((topic, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-27.5"
                      >
                        <Tag className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                        {topic}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectSession(session);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors shrink-0 cursor-pointer"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Click &quot;View Analysis&quot; to restore the full word cloud, transcript, and audio.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmTarget !== null}
        title={
          confirmTarget?.type === "clearAll"
            ? "Clear all history?"
            : "Delete this session?"
        }
        description={
          confirmTarget?.type === "clearAll"
            ? "Are you sure you want to delete all saved session history? This action cannot be undone."
            : "Are you sure you want to delete this session from your history? This action cannot be undone."
        }
        confirmText={confirmTarget?.type === "clearAll" ? "Clear All" : "Delete"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
