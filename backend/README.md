# AI Cost Auditor – Backend

## Local setup (Windows, no Docker)

### 1. Create virtual environment

Use **the same Python** you'll use for everything below (check with `python --version` or `py --list`).

```powershell
cd backend
python -m venv venv
```

If you have multiple Pythons and want a specific one (e.g. 3.13):

```powershell
py -3.13 -m venv venv
```

### 2. Activate the virtual environment (required)

In **PowerShell**:

```powershell
.\venv\Scripts\Activate.ps1
```

If you get "cannot be loaded because running scripts is disabled", run once:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run `.\venv\Scripts\Activate.ps1` again.

You should see `(venv)` at the start of your prompt. **Leave this terminal open and use it for all following steps.**

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

Install must happen **after** activating the venv so packages go into the venv, not the global Python.

### 4. Create tables and seed data (SQLite default)

```powershell
python scripts/seed.py
```

This creates `app.db` and the admin user (admin@local / admin123).

### 5. Run the server

Use the **venv’s** Python so it finds the installed packages:

```powershell
python -m uvicorn app.main:app --reload
```

Do **not** run `uvicorn` by itself if it points to a different Python (e.g. 3.9) than the one you used in the venv (e.g. 3.13).

- API: http://127.0.0.1:8000  
- Docs: http://127.0.0.1:8000/docs  
- Demo login: **admin@local** / **admin123**

---

### Optional: PostgreSQL locally

1. Install PostgreSQL and add `pg_config` to PATH, then: `pip install psycopg2-binary`
2. Create `.env` with `DATABASE_URL=postgresql://...`, `SECRET_KEY`, `JWT_SECRET`
3. Run: `alembic upgrade head` then `python scripts/seed.py`

### Optional: `.env` overrides

- `DATABASE_URL` – default `sqlite:///./app.db`
- `SECRET_KEY`, `JWT_SECRET` – dev defaults set; override for production
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` – for proxy to LLM APIs

---

## Docker (PostgreSQL)

From the **project root**:

```powershell
docker compose up --build
```

Then:

```powershell
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed.py
```
