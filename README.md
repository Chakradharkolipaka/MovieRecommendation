# 🎬 Movie Recommender System

A modular full-stack Movie Recommendation System using **Collaborative Filtering + statistics**.

## Stack

- **Backend**: FastAPI, pandas, NumPy, scikit-learn, SciPy, pytest
- **Frontend**: React 18 + Vite, Tailwind CSS, Bootstrap 5, Framer Motion, Recharts, Zustand
- **Infra**: Docker / Docker Compose (free-tier friendly), in-memory CSV pipeline (no DB)

## Project Structure

- `backend/`: FastAPI API and ML pipeline
- `frontend/`: React app with cinematic UX and popup-driven recommendation flow
- `docker-compose.yml`: one-command local orchestration

## Backend ML Flow

1. Load `movies.csv` + `ratings.csv` from `backend/app/data/movielens/`
2. Filter users and movies by minimum rating thresholds
3. Build sparse user-movie matrix with `NaN` for missing values
4. Normalize by user mean for bias correction
5. Compute:
   - User-user Pearson correlation
   - Item-item cosine similarity
6. Serve recommendations and analytics through REST APIs

## API Endpoints

- `POST /api/recommend` → user/item-based recommendations with pipeline steps
- `GET /api/movies` → searchable movie catalog
- `GET /api/users` → paginated users + rating summary
- `GET /api/stats` → global statistics + sparsity + top genres + heatmap sample
- `GET /api/metrics` → RMSE, MAE, Precision@K, Recall@K
- `GET /api/correlation` → related movies for an input title

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m scripts.generate_sparse_ratings  # optional: increase sparsity from dense samples
uvicorn app.main:app --reload --port 8000
```

The backend expects dataset files at:

- `backend/app/data/movielens/movies.csv`
- `backend/app/data/movielens/ratings.csv`

To use official MovieLens small data (recommended):

1. Download from `https://files.grouplens.org/datasets/movielens/ml-latest-small.zip`
2. Extract and copy `movies.csv` and `ratings.csv` into `backend/app/data/movielens/`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Full stack via Docker

```bash
docker compose up --build
```

## Tests

```bash
cd backend
pytest -q
```

## One-liner run flow

```bash
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload
cd frontend && npm run dev
```

## UX highlights

- Step-by-step modal pipeline popup with progress
- Animated error popup with retry action and error-code badge
- Success toast popup on recommendation completion
- Cinematic dark theme with glassmorphism cards and red glow hovers
- Analytics dashboard with heatmap + metrics charts

## Deployment (Free tier)

- Backend: Render / Railway
- Frontend: Vercel / Netlify
- Set `VITE_API_URL` to deployed backend URL

## Notes

- The repository includes a sparse sample ratings matrix so recommendations are available out of the box.
- SQLAlchemy tables (`movies`, `ratings`) are auto-created on backend startup and loaded from CSV on first run.
- SQLite is used by default for free-tier local/demo simplicity.
