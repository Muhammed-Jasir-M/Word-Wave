"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { AudioInputOption } from "@/components/AudioInputOption";
import { FormatInfo } from "@/components/FormatInfo";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { WordCloud } from "@/components/WordCloud";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioUploader } from "@/hooks/useAudioUploader";
import { AudioPayload, AudioAnalysisResponse } from "@/types";
import { Sparkles, FileText, Hash, Globe, Tag } from "lucide-react";

type Mode = "idle" | "record" | "upload";

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>("idle");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResponse | null>(null);

  const recorder = useAudioRecorder();
  const uploader = useAudioUploader();

  const handleRecordClick = async () => {
    setActiveMode("record");
    await recorder.startRecording();
  };

  const handleUploadClick = () => {
    setActiveMode("upload");
  };

  const handleBackToOptions = () => {
    recorder.discardRecording();
    uploader.discardFile();
    setAnalysisError(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setActiveMode("idle");
  };

  const handleAnalyseAI = async (audio: AudioPayload) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    // Check internet connection
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
      setAnalysisError("Network connection error. Please check your internet connection and try again.");
      setIsAnalyzing(false);
      return;
    }

    try {
      const formData = new FormData();
      const fileName =
        audio.blob instanceof File
          ? audio.blob.name
          : `${audio.name || "recording"}.webm`;

      formData.append("file", audio.blob, fileName);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      let data: Record<string, unknown> = {};
      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid or unparseable response. Please try again.");
      }

      if (!response.ok) {
        const serverError = typeof data.error === "string" ? data.error : null;
        throw new Error(
          serverError || "An error occurred during audio analysis. Please try again."
        );
      }

      setAnalysisResult(data as unknown as AudioAnalysisResponse);
    } catch (err: unknown) {
      const errObj = err as { message?: string; name?: string };
      if (errObj.name === "TypeError" || errObj.message?.includes("fetch")) {
        setAnalysisError(
          "Network connection error. Please check your internet connection and try again."
        );
      } else {
        setAnalysisError(
          errObj.message || "Failed to analyze audio with AI service. Please try again."
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl mx-auto space-y-6">
        <Header />

        {activeMode === "idle" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AudioInputOption
                type="record"
                title="Record Audio"
                description="Use your microphone to record audio live in the browser."
                actionText="Start Recording"
                onClick={handleRecordClick}
              />

              <AudioInputOption
                type="upload"
                title="Upload Audio"
                description="Select or drop an existing audio file from your device."
                actionText="Select File"
                onClick={handleUploadClick}
              />
            </div>

            <FormatInfo />
          </>
        )}

        {activeMode === "record" && (
          <div className="space-y-4">
            <AudioRecorder
              recorder={recorder}
              onCancel={handleBackToOptions}
              onAnalyse={handleAnalyseAI}
              isAnalyzing={isAnalyzing}
              analysisError={analysisError}
            />
          </div>
        )}

        {activeMode === "upload" && (
          <div className="space-y-4">
            <AudioUploader
              uploader={uploader}
              onCancel={handleBackToOptions}
              onAnalyse={handleAnalyseAI}
              isAnalyzing={isAnalyzing}
              analysisError={analysisError}
            />
          </div>
        )}

        {/* Structured Analysis Results Output */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Word Cloud Result View */}
            <WordCloud
              terms={analysisResult.terms || []}
              onNewAnalysis={handleBackToOptions}
            />

            <div className="rounded-2xl border border-indigo-200/90 bg-white/95 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Full Session Analysis</h3>
                  <p className="text-xs text-slate-600">Generated by {analysisResult.modelUsed || "Gemini AI"}</p>
                </div>
              </div>

              {/* Badges bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  Language: <strong className="text-slate-900">{analysisResult.language}</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  Words: <strong className="text-slate-900">{analysisResult.wordCount}</strong>
                </span>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Summary</h4>
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Key Topics */}
              {analysisResult.keyTopics && analysisResult.keyTopics.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Key Topics</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.keyTopics.map((topic, idx) => (
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
              <div className="space-y-1 pt-1">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Transcript
                </h4>
                <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 max-h-60 overflow-y-auto font-sans">
                  {analysisResult.transcript}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


