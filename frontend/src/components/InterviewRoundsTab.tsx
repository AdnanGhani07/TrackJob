"use client";

import React, { useState, useEffect } from "react";
import { InterviewRound, RoundType, RoundOutcome } from "@/lib/types";
import { api } from "@/lib/api";
import { Plus, Calendar, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";

interface InterviewRoundsTabProps {
  applicationId: number;
}

const outcomeConfig: Record<RoundOutcome, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "var(--status-interview)", bg: "var(--status-interview-bg)", icon: Clock },
  passed: { label: "Passed", color: "var(--status-offer)", bg: "var(--status-offer-bg)", icon: CheckCircle2 },
  failed: { label: "Failed", color: "var(--status-rejected)", bg: "var(--status-rejected-bg)", icon: XCircle },
};

export const InterviewRoundsTab: React.FC<InterviewRoundsTabProps> = ({ applicationId }) => {
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [showAddRound, setShowAddRound] = useState(false);

  // New Round Form State
  const [roundType, setRoundType] = useState<RoundType>("tech");
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState("");

  const fetchRounds = async () => {
    try {
      const data = await api.interviewRounds.list(applicationId);
      setRounds(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, [applicationId]);

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.interviewRounds.create(applicationId, {
        round_type: roundType,
        scheduled_date: new Date(scheduledDate).toISOString(),
        notes: notes || undefined,
        outcome: "pending",
      });
      setNotes("");
      setShowAddRound(false);
      fetchRounds();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOutcome = async (roundId: number, outcome: RoundOutcome) => {
    try {
      await api.interviewRounds.update(roundId, { outcome });
      fetchRounds();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Interview Rounds Timeline</h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Schedule and track outcomes for phone screens, tech interviews, and system design
          </p>
        </div>

        <button
          onClick={() => setShowAddRound(!showAddRound)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "var(--accent-primary)",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={14} />
          <span>Schedule Round</span>
        </button>
      </div>

      {/* Add Round Form */}
      {showAddRound && (
        <form
          onSubmit={handleCreateRound}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                Round Type
              </label>
              <select
                value={roundType}
                onChange={(e) => setRoundType(e.target.value as RoundType)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "#1e293b",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "13px",
                }}
              >
                <option value="phone_screen">Phone Screen / Recruiter</option>
                <option value="tech">Technical / Live Coding</option>
                <option value="system_design">System Design</option>
                <option value="hr">HR / Culture Fit</option>
                <option value="behavioral">Behavioral</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: "#1e293b",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
              Preparation Notes / Interviewer Name
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on Python concurrency and PostgreSQL indexing"
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "#1e293b",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setShowAddRound(false)}
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "6px 14px",
                background: "var(--accent-primary)",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Save Round
            </button>
          </div>
        </form>
      )}

      {/* Rounds Timeline */}
      {rounds.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13px" }}>
          No interview rounds scheduled yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {rounds.map((r) => {
            const conf = outcomeConfig[r.outcome];
            const Icon = conf.icon;

            return (
              <div
                key={r.id}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: conf.bg,
                      color: conf.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>
                      {r.round_type.replace("_", " ")} Round
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      <Calendar size={12} />
                      <span>{new Date(r.scheduled_date).toLocaleString()}</span>
                    </div>
                    {r.notes && (
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        {r.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Outcome Toggle Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginRight: "4px" }}>Outcome:</span>
                  {(["pending", "passed", "failed"] as RoundOutcome[]).map((oc) => (
                    <button
                      key={oc}
                      onClick={() => handleUpdateOutcome(r.id, oc)}
                      style={{
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        borderRadius: "4px",
                        border: r.outcome === oc ? `1px solid ${outcomeConfig[oc].color}` : "1px solid transparent",
                        background: r.outcome === oc ? outcomeConfig[oc].bg : "rgba(255,255,255,0.03)",
                        color: r.outcome === oc ? outcomeConfig[oc].color : "var(--text-muted)",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {oc}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
