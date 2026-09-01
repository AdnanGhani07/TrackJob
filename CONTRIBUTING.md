# Contributing to Interview Prep & Application Tracker

Thank you for your interest in contributing to **Interview Prep & Application Tracker**! We welcome contributions from developers of all skill levels.

---

## 🧭 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

## 🛠️ Development Setup

### Prerequisites
- **Python**: 3.12+ (or 3.14)
- **Node.js**: 18.x or 20.x+
- **Docker**: Docker Desktop with Docker Compose
- **Ollama** (Optional): If running local offline AI inference (`llama3.2:3b`)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/adnanghani07/trackjob.git
cd trackjob
cp .env.example .env
```

### 2. Start PostgreSQL via Docker
```bash
docker compose up -d
```

### 3. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup
```powershell
cd ../frontend
npm install
npm run dev
```

---

## 🌿 Branching & Git Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
2. Make your code changes following clean architecture guidelines.
3. Run the test suite:
   ```powershell
   cd backend
   pytest -v
   cd ../frontend
   npm run build
   ```
4. Commit with descriptive semantic commit messages:
   - `feat(api): add export to CSV endpoint`
   - `fix(kanban): resolve drag position jitter on mobile`
   - `docs: update deployment guidelines`
5. Push to your fork and submit a Pull Request!

---

## 🧪 Testing Guidelines

- All backend additions should include automated tests under `backend/tests/`.
- Ensure all tests pass with zero warnings (`pytest -v`).
- Keep UI components typed with TypeScript (`noImplicitAny`).
