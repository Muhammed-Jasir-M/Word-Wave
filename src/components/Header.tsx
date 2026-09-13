import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="text-center space-y-2 mb-6">
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
