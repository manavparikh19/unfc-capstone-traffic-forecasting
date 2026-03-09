# Traffic Forecasting Project Audit Recommendations

## 1) Pipeline Summary
- Scope audited: `00_raw_preprocessing.ipynb` -> `01_define_congestion_metric.ipynb` -> `02_dataset_validation.ipynb` -> `03_eda_traffic_data.ipynb` -> `04_feature_engineering.ipynb`.
- Data source context: City of Toronto SVC volume program (campaign-based counts).
- Current modeling track after audit updates: city-level daily forecasting from raw-derived daily volume.

## 2) Reproducibility Status
- Notebook execution order tested end-to-end with `nbconvert --execute --inplace`.
- Result: all five notebooks execute successfully without manual intervention.
- Path consistency:
  - `00`, `01`, `03`, `04` use `data/processed/modeling_dataset_2015_2019.csv` correctly for modeling pipeline.
  - `02` is validation-only on summary data; it now uses robust path selection and falls back to raw summary when required validation fields are not in processed summary files.
- Broken/stale issues fixed:
  - `02_dataset_validation.ipynb` stale reference to `04_raw_preprocessing.ipynb` corrected to `00_raw_preprocessing.ipynb`.
  - `02_dataset_validation.ipynb` key-field missingness cell made robust to column availability.

## 3) Data Integrity by Stage

### Raw (15-min)
- File: `data/raw/svc_raw_data_volume_2015_2019.csv`
- Shape: `556,608 x 10`
- Date range (`time_start`): `2015-03-31` to `2019-11-05`
- Unique dates: `273`
- Missing values: none
- Columns: `id, count_id, location_name, longitude, latitude, centreline_id, time_start, time_end, direction, volume_15min`

### Processed (daily, location-level)
- File: `data/processed/modeling_dataset_2015_2019.csv`
- Shape: `5,778 x 12`
- Date range (`date`): `2015-03-31` to `2019-11-05`
- Unique dates: `273`
- Missing values: `peak_ratio` has `1` missing row; all others complete
- Columns: `location_id, location_name, centreline_id, date, year, month, day_of_week, is_weekend, daily_total_volume, peak_hour_volume, peak_ratio, congestion_target`

### Engineered (daily, city-level)
- File: `data/processed/modeling_dataset_features_2015_2019.csv`
- Shape after optimization: `259 x 19`
- Date range (`date`): `2015-05-12` to `2019-11-05`
- Unique dates: `259`
- Missing values: none
- Columns: `date, daily_total_volume, peak_hour_volume, peak_ratio, congestion_target, year, month, quarter, day_of_week, is_weekend, week_of_year, lag_1, lag_7, lag_14, roll_7_mean, roll_14_mean, roll_7_std, roll_7_median, lag_peak_ratio_7`

## 4) Aggregation Logic Audit
- 15-min -> daily aggregation is correct in `00_raw_preprocessing.ipynb`:
  - Hourly sum from 15-min bins by `location_id` and hour.
  - Daily sum from hourly volume by `location_id` and date.
  - Peak-hour volume from max hourly volume per location-date.
- Location dimension drop point:
  - In `04_feature_engineering.ipynb`, city-level modeling is now intentionally enforced via `groupby('date')` aggregation before lag/rolling creation.
- Rationale:
  - Processed location continuity is sparse (`914` location_ids, min/median/max rows per location = `1/3/24`, and `0` locations with >=31 days).
  - Panel forecasting with long temporal memory is not defensible under this sparsity.

## 5) Data Loss Analysis
- Raw -> Processed: reduction due to temporal aggregation and location-date summarization (`556,608` -> `5,778`).
- Processed -> Engineered city-level series:
  - 273 daily rows before lag/rolling.
  - 259 rows after engineered-feature NaN drop.
  - 14 rows lost, consistent with `lag_14` / `roll_14` warm-up requirement.
- Prior feature set (`lag_30`, `roll_30`) was overly aggressive and reduced usable rows more than necessary.

## 6) Feature Engineering Audit and Optimization
- Leakage checks: passed.
  - Lags use `shift(k)`.
  - Rolling features use shifted trailing series (`shift(1).rolling(...)`).
  - No centered/future-looking windows.
- Duplicate-date checks: passed for city-level engineered table (`0` duplicate dates).
- Feature-to-sample ratio after optimization:
  - Numeric predictors excluding target: `17`
  - Samples: `259`
  - Samples-per-feature: `15.24`
- Change made for stability and sample size:
  - Kept: `lag_1, lag_7, lag_14, roll_7_mean, roll_14_mean, roll_7_std` (+ existing useful optionals `roll_7_median`, `lag_peak_ratio_7`).
  - Removed: `lag_30`, `roll_30_mean`.

## 7) Best Scope Recommendation (Defensible)
- Recommended: **City-level daily forecasting (single series)**.
- Not recommended now: panel/location-level forecasting as primary claim.

### Safe Claims
- End-to-end reproducible city-level daily forecasting pipeline from raw SVC volume.
- Temporal dependency captured via leakage-safe lag/rolling features.
- Transparent limitations and scope boundaries documented.

### Unsafe Claims
- Strong location-level generalization across Toronto sites.
- Robust long-horizon panel forecasting with current campaign-based continuity.
- Comparative claims against feature families not present in scope (weather/speed/classification modeling) for this issue set.

## 8) Specific Changes Made
- `notebooks/00_raw_preprocessing.ipynb`
  - Added concise research-context markdown clarifying SVC volume scope and campaign-based limitation.
- `notebooks/01_define_congestion_metric.ipynb`
  - Added scope markdown clarifying target definition context and exclusion of external feature families.
- `notebooks/02_dataset_validation.ipynb`
  - Fixed stale notebook reference (`04_raw_preprocessing` -> `00_raw_preprocessing`).
  - Added scope/limitation markdown.
  - Improved dataset path selection logic for summary validation files.
  - Hardened key-field missingness cell to avoid failures on schema differences.
- `notebooks/03_eda_traffic_data.ipynb`
  - Added scope/limitation markdown for campaign-based site continuity.
- `notebooks/04_feature_engineering.ipynb`
  - Updated narrative to explicit city-level scope.
  - Simplified feature set by disabling `lag_30` and `roll_30_mean`.
  - Kept leakage-safe lag/rolling logic.
  - Re-generated engineered dataset.
- `data/processed/modeling_dataset_features_2015_2019.csv`
  - Re-generated artifact with updated feature set (`259 x 19`).

## 9) Two-Week Next-Step Checklist (No New Notebooks)
- [ ] Freeze data split protocol: strict chronological train/validation/test.
- [ ] Implement baseline models in existing modeling workflow: regularized linear model + constrained tree booster.
- [ ] Run ablation in planned feature sets:
  - A: calendar only
  - B: A + lags (1/7/14)
  - C: B + rolling (7/14 + std)
- [ ] Report MAE/RMSE/MAPE with confidence intervals via blocked CV.
- [ ] Document limitation-focused discussion and avoid unsupported location-level claims.
