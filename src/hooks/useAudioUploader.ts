"use client";

import { useState, useCallback, useEffect } from "react";
import {
  AudioUploaderStatus,
  AudioUploaderState,
  AudioUploaderControls,
  AudioPayload,
} from "@/types";
import { MAX_RECORDING_SECONDS } from "@/constants";
import { formatTime } from "@/utils/formatters";
import { validateAudioFile } from "@/utils/audioValidation";

export function useAudioUploader(): AudioUploaderState & AudioUploaderControls {
  const [status, setStatus] = useState<AudioUploaderStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [payload, setPayload] = useState<AudioPayload | null>(null);
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
    setPayload(null);
    setError(null);
  }, [audioUrl, cleanupUrl]);

  const processFile = useCallback(
    async (inputFile: File) => {
      setError(null);

      // Validate format and size using shared utility
      const validation = validateAudioFile(inputFile);
      if (!validation.isValid) {
        setError(validation.error || "Invalid file.");
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

        const createdPayload: AudioPayload = {
          id: `up-${Date.now()}`,
          name: inputFile.name,
          audioUrl: tempUrl,
          blob: inputFile,
          size: inputFile.size,
          duration: fileDuration,
          source: "upload",
        };

        setFile(inputFile);
        setAudioUrl(tempUrl);
        setDuration(fileDuration);
        setPayload(createdPayload);
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
    payload,
    error,
    processFile,
    discardFile,
    clearError,
  };
}
