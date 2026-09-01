"use client";

import React, { useState, useEffect } from "react";
import { Contact, OutreachLog } from "@/lib/types";
import { api } from "@/lib/api";
import { Plus, User, Linkedin, Mail, CheckCircle2, Circle, MessageSquare, Trash2, Calendar } from "lucide-react";

interface ContactsTabProps {
  applicationId: number;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({ applicationId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [outreachLogs, setOutreachLogs] = useState<Record<number, OutreachLog[]>>({});
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContactIdForOutreach, setSelectedContactIdForOutreach] = useState<number | null>(null);

  // New Contact Form State
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("referrer");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // New Outreach Note State
  const [outreachMessage, setOutreachMessage] = useState("");

  const fetchContacts = async () => {
    try {
      const data = await api.contacts.list(applicationId);
      setContacts(data);
      // Fetch outreach logs for each contact
      data.forEach((c) => {
        api.outreach.list(c.id).then((logs) => {
          setOutreachLogs((prev) => ({ ...prev, [c.id]: logs }));
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [applicationId]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.contacts.create(applicationId, {
        name,
        relation,
        linkedin_url: linkedinUrl || undefined,
      });
      setName("");
      setLinkedinUrl("");
      setShowAddContact(false);
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOutreach = async (contactId: number) => {
    if (!outreachMessage.trim()) return;
    try {
      await api.outreach.create(contactId, {
        message_sent: outreachMessage,
        response_received: false,
      });
      setOutreachMessage("");
      setSelectedContactIdForOutreach(null);
      // Refresh logs for this contact
      const logs = await api.outreach.list(contactId);
      setOutreachLogs((prev) => ({ ...prev, [contactId]: logs }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleResponse = async (outreachId: number, currentVal: boolean, contactId: number) => {
    try {
      await api.outreach.update(outreachId, { response_received: !currentVal });
      const logs = await api.outreach.list(contactId);
      setOutreachLogs((prev) => ({ ...prev, [contactId]: logs }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      {/* Header & Add Button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Contacts & Outreach Trail</h3>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Track recruiters, alumni referrers, and logged cold messages
          </p>
        </div>

        <button
          onClick={() => setShowAddContact(!showAddContact)}
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
          <span>Add Contact</span>
        </button>
      </div>

      {/* Add Contact Modal / Inline Form */}
      {showAddContact && (
        <form
          onSubmit={handleCreateContact}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
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

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                Relation
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
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
                <option value="referrer">Alumni / Referrer</option>
                <option value="recruiter">Recruiter</option>
                <option value="alum">University Alumni</option>
                <option value="other">Other Connection</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                LinkedIn URL (optional)
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setShowAddContact(false)}
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
              Save Contact
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13px" }}>
          No contacts added for this application yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {contacts.map((c) => {
            const logs = outreachLogs[c.id] || [];

            return (
              <div
                key={c.id}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "14px",
                }}
              >
                {/* Contact Card Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(6, 182, 212, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--status-referral)",
                    }}>
                      <User size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                        {c.relation}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {c.linkedin_url && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          color: "var(--status-referral)",
                          textDecoration: "none",
                        }}
                      >
                        <Linkedin size={14} />
                        <span>LinkedIn</span>
                      </a>
                    )}

                    <button
                      onClick={() =>
                        setSelectedContactIdForOutreach(
                          selectedContactIdForOutreach === c.id ? null : c.id
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 10px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>Log Message</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Outreach Message Form */}
                {selectedContactIdForOutreach === c.id && (
                  <div style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    padding: "10px",
                    borderRadius: "6px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}>
                    <textarea
                      rows={2}
                      value={outreachMessage}
                      onChange={(e) => setOutreachMessage(e.target.value)}
                      placeholder="Paste note or summary of message sent..."
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#1e293b",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        color: "#fff",
                        fontSize: "12px",
                        resize: "none",
                        marginBottom: "8px",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        onClick={() => setSelectedContactIdForOutreach(null)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCreateOutreach(c.id)}
                        style={{
                          background: "var(--accent-primary)",
                          border: "none",
                          borderRadius: "4px",
                          color: "#fff",
                          padding: "4px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Outreach Trail / Messages */}
                {logs.length > 0 && (
                  <div style={{ marginTop: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                      OUTREACH HISTORY ({logs.length})
                    </div>
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          background: "rgba(255, 255, 255, 0.02)",
                          borderRadius: "6px",
                          marginBottom: "4px",
                          fontSize: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          <button
                            onClick={() => handleToggleResponse(log.id, log.response_received, c.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: log.response_received ? "var(--status-offer)" : "var(--text-muted)",
                              cursor: "pointer",
                              padding: 0,
                              marginTop: "2px",
                            }}
                            title={log.response_received ? "Response Received" : "Mark as Responded"}
                          >
                            {log.response_received ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          </button>
                          <div>
                            <span style={{ color: "var(--text-primary)" }}>{log.message_sent}</span>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                              Sent on {log.date_sent}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: log.response_received ? "var(--status-offer-bg)" : "rgba(255, 255, 255, 0.05)",
                            color: log.response_received ? "var(--status-offer)" : "var(--text-muted)",
                          }}
                        >
                          {log.response_received ? "Responded" : "Awaiting"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
