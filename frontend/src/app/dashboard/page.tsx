"use client";

import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";
import { ApplicationModal } from "@/components/ApplicationModal";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Application, ApplicationStatus } from "@/lib/types";
import { Briefcase, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const data = await api.applications.list();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleStatusChange = async (
    appId: number,
    newStatus: ApplicationStatus,
  ) => {
    try {
      // Optimistic update
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app,
        ),
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
      await api.applications.update(appId, { status: newStatus });
    } catch (err) {
      console.error(err);
      fetchApplications();
    }
  };

  const handleDeleteApplication = async (appId: number) => {
    if (confirm("Are you sure you want to delete this job application?")) {
      try {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
        if (selectedApp?.id === appId) setSelectedApp(null);
        await api.applications.delete(appId);
      } catch (err) {
        console.error(err);
        fetchApplications();
      }
    }
  };

  // Filter applications by search and source
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.company?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === "all" || app.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f17",
        }}
      >
        <div
          style={{
            color: "var(--accent-primary)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.08), transparent 50%), #0b0f17",
      }}
    >
      <Navbar onNewApplication={() => setIsNewModalOpen(true)} />

      <main
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 24px" }}
      >
        {/* Top Control Bar & Stats Summary */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Application Pipeline
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              {applications.length} active applications across{" "}
              {new Set(applications.map((a) => a.company_id)).size} companies
            </p>
          </div>

          {/* Search & Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company or role..."
                style={{
                  padding: "8px 14px 8px 36px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  width: "220px",
                }}
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "#1e293b",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "var(--text-secondary)",
                fontSize: "13px",
                outline: "none",
              }}
            >
              <option value="all">All Sources</option>
              <option value="referral">Referral</option>
              <option value="cold">Cold Outreach</option>
              <option value="job_board">Job Board</option>
            </select>
          </div>
        </div>

        {/* Pipeline Board */}
        {loadingApps ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px",
              color: "var(--text-muted)",
              fontSize: "14px",
            }}
          >
            Fetching pipeline...
          </div>
        ) : applications.length === 0 ? (
          <div
            className="glass-card"
            style={{ textAlign: "center", padding: "60px 20px" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.15)",
                color: "var(--accent-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Briefcase size={24} />
            </div>
            <h2
              style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}
            >
              No applications yet
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                maxWidth: "420px",
                margin: "0 auto 20px",
              }}
            >
              Start tracking your applications, contacts, and interview prep by
              adding your first target company.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(99, 102, 241, 0.35)",
              }}
            >
              + Create First Application
            </button>
          </div>
        ) : (
          <KanbanBoard
            applications={filteredApps}
            onSelectApplication={(app) => setSelectedApp(app)}
            onStatusChange={handleStatusChange}
            onDeleteApplication={handleDeleteApplication}
          />
        )}
      </main>

      {/* Create Application Modal */}
      <ApplicationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => fetchApplications()}
      />

      {/* Application Detail & Tabs Modal */}
      <ApplicationDetailModal
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
