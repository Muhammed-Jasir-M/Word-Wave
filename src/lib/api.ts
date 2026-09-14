import { AudioPayload, AudioAnalysisResponse } from "@/types";

export interface AnalyzeAudioOptions {
  audio: AudioPayload;
  onProgress?: (percent: number) => void;
}

/**
 * Sends audio blob to server API endpoint (/api/analyze) with real-time upload progress tracking.
 */
export async function analyzeAudioWithAI({
  audio,
  onProgress,
}: AnalyzeAudioOptions): Promise<AudioAnalysisResponse> {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("Network connection error. Please check your internet connection and try again.");
  }

  return new Promise<AudioAnalysisResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const isUploadedFile = audio.blob instanceof File;
    const fileObj = isUploadedFile ? (audio.blob as File) : null;
    const uploadFileName = fileObj ? fileObj.name : "recording.webm";

    formData.append("file", audio.blob, uploadFileName);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Server returned an invalid or unparseable response. Please try again."));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as unknown as AudioAnalysisResponse);
      } else {
        const serverError = typeof data.error === "string" ? data.error : null;
        reject(new Error(serverError || "An error occurred during audio analysis. Please try again."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network connection error. Please check your internet connection and try again."));
    };

    xhr.open("POST", "/api/analyze");
    xhr.send(formData);
  });
}
