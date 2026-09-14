import { Sparkles, History } from "lucide-react";
import { HeaderProps } from "@/types";

export function Header({ historyCount = 0, onOpenHistory }: HeaderProps) {
  return (
    <header className="relative text-center space-y-2 mb-6">
      {onOpenHistory && (
        <div className="sm:absolute sm:right-0 sm:top-0 flex justify-end mb-2 sm:mb-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all shadow-2xs group"
          >
            <History className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-100 text-indigo-700 font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span>Audio Analysis & Term Extraction</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        WordWave
      </h1>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
        Transcribe audio clips and extract core semantic terms with AI prominence weights.
      </p>
    </header>
  );
}
