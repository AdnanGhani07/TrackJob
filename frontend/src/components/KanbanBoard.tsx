"use client";

import React from "react";
import { Application, ApplicationStatus } from "@/lib/types";
import { ApplicationCard } from "./ApplicationCard";

interface KanbanBoardProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onDeleteApplication: (id: number) => void;
}

const COLUMNS: {
  status: ApplicationStatus;
  title: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
}[] = [
  {
    status: "Applied",
    title: "Applied",
    dotColor: "bg-indigo-400",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-400",
    borderHover: "hover:border-indigo-500/30",
  },
  {
    status: "Referral",
    title: "Referral / Outreach",
    dotColor: "bg-cyan-400",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    borderHover: "hover:border-cyan-500/30",
  },
  {
    status: "Interview",
    title: "Interviewing",
    dotColor: "bg-amber-400",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
    borderHover: "hover:border-amber-500/30",
  },
  {
    status: "Offer",
    title: "Offers",
    dotColor: "bg-emerald-400",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    borderHover: "hover:border-emerald-500/30",
  },
  {
    status: "Rejected",
    title: "Archived / Rejected",
    dotColor: "bg-rose-400",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-400",
    borderHover: "hover:border-rose-500/30",
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectApplication,
  onStatusChange,
  onDeleteApplication,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4.5 items-start pb-10">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((app) => app.status === col.status);

        return (
          <div
            key={col.status}
            className={`bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5 flex flex-col h-[calc(100vh-250px)] min-h-[480px] max-h-[780px] transition-all duration-200 shadow-xl ${col.borderHover}`}
          >
            {/* Column Header (Fixed sticky top) */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0 select-none">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor} shadow-sm`} />
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {col.title}
                </h2>
              </div>

              <span
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-white/5 ${col.badgeBg} ${col.badgeText}`}
              >
                {colApps.length}
              </span>
            </div>

            {/* Column Cards Container (Independently scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {colApps.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onSelect={onSelectApplication}
                  onStatusChange={onStatusChange}
                  onDelete={onDeleteApplication}
                />
              ))}

              {colApps.length === 0 && (
                <div className="h-36 flex items-center justify-center text-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  No applications
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
