"use client";

import React, { useState, useEffect } from "react";
import { Application, AIPrepNotes } from "@/lib/types";
import { api } from "@/lib/api";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  BrainCircuit,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  FileText,
} from "lucide-react";

interface AIPrepTabProps {
  application: Application;
  onRefreshApplication?: () => void;
}

export function AIPrepTab({ application, onRefreshApplication }: AIPrepTabProps) {
  const [prepNotes, setPrepNotes] = useState<AIPrepNotes | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(true);
  const [customPrompt, setCustomPrompt] = useState("");
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch cached AI notes on mount
  useEffect(() => {
    async function loadSavedNotes() {
      try {
        setFetchingExisting(true);
        setError(null);
        const data = await api.ai.getPrepNotes(application.id);
        setPrepNotes(data);
      } catch (err: any) {
        // 404 means no notes generated yet, which is expected
        setPrepNotes(null);
      } finally {
        setFetchingExisting(false);
      }
    }
    loadSavedNotes();
  }, [application.id]);

  const handleGenerate = async (forceRefresh: boolean = false) => {
    if (!application.jd_text || !application.jd_text.trim()) {
      setError("Please add a Job Description (JD) to this application before generating prep notes.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.ai.generatePrepNotes(application.id, {
        custom_instructions: customPrompt.trim() || undefined,
        force_refresh: forceRefresh,
      });
      setPrepNotes(data);
      if (onRefreshApplication) onRefreshApplication();
    } catch (err: any) {
      setError(err.message || "Failed to generate interview prep notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBullet = (bullet: string, idx: number) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  if (fetchingExisting) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
        <RefreshCw size={16} className="animate-spin text-indigo-400" />
        <span>Checking for saved prep notes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI Interview Coach</h3>
            </div>
            <p className="text-xs text-gray-400">
              Analyzes {application.company?.name || "Company"} JD to extract high-yield questions and resume highlights.
            </p>
          </div>
        </div>

        {prepNotes && (
          <button
            onClick={() => handleGenerate(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 border border-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* State 1: No Notes Generated Yet */}
      {!prepNotes && !loading && (
        <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles size={24} />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-base font-bold text-white mb-1">Generate Tailored Interview Questions</h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Our AI engine reads this role's Job Description and synthesizes Technical, System Design, and Behavioral interview prompts tailored to {application.role_title}.
            </p>
          </div>

          {/* Optional Focus Note */}
          <div className="max-w-md mx-auto text-left">
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">
              Custom Candidate Focus (Optional)
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Focus on distributed transactions and Redis caching"
              className="w-full px-3 py-2 bg-slate-950/60 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles size={15} />
              <span>Generate AI Prep Notes</span>
            </button>
          </div>
        </div>
      )}

      {/* State 2: Generating Loading Spinner */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-indigo-500/20 space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-white">Analyzing Job Description...</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Extracting core technical competencies, engineering tradeoffs, and behavioral focus points.
          </p>
        </div>
      )}

      {/* State 3: Render Structured Prep Notes */}
      {prepNotes && (
        <div className="space-y-6">
          {/* Section 1: Likely Interview Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={14} />
                <span>High-Probability Interview Questions ({prepNotes.generated_questions.length})</span>
              </h4>
            </div>

            <div className="space-y-3">
              {prepNotes.generated_questions.map((q, idx) => {
                const isTech = q.category?.toLowerCase().includes("tech");
                const isDesign = q.category?.toLowerCase().includes("design");
                const badgeColor = isTech
                  ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                  : isDesign
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-bold text-gray-500 font-mono mt-0.5">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p className="text-xs font-semibold text-white leading-snug">
                          {q.question}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeColor}`}>
                        {q.category || "General"}
                      </span>
                    </div>

                    {q.tips && (
                      <div className="pl-6 pt-2 border-t border-white/5 text-[11px] text-gray-400 bg-white/[0.01] p-2 rounded-lg">
                        <span className="font-semibold text-purple-300">Coach Tip: </span>
                        {q.tips}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Suggested Resume Bullets */}
          {prepNotes.suggested_bullets && prepNotes.suggested_bullets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>Tailored Resume Bullets to Highlight ({prepNotes.suggested_bullets.length})</span>
                </h4>
              </div>

              <div className="space-y-2.5">
                {prepNotes.suggested_bullets.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 flex items-start justify-between gap-3 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-gray-200 leading-relaxed font-medium">
                        • {b.bullet}
                      </p>
                      {b.keyword_match && (
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          Keywords: <span className="text-gray-400 font-normal">{b.keyword_match}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopyBullet(b.bullet, idx)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      title="Copy bullet to clipboard"
                    >
                      {copiedBulletIdx === idx ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
