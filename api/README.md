# FastAPI Model Service

This service provides live traffic-demand inference endpoints for the web app.

## Endpoints

- `GET /health`
- `POST /v1/forecast/predict`
- `POST /v1/forecast/snapshot`

## Run locally

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

The model trains on startup using:

- `../data/processed/traffic_with_external_factors.csv`
- `../data/processed/forecast_model_results.csv`

Depending on machine performance, first startup can take ~10-20 seconds while model artifacts are loaded.

## Health check

```bash
curl http://127.0.0.1:8000/health
```

## Example request

```bash
curl -X POST http://127.0.0.1:8000/v1/forecast/snapshot \
  -H "Content-Type: application/json" \
  -d '{"location_id":"10133019_NB","horizon_hours":24,"model_name":"XGBoost"}'
```
