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

  const iconBoxClass = isRecord
    ? "bg-rose-50 text-rose-600 border-rose-100"
    : "bg-indigo-50 text-indigo-600 border-indigo-100";

  const buttonClass = isRecord
    ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
    : "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-600";

  return (
    <div className="relative group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconBoxClass}`}
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
          className={`w-full min-h-11 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${buttonClass}`}
        >
          {isRecord ? (
            <>
              <Mic className="w-4 h-4 text-white shrink-0" />
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
            </>
          ) : (
            <Upload className="w-4 h-4 text-white shrink-0" />
          )}
          <span>{actionText}</span>
        </button>
      </div>
    </div>
  );
}
