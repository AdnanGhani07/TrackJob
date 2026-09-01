export type ApplicationStatus = "Applied" | "Referral" | "Interview" | "Offer" | "Rejected";
export type ApplicationSource = "referral" | "cold" | "job_board";
export type ContactRelation = "alum" | "referrer" | "recruiter" | "other";
export type RoundType = "phone_screen" | "tech" | "system_design" | "hr" | "behavioral";
export type RoundOutcome = "pending" | "passed" | "failed";

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Company {
  id: number;
  name: string;
  industry?: string | null;
  notes?: string | null;
}

export interface PrepQuestionItem {
  question: string;
  category: string;
  tips?: string | null;
  answer?: string | null;
  explanation?: string | null;
  sample_code?: string | null;
}

export interface PrepBulletItem {
  bullet: string;
  keyword_match?: string | null;
}

export interface AIPrepNotes {
  id: number;
  application_id: number;
  generated_questions: PrepQuestionItem[];
  suggested_bullets: PrepBulletItem[];
  model_used: string;
  generated_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  company_id: number;
  company?: Company;
  role_title: string;
  jd_text?: string | null;
  status: ApplicationStatus;
  source: ApplicationSource;
  applied_date?: string | null;
  resume_version?: string | null;
  ai_prep_note?: AIPrepNotes | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  application_id: number;
  name: string;
  relation: ContactRelation;
  linkedin_url?: string | null;
  last_contacted_date?: string | null;
  created_at: string;
}

export interface OutreachLog {
  id: number;
  contact_id: number;
  message_sent: string;
  date_sent: string;
  response_received: boolean;
  created_at: string;
}

export interface InterviewRound {
  id: number;
  application_id: number;
  round_type: RoundType;
  scheduled_date: string;
  notes?: string | null;
  outcome: RoundOutcome;
  created_at: string;
  updated_at: string;
}
