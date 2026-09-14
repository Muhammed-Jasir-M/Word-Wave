"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AudioInputOption } from "@/components/AudioInputOption";
import { FormatInfo } from "@/components/FormatInfo";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { AudioPlayer } from "@/components/AudioPlayer";
import { WordCloud } from "@/components/WordCloud";
import { HistoryModal } from "@/components/HistoryModal";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioUploader } from "@/hooks/useAudioUploader";
import { AudioPayload, AudioAnalysisResponse, SavedSession, AppMode } from "@/types";
import { getSessionsDB, saveSessionDB, deleteSessionDB, clearSessionsDB } from "@/utils/db";
import { Sparkles, FileText, Hash, Globe, Tag, Copy, Check, Heart, ExternalLink, Volume2 } from "lucide-react";

export default function Home() {
  const [activeMode, setActiveMode] = useState<AppMode>("idle");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResponse | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  const recorder = useAudioRecorder();
  const uploader = useAudioUploader();

  // Load sessions from IndexedDB on initial mount
  useEffect(() => {
    getSessionsDB().then((loaded) => {
      setSavedSessions(loaded);
    });
  }, []);

  const saveSessionToHistory = async (
    fileName: string,
    data: AudioAnalysisResponse,
    blob: Blob
  ) => {
    const newSession: SavedSession = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      fileName,
      result: data,
      audioBlob: blob,
      audioUrl: URL.createObjectURL(blob),
    };

    await saveSessionDB(newSession);
    const updated = await getSessionsDB();
    setSavedSessions(updated);
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSessionDB(id);
    const updated = await getSessionsDB();
    setSavedSessions(updated);
  };

  const handleClearAllHistory = async () => {
    await clearSessionsDB();
    setSavedSessions([]);
  };

  const handleSelectSavedSession = (session: SavedSession) => {
    setAnalysisResult(session.result);
    setCurrentAudioUrl(session.audioUrl || null);
    setActiveMode("idle");
    setIsHistoryOpen(false);
  };

  const handleRecordClick = async () => {
    setActiveMode("record");
    await recorder.startRecording();
  };

  const handleUploadClick = () => {
    setActiveMode("upload");
  };

  const handleCopyTranscript = () => {
    if (!analysisResult?.transcript) return;
    navigator.clipboard.writeText(analysisResult.transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBackToOptions = () => {
    recorder.discardRecording();
    uploader.discardFile();
    setAnalysisError(null);
    setAnalysisResult(null);
    setCurrentAudioUrl(null);
    setUploadProgress(null);
    setIsAnalyzing(false);
    setActiveMode("idle");
  };

  const handleAnalyseAI = async (audio: AudioPayload) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setUploadProgress(0);
    setCurrentAudioUrl(audio.audioUrl);

    if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
      setAnalysisError("Network connection error. Please check your internet connection and try again.");
      setIsAnalyzing(false);
      setUploadProgress(null);
      return;
    }

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      const isUploadedFile = audio.blob instanceof File;
      const fileObj = isUploadedFile ? (audio.blob as File) : null;
      const uploadFileName = fileObj ? fileObj.name : "recording.webm";
      const displayFileName = fileObj ? fileObj.name : (audio.name || "Voice Recording");

      formData.append("file", audio.blob, uploadFileName);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setUploadProgress(null);
        setIsAnalyzing(false);
        let data: Record<string, unknown> = {};
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          setAnalysisError("Server returned an invalid or unparseable response. Please try again.");
          resolve();
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          const parsedResponse = data as unknown as AudioAnalysisResponse;
          setAnalysisResult(parsedResponse);
          saveSessionToHistory(displayFileName, parsedResponse, audio.blob);
        } else {
          const serverError = typeof data.error === "string" ? data.error : null;
          setAnalysisError(serverError || "An error occurred during audio analysis. Please try again.");
        }
        resolve();
      };

      xhr.onerror = () => {
        setUploadProgress(null);
        setIsAnalyzing(false);
        setAnalysisError("Network connection error. Please check your internet connection and try again.");
        resolve();
      };

      xhr.open("POST", "/api/analyze");
      xhr.send(formData);
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl mx-auto space-y-6">
        <Header
          historyCount={savedSessions.length}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />

        {activeMode === "idle" && !analysisResult && (
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
              uploadProgress={uploadProgress}
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
              uploadProgress={uploadProgress}
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Full Session Analysis</h3>
                    <p className="text-xs text-slate-600">Generated by {analysisResult.modelUsed || "Gemini AI"}</p>
                  </div>
                </div>
              </div>

              {/* Saved Audio Recording Playback Player */}
              {currentAudioUrl && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                    Session Audio Playback
                  </h4>
                  <AudioPlayer src={currentAudioUrl} />
                </div>
              )}

              {/* Badges bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium pt-1">
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
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Transcript
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 max-h-60 overflow-y-auto font-sans select-text">
                  {analysisResult.transcript}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-4 text-center text-xs text-slate-500 font-medium border-t border-slate-200/60 mt-8 space-y-1">
          <p>© {new Date().getFullYear()} WordWave • AI Audio Analysis Tool</p>
          <p className="inline-flex items-center justify-center gap-1 flex-wrap">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline shrink-0" />
            <span>by</span>
            <a
              href="https://github.com/Muhammed-Jasir-M/Word-Wave"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1"
            >
              <span>Muhammed Jasir M</span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
            </a>
          </p>
        </footer>
      </div>

      {/* History Modal Component */}
      <HistoryModal
        isOpen={isHistoryOpen}
        sessions={savedSessions}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectSavedSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAllHistory}
      />
    </main>
  );
}
