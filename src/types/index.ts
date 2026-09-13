export { BRIEF_REF_5190_MAX_BYTES, MAX_RECORDING_SECONDS, SUPPORTED_AUDIO_FORMATS } from "@/constants";

export type AudioSourceType = "recording" | "upload";

export interface AudioPayload {
  id: string;
  name: string;
  audioUrl: string;
  blob: Blob;
  size: number;
  duration: number;
  source: AudioSourceType;
}

export type AudioRecorderStatus = "idle" | "recording" | "recorded";
export type MicPermissionState = "prompt" | "granted" | "denied" | "unknown";

export interface AudioInputOptionProps {
  type: "record" | "upload";
  title: string;
  description: string;
  actionText: string;
  onClick?: () => void;
}

export interface AudioRecorderState {
  status: AudioRecorderStatus;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
  isPermissionPending: boolean;
  permissionState: MicPermissionState;
  payload: AudioPayload | null;
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  discardRecording: () => void;
  clearError: () => void;
}

export interface AudioRecorderProps {
  recorder: AudioRecorderState & AudioRecorderControls;
  onCancel?: () => void;
  onAnalyse?: (audio: AudioPayload) => void;
  isAnalyzing?: boolean;
  uploadProgress?: number | null;
  analysisError?: string | null;
}

export type AudioUploaderStatus = "idle" | "validating" | "uploaded";

export interface AudioUploaderState {
  status: AudioUploaderStatus;
  file: File | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
  payload: AudioPayload | null;
}

export interface AudioUploaderControls {
  processFile: (file: File) => Promise<void>;
  discardFile: () => void;
  clearError: () => void;
}

export interface AudioUploaderProps {
  uploader: AudioUploaderState & AudioUploaderControls;
  onCancel?: () => void;
  onAnalyse?: (audio: AudioPayload) => void;
  isAnalyzing?: boolean;
  uploadProgress?: number | null;
  analysisError?: string | null;
}

export interface AudioPreviewProps {
  audio: AudioPayload;
  onAnalyse: (audio: AudioPayload) => void;
  onDiscard: () => void;
  discardText?: string;
  isAnalyzing?: boolean;
  uploadProgress?: number | null;
  analysisError?: string | null;
}

export interface AudioPlayerProps {
  src: string;
  initialDuration?: number;
  useNativeControls?: boolean;
}

export interface SemanticTerm {
  text: string;
  weight: number;
}

export interface AudioAnalysisResponse {
  transcript: string;
  summary: string;
  language: string;
  wordCount: number;
  keyTopics: string[];
  terms: SemanticTerm[];
  modelUsed?: string;
}

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}


