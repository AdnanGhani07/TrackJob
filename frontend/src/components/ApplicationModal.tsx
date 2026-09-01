"use client";

import React, { useState, useEffect } from "react";
import { Company, ApplicationStatus, ApplicationSource } from "@/lib/types";
import { api } from "@/lib/api";
import { X, Building2, Briefcase, FileText, Calendar, Tag, AlertCircle } from "lucide-react";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [newCompanyName, setNewCompanyName] = useState<string>("");
  const [isCreatingNewCompany, setIsCreatingNewCompany] = useState<boolean>(false);
  
  const [roleTitle, setRoleTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("Applied");
  const [source, setSource] = useState<ApplicationSource>("job_board");
  const [appliedDate, setAppliedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [resumeVersion, setResumeVersion] = useState("v1.0_general");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.companies.list()
        .then((res) => {
          setCompanies(res);
          if (res.length > 0) {
            setSelectedCompanyId(res[0].id.toString());
          } else {
            setIsCreatingNewCompany(true);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let companyId: number;

      if (isCreatingNewCompany) {
        if (!newCompanyName.trim()) {
          throw new Error("Company name is required");
        }
        const createdComp = await api.companies.create({ name: newCompanyName.trim() });
        companyId = createdComp.id;
      } else {
        companyId = parseInt(selectedCompanyId, 10);
      }

      await api.applications.create({
        company_id: companyId,
        role_title: roleTitle,
        jd_text: jdText || undefined,
        status,
        source,
        applied_date: appliedDate || undefined,
        resume_version: resumeVersion || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: "20px",
    }}>
      <div className="glass-modal animate-modal" style={{
        width: "100%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "28px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(99, 102, 241, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-primary)",
            }}>
              <Briefcase size={18} />
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 700 }}>New Job Application</h2>
          </div>

          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#f43f5e",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "18px",
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Company Selection / Quick Add */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
                Company Name
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNewCompany(!isCreatingNewCompany)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent-primary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isCreatingNewCompany ? "Choose Existing Company" : "+ Add New Company"}
              </button>
            </div>

            {isCreatingNewCompany ? (
              <input
                type="text"
                required
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="e.g. OpenAI, Stripe, Google"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            ) : (
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#1e293b",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Role Title */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Role Title
            </label>
            <input
              type="text"
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Status & Source Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#1e293b",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                <option value="Applied">Applied</option>
                <option value="Referral">Referral / Outreach</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Application Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as ApplicationSource)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#1e293b",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                <option value="job_board">Job Board</option>
                <option value="referral">Referral</option>
                <option value="cold">Cold Outreach</option>
              </select>
            </div>
          </div>

          {/* Applied Date */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Applied Date
            </label>
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Job Description */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Job Description (JD Text for AI Interview Prep)
            </label>
            <textarea
              rows={4}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste full JD here. Our AI feature will generate tailored interview questions and resume bullets."
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "13px",
                lineHeight: "1.5",
                resize: "vertical",
                outline: "none",
              }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                background: "rgba(255, 255, 255, 0.06)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 22px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 10px rgba(99, 102, 241, 0.3)",
              }}
            >
              {loading ? "Creating..." : "Save Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
