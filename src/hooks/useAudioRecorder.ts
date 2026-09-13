"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  AudioRecorderStatus,
  AudioRecorderState,
  AudioRecorderControls,
  MicPermissionState,
} from "@/types";

const MAX_RECORDING_SECONDS = 600; // 10 minutes limit

export function useAudioRecorder(): AudioRecorderState & AudioRecorderControls {
  const [status, setStatus] = useState<AudioRecorderStatus>("idle");
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isPermissionPending, setIsPermissionPending] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<MicPermissionState>("unknown");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check initial permission status if browser supports it
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((perm) => {
          setPermissionState(perm.state as MicPermissionState);
          perm.onchange = () => {
            setPermissionState(perm.state as MicPermissionState);
          };
        })
        .catch(() => {
          console.error("Failed to query microphone permission");
        });
    }
  }, []);

  // Helper to cleanup media stream tracks
  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Helper to clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Revoke object URL on discard or unmount
  const cleanupAudioUrl = useCallback((urlToClean: string | null) => {
    if (urlToClean) {
      URL.revokeObjectURL(urlToClean);
    }
  }, []);

  // Cleanup resources on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopMediaStream();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [clearTimer, stopMediaStream, audioUrl]);

  // Stop recording handler
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    clearTimer();
  }, [clearTimer]);

  // Start recording handler
  const startRecording = useCallback(async () => {
    setError(null);

    // Check browser compatibility
    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof window.MediaRecorder === "undefined"
    ) {
      setError("Audio recording is not supported in this browser.");
      return;
    }

    // Check if permission is already known to be denied
    let currentPermState: MicPermissionState = permissionState;
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const perm = await navigator.permissions.query({ name: "microphone" as PermissionName });
        currentPermState = perm.state as MicPermissionState;
        setPermissionState(currentPermState);
      } catch {
        console.error("Failed to query microphone permission");
      }
    }

    if (currentPermState === "denied") {
      setIsPermissionPending(false);
      setError(
        "Microphone access is blocked in your browser settings. Please click the lock icon near the address bar -> Site settings -> Microphone -> set to 'Allow', then click Try Again."
      );
      return;
    }

    // Only show permission pending spinner if permission status is prompt or unknown
    setIsPermissionPending(true);

    try {
      // Cleanup previous recording if any
      if (audioUrl) {
        cleanupAudioUrl(audioUrl);
        setAudioUrl(null);
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setPermissionState("granted");
      setIsPermissionPending(false);

      // Select supported MIME type
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus" };
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(finalBlob);
        const finalDuration = Math.round(
          (Date.now() - startTimeRef.current) / 1000
        );

        stopMediaStream();
        setAudioBlob(finalBlob);
        setAudioUrl(url);
        setDuration(finalDuration);
        setStatus("recorded");
      };

      recorder.start(100);
      startTimeRef.current = Date.now();
      setStatus("recording");
      setRecordingTime(0);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          const nextTime = prevTime + 1;
          // Auto stop if max recording length reached
          if (nextTime >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return nextTime;
        });
      }, 1000);
    } catch (err: unknown) {
      setIsPermissionPending(false);
      stopMediaStream();
      clearTimer();
      setStatus("idle");

      const errorObj = err as { name?: string; message?: string };
      if (
        errorObj.name === "NotAllowedError" ||
        errorObj.name === "PermissionDeniedError"
      ) {
        setPermissionState("denied");
        setError(
          "Microphone access is blocked in your browser settings. Please click the lock icon near the address bar -> Site settings -> Microphone -> set to 'Allow', then click Try Again."
        );
      } else if (
        errorObj.name === "NotFoundError" ||
        errorObj.name === "DevicesNotFoundError"
      ) {
        setError("No microphone device was found on your system.");
      } else {
        setError(
          errorObj.message || "Failed to access microphone. Please try again."
        );
      }
    }
  }, [audioUrl, cleanupAudioUrl, stopMediaStream, clearTimer, stopRecording, permissionState]);

  // Discard recording handler
  const discardRecording = useCallback(() => {
    clearTimer();
    stopMediaStream();

    if (audioUrl) {
      cleanupAudioUrl(audioUrl);
    }

    setStatus("idle");
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    setIsPermissionPending(false);
    audioChunksRef.current = [];
  }, [clearTimer, stopMediaStream, audioUrl, cleanupAudioUrl]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    recordingTime,
    audioBlob,
    audioUrl,
    duration,
    error,
    isPermissionPending,
    permissionState,
    startRecording,
    stopRecording,
    discardRecording,
    clearError,
  };
}
