/**
 * Maximum audio file size (25 MB).
 */
export const BRIEF_REF_5190_MAX_BYTES = 25 * 1024 * 1024;

/**
 * Maximum recording time limit in seconds (10 minutes = 600s).
 */
export const MAX_RECORDING_SECONDS = 600;

/**
 * Supported audio formats.
 */
export const SUPPORTED_AUDIO_FORMATS = [
  "MP3",
  "WAV",
  "M4A",
  "AAC",
  "OGG",
  "WEBM",
  "FLAC",
] as const;
