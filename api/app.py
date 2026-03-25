from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

try:
    # Works when running: `uvicorn api.app:app`
    from .model_service import ForecastModelService
except ImportError:
    # Works when running from `api/` as: `uvicorn app:app`
    from model_service import ForecastModelService


DATA_ROOT = (Path(__file__).resolve().parents[1] / "data" / "processed").resolve()
FORECAST_TIMEZONE = ZoneInfo("America/Toronto")
service = ForecastModelService(data_root=DATA_ROOT)

app = FastAPI(
    title="Traffic Forecast Model Service",
    version="1.0.0",
    description="Live model-serving API for traffic demand forecasting.",
)


class PredictRequest(BaseModel):
    location_id: str = Field(..., min_length=2, max_length=64)
    timestamp: datetime
    model_name: str | None = None
    feature_overrides: dict[str, float] | None = None


class SnapshotRequest(BaseModel):
    location_id: str = Field(default="10133019_NB", min_length=2, max_length=64)
    start_timestamp: datetime | None = None
    horizon_hours: int = Field(default=24, ge=1, le=24)
    model_name: str | None = None


@app.on_event("startup")
def startup_event() -> None:
    service.load()


@app.get("/health")
def health() -> dict[str, Any]:
    artifacts = service._ensure_loaded()
    return {
        "status": "ok",
        "model": artifacts.best_model["name"],
        "trained_rows": artifacts.trained_rows,
        "data_root": str(DATA_ROOT),
    }


@app.post("/v1/forecast/predict")
def predict(payload: PredictRequest) -> dict[str, Any]:
    try:
        ts = pd.Timestamp(payload.timestamp)
        prediction = service.predict_one(
            location_id=payload.location_id,
            timestamp=ts,
            model_name=payload.model_name,
            feature_overrides=payload.feature_overrides,
        )
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "location_id": payload.location_id,
        "timestamp": payload.timestamp.isoformat(),
        **prediction,
    }


@app.post("/v1/forecast/snapshot")
def snapshot(payload: SnapshotRequest) -> dict[str, Any]:
    try:
        start = payload.start_timestamp or datetime.now(FORECAST_TIMEZONE)
        if start.tzinfo is None:
            start = start.replace(tzinfo=FORECAST_TIMEZONE)
        else:
            start = start.astimezone(FORECAST_TIMEZONE)
        now_toronto = datetime.now(FORECAST_TIMEZONE)
        if start < (now_toronto - timedelta(hours=1)):
            raise HTTPException(
                status_code=400,
                detail="Forecast start time cannot be more than 1 hour before current Toronto time.",
            )
        result = service.build_snapshot(
            location_id=payload.location_id,
            start_timestamp=pd.Timestamp(start),
            horizon_hours=payload.horizon_hours,
            model_name=payload.model_name,
        )
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return result
