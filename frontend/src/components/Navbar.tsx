"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Briefcase,
  LogOut,
  Plus,
  User as UserIcon,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  onNewApplication?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewApplication }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation Tabs */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Briefcase size={18} />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                TrackJob
              </span>
              <span className="text-[11px] text-gray-400 block -mt-1 font-medium">
                Pipeline & AI Coach
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                pathname === "/dashboard"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Pipeline Board</span>
            </Link>

            <Link
              href="/prep"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                pathname === "/prep"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles size={14} />
              <span>Interview Prep Hub</span>
            </Link>
          </nav>
        </div>

        {/* Right: Action Controls & User Menu */}
        <div className="flex items-center gap-3">
          {onNewApplication && (
            <button
              onClick={onNewApplication}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Application</span>
            </button>
          )}

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 text-xs font-bold">
                <UserIcon size={14} />
              </div>
              <span className="hidden lg:inline text-xs text-gray-300 font-semibold max-w-[120px] truncate">
                {user?.email.split("@")[0]}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
