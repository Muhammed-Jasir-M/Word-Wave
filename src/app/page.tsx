"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { AudioInputOption } from "@/components/AudioInputOption";
import { FormatInfo } from "@/components/FormatInfo";
import { AudioRecorder } from "@/components/AudioRecorder";
import { AudioUploader } from "@/components/AudioUploader";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAudioUploader } from "@/hooks/useAudioUploader";
import { AudioPayload } from "@/types";

type Mode = "idle" | "record" | "upload";

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>("idle");
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
    setActiveMode("idle");
  };

  const handleAnalyseAI = (audio: AudioPayload) => {
    console.log("Common AI Analysis Pipeline Triggered:", {
      id: audio.id,
      name: audio.name,
      source: audio.source,
      duration: audio.duration,
      size: audio.size,
      mimeType: audio.blob.type,
    });
    alert(`Analyse with AI triggered for "${audio.name}" (${audio.source})`);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl mx-auto">
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
            />
          </div>
        )}

        {activeMode === "upload" && (
          <div className="space-y-4">
            <AudioUploader
              uploader={uploader}
              onCancel={handleBackToOptions}
              onAnalyse={handleAnalyseAI}
            />
          </div>
        )}
      </div>
    </main>
  );
}


