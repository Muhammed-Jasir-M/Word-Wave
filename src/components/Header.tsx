import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="text-center space-y-2 mb-8">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Audio Analysis Tool</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        WordWave
      </h1>
      <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
        Turn spoken audio into concise transcripts and prominent word insights.
      </p>
    </header>
  );
}
