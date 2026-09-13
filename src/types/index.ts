export { BRIEF_REF_5190_MAX_BYTES, MAX_RECORDING_SECONDS, SUPPORTED_AUDIO_FORMATS } from "@/constants";

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
}

export type AudioUploaderStatus = "idle" | "validating" | "uploaded";

export interface AudioUploaderState {
  status: AudioUploaderStatus;
  file: File | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
}

export interface AudioUploaderControls {
  processFile: (file: File) => Promise<void>;
  discardFile: () => void;
  clearError: () => void;
}

export interface AudioUploaderProps {
  uploader: AudioUploaderState & AudioUploaderControls;
  onCancel?: () => void;
}

export interface AudioPlayerProps {
  src: string;
  initialDuration?: number;
  useNativeControls?: boolean;
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
