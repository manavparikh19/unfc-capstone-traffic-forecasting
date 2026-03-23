# FastAPI Model Service

This service provides live traffic-demand inference endpoints for the web app.

## Endpoints

- `GET /health`
- `POST /v1/forecast/predict`
- `POST /v1/forecast/snapshot`

## Run locally

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The model trains on startup using:

- `../data/processed/traffic_with_external_factors.csv`
- `../data/processed/forecast_model_results.csv`

## Example request

```bash
curl -X POST http://localhost:8000/v1/forecast/snapshot \
  -H "Content-Type: application/json" \
  -d '{"location_id":"10133019_NB","horizon_hours":24,"model_name":"XGBoost"}'
```
