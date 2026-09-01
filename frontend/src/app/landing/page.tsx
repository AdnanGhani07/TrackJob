"use client";

import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Database,
  Kanban,
  Lock,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: "5x", label: "Faster Application Logging" },
    { value: "100%", label: "Privacy-Preserving AI Analysis" },
    { value: "99.9%", label: "Cloud Uptime & ACID Durability" },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Log Applications & Contacts",
      desc: "Add target companies, paste Job Descriptions, and link alumni referrers or recruiters in seconds.",
      icon: Briefcase,
    },
    {
      step: "02",
      title: "Generate AI Prep Notes",
      desc: "Our intelligent LLM engine analyzes the JD to generate 5–8 high-probability technical & behavioral questions.",
      icon: Sparkles,
    },
    {
      step: "03",
      title: "Track Outreach & Rounds",
      desc: "Log message timestamps, track responses, and manage Tech/System Design round outcomes until offer.",
      icon: Kanban,
    },
  ];

  const faqs = [
    {
      q: "How does the AI Interview Prep engine work?",
      a: "Our AI engine parses job postings to extract critical domain keywords, required technical competencies, and high-frequency behavioral questions, generating actionable resume bullet recommendations to highlight.",
    },
    {
      q: "Is my candidate outreach data private and secure?",
      a: "Yes. All applications, contacts, and interview notes are secured via industry-standard bcrypt encryption, stateless JWT authorization, and strict user-scoped database isolation.",
    },
    {
      q: "Can I manage multi-round technical interviews?",
      a: "Absolutely. The Interview Rounds module provides dedicated timeline tracking for Recruiter Screens, Live Coding Challenges, System Design rounds, and Hiring Manager interviews with outcome logs.",
    },
    {
      q: "Can I export or filter my application pipeline?",
      a: "Yes. You can instantly filter applications by status, outreach source (Referral, Cold, Job Board), or search dynamically by company name and role title.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-[#f9fafb] overflow-x-hidden bg-[radial-gradient(ellipse_at_50%_-20%,rgba(99,102,241,0.22),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.08),transparent_40%)]">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Briefcase size={20} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight">
              TrackJob
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              PRO
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-white transition-colors">
            Workflow
          </a>
          <a href="#stack" className="hover:text-white transition-colors">
            Tech Stack
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-7">
          <Sparkles size={14} />
          <span>Intelligent Interview Coaching & Pipeline Workspace</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-none mb-6">
          Stop Losing Job Leads.
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Track, Prepare & Land Offers.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-9">
          A developer-centric interview management system. Organize company
          outreach, track alumni referrals, and leverage AI to generate
          high-impact interview questions directly from job postings.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-14">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-base font-bold shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <span>
              {user ? "Open Active Workspace" : "Launch Your Tracker Now"}
            </span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="glass-card p-5 text-center border border-white/5"
            >
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {s.value}
              </div>
              <div className="text-xs text-gray-400 mt-1 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive UI Mockup & Features Showcase */}
      <section
        id="features"
        className="max-w-6xl mx-auto px-6 py-8 pb-20 scroll-mt-12"
      >
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-white/10 p-2 sm:p-4 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl">
          {/* Subtle Glow Behind Frame */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl -z-10 opacity-70" />

          {/* Browser / App Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/60 rounded-t-xl mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-400 font-medium">
              <Lock size={12} className="text-emerald-400" />
              <span>app.interviewtracker.io/pipeline</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          {/* SaaS App Dashboard Layout Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-950/40 p-3 sm:p-4 rounded-xl border border-white/5">
            {/* Left Sidebar Mockup */}
            <div className="hidden lg:flex lg:col-span-3 flex-col justify-between p-4 bg-slate-900/60 rounded-xl border border-white/5 text-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-2 py-1.5 text-white font-bold text-sm">
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
                    <Briefcase size={14} />
                  </div>
                  <span>Workspace</span>
                </div>

                <div className="space-y-1 text-gray-400 font-medium">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-500/15 text-indigo-400 font-semibold">
                    <span className="flex items-center gap-2">
                      <Kanban size={14} /> Kanban Board
                    </span>
                    <span className="text-[10px] bg-indigo-500/30 px-1.5 py-0.5 rounded">9</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="flex items-center gap-2">
                      <Users size={14} /> Network & Referrals
                    </span>
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">14</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="flex items-center gap-2">
                      <Clock size={14} /> Scheduled Rounds
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">3</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} className="text-purple-400" /> AI Prep Notes
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">AI</span>
                  </div>
                </div>
              </div>

              {/* Target Goals Meter */}
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                  <span>Weekly Outreach Goal</span>
                  <span className="text-white font-bold">12 / 15</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full w-[80%]" />
                </div>
              </div>
            </div>

            {/* Main Content Area Mockup */}
            <div className="lg:col-span-9 space-y-4">
              {/* Top Search & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-white/5 text-xs">
                <div className="flex items-center gap-2 text-gray-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/5 flex-1 max-w-xs">
                  <span>Search companies, roles, tags...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-gray-300 font-medium">All Sources</span>
                  <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
                    <span>+ New Application</span>
                  </button>
                </div>
              </div>

              {/* Columns Pipeline Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Column 1: Applied */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-bold text-indigo-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" /> Applied
                    </span>
                    <span className="bg-indigo-500/15 px-2 py-0.5 rounded-full text-[10px]">3</span>
                  </div>

                  {/* Card 1 */}
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-white/10 hover:border-indigo-500/40 transition-all shadow-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white">Stripe</span>
                      <span className="text-[10px] text-gray-500">2d ago</span>
                    </div>
                    <div className="text-xs font-medium text-gray-300 mb-2.5">Senior Backend Engineer</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Referral
                      </span>
                      <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        Resume v2.1
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-white/10 hover:border-indigo-500/40 transition-all shadow-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white">Datadog</span>
                      <span className="text-[10px] text-gray-500">5d ago</span>
                    </div>
                    <div className="text-xs font-medium text-gray-300 mb-2.5">Distributed Systems Engineer</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                        <Sparkles size={10} /> AI Prep Ready
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Interviewing */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Interviewing
                    </span>
                    <span className="bg-amber-500/15 px-2 py-0.5 rounded-full text-[10px]">2</span>
                  </div>

                  {/* Card 3 */}
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-md bg-gradient-to-b from-amber-500/5 to-transparent">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white">Google</span>
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Tomorrow, 2:00 PM
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-300 mb-2">Staff Software Engineer</div>
                    <div className="text-[11px] text-gray-400 bg-slate-950/60 p-2 rounded border border-white/5 space-y-1 mb-2">
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Clock size={11} /> Round 3: System Design
                      </div>
                      <div className="text-[10px] text-gray-400">Interviewer: Principal Architect</div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>Contact: Alex M. (Recruiter)</span>
                      <span className="text-emerald-400 font-medium">R2 Passed ✓</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Offers */}
                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Offer Extended
                    </span>
                    <span className="bg-emerald-500/15 px-2 py-0.5 rounded-full text-[10px]">1</span>
                  </div>

                  {/* Card 4 */}
                  <div className="p-3 bg-gradient-to-b from-emerald-500/15 to-slate-900/90 rounded-lg border border-emerald-500/40 shadow-lg shadow-emerald-950/40">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-extrabold text-white">OpenAI</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Active Offer
                      </span>
                    </div>
                    <div className="text-xs font-bold text-emerald-300 mb-2">Senior Platform Engineer</div>
                    <div className="text-[11px] text-gray-300 space-y-1 mb-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">Base + Equity Package</span>
                        <span className="text-emerald-400 font-bold">Decision: Sep 15</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-gray-400">4 Rounds Completed</span>
                      <span className="text-indigo-400 font-semibold">Review Terms →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section id="workflow" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold tracking-tight">
            How High-Performers Land Offers
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            A structured, repeatable methodology from initial discovery to
            negotiation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="glass-card p-7 relative border border-white/10"
              >
                <div className="text-4xl font-black text-indigo-500/20 absolute top-5 right-6 font-mono">
                  {step.step}
                </div>

                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-5">
                  <Icon size={22} />
                </div>

                <h3 className="text-lg font-bold mb-2 text-white">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section
        id="stack"
        className="bg-slate-900/40 border-y border-white/5 py-20 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Engineered with Enterprise-Grade Tech
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-2">
              Clean layered architecture with clear separation of concerns
              across every layer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-card p-6">
              <div className="text-indigo-400 mb-3">
                <Terminal size={24} />
              </div>
              <h3 className="text-base font-bold mb-1.5 text-white">
                FastAPI Async Core
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                High-throughput asynchronous engine with strict schema
                validation and OpenAPI auto-specifications.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="text-emerald-400 mb-3">
                <Database size={24} />
              </div>
              <h3 className="text-base font-bold mb-1.5 text-white">
                Cloud PostgreSQL
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Serverless relational storage with connection pooling, automated
                migrations, and ACID guarantees.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="text-cyan-400 mb-3">
                <Code2 size={24} />
              </div>
              <h3 className="text-base font-bold mb-1.5 text-white">
                Next.js 14 & TypeScript
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                React App Router with glassmorphic styling, typed API client,
                and instant client state synchronization.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="text-purple-400 mb-3">
                <Cpu size={24} />
              </div>
              <h3 className="text-base font-bold mb-1.5 text-white">
                Intelligent LLM Engine
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Structured generative AI orchestration for automated job
                description parsing and question extraction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Everything you need to know about the platform and deployment.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card p-5 cursor-pointer border border-white/5 transition-all"
                onClick={() => setActiveFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.q}
                  </span>
                  <ChevronRight
                    size={18}
                    className={`text-gray-400 transform transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-90" : "rotate-0"
                    }`}
                  />
                </div>

                {isOpen && (
                  <p className="text-gray-400 text-sm leading-relaxed mt-3 pt-3 border-t border-white/10">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/40 rounded-2xl p-10 sm:p-14 text-center shadow-2xl shadow-black/60">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 text-white">
            Ready to Supercharge Your Job Pipeline?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Set up your workspace in under 60 seconds with our complete modern
            stack.
          </p>

          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-base font-bold shadow-lg shadow-indigo-500/30 transition-all"
          >
            <span>
              {user ? "Open Active Workspace" : "Get Started For Free"}
            </span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/80 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Briefcase size={15} />
            </div>
            <span className="text-sm font-bold text-white">
              TrackJob — Smart Job Tracker & AI Prep
            </span>
          </div>

          <div className="text-xs text-gray-500">
            Powered by Next.js 14, FastAPI, Cloud PostgreSQL & Google Gemini AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
