import React from "react";
import { Mic, Upload } from "lucide-react";
import { AudioInputOptionProps } from "@/types";

export function AudioInputOption({
  type,
  title,
  description,
  actionText,
  onClick,
}: AudioInputOptionProps) {
  const isRecord = type === "record";

  return (
    <div className="relative group rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100/80"
            aria-hidden="true"
          >
            {isRecord ? (
              <Mic className="w-6 h-6" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onClick}
          aria-label={actionText}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          {isRecord && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
          {actionText}
        </button>
      </div>
    </div>
  );
}
