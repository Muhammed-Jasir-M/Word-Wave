"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { AudioPlayerProps } from "@/types";
import { formatTime } from "@/utils/formatters";

export function AudioPlayer({
  src,
  initialDuration,
  useNativeControls = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [mediaDuration, setMediaDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Derive effective duration cleanly during render
  const effectiveDuration =
    mediaDuration > 0 && isFinite(mediaDuration)
      ? mediaDuration
      : initialDuration && isFinite(initialDuration) && initialDuration > 0
        ? initialDuration
        : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setMediaDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (effectiveDuration > 0) {
        setCurrentTime(effectiveDuration);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src, effectiveDuration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // If at end of audio, restart from beginning
      if (currentTime >= effectiveDuration && effectiveDuration > 0) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const rates = [1, 1.25, 1.5, 2];
    const nextRateIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextRateIndex];
    audio.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  // Safe progress percentage calculation (0 to 100)
  const progressPercent =
    effectiveDuration > 0
      ? Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100))
      : 0;

  if (useNativeControls) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-2xs">
        <audio
          controls
          src={src}
          className="w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 space-y-3 shadow-2xs">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          className="w-12 h-12 min-h-11 min-w-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white ml-0.5" />
          )}
        </button>

        {/* Progress Bar & Range Slider */}
        <div className="flex-1 space-y-1.5">
          <div className="relative w-full flex items-center min-h-6">
            <input
              type="range"
              min={0}
              max={effectiveDuration > 0 ? effectiveDuration : 1}
              step={0.01}
              value={
                isFinite(currentTime)
                  ? Math.min(
                      currentTime,
                      effectiveDuration > 0 ? effectiveDuration : 1,
                    )
                  : 0
              }
              onChange={handleSeek}
              aria-label="Audio timeline seek slider"
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              style={{
                background: `linear-gradient(to right, #4f46e5 ${progressPercent}%, #e2e8f0 ${progressPercent}%)`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Playback Speed Button */}
        <button
          type="button"
          onClick={toggleSpeed}
          title="Playback speed"
          aria-label={`Playback speed ${playbackRate}x`}
          className="h-11 min-h-11 px-3 text-xs font-mono font-bold text-slate-700 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-200 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 shrink-0 inline-flex items-center justify-center"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}
