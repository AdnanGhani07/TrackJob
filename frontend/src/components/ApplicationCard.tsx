"use client";

import React, { useState } from "react";
import { Application, ApplicationStatus } from "@/lib/types";
import {
  Building2,
  Calendar,
  ChevronRight,
  MoreVertical,
  Trash2,
  Tag,
  Sparkles,
} from "lucide-react";

interface ApplicationCardProps {
  application: Application;
  onSelect: (app: Application) => void;
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
}

const statusBadgeStyles: Record<ApplicationStatus, string> = {
  Applied: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  Referral: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Interview: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Offer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onSelect,
  onStatusChange,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const statuses: ApplicationStatus[] = [
    "Applied",
    "Referral",
    "Interview",
    "Offer",
    "Rejected",
  ];

  return (
    <div
      className="p-4 mb-3 cursor-pointer relative rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 hover:bg-slate-900/75 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 group bg-gradient-to-b from-white/[0.03] to-transparent"
      onClick={() => onSelect(application)}
    >
      {/* Top Header: Company Name & Actions Menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-gray-400" />
          <span className="text-sm font-bold text-white tracking-tight">
            {application.company?.name || "Company"}
          </span>
        </div>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-20 p-1.5 space-y-0.5">
              <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                Move Status
              </div>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(application.id, s);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    application.status === s
                      ? "bg-white/10 text-white font-semibold"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}

              <div className="h-px bg-white/10 my-1" />

              <button
                onClick={() => {
                  onDelete(application.id);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 font-semibold"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role Title */}
      <h3 className="text-sm font-semibold text-gray-100 mb-3 line-clamp-1 group-hover:text-white transition-colors">
        {application.role_title}
      </h3>

      {/* Tags: Status, Source, Resume, AI Badge */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            statusBadgeStyles[application.status] ||
            "bg-gray-800 text-gray-300 border-gray-700"
          }`}
        >
          {application.status}
        </span>

        {application.source && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-300 flex items-center gap-1 border border-white/5 capitalize">
            <Tag size={10} className="text-gray-400" />
            {application.source}
          </span>
        )}
      </div>

      {/* Footer Details: Date & Action Link */}
      <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-xs text-gray-400">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar size={13} className="text-gray-500" />
          <span>{application.applied_date || "Date N/A"}</span>
        </div>

        <div className="flex items-center gap-1 text-indigo-400 text-[11px] font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>View</span>
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
};
