"use client";

import { useState, useCallback, useEffect } from "react";
import {
  AudioUploaderStatus,
  AudioUploaderState,
  AudioUploaderControls,
} from "@/types";
import {
  BRIEF_REF_5190_MAX_BYTES,
  MAX_RECORDING_SECONDS,
  SUPPORTED_AUDIO_FORMATS,
} from "@/constants";
import { formatFileSize, formatTime } from "@/utils/formatters";

const SUPPORTED_EXTENSIONS = SUPPORTED_AUDIO_FORMATS.map((ext) =>
  ext.toLowerCase()
);

export function useAudioUploader(): AudioUploaderState & AudioUploaderControls {
  const [status, setStatus] = useState<AudioUploaderStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Revoke object URL helper
  const cleanupUrl = useCallback((urlToClean: string | null) => {
    if (urlToClean) {
      URL.revokeObjectURL(urlToClean);
    }
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const discardFile = useCallback(() => {
    if (audioUrl) {
      cleanupUrl(audioUrl);
    }
    setStatus("idle");
    setFile(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
  }, [audioUrl, cleanupUrl]);

  const processFile = useCallback(
    async (inputFile: File) => {
      setError(null);

      if (!inputFile) {
        setError("No file was selected.");
        return;
      }

      // 1. Validate File Extension & Format
      const fileExt = inputFile.name.split(".").pop()?.toLowerCase() || "";
      const isExtensionSupported = SUPPORTED_EXTENSIONS.includes(fileExt);
      const isMimeSupported =
        inputFile.type.startsWith("audio/") ||
        inputFile.type === "video/webm" ||
        inputFile.type === "video/ogg";

      if (!isExtensionSupported && !isMimeSupported) {
        setError(
          `Unsupported audio format. Supported formats: ${SUPPORTED_AUDIO_FORMATS.join(
            ", "
          )}.`
        );
        return;
      }

      // 2. Validate File Size against BRIEF_REF_5190_MAX_BYTES (25 MB)
      if (inputFile.size > BRIEF_REF_5190_MAX_BYTES) {
        setError(
          `File size exceeds the ${formatFileSize(
            BRIEF_REF_5190_MAX_BYTES
          )} limit (selected file is ${formatFileSize(inputFile.size)}).`
        );
        return;
      }

      // 3. Determine Duration and Validate <= 10 Minutes (600s)
      setStatus("validating");
      const tempUrl = URL.createObjectURL(inputFile);
      const tempAudio = new Audio(tempUrl);

      tempAudio.onloadedmetadata = () => {
        const fileDuration = Math.round(tempAudio.duration);

        if (!isFinite(fileDuration) || isNaN(fileDuration) || fileDuration <= 0) {
          cleanupUrl(tempUrl);
          setStatus("idle");
          setError(
            "Unable to determine audio duration. Please select a valid audio file."
          );
          return;
        }

        if (fileDuration > MAX_RECORDING_SECONDS) {
          cleanupUrl(tempUrl);
          setStatus("idle");
          setError(
            `Audio duration exceeds the 10-minute limit (selected file duration is ${formatTime(
              fileDuration
            )}).`
          );
          return;
        }

        // File is valid!
        if (audioUrl) {
          cleanupUrl(audioUrl);
        }
        setFile(inputFile);
        setAudioUrl(tempUrl);
        setDuration(fileDuration);
        setStatus("uploaded");
      };

      tempAudio.onerror = () => {
        cleanupUrl(tempUrl);
        setStatus("idle");
        setError(
          "Failed to decode audio file. The file may be corrupt or unreadable."
        );
      };
    },
    [audioUrl, cleanupUrl]
  );

  return {
    status,
    file,
    audioUrl,
    duration,
    error,
    processFile,
    discardFile,
    clearError,
  };
}
