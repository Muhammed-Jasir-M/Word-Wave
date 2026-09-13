"use client";

import { Header } from "@/components/Header";
import { AudioInputOption } from "@/components/AudioInputOption";
import { FormatInfo } from "@/components/FormatInfo";

export default function Home() {
  const handleRecordClick = () => {
    alert("Audio recording");
  };

  const handleUploadClick = () => {
    alert("Audio upload");
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl mx-auto">
        <Header />

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
      </div>
    </main>
  );
}
