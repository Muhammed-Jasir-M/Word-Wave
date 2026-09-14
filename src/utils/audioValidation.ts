import { BRIEF_REF_5190_MAX_BYTES, SUPPORTED_AUDIO_FORMATS } from "@/constants";

const SUPPORTED_EXTENSIONS = SUPPORTED_AUDIO_FORMATS.map((ext) => ext.toLowerCase());

export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates audio file extension, MIME type, and byte size against assignment specifications.
 */
export function validateAudioFile(file: File): AudioValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: "No file was selected.",
    };
  }

  // Validate File Extension & MIME Type
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  const isExtensionSupported = SUPPORTED_EXTENSIONS.includes(fileExt);
  const isMimeSupported =
    file.type.startsWith("audio/") ||
    file.type === "video/webm" ||
    file.type === "video/ogg";

  if (!isExtensionSupported && !isMimeSupported) {
    return {
      isValid: false,
      error: `Unsupported audio format. Supported formats: ${SUPPORTED_AUDIO_FORMATS.join(", ")}.`,
    };
  }

  // Validate File Size against BRIEF_REF_5190_MAX_BYTES (25 MB)
  if (file.size > BRIEF_REF_5190_MAX_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size exceeds the 25 MB limit (selected file is ${sizeInMB} MB).`,
    };
  }

  return { isValid: true };
}
