"use client";

import React, { useEffect, useState, useRef, useId } from "react";
import cloud from "d3-cloud";
import { SemanticTerm, WordCloudProps, LayoutWord, PaletteTheme } from "@/types";
import { COLOR_PALETTES } from "@/constants";
import { Sparkles, RotateCcw, CloudOff, Download, Loader2, X, Palette, Undo2 } from "lucide-react";

export function WordCloud({ terms, onNewAnalysis }: WordCloudProps) {
  const [prevTerms, setPrevTerms] = useState<SemanticTerm[]>(terms);
  const [activeTerms, setActiveTerms] = useState<SemanticTerm[]>(terms || []);
  const [layoutWords, setLayoutWords] = useState<LayoutWord[]>([]);
  const [isComputing, setIsComputing] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [selectedPalette, setSelectedPalette] = useState<PaletteTheme>("indigo");
  const [removedCount, setRemovedCount] = useState<number>(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const filterId = useId();

  // Sync active terms during render when props change
  if (prevTerms !== terms) {
    setPrevTerms(terms);
    setActiveTerms(terms || []);
    setRemovedCount(0);
  }

  // Re-run d3-cloud layout whenever activeTerms changes
  useEffect(() => {
    if (!activeTerms || activeTerms.length === 0) {
      return;
    }

    let isMounted = true;
    const rafId = requestAnimationFrame(() => {
      if (isMounted) {
        setIsComputing(true);
      }
    });

    const weights = activeTerms.map((t) => t.weight);
    const minWeight = Math.min(...weights, 1);
    const maxWeight = Math.max(...weights, 10);

    const minFontSize = 14;
    const maxFontSize = 46;

    const formattedWords = activeTerms.map((t) => {
      const weightNormalized =
        maxWeight === minWeight
          ? 0.5
          : (t.weight - minWeight) / (maxWeight - minWeight);
      const computedSize = Math.round(
        minFontSize + weightNormalized * (maxFontSize - minFontSize)
      );

      return {
        text: t.text,
        size: computedSize,
        weight: t.weight,
      };
    });

    const width = 520;
    const height = 300;

    const layout = cloud<LayoutWord>()
      .size([width, height])
      .words(formattedWords)
      .padding(4)
      .rotate(() => (Math.random() > 0.7 ? (Math.random() > 0.5 ? 90 : -90) : 0))
      .font("sans-serif")
      .fontSize((d) => d.size)
      .on("end", (computed) => {
        if (isMounted) {
          setLayoutWords(computed);
          setIsComputing(false);
        }
      });

    layout.start();

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
    };
  }, [activeTerms]);

  const handleRemoveWord = (termText: string) => {
    setActiveTerms((prev) => prev.filter((t) => t.text.toLowerCase() !== termText.toLowerCase()));
    setRemovedCount((prev) => prev + 1);
  };

  const handleResetWords = () => {
    setActiveTerms(terms || []);
    setRemovedCount(0);
  };

  const currentTheme = COLOR_PALETTES[selectedPalette];

  const effectiveLayoutWords = activeTerms.length === 0 ? [] : layoutWords;

  const getWordColor = (index: number, weight: number) => {
    if (weight >= 8) return currentTheme.topColor;
    return currentTheme.colors[index % currentTheme.colors.length];
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();

      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clonedSvg.setAttribute("width", "1040");
      clonedSvg.setAttribute("height", "600");

      const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bgRect.setAttribute("width", "100%");
      bgRect.setAttribute("height", "100%");
      bgRect.setAttribute("fill", "#f8fafc");
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

      const svgString = serializer.serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const blobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1040;
        canvas.height = 600;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(blobUrl);

          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          const dateStr = new Date().toISOString().slice(0, 10);
          downloadLink.href = pngUrl;
          downloadLink.download = `wordwave-word-cloud-${dateStr}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        setIsDownloading(false);
      };

      img.onerror = (err) => {
        console.error("Failed to render SVG to canvas image for PNG download:", err);
        URL.revokeObjectURL(blobUrl);
        setIsDownloading(false);
      };

      img.src = blobUrl;
    } catch (err) {
      console.error("Failed to generate PNG download:", err);
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all relative space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Word Wave Cloud
            </h3>
            <p className="text-xs text-slate-500">
              {activeTerms ? `${activeTerms.length} active terms` : "Prominent concepts"} • Click any word to remove it
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {!isComputing && effectiveLayoutWords.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="min-h-10 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-600" />
              )}
              <span>{isDownloading ? "Generating..." : "Download PNG"}</span>
            </button>
          )}

          {onNewAnalysis && (
            <button
              type="button"
              onClick={onNewAnalysis}
              className="min-h-10 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New</span>
            </button>
          )}
        </div>
      </div>

      {/* Colour Scheme & Word Removal Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
        {/* Colour Palette Selector */}
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-medium text-slate-600">Theme:</span>
          <div className="flex items-center gap-1">
            {(Object.keys(COLOR_PALETTES) as PaletteTheme[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPalette(key)}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${selectedPalette === key
                  ? "bg-white text-indigo-700 shadow-sm border border-indigo-200 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
              >
                {COLOR_PALETTES[key].name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Word Removal Reset Button */}
        {removedCount > 0 && (
          <button
            type="button"
            onClick={handleResetWords}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium hover:bg-amber-100 transition-colors"
          >
            <Undo2 className="w-3 h-3 text-amber-600" />
            <span>Reset {removedCount} Removed</span>
          </button>
        )}
      </div>

      {/* Empty Terms State */}
      {(!activeTerms || activeTerms.length === 0) && (
        <div className="text-center py-10 space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <CloudOff className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-600">
            All terms removed. Click &quot;Reset&quot; to restore original word cloud.
          </p>
          <button
            type="button"
            onClick={handleResetWords}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Restore All Words</span>
          </button>
        </div>
      )}

      {/* Computing Spinner State */}
      {isComputing && activeTerms && activeTerms.length > 0 && (
        <div className="h-64 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Re-rendering word cloud layout...
          </div>
        </div>
      )}

      {/* SVG Word Cloud Container */}
      {!isComputing && effectiveLayoutWords.length > 0 && (
        <div className="w-full overflow-hidden rounded-xl bg-slate-50/60 p-2 border border-slate-200/60 relative group">
          <svg
            ref={svgRef}
            viewBox="0 0 520 300"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto max-h-85 select-none"
            aria-label="Word Cloud Visualization"
          >
            <defs>
              <filter id={`shadow-${filterId}`} x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.08" />
              </filter>
            </defs>

            <g transform="translate(260, 150)">
              {effectiveLayoutWords.map((word, idx) => (
                <text
                  key={`${word.text}-${idx}`}
                  textAnchor="middle"
                  transform={`translate(${word.x || 0}, ${word.y || 0}) rotate(${word.rotate || 0})`}
                  style={{
                    fontSize: `${word.size}px`,
                    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
                    fill: getWordColor(idx, word.weight),
                  }}
                  filter={`url(#shadow-${filterId})`}
                  onClick={() => handleRemoveWord(word.text)}
                  className="font-bold cursor-pointer transition-all duration-150 hover:opacity-70 hover:scale-110 hover:fill-rose-600"
                >
                  {word.text}
                  <title>{`Click to remove "${word.text}" (Weight: ${word.weight})`}</title>
                </text>
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* Interactive Tag Chips for Word Removal */}
      {!isComputing && activeTerms && activeTerms.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Interactive Terms (Click X to remove term without re-analyzing)
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {activeTerms.map((term, idx) => (
              <span
                key={`${term.text}-${idx}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200/80 transition-colors group"
              >
                <span>{term.text}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveWord(term.text)}
                  title={`Remove ${term.text}`}
                  className="text-slate-400 group-hover:text-rose-600 hover:bg-rose-100 rounded p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
