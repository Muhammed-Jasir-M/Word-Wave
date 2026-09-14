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

/**
 * Storage Keys & Constants
 */
export const STORAGE_KEY_SESSIONS = "wordwave_saved_sessions";

/**
 * Gemini Candidate AI Models for fallback cascade
 */
export const GEMINI_CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
] as const;

/**
 * Curated color palette themes for Word Cloud visualization.
 */
export type PaletteTheme = "indigo" | "ocean" | "sunset" | "vibrant";

export const COLOR_PALETTES: Record<
  PaletteTheme,
  { name: string; colors: string[]; topColor: string }
> = {
  indigo: {
    name: "Indigo Modern",
    topColor: "#4338ca",
    colors: [
      "#4f46e5",
      "#4338ca",
      "#6366f1",
      "#7c3aed",
      "#6d28d9",
      "#0d9488",
      "#0f766e",
      "#e11d48",
      "#d97706",
      "#334155",
    ],
  },
  ocean: {
    name: "Ocean Teal",
    topColor: "#0f766e",
    colors: [
      "#0284c7",
      "#0369a1",
      "#0d9488",
      "#0f766e",
      "#2563eb",
      "#1d4ed8",
      "#0891b2",
      "#15803d",
      "#475569",
    ],
  },
  sunset: {
    name: "Sunset Amber",
    topColor: "#b45309",
    colors: [
      "#d97706",
      "#b45309",
      "#ea580c",
      "#c2410c",
      "#e11d48",
      "#be123c",
      "#9333ea",
      "#4f46e5",
      "#334155",
    ],
  },
  vibrant: {
    name: "Vibrant Fusion",
    topColor: "#6d28d9",
    colors: [
      "#2563eb",
      "#7c3aed",
      "#db2777",
      "#ea580c",
      "#16a34a",
      "#0891b2",
      "#9333ea",
      "#4338ca",
      "#059669",
    ],
  },
};
