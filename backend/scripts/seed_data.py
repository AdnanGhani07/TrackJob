"""
Database Seeder Script for Development and Staging Demonstrations.
Usage:
    python scripts/seed_data.py
    python scripts/seed_data.py --force-production (if running against staging/production database)
"""

import os
import sys
from datetime import date, datetime, timedelta, timezone

# Add backend dir to sys.path so app modules import properly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import SessionLocal
from app.core.security import get_password_hash
from app.models.ai_prep_note import AIPrepNote
from app.models.application import Application, ApplicationSource, ApplicationStatus
from app.models.company import Company
from app.models.contact import Contact, ContactRelation
from app.models.interview_round import InterviewRound, RoundOutcome, RoundType
from app.models.outreach_log import OutreachLog
from app.models.user import User


def seed_database():
    is_prod = settings.ENVIRONMENT.lower() in ["production", "prod"]
    if is_prod and "--force-production" not in sys.argv:
        print(
            "[!] SAFETY ABORT: Refusing to run seed script in PRODUCTION environment without --force-production flag."
        )
        return

    print("[*] Initializing Database Seeder...")
    db: Session = SessionLocal()

    try:
        # 1. Create or Find Demo User
        demo_email = "demo@interviewtracker.dev"
        demo_user = db.scalars(select(User).where(User.email == demo_email)).first()
        if not demo_user:
            demo_user = User(
                email=demo_email,
                password_hash=get_password_hash("DemoPass123!"),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"[+] Created Demo User: {demo_email} (Password: DemoPass123!)")
        else:
            print(f"[-] Demo User exists: {demo_email}")

        # 2. Seed Companies
        companies_data = [
            {
                "name": "Stripe",
                "industry": "Financial Technology",
                "notes": "Global infrastructure for internet commerce.",
            },
            {
                "name": "Datadog",
                "industry": "Cloud Observability & Security",
                "notes": "Monitoring platform for cloud-scale applications.",
            },
            {
                "name": "Google",
                "industry": "Search & Cloud",
                "notes": "Core Infrastructure and Distributed Systems teams.",
            },
            {
                "name": "OpenAI",
                "industry": "Artificial Intelligence",
                "notes": "Applied AI and Research Infrastructure.",
            },
            {
                "name": "Meta",
                "industry": "Social Media & Metaverse",
                "notes": "Monetization and ads infra engineering.",
            },
        ]

        created_companies = {}
        for c in companies_data:
            comp = db.scalars(select(Company).where(Company.name == c["name"])).first()
            if not comp:
                comp = Company(name=c["name"], industry=c["industry"], notes=c["notes"])
                db.add(comp)
                db.commit()
                db.refresh(comp)
            created_companies[c["name"]] = comp
        print(f"[+] Seeded {len(created_companies)} target companies.")

        # 3. Seed Applications with Detailed JDs
        apps_data = [
            {
                "company_name": "Stripe",
                "role_title": "Senior Backend Engineer (Payments)",
                "status": ApplicationStatus.APPLIED,
                "source": ApplicationSource.REFERRAL,
                "applied_date": date.today() - timedelta(days=2),
                "resume_version": "v2.1-Payments",
                "jd_text": """About the Role:
We are looking for senior backend engineers to help build resilient, high-throughput payment infrastructure handling hundreds of billions of dollars annually.

Responsibilities:
- Design and implement distributed financial ledger services with strict idempotency and zero-downtime requirements.
- Build low-latency async services in Python / Go with PostgreSQL, Redis, and Kafka.
- Collaborate with security teams to enforce PCI-DSS compliance and cryptographic data protection.

Requirements:
- 4+ years of professional backend engineering experience.
- Deep expertise in relational databases (PostgreSQL), index optimization, and transaction isolation levels.
- Strong fundamentals in concurrency, distributed systems, and API design.""",
            },
            {
                "company_name": "Datadog",
                "role_title": "Distributed Systems Engineer",
                "status": ApplicationStatus.APPLIED,
                "source": ApplicationSource.JOB_BOARD,
                "applied_date": date.today() - timedelta(days=5),
                "resume_version": "v2.0-Infra",
                "jd_text": """We build real-time monitoring and observability pipelines ingesting trillions of events daily.
Looking for engineers passionate about telemetry, async pipelines, time-series data storage, and low-latency API architecture.""",
            },
            {
                "company_name": "Google",
                "role_title": "Staff Software Engineer (Cloud Run)",
                "status": ApplicationStatus.INTERVIEW,
                "source": ApplicationSource.COLD,
                "applied_date": date.today() - timedelta(days=14),
                "resume_version": "v2.2-Cloud",
                "jd_text": """Google Cloud Run is building serverless container orchestration for enterprise workloads.
Seeking engineers with deep experience in Linux namespaces, container runtimes, Kubernetes, and high-throughput gRPC services.""",
            },
            {
                "company_name": "OpenAI",
                "role_title": "Senior Platform Engineer",
                "status": ApplicationStatus.OFFER,
                "source": ApplicationSource.REFERRAL,
                "applied_date": date.today() - timedelta(days=28),
                "resume_version": "v2.3-AI",
                "jd_text": """Build the orchestration layer powering millions of LLM API requests per second with high GPU utilization and ultra-low latency routing.""",
            },
        ]

        created_apps = {}
        for app_info in apps_data:
            comp = created_companies[app_info["company_name"]]
            existing_app = db.scalars(
                select(Application).where(
                    Application.user_id == demo_user.id,
                    Application.company_id == comp.id,
                    Application.role_title == app_info["role_title"],
                )
            ).first()

            if not existing_app:
                app_obj = Application(
                    user_id=demo_user.id,
                    company_id=comp.id,
                    role_title=app_info["role_title"],
                    jd_text=app_info["jd_text"],
                    status=app_info["status"],
                    source=app_info["source"],
                    applied_date=app_info["applied_date"],
                    resume_version=app_info["resume_version"],
                )
                db.add(app_obj)
                db.commit()
                db.refresh(app_obj)
                created_apps[app_info["company_name"]] = app_obj
            else:
                created_apps[app_info["company_name"]] = existing_app

        print(f"[+] Seeded {len(created_apps)} applications.")

        # 4. Seed Contacts & Outreach Logs
        stripe_app = created_apps["Stripe"]
        contact1 = db.scalars(
            select(Contact).where(Contact.application_id == stripe_app.id)
        ).first()
        if not contact1:
            contact1 = Contact(
                application_id=stripe_app.id,
                name="Sarah Chen",
                relation=ContactRelation.REFERRER,
                linkedin_url="https://linkedin.com/in/sarahchen-stripe",
                last_contacted_date=date.today() - timedelta(days=2),
            )
            db.add(contact1)
            db.commit()
            db.refresh(contact1)

            outreach1 = OutreachLog(
                contact_id=contact1.id,
                message_sent="Hi Sarah! Loved your talk on distributed ledger consistency at GopherCon. I recently applied for the Backend Payments role and would love to connect!",
                date_sent=date.today() - timedelta(days=2),
                response_received=True,
            )
            db.add(outreach1)
            db.commit()
            print("[+] Seeded Contact & Outreach Logs for Stripe.")

        # 5. Seed Interview Rounds for Google
        google_app = created_apps["Google"]
        existing_rounds = db.scalars(
            select(InterviewRound).where(InterviewRound.application_id == google_app.id)
        ).all()
        if not existing_rounds:
            r1 = InterviewRound(
                application_id=google_app.id,
                round_type=RoundType.PHONE_SCREEN,
                scheduled_date=datetime.now(timezone.utc) - timedelta(days=7),
                notes="Recruiter screen with Alex Miller. Discussed background and team matching.",
                outcome=RoundOutcome.PASSED,
            )
            r2 = InterviewRound(
                application_id=google_app.id,
                round_type=RoundType.TECH,
                scheduled_date=datetime.now(timezone.utc) - timedelta(days=3),
                notes="Live coding round on graph traversal algorithms and concurrency locks.",
                outcome=RoundOutcome.PASSED,
            )
            r3 = InterviewRound(
                application_id=google_app.id,
                round_type=RoundType.SYSTEM_DESIGN,
                scheduled_date=datetime.now(timezone.utc) + timedelta(days=2),
                notes="Designing a distributed rate limiter and distributed task scheduler.",
                outcome=RoundOutcome.PENDING,
            )
            db.add_all([r1, r2, r3])
            db.commit()
            print("[+] Seeded Interview Rounds for Google.")

        # 6. Seed AI Prep Notes for Stripe
        existing_ai = db.scalars(
            select(AIPrepNote).where(AIPrepNote.application_id == stripe_app.id)
        ).first()
        if not existing_ai:
            ai_note = AIPrepNote(
                application_id=stripe_app.id,
                model_used="gemini-3.7-flash",
                generated_questions=[
                    {
                        "question": "How do you guarantee exactly-once payment processing across distributed network partitions?",
                        "category": "System Design",
                        "tips": "Detail idempotency keys in PostgreSQL, two-phase commit patterns, and asynchronous reconciliation loops.",
                    },
                    {
                        "question": "Describe how you would design a high-throughput ledger table with optimistic locking in PostgreSQL.",
                        "category": "Technical",
                        "tips": "Discuss WAL write overhead, row-level locking (SELECT FOR UPDATE), and composite B-Tree indexes.",
                    },
                    {
                        "question": "Tell me about a production incident involving data inconsistency and how you resolved it.",
                        "category": "Behavioral",
                        "tips": "Use the STAR method: Situation, Task, Action, and Quantified Results.",
                    },
                ],
                suggested_bullets=[
                    {
                        "bullet": "Architected async financial reconciliation microservice in FastAPI handling $120M+ in transactions with 99.999% uptime.",
                        "keyword_match": "FastAPI, PostgreSQL, Idempotency, Financial Systems",
                    },
                    {
                        "bullet": "Reduced PostgreSQL query latency by 45% using composite indexing and connection pooling on high-frequency tables.",
                        "keyword_match": "PostgreSQL, Index Optimization, Connection Pooling",
                    },
                ],
            )
            db.add(ai_note)
            db.commit()
            print("[+] Seeded AI Prep Notes for Stripe.")

        print("\n===========================================================")
        print("Database seeding completed successfully!")
        print("Demo Credentials:")
        print(f"   Email:    {demo_email}")
        print("   Password: DemoPass123!")
        print("===========================================================")

    except Exception as e:
        db.rollback()
        print(f"[!] Seeder failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
