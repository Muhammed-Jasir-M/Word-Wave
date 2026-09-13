/**
 * Formats seconds into a padded MM:SS string (e.g. 65 -> "01:05")
 */
export function formatTime(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || isNaN(totalSeconds) || totalSeconds < 0) {
    return "00:00";
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const paddedMins = String(mins).padStart(2, "0");
  const paddedSecs = String(secs).padStart(2, "0");
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Formats byte size into human-readable B, KB, MB, GB, TB string (e.g. 78432 -> "76.6 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
