# News App - Full Stack Project

A comprehensive news scraping and display application built with a React frontend, **FastAPI** backend (Python), and **Scrapy** scrapers (with optional Tamil news classification).

## 📋 Project Overview

This project consists of three main components:

1. **Frontend (`news-app`)**: React + TypeScript + Vite application displaying news articles
2. **Backend (`tamilwin_scraper`)**: **FastAPI** app (`fastapi_app.py`) on port **4000**, PostgreSQL, static `/images`, Tamil category classification
3. **Scraper (`tamilwin_scraper`)**: Scrapy spiders (e.g. tamilwin, virakesari, lankasri) that write `news.json` and optionally sync to the database via the API

### Project Structure

```
news_cursor/                     # repository root (scrapy.cfg lives here)
├── news-app/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/
│   │   └── App.tsx
│   └── package.json
└── tamilwin_scraper/
    ├── fastapi_app.py           # FastAPI server (run with uvicorn)
    ├── classifier.py            # Tamil category from first 70 words + .pkl models
    ├── models/                  # tamil_news_classifier.pkl, label_encoder.pkl (you add these)
    ├── spiders/                 # tamilwin.py, virakesari.py, lankasri.py
    ├── settings.py
    ├── pipelines.py
    ├── run_all.py               # run all spiders + POST /api/sync
    ├── requirements.txt
    ├── news.json                # merged scraped output
    └── image/                   # downloaded article images
```

---

## 🚀 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16+ recommended) - [Download](https://nodejs.org/)
- **Python** (3.8+) - [Download](https://www.python.org/)
- **PostgreSQL** (12+) - [Download](https://www.postgresql.org/)
- **Git** (optional)

### Verify Installations

```bash
node --version
npm --version
python --version
pip --version
psql --version
```

---

## 📦 Installation Steps

### Step 1: Set Up PostgreSQL Database

1. **Open PostgreSQL** (use pgAdmin GUI or psql CLI)

2. **Create the database**:
   ```sql
   CREATE DATABASE news_techorin;
   ```

3. **Connect to the database**:
   ```sql
   \c news_techorin
   ```

4. **Create the news table** (optional—the API and scraper pipeline create compatible tables automatically):
   ```sql
   CREATE TABLE news (
     id SERIAL PRIMARY KEY,
     title TEXT NOT NULL,
     url TEXT UNIQUE NOT NULL,
     image_path TEXT DEFAULT '',
     full_text TEXT DEFAULT '',
     source TEXT DEFAULT '',
     category_ta TEXT DEFAULT '',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Set user password** (if needed):
   ```sql
   ALTER USER postgres WITH PASSWORD '12345';
   ```

#### Connection String Used
```
postgresql://postgres:12345@localhost:5432/news_techorin
```

---

### Step 2: Install Python Dependencies (Scraper + FastAPI Backend)

From the **repository root** (the folder that contains `scrapy.cfg` and `tamilwin_scraper/`):

```bash
# Windows (optional but recommended)
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

pip install -r tamilwin_scraper/requirements.txt
```

If spiders used to fail with `No module named 'joblib'`, your venv was missing ML/API packages; the above line installs them. Scraping now starts even without `joblib` (categories stay empty until you install deps and add `.pkl` files).

For Playwright-based spiders, install the browser once:

```bash
playwright install chromium
```

**Notable packages:** Scrapy, scrapy-playwright, FastAPI, Uvicorn, psycopg2-binary, scikit-learn, joblib (classification).

**Tamil classification (optional):** copy `tamil_news_classifier.pkl` and `label_encoder.pkl` into `tamilwin_scraper/models/`. Without them, the app runs but `category_ta` stays empty.

---

### Step 3: Install Frontend Dependencies

```bash
cd news-app
npm install
```

**Key Dependencies:**
- `react` ^19.2.4
- `react-router-dom` ^7.13.1 - Client-side routing
- `tailwindcss` ^4.2.1 - Utility CSS framework
- `typescript` ~5.9.3

---

## 🏃 Running the Project

### Terminal 1: Start PostgreSQL

Ensure PostgreSQL service is running:

**Windows:**
```bash
# PostgreSQL usually runs as a service automatically
# Check in Services app or use:
pg_isready -h localhost -p 5432
```

**Mac (with Homebrew):**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
```

---

### Terminal 2: Start the Backend (FastAPI)

Use your **venv** (`python -m venv venv` then activate). Port **4000** must match `news-app/vite.config.ts`.

**Option A — repository root** (folder that contains `scrapy.cfg` and `tamilwin_scraper/`):

```bash
cd C:\Users\krsna\OneDrive\Documents\news_cursor
uvicorn tamilwin_scraper.fastapi_app:app --reload --port 4000
```

**Option B — inside `tamilwin_scraper`** (also works after a path fix in `fastapi_app.py`):

```bash
cd C:\Users\krsna\OneDrive\Documents\news_cursor\tamilwin_scraper
uvicorn fastapi_app:app --reload --port 4000
```

Do **not** use `uvicorn fastapi_app:app` from the repo root (wrong module). From the repo root, always use `tamilwin_scraper.fastapi_app:app`.

**Why port 4000?** The Vite dev server in `news-app` proxies `/api` and `/images` to `http://localhost:4000`.

**Expected output:** Uvicorn reports `Uvicorn running on http://127.0.0.1:4000`.

**Backend (same paths as before, plus classification):**
- `GET http://localhost:4000/api/news` — list articles (includes `source`, `category_ta` when set)
- `GET http://localhost:4000/api/news/{id}` — article detail (`full_text`, `category_ta`, …)
- `POST http://localhost:4000/api/sync` — import/update rows from `tamilwin_scraper/news.json` into PostgreSQL (classifies missing `category_ta` when models are present)
- `POST http://localhost:4000/api/classify` — JSON body `{"text": "..."}` or `{"full_text": "..."}` → `{"category_ta": "..."}` (uses first 70 words)
- `GET http://localhost:4000/images/...` — static files from `tamilwin_scraper/image/`

**Database URL:** defaults to `postgresql://postgres:12345@localhost:5432/news_techorin`. Override with env var `DATABASE_URL` if needed.

---

### Terminal 3: Start the Frontend (React Dev Server)

```bash
cd news-app
npm run dev
```

**Expected Output:**
```
  VITE v8.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

Open **http://localhost:5173** in your browser.

**Available Routes:**
- `/` - HomePage (displays all news articles)
- `/article/:id` - ArticlePage (detailed view of single article)

---

### Terminal 4: Run the Scraper (optional)

From the **repository root**, with venv activated:

```bash
# One spider
scrapy crawl tamilwin

# Or all three spiders + automatic sync to DB (requires API running on :4000)
# From repo root:
python tamilwin_scraper/run_all.py
# If your shell is already inside tamilwin_scraper/:
python run_all.py
```

**What the scraper does:**
1. Crawls configured sites (e.g. tamilwin, virakesari, lankasri)
2. Saves images under `tamilwin_scraper/image/`
3. Merges items into `tamilwin_scraper/news.json` and, if PostgreSQL is up, inserts/updates the `news` table via the pipeline
4. Sets Tamil **`category_ta`** when classifier `.pkl` files are in `tamilwin_scraper/models/`

**Sync JSON → DB:** With the FastAPI server running, `run_all.py` calls `POST /api/sync` at the end. You can also trigger sync manually (e.g. with curl or any HTTP client) while the server is up.

---

## 🔄 Complete Workflow

### First time — full stack

```bash
# 0. PostgreSQL: create DB news_techorin and ensure service is running

# 1. Repository root: Python venv + deps + Playwright browser
python -m venv venv
# Windows: venv\Scripts\activate   |  Mac/Linux: source venv/bin/activate
pip install -r tamilwin_scraper/requirements.txt
playwright install chromium

# 2. Backend (repo root)
uvicorn tamilwin_scraper.fastapi_app:app --reload --port 4000

# 3. Frontend (new terminal)
cd news-app
npm install
npm run dev

# 4. Data (new terminal, repo root, venv on)
scrapy crawl tamilwin
# Optional: push news.json into DB
curl -X POST http://localhost:4000/api/sync -H "Content-Type: application/json" -d "{}"
```

### Day-to-day

```bash
# Terminal A (repo root, venv on)
uvicorn fastapi_app:app --reload --port 4000                 

# Terminal B
cd news-app && npm run dev

# Terminal C (when you want fresh articles)
scrapy crawl tamilwin   # or: python tamilwin_scraper/run_all.py
```

---

## 📊 API Endpoints

### Get All News
```
GET /api/news
```
**Response (example):**
```json
[
  {
    "id": 1,
    "title": "Article Title",
    "image": "/images/somefile.webp",
    "source": "tamilwin",
    "category_ta": "அரசியல்",
    "created_at": "2024-03-15T10:30:00Z"
  }
]
```

### Get article details
```
GET /api/news/{id}
```
**Response (example):**
```json
{
  "id": 1,
  "title": "Full Article Title",
  "url": "https://tamilwin.com/article/...",
  "image": "/images/somefile.webp",
  "full_text": "Complete article content...",
  "source": "tamilwin",
  "category_ta": "சர்வதேசம்",
  "created_at": "2024-03-15T10:30:00Z"
}
```

### Sync `news.json` to PostgreSQL
```
POST /api/sync
```
Body can be empty JSON `{}`. Reads `tamilwin_scraper/news.json` and upserts by `url`.

### Classify snippet
```
POST /api/classify
Content-Type: application/json

{"full_text": "…Tamil article text…"}
```
Returns `{"category_ta": "…"}` using the first 70 words when models are installed.

---

## 🛠️ Build for Production

### Frontend Build

```bash
cd news-app
npm run build
```

Creates optimized production build in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 🐛 Troubleshooting

### Issue: PostgreSQL Connection Error
**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
- Ensure PostgreSQL service is running
- Verify connection string: default in `tamilwin_scraper/fastapi_app.py` and `tamilwin_scraper/pipelines.py`, or set `DATABASE_URL`
- Check if database `news_techorin` exists
- Verify username/password are correct

### Issue: Frontend Can't Connect to Backend
**Error:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**
- FastAPI enables permissive CORS for development
- Ensure Uvicorn is running on **port 4000** (matches `news-app/vite.config.ts` proxy)
- Open the app via the Vite URL (e.g. `http://localhost:5173`) so `/api` is proxied

### Issue: Scraper Not Saving to Database
**Error:** `psycopg2.OperationalError: could not connect to server`

**Solution:**
- Verify PostgreSQL is running
- Check `DB_URL` in `tamilwin_scraper/pipelines.py` (scraper) matches your Postgres credentials
- Ensure database credentials match `DATABASE_URL` / defaults in `tamilwin_scraper/fastapi_app.py` (API)

### Issue: Images Not Displaying
**Error:** 404 on image URLs

**Solution:**
- Verify scraper was run and downloaded images to `tamilwin_scraper/image/`
- Check image path in database matches directory structure
- Ensure FastAPI is running so `/images/...` is served from `tamilwin_scraper/image/`

### Port Already in Use
**Error:** `Error: listen EADDRINUSE :::4000` or `:5173`

**Solution:**
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :4000   # Windows (then taskkill /PID <PID> /F)

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## 📝 Environment Variables

**Backend (Python):** optional `DATABASE_URL` for PostgreSQL (full URL). Default matches local `postgres` / `news_techorin`. Optional `TAMILNEWS_MODEL_DIR` to override the folder containing `tamil_news_classifier.pkl` and `label_encoder.pkl`.

**Frontend:** dev server proxies `/api` and `/images` to port 4000 via `vite.config.ts`; no `.env` required for local use unless you change that.

---

## 📚 Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 19.2.4 |
| Frontend Build | Vite | 8.0.0 |
| Frontend Styling | Tailwind CSS | 4.2.1 |
| Frontend Routing | React Router | 7.13.1 |
| Backend | FastAPI + Uvicorn | see requirements.txt |
| Database | PostgreSQL | 12+ |
| Database Client (Python) | psycopg2-binary | see requirements.txt |
| Web Scraper | Scrapy | see requirements.txt |
| Scraper Browser | Playwright | see requirements.txt |
| Classification | scikit-learn / joblib | optional `.pkl` in `tamilwin_scraper/models/` |

---

## 🤝 Contributing

1. Create feature branches for new features
2. Run linting: `npm run lint` (frontend)
3. Test all components before pushing
4. Update this README for significant changes

---

## 📄 License

ISC

---

## 💡 Quick Reference

| Command | Location | Purpose |
|---------|----------|---------|
| `npm run dev` | news-app | Start Vite dev server |
| `npm run build` | news-app | Build for production |
| `npm run lint` | news-app | Check code quality |
| `uvicorn tamilwin_scraper.fastapi_app:app --reload --port 4000` | repo root | Start FastAPI backend |
| `pip install -r tamilwin_scraper/requirements.txt` | repo root | Install Python deps |
| `playwright install chromium` | repo root | Browser for Scrapy-Playwright |
| `scrapy crawl <spider>` | repo root | Run a spider (`tamilwin`, `virakesari`, `lankasri`) |
| `python tamilwin_scraper/run_all.py` | repo root | All spiders + `POST /api/sync` (API must be up) |
| `psql -U postgres -d news_techorin` | — | Connect to database |

---

**Happy Coding! 🎉**
