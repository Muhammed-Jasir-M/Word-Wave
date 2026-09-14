"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AudioInputOption } from "@/components/AudioInputOption";
import { FormatInfo } from "@/components/FormatInfo";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { WordCloud } from "@/components/WordCloud";
import { SessionAnalysis } from "@/components/SessionAnalysis";
import { HistoryModal } from "@/components/HistoryModal";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioUploader } from "@/hooks/useAudioUploader";
import { AudioPayload, AudioAnalysisResponse, SavedSession, AppMode } from "@/types";
import { getSessionsDB, saveSessionDB, deleteSessionDB, clearSessionsDB } from "@/utils/db";
import { analyzeAudioWithAI } from "@/lib/api";
import { Heart, ExternalLink } from "lucide-react";

export default function Home() {
  const [activeMode, setActiveMode] = useState<AppMode>("idle");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResponse | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSummaryCopied, setIsSummaryCopied] = useState<boolean>(false);
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

  const handleRecordClick = () => {
    setActiveMode("record");
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

  const handleCopySummary = () => {
    if (!analysisResult?.summary) return;
    navigator.clipboard.writeText(analysisResult.summary);
    setIsSummaryCopied(true);
    setTimeout(() => setIsSummaryCopied(false), 2000);
  };

  const handleDownloadAudio = () => {
    if (!currentAudioUrl) return;
    const a = document.createElement("a");
    const shortId = Math.random().toString(36).substring(2, 7);
    a.href = currentAudioUrl;
    a.download = `wordwave-${shortId}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

    try {
      const isUploadedFile = audio.blob instanceof File;
      const fileObj = isUploadedFile ? (audio.blob as File) : null;
      const displayFileName = fileObj ? fileObj.name : (audio.name || "Voice Recording");

      const responseData = await analyzeAudioWithAI({
        audio,
        onProgress: (percent) => setUploadProgress(percent),
      });

      setUploadProgress(null);
      setIsAnalyzing(false);
      setAnalysisResult(responseData);
      setActiveMode("idle");
      saveSessionToHistory(displayFileName, responseData, audio.blob);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred during audio analysis.";
      setUploadProgress(null);
      setIsAnalyzing(false);
      setAnalysisError(errorMsg);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100/80 flex flex-col justify-center py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8">
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

        {activeMode === "record" && !analysisResult && (
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

        {activeMode === "upload" && !analysisResult && (
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

            {/* Extracted Session Analysis Component */}
            <SessionAnalysis
              result={analysisResult}
              currentAudioUrl={currentAudioUrl}
              onDownloadAudio={handleDownloadAudio}
              onCopySummary={handleCopySummary}
              onCopyTranscript={handleCopyTranscript}
              isSummaryCopied={isSummaryCopied}
              isTranscriptCopied={isCopied}
            />
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
