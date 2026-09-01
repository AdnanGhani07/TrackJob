import {
  User,
  AuthResponse,
  Company,
  Application,
  Contact,
  OutreachLog,
  InterviewRound,
  ApplicationStatus,
  ApplicationSource,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  public setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  public clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Auto-clear invalid/expired token
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        this.clearToken();
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || "An unexpected error occurred");
    }

    return data as T;
  }

  // --- Auth Endpoints ---
  public auth = {
    register: (data: { email: string; password: string }) =>
      this.request<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      this.request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMe: () => this.request<User>("/auth/me"),
  };

  // --- Companies Endpoints ---
  public companies = {
    list: () => this.request<Company[]>("/companies"),
    create: (data: { name: string; industry?: string; notes?: string }) =>
      this.request<Company>("/companies", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getById: (id: number) => this.request<Company>(`/companies/${id}`),
    update: (id: number, data: Partial<Company>) =>
      this.request<Company>(`/companies/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<void>(`/companies/${id}`, { method: "DELETE" }),
  };

  // --- Applications Endpoints ---
  public applications = {
    list: (params?: { status?: ApplicationStatus; source?: ApplicationSource; company_id?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append("status", params.status);
      if (params?.source) searchParams.append("source", params.source);
      if (params?.company_id) searchParams.append("company_id", params.company_id.toString());
      const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
      return this.request<Application[]>(`/applications${query}`);
    },
    create: (data: {
      company_id: number;
      role_title: string;
      jd_text?: string;
      status?: ApplicationStatus;
      source?: ApplicationSource;
      applied_date?: string;
      resume_version?: string;
    }) =>
      this.request<Application>("/applications", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getById: (id: number) => this.request<Application>(`/applications/${id}`),
    update: (id: number, data: Partial<Application>) =>
      this.request<Application>(`/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<void>(`/applications/${id}`, { method: "DELETE" }),
  };

  // --- Contacts Endpoints ---
  public contacts = {
    list: (applicationId: number) =>
      this.request<Contact[]>(`/applications/${applicationId}/contacts`),
    create: (applicationId: number, data: { name: string; relation: string; linkedin_url?: string; last_contacted_date?: string }) =>
      this.request<Contact>(`/applications/${applicationId}/contacts`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<Contact>) =>
      this.request<Contact>(`/contacts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<void>(`/contacts/${id}`, { method: "DELETE" }),
  };

  // --- Outreach Endpoints ---
  public outreach = {
    list: (contactId: number) =>
      this.request<OutreachLog[]>(`/contacts/${contactId}/outreach`),
    create: (contactId: number, data: { message_sent: string; date_sent?: string; response_received?: boolean }) =>
      this.request<OutreachLog>(`/contacts/${contactId}/outreach`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<OutreachLog>) =>
      this.request<OutreachLog>(`/outreach/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<void>(`/outreach/${id}`, { method: "DELETE" }),
  };

  // --- Interview Rounds Endpoints ---
  public interviewRounds = {
    list: (applicationId: number) =>
      this.request<InterviewRound[]>(`/applications/${applicationId}/interview-rounds`),
    create: (applicationId: number, data: { round_type: string; scheduled_date: string; notes?: string; outcome?: string }) =>
      this.request<InterviewRound>(`/applications/${applicationId}/interview-rounds`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<InterviewRound>) =>
      this.request<InterviewRound>(`/interview-rounds/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<void>(`/interview-rounds/${id}`, { method: "DELETE" }),
  };

  // --- AI Interview Prep Endpoints ---
  public ai = {
    getPrepNotes: (applicationId: number) =>
      this.request<import("./types").AIPrepNotes>(`/applications/${applicationId}/ai/prep-notes`),
    generatePrepNotes: (
      applicationId: number,
      data?: {
        custom_instructions?: string;
        round_type?: string;
        round_notes?: string;
        force_refresh?: boolean;
      }
    ) =>
      this.request<import("./types").AIPrepNotes>(`/applications/${applicationId}/ai/prep-notes`, {
        method: "POST",
        body: JSON.stringify(data || {}),
      }),
    deletePrepNotes: (applicationId: number) =>
      this.request<void>(`/applications/${applicationId}/ai/prep-notes`, { method: "DELETE" }),
  };
}

export const api = new ApiClient();
