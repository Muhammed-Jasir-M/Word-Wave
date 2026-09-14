"use client";

import React from "react";
import {
  Sparkles,
  Volume2,
  Download,
  Globe,
  Hash,
  FileText,
  Copy,
  Check,
  Tag,
} from "lucide-react";
import { SessionAnalysisProps } from "@/types";
import { AudioPlayer } from "./AudioPlayer";

export function SessionAnalysis({
  result,
  currentAudioUrl,
  onDownloadAudio,
  onCopySummary,
  onCopyTranscript,
  isSummaryCopied,
  isTranscriptCopied,
}: SessionAnalysisProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4.5">
      {/* Header */}
      <div className="flex items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-950">Session Analysis</h3>
            <p className="text-xs text-slate-500">
              Processed by {result.modelUsed || "Gemini AI"}
            </p>
          </div>
        </div>
      </div>

      {/* Session Audio Player */}
      {currentAudioUrl && (
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Audio Playback</span>
            </h4>
            <button
              type="button"
              onClick={onDownloadAudio}
              aria-label="Download audio recording file"
              className="min-h-9 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 cursor-pointer whitespace-nowrap self-start sm:self-auto"
              title="Download audio recording"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Download Audio</span>
            </button>
          </div>
          <AudioPlayer src={currentAudioUrl} />
        </div>
      )}

      {/* Metrics badges bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium pt-1">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          Language: <strong className="text-slate-900">{result.language}</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          <Hash className="w-3.5 h-3.5 text-slate-500" />
          Words: <strong className="text-slate-900">{result.wordCount}</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          Characters: <strong className="text-slate-900">{(result.transcript || "").length}</strong>
        </span>
      </div>

      {/* Executive Summary */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Summary</h4>
          <button
            type="button"
            onClick={onCopySummary}
            aria-label="Copy executive summary"
            className="min-h-9 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 cursor-pointer"
          >
            {isSummaryCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 font-sans">
          {result.summary}
        </p>
      </div>

      {/* Key Topics */}
      {result.keyTopics && result.keyTopics.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Key Topics</h4>
          <div className="flex flex-wrap gap-1.5">
            {result.keyTopics.map((topic, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                <Tag className="w-3 h-3 text-indigo-500" />
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Transcript</span>
          </h4>
          <button
            type="button"
            onClick={onCopyTranscript}
            aria-label="Copy full transcript"
            className="min-h-9 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 cursor-pointer"
          >
            {isTranscriptCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copy Transcript</span>
              </>
            )}
          </button>
        </div>
        <div className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 max-h-60 overflow-y-auto font-sans select-text">
          {result.transcript}
        </div>
      </div>
    </div>
  );
}
