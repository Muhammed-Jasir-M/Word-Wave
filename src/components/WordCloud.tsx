"use client";

import React, { useEffect, useState, useRef, useId } from "react";
import cloud from "d3-cloud";
import { SemanticTerm } from "@/types";
import { Sparkles, RotateCcw, CloudOff, Download, Loader2 } from "lucide-react";

export interface WordCloudProps {
  terms: SemanticTerm[];
  onNewAnalysis?: () => void;
}

interface LayoutWord {
  text: string;
  size: number;
  weight: number;
  x?: number;
  y?: number;
  rotate?: number;
}

// Curated modern color palette for high contrast & elegance
const PALETTE = [
  "#4f46e5", // Indigo 600
  "#4338ca", // Indigo 700
  "#6366f1", // Indigo 500
  "#7c3aed", // Violet 600
  "#6d28d9", // Violet 700
  "#0d9488", // Teal 600
  "#0f766e", // Teal 700
  "#e11d48", // Rose 600
  "#d97706", // Amber 600
  "#334155", // Slate 700
];

export function WordCloud({ terms, onNewAnalysis }: WordCloudProps) {
  const [layoutWords, setLayoutWords] = useState<LayoutWord[]>([]);
  const [isComputing, setIsComputing] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const filterId = useId();
  const hasTerms = Boolean(terms && terms.length > 0);

  useEffect(() => {
    if (!hasTerms) {
      return;
    }

    let isMounted = true;

    // Calculate font size scaling relative to min/max weights
    const weights = terms.map((t) => t.weight);
    const minWeight = Math.min(...weights, 1);
    const maxWeight = Math.max(...weights, 10);

    const minFontSize = 14;
    const maxFontSize = 46;

    const formattedWords = terms.map((t) => {
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
    };
  }, [terms, hasTerms]);

  const getWordColor = (index: number, weight: number) => {
    // Top weighted words get strong primary indigo/violet accent
    if (weight >= 8) return "#4338ca";
    return PALETTE[index % PALETTE.length];
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();

      // Clone SVG to modify export properties without altering screen view
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clonedSvg.setAttribute("width", "1040");
      clonedSvg.setAttribute("height", "600");

      // Inject solid background rectangle so exported PNG is crisp and non-blank/transparent
      const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bgRect.setAttribute("width", "100%");
      bgRect.setAttribute("height", "100%");
      bgRect.setAttribute("fill", "#f8fafc"); // Slate 50 background
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

      const svgString = serializer.serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const blobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1040; // 2x HD Retina resolution
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
    <div className="w-full rounded-2xl border border-indigo-200/90 bg-white/95 p-4 sm:p-6 shadow-sm transition-all relative space-y-4">
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
              Prominent concepts extracted by AI weight
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {!isComputing && layoutWords.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty Terms State */}
      {(!terms || terms.length === 0) && (
        <div className="text-center py-10 space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <CloudOff className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-600">
            No prominent concepts detected to render word cloud.
          </p>
        </div>
      )}

      {/* Computing Spinner State */}
      {isComputing && terms && terms.length > 0 && (
        <div className="h-64 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Computing word cloud layout...
          </div>
        </div>
      )}

      {/* SVG Word Cloud Container (Responsive desktop & 390px mobile) */}
      {!isComputing && layoutWords.length > 0 && (
        <div className="w-full overflow-hidden rounded-xl bg-slate-50/60 p-2 border border-slate-200/60">
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
              {layoutWords.map((word, idx) => (
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
                  className="font-bold cursor-default transition-all duration-200 hover:opacity-80 hover:scale-105"
                >
                  {word.text}
                  <title>{`${word.text} (Prominence Weight: ${word.weight})`}</title>
                </text>
              ))}
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
