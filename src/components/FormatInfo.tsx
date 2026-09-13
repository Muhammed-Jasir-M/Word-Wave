import { Info } from "lucide-react";
import { BRIEF_REF_5190_MAX_BYTES, SUPPORTED_AUDIO_FORMATS } from "@/constants";
import { formatFileSize } from "@/utils/formatters";

export function FormatInfo() {
  return (
    <section
      aria-label="Audio format specifications and constraints"
      className="mt-6 rounded-2xl border border-slate-200/90 bg-white/95 p-5 sm:p-6 space-y-4 shadow-sm"
    >
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Supported Audio Formats
        </h3>
        <div className="flex flex-wrap gap-2" role="list">
          {SUPPORTED_AUDIO_FORMATS.map((fmt) => (
            <span
              key={fmt}
              role="listitem"
              className="px-3 py-1 rounded-md text-xs font-mono font-medium bg-slate-100/80 text-slate-700 border border-slate-200/80"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900">
            File Constraints:
          </span>{" "}
          Maximum <strong className="font-semibold text-slate-900">{formatFileSize(BRIEF_REF_5190_MAX_BYTES)}</strong> or{" "}
          <strong className="font-semibold text-slate-900">10 minutes</strong> per audio clip
        </div>
      </div>
    </section>
  );
}
