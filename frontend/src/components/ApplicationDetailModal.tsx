"use client";

import React, { useState } from "react";
import { Application, ApplicationStatus } from "@/lib/types";
import { ContactsTab } from "./ContactsTab";
import { InterviewRoundsTab } from "./InterviewRoundsTab";
import { AIPrepTab } from "./AIPrepTab";
import {
  X,
  Building2,
  Calendar,
  Tag,
  FileText,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onRefreshApplication?: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onStatusChange,
  onRefreshApplication,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "contacts" | "rounds" | "ai"
  >("overview");

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="glass-modal animate-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Building2 size={16} />
              <span className="text-sm font-bold">
                {application.company?.name || "Company"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {application.role_title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={application.status}
              onChange={(e) =>
                onStatusChange(application.id, e.target.value as ApplicationStatus)
              }
              className="px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Applied">Applied</option>
              <option value="Referral">Referral / Outreach</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-5 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & JD", icon: FileText },
            { id: "contacts", label: "Contacts & Outreach", icon: Users },
            { id: "rounds", label: "Interview Rounds", icon: Clock },
            { id: "ai", label: "AI Interview Prep", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  APPLIED DATE
                </div>
                <div className="text-sm font-semibold text-white">
                  {application.applied_date || "Not specified"}
                </div>
              </div>
              <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  SOURCE
                </div>
                <div className="text-sm font-semibold text-white capitalize">
                  {application.source}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Job Description
              </h3>
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-gray-300 max-h-64 overflow-y-auto whitespace-pre-wrap">
                {application.jd_text ||
                  "No job description text provided. Paste a JD when creating or editing to enable Gemini AI interview question generation."}
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <ContactsTab applicationId={application.id} />
        )}
        {activeTab === "rounds" && (
          <InterviewRoundsTab applicationId={application.id} />
        )}
        {activeTab === "ai" && (
          <div className="py-4">
            <div className="bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-lg shadow-indigo-500/20">
                <Sparkles size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Interview Prep Hub
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
                  Generate tailored interview questions with comprehensive model answers, technical deep dives, and code solutions for{" "}
                  <span className="text-white font-semibold">
                    {application.company?.name} — {application.role_title}
                  </span>.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-center">
                <a
                  href="/prep"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles size={16} />
                  <span>Open in Interview Prep Hub</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
