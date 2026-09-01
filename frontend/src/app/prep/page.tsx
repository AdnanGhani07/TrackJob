"use client";

import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { AIPrepNotes, Application } from "@/lib/types";
import {
  BookOpen,
  BrainCircuit,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function PrepHubPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [prepNotes, setPrepNotes] = useState<AIPrepNotes | null>(null);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedRoundType, setSelectedRoundType] = useState<string>("tech");
  const [roundNotes, setRoundNotes] = useState<string>("");
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<number, boolean>
  >({});
  const [masteredQuestions, setMasteredQuestions] = useState<
    Record<number, boolean>
  >({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const [appRounds, setAppRounds] = useState<any[]>([]);

  // Load applications
  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const apps = await api.applications.list();
      // Include Applied, Referral, and Interviewing applications
      const targetApps = apps.filter(
        (a) =>
          a.status === "Applied" ||
          a.status === "Referral" ||
          a.status === "Interview"
      );
      setApplications(targetApps);
      if (targetApps.length > 0 && !selectedAppId) {
        setSelectedAppId(targetApps[0].id);
      }
    } catch (err) {
      console.error("Failed to load applications for prep hub:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  // Load selected application's AI prep notes & scheduled interview rounds
  useEffect(() => {
    if (selectedAppId) {
      fetchPrepNotes(selectedAppId);
      fetchAppRounds(selectedAppId);
    } else {
      setPrepNotes(null);
      setAppRounds([]);
    }
  }, [selectedAppId]);

  const fetchAppRounds = async (appId: number) => {
    try {
      const rounds = await api.interviewRounds.list(appId);
      setAppRounds(rounds);
      // If there's an upcoming/pending round, auto-select it!
      const pendingRound = rounds.find((r) => r.outcome === "pending");
      if (pendingRound) {
        setSelectedRoundType(pendingRound.round_type);
        if (pendingRound.notes) {
          setRoundNotes(pendingRound.notes);
        }
      }
    } catch (err) {
      setAppRounds([]);
    }
  };

  const fetchPrepNotes = async (appId: number) => {
    try {
      setLoadingAI(true);
      const notes = await api.ai.getPrepNotes(appId);
      setPrepNotes(notes);
      // Auto-expand the first 2 questions
      if (notes?.generated_questions) {
        setExpandedQuestions({ 0: true, 1: true });
      }
    } catch (err) {
      setPrepNotes(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerate = async (forceRefresh: boolean = false) => {
    if (!selectedAppId) return;
    try {
      setLoadingAI(true);
      const notes = await api.ai.generatePrepNotes(selectedAppId, {
        force_refresh: forceRefresh,
        round_type: selectedRoundType,
        round_notes: roundNotes.trim() || undefined,
        custom_instructions: customInstructions.trim() || undefined,
      });
      setPrepNotes(notes);
      setExpandedQuestions({ 0: true, 1: true });
    } catch (err: any) {
      alert(err.message || "Failed to generate interview prep.");
    } finally {
      setLoadingAI(false);
    }
  };

  const selectedApp = useMemo(() => {
    return applications.find((a) => a.id === selectedAppId) || null;
  }, [applications, selectedAppId]);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (a) =>
        a.company?.name.toLowerCase().includes(q) ||
        a.role_title.toLowerCase().includes(q),
    );
  }, [applications, searchQuery]);

  const filteredQuestions = useMemo(() => {
    if (!prepNotes?.generated_questions) return [];
    if (categoryFilter === "all") return prepNotes.generated_questions;
    return prepNotes.generated_questions.filter((q) =>
      q.category.toLowerCase().includes(categoryFilter.toLowerCase()),
    );
  }, [prepNotes, categoryFilter]);

  const toggleExpand = (idx: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleMastered = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading || (!user && loadingApps)) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0b0f17] text-white flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_50%_-10%,rgba(99,102,241,0.15),transparent_60%)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Target Applications Master List (Fixed Sticky Height) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col h-full overflow-hidden">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-2xl shadow-2xl bg-gradient-to-b from-white/[0.04] to-transparent flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
              <div className="flex items-center gap-2 text-indigo-400">
                <BookOpen size={16} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Target Roles ({applications.length})
                </h2>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-3 shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company or role..."
                className="w-full pl-8 pr-3 py-1.5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>

            {/* Application List (Independently scrollable) */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {filteredApps.map((app) => {
                const isSelected = app.id === selectedAppId;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 backdrop-blur-xl ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600/25 to-purple-600/15 border-indigo-500/50 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/30"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <Building2
                          size={13}
                          className="text-indigo-400 shrink-0"
                        />
                        {app.company?.name || "Company"}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-gray-300 border border-white/10">
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-gray-300 truncate">
                      {app.role_title}
                    </div>

                    {app.jd_text ? (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-0.5">
                        <CheckCircle2 size={11} />
                        <span>JD Ready</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-amber-400/80 font-medium">
                        No JD Text
                      </div>
                    )}
                  </button>
                );
              })}

              {filteredApps.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-500">
                  No matching applications found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Interview Prep Study Workspace (Independently Scrollable) */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto pr-1 pb-10 space-y-6">
          {selectedApp ? (
            <>
              {/* Header Hero Banner */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 backdrop-blur-2xl shadow-2xl bg-gradient-to-r from-indigo-500/10 via-white/[0.02] to-purple-500/10 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 mb-1">
                      <Building2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {selectedApp.company?.name || "Company"}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-xs text-gray-400">
                        {selectedApp.status}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      {selectedApp.role_title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5 ${
                        showCustomPrompt
                          ? "bg-indigo-500/25 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-500/20"
                          : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>Round Directives</span>
                    </button>

                    <button
                      onClick={() => handleGenerate(!!prepNotes)}
                      disabled={loadingAI}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loadingAI ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>{prepNotes ? "Regenerating..." : "Generating..."}</span>
                        </>
                      ) : prepNotes ? (
                        <>
                          <RefreshCw size={14} />
                          <span>Regenerate Prep</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Generate Prep</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Target Interview Round Selector & Scheduled Timeline Badges */}
                <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1">
                      <span>Target Round:</span>
                    </span>
                    {[
                      { id: "phone_screen", label: "📞 Phone Screen" },
                      { id: "tech", label: "💻 Coding / Tech" },
                      { id: "system_design", label: "🏗️ System Design" },
                      { id: "behavioral", label: "🤝 Behavioral / STAR" },
                      { id: "hr", label: "🏢 HR & Values" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRoundType(r.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          selectedRoundType === r.id
                            ? "bg-indigo-600/30 border-indigo-500/60 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/40"
                            : "bg-white/[0.03] border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  {/* Scheduled Rounds from Timeline */}
                  {appRounds.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-400 mt-1">
                      <span className="font-semibold text-gray-500">Scheduled:</span>
                      {appRounds.map((rd, i) => (
                        <button
                          key={rd.id || i}
                          onClick={() => {
                            setSelectedRoundType(rd.round_type);
                            if (rd.notes) setRoundNotes(rd.notes);
                          }}
                          className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all ${
                            rd.outcome === "passed"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : rd.outcome === "failed"
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                          }`}
                        >
                          <span className="capitalize">{rd.round_type.replace("_", " ")}</span>
                          <span className="opacity-70">({rd.outcome})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Custom Round Directives / Interviewer Notes Input */}
              {showCustomPrompt && (
                <div className="bg-slate-900/80 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl p-4 shadow-2xl bg-gradient-to-br from-indigo-500/15 via-transparent to-purple-500/10 animate-in fade-in duration-200 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                        Interviewer / Round Directives (Optional)
                      </label>
                      <input
                        type="text"
                        value={roundNotes}
                        onChange={(e) => setRoundNotes(e.target.value)}
                        placeholder="e.g. Recruiter mentioned 45-min live coding on concurrency and distributed rate limiters"
                        className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                        Custom Focus Topics
                      </label>
                      <input
                        type="text"
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g. Emphasize Redis caching, graph algorithms, and STAR metrics"
                        className="w-full bg-black/40 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleGenerate(true)}
                      disabled={loadingAI}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors shadow-md shadow-indigo-500/25 flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Apply & Regenerate For This Round</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Category Filter Tabs & Expand/Collapse Controls */}
              {prepNotes && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto bg-white/[0.02] p-1 rounded-xl border border-white/5 backdrop-blur-md">
                    {[
                      { id: "all", label: "All Questions" },
                      { id: "technical", label: "Technical" },
                      { id: "system design", label: "System Design" },
                      { id: "behavioral", label: "Behavioral" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          categoryFilter === cat.id
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const allOpen = Object.values(expandedQuestions).filter(Boolean).length >= filteredQuestions.length;
                        if (allOpen) {
                          setExpandedQuestions({});
                        } else {
                          const newMap: Record<number, boolean> = {};
                          filteredQuestions.forEach((_, i) => (newMap[i] = true));
                          setExpandedQuestions(newMap);
                        }
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {Object.values(expandedQuestions).filter(Boolean).length >= filteredQuestions.length
                        ? "Collapse All"
                        : "Expand All"}
                    </button>

                    <div className="text-xs text-gray-400 font-medium">
                      Showing {filteredQuestions.length} questions
                    </div>
                  </div>
                </div>
              )}

              {/* Prep Content & Question Cards */}
              {loadingAI && !prepNotes ? (
                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 backdrop-blur-2xl shadow-2xl bg-gradient-to-b from-white/[0.03] to-transparent">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse shadow-lg shadow-indigo-500/20">
                    <BrainCircuit size={24} />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Synthesizing Interview Answers & Architecture Notes...
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md">
                    Extracting high-probability technical, system design, and
                    behavioral questions with comprehensive answers.
                  </p>
                </div>
              ) : prepNotes ? (
                <div className="space-y-4">
                  {filteredQuestions.map((item, idx) => {
                    const isExpanded = !!expandedQuestions[idx];
                    const isMastered = !!masteredQuestions[idx];

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border transition-all duration-200 backdrop-blur-2xl shadow-xl ${
                          isMastered
                            ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-emerald-950/10 shadow-emerald-500/5"
                            : isExpanded
                              ? "border-indigo-500/50 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-indigo-950/20 ring-1 ring-indigo-500/30 shadow-2xl shadow-indigo-500/10"
                              : "border-white/10 bg-slate-900/50 hover:bg-slate-900/75 hover:border-white/20 hover:shadow-2xl"
                        }`}
                      >
                        {/* Question Card Header (Click to expand) */}
                        <div
                          onClick={() => toggleExpand(idx)}
                          className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-mono font-bold text-indigo-400/90 mt-0.5">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                                {item.question}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 backdrop-blur-md text-indigo-300 border border-white/10 shadow-sm">
                                  {item.category}
                                </span>
                                {item.tips && (
                                  <span className="text-[11px] text-gray-400 hidden sm:inline truncate max-w-md">
                                    💡 {item.tips}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => toggleMastered(idx, e)}
                              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all backdrop-blur-md ${
                                isMastered
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                              }`}
                              title={
                                isMastered
                                  ? "Mark Needs Review"
                                  : "Mark Mastered"
                              }
                            >
                              <CheckCircle2 size={16} />
                              <span className="hidden sm:inline">
                                {isMastered ? "Mastered" : "Study"}
                              </span>
                            </button>

                            <div className="p-1 text-gray-400 hover:text-white transition-colors">
                              {isExpanded ? (
                                <ChevronUp size={18} />
                              ) : (
                                <ChevronDown size={18} />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Question Details & Answers */}
                        {isExpanded && (
                          <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/5 space-y-4 animate-in fade-in duration-200">
                            {/* 1. Model Answer */}
                            {item.answer ? (
                              <div className="bg-indigo-500/[0.08] backdrop-blur-md border border-indigo-500/25 rounded-xl p-4 shadow-inner">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                                    <Sparkles size={14} />
                                    <span>High-Scoring Model Answer</span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        item.answer || "",
                                        idx * 10,
                                      )
                                    }
                                    className="text-[11px] text-indigo-400 hover:text-indigo-200 flex items-center gap-1 font-semibold transition-colors"
                                  >
                                    {copiedIndex === idx * 10 ? (
                                      <>
                                        <Check
                                          size={12}
                                          className="text-emerald-400"
                                        />
                                        <span className="text-emerald-400">
                                          Copied!
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} />
                                        <span>Copy Answer</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                                  {item.answer}
                                </div>
                              </div>
                            ) : item.tips ? (
                              <div className="bg-indigo-500/[0.08] backdrop-blur-md border border-indigo-500/25 rounded-xl p-4 text-xs sm:text-sm text-gray-300 leading-relaxed">
                                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                                  Coach Key Points
                                </div>
                                {item.tips}
                              </div>
                            ) : null}

                            {/* 2. Deep Dive & Architectural Explanation */}
                            {item.explanation && (
                              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-inner">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                  <Lightbulb
                                    size={14}
                                    className="text-amber-400"
                                  />
                                  <span>Technical Deep Dive & Trade-offs</span>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                  {item.explanation}
                                </div>
                              </div>
                            )}

                            {/* 3. Code / Query Example */}
                            {item.sample_code && (
                              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-inner">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <Code2
                                      size={14}
                                      className="text-cyan-400"
                                    />
                                    <span>Implementation & Pseudocode</span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        item.sample_code || "",
                                        idx * 10 + 1,
                                      )
                                    }
                                    className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
                                  >
                                    {copiedIndex === idx * 10 + 1 ? (
                                      <>
                                        <Check
                                          size={12}
                                          className="text-emerald-400"
                                        />
                                        <span className="text-emerald-400">
                                          Copied!
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={12} />
                                        <span>Copy Code</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="text-xs font-mono text-cyan-200 overflow-x-auto p-3.5 bg-black/60 rounded-lg border border-white/5 leading-relaxed whitespace-pre-wrap">
                                  {item.sample_code}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-12 text-center space-y-4 backdrop-blur-2xl shadow-2xl bg-gradient-to-b from-white/[0.03] to-transparent">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-lg shadow-indigo-500/20">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      No Prep Notes Generated Yet
                    </h3>
                    <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                      Click below to analyze {selectedApp.company?.name}&apos;s
                      job description and generate questions, comprehensive
                      answers, and technical deep dives.
                    </p>
                  </div>
                  <button
                    onClick={() => handleGenerate(false)}
                    disabled={loadingAI}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Generate AI Prep Notes
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-12 text-center text-gray-400 text-sm backdrop-blur-2xl">
              Select a job application on the left to begin your interview prep
              session.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
