# Smart City Traffic Signal Timing Optimization and Simulation (Toronto)

## Capstone Project – University of Niagara Falls (UNF)

### Team Members

- Manav Parikh
- Dhyey Modi
- Rudra Patel
- Arpit Desai


## Project Overview

This capstone project examines **smart city traffic signal timing optimization and simulation** using historical City of Toronto traffic data from **2015–2019** as a stable pre-COVID baseline. The repository has evolved from an initial congestion-oriented framing into a broader urban traffic analytics workflow that is more appropriate for signal operations, intersection-level performance evaluation, and decision-support design.

The repository is organized around a reproducible notebook pipeline that:
- prepares daily and hourly traffic datasets from raw Speed Volume Classification (SVC) records
- derives traffic flow metrics for historical demand interpretation
- maps traffic count locations to nearby signalized intersections
- computes intersection-level signal performance metrics
- builds short-term traffic demand forecasting models and compares predictive approaches
- evaluates forecast-driven signal timing strategies using traffic engineering performance metrics
- integrates hourly weather and temporal external factors for enriched demand analysis
- documents dashboard requirements for later Power BI implementation
- establishes the analytical foundation for future forecasting, optimization, simulation, and decision-support reporting


## Problem Definition

Traffic count locations and signalized intersections are stored in separate Toronto Open Data datasets and do not share a common identifier. To support signal timing analysis, this project links these datasets through geographic nearest-neighbor matching, derives traffic and operational indicators from historical observations, and structures the resulting outputs for later optimization, simulation, and dashboard-based interpretation.


## Objectives

- analyze recurring historical traffic demand patterns across Toronto traffic count locations
- define interpretable traffic flow metrics from daily and hourly observations
- map traffic count locations to nearby signalized intersections
- engineer optimization-oriented traffic features for downstream signal timing analysis
- compute signal performance metrics to support candidate intersection screening
- define dashboard requirements for exploratory analysis and optimization reporting
- develop and compare next-hour traffic demand forecasting models
- evaluate baseline and optimized signal timing strategies using forecast-driven demand
- integrate external hourly weather factors for enriched traffic demand analysis
- provide a structured and reproducible capstone workflow for academic review


## Data Sources

- **City of Toronto Open Data Portal**
  - Traffic Volume – Speed Volume Classification (SVC)
  - Traffic Signals dataset
- **Meteostat hourly weather data**
  - Toronto hourly weather observations accessed through the Meteostat Python library for external-factor integration

These official City of Toronto Open Data sources are used strictly for academic research purposes.


## Notebook Execution Order

Main pipeline:

```text
1. notebooks/00_raw_preprocessing.ipynb
2. notebooks/01_define_congestion_metric.ipynb
3. notebooks/03_eda_traffic_data.ipynb
4. notebooks/04_feature_engineering.ipynb
5. notebooks/05_signal_performance_metrics.ipynb
6. notebooks/06_baseline_signal_timing.ipynb
7. notebooks/07_traffic_demand_forecasting.ipynb
8. notebooks/08_signal_timing_strategy_comparison.ipynb
9. notebooks/09_external_factors_integration.ipynb
```

Optional notebook:

```text
notebooks/02_dataset_validation.ipynb
```

- `02_dataset_validation.ipynb` can be run independently.
- It validates dataset coverage, temporal consistency, and summary-data quality.
- It is not required for the downstream notebook pipeline.

Notebook summary:

- `00_raw_preprocessing.ipynb`  
  Prepares the core daily and hourly traffic datasets from raw SVC records.
- `01_define_congestion_metric.ipynb`  
  Derives interpretable traffic flow metrics for historical demand analysis.
- `02_dataset_validation.ipynb`  
  Validates dataset coverage, temporal consistency, and summary-data quality.
- `03_eda_traffic_data.ipynb`  
  Explores recurring traffic demand patterns and descriptive trends.
- `04_feature_engineering.ipynb`  
  Maps traffic count locations to nearby signalized intersections and builds optimization-oriented features.
- `05_signal_performance_metrics.ipynb`  
  Aggregates intersection-level signal performance indicators for comparative evaluation.
- `06_baseline_signal_timing.ipynb`  
  Defines the baseline fixed-time signal timing benchmark for downstream comparison.
- `07_traffic_demand_forecasting.ipynb`  
  Builds short-term traffic demand forecasting models and compares machine learning and deep learning approaches.
- `08_signal_timing_strategy_comparison.ipynb`  
  Compares baseline and optimized signal timing strategies using forecast-driven demand and traffic engineering performance metrics.
- `09_external_factors_integration.ipynb`  
  Integrates hourly weather data and external temporal factors to analyze their relationship with traffic demand.


## Data Pipeline

```text
Raw traffic data
  -> notebooks/00_raw_preprocessing.ipynb
  -> data/processed/modeling_dataset_2015_2019.csv
  -> data/processed/traffic_signal_hourly_dataset_2015_2019.csv

Processed daily/hourly traffic datasets
  -> notebooks/01_define_congestion_metric.ipynb
  -> data/processed/traffic_flow_metrics_2015_2019.csv

Processed traffic datasets
  -> notebooks/03_eda_traffic_data.ipynb
  -> exploratory insights only

Hourly traffic dataset + raw signal dataset
  -> notebooks/04_feature_engineering.ipynb
  -> data/processed/signal_optimization_features_2015_2019.csv

Optimization-ready feature dataset
  -> notebooks/05_signal_performance_metrics.ipynb
  -> data/processed/signal_performance_metrics_2015_2019.csv

Signal performance metrics
  -> notebooks/06_baseline_signal_timing.ipynb
  -> data/processed/baseline_signal_timing_results.csv

Optimization-ready features + baseline metrics
  -> notebooks/07_traffic_demand_forecasting.ipynb
  -> data/processed/traffic_demand_forecasts.csv
  -> data/processed/forecast_model_results.csv
  -> data/processed/forecast_ablation_results.csv

Forecast outputs + signal metrics
  -> notebooks/08_signal_timing_strategy_comparison.ipynb
  -> data/processed/signal_timing_strategy_detailed_results.csv
  -> data/processed/signal_timing_comparison_summary.csv
  -> data/processed/location_signal_timing_improvement.csv

Hourly traffic dataset + external hourly weather data
  -> notebooks/09_external_factors_integration.ipynb
  -> data/processed/traffic_with_external_factors.csv
  -> data/processed/external_factors_summary.csv

Processed analytical outputs
  -> docs/dashboard-requirements.md
  -> dashboard KPI, layout, and visualization specifications
```

`00_raw_preprocessing.ipynb` prepares the core daily and hourly traffic datasets from raw SVC inputs. `01_define_congestion_metric.ipynb` derives traffic flow metrics that support demand interpretation. `03_eda_traffic_data.ipynb` provides exploratory analysis rather than a new processed dataset. `04_feature_engineering.ipynb` maps traffic count locations to the nearest signalized intersections and attaches optimization-oriented features. `05_signal_performance_metrics.ipynb` aggregates these outputs into intersection-level performance indicators. `06_baseline_signal_timing.ipynb` establishes the baseline fixed-time timing benchmark. `07_traffic_demand_forecasting.ipynb` generates next-hour demand forecasts for downstream operational analysis. `08_signal_timing_strategy_comparison.ipynb` connects the forecasting outputs to signal timing evaluation. `09_external_factors_integration.ipynb` enriches the hourly traffic dataset with weather and temporal external factors.

Note: the filename `traffic_signal_hourly_dataset_2015_2019.csv` is retained for continuity within the repository, although explicit signal mapping is performed later in `04_feature_engineering.ipynb`.


## Project Structure

The repository is organized to separate raw data, processed outputs, notebooks, documentation, and source code.

```text
unfc-capstone-traffic-forecasting/
├── data/
│   ├── raw/
│   │   ├── traffic/
│   │   │   ├── svc_raw_data_volume_2015_2019.csv
│   │   │   └── svc_summary_data.csv
│   │   └── signals/
│   │       ├── traffic_signals.csv
│   │       └── traffic_signals.geojson
│   └── processed/
│       ├── modeling_dataset_2015_2019.csv
│       ├── traffic_signal_hourly_dataset_2015_2019.csv
│       ├── traffic_flow_metrics_2015_2019.csv
│       ├── signal_optimization_features_2015_2019.csv
│       ├── signal_performance_metrics_2015_2019.csv
│       ├── traffic_demand_forecasts.csv
│       ├── signal_timing_strategy_detailed_results.csv
│       └── traffic_with_external_factors.csv
├── notebooks/
│   ├── 00_raw_preprocessing.ipynb
│   ├── 01_define_congestion_metric.ipynb
│   ├── 02_dataset_validation.ipynb
│   ├── 03_eda_traffic_data.ipynb
│   ├── 04_feature_engineering.ipynb
│   ├── 05_signal_performance_metrics.ipynb
│   ├── 06_baseline_signal_timing.ipynb
│   ├── 07_traffic_demand_forecasting.ipynb
│   ├── 08_signal_timing_strategy_comparison.ipynb
│   └── 09_external_factors_integration.ipynb
├── docs/
│   └── dashboard-requirements.md
├── src/
├── api/
├── web/
└── README.md
```

This structure supports reproducible research, notebook-based analysis, formal documentation, and later extension into optimization and application layers.

Note: The `api` and `web` components are optional extensions intended for model serving and interactive dashboards if time and scope permit.


## Reproducibility

To reproduce the current notebook pipeline:

1. Place the raw traffic files in `data/raw/traffic/`.
2. Place the signal files in `data/raw/signals/`.
3. Run the main notebooks in the documented order through `09_external_factors_integration.ipynb`.
4. Review the processed outputs generated along the way.
5. Consult `docs/dashboard-requirements.md` for the current reporting specification.

Key processed outputs:

- `data/processed/modeling_dataset_2015_2019.csv`
- `data/processed/traffic_signal_hourly_dataset_2015_2019.csv`
- `data/processed/traffic_flow_metrics_2015_2019.csv`
- `data/processed/signal_optimization_features_2015_2019.csv`
- `data/processed/signal_performance_metrics_2015_2019.csv`
- `data/processed/traffic_demand_forecasts.csv`
- `data/processed/forecast_model_results.csv`
- `data/processed/forecast_ablation_results.csv`
- `data/processed/signal_timing_strategy_detailed_results.csv`
- `data/processed/traffic_with_external_factors.csv`
- `data/processed/external_factors_summary.csv`

The project is designed so that the processed datasets are generated incrementally by the notebooks rather than being treated as manual prerequisites.

Note: the forecasting notebook `notebooks/07_traffic_demand_forecasting.ipynb` uses TensorFlow/Keras for the LSTM, GRU, and TCN models. In this repository, that notebook is configured to run in the dedicated Python `3.11` environment and Jupyter kernel `.venv311` / `unfc-tf311`, because TensorFlow support is not available in the main Python `3.14` environment.


## Traffic Demand Forecasting

The forecasting stage compares traditional machine learning and deep learning models for **next-hour traffic demand prediction**. The notebook evaluates:

- Random Forest
- LSTM
- GRU
- TCN

A structured model comparison and ablation study was performed to assess how different feature sets affect predictive accuracy before the outputs are passed downstream into signal timing analysis.


## Signal Timing Strategy Comparison

This stage connects the forecasting outputs to downstream traffic operations analysis.

- A baseline fixed-time signal timing benchmark was defined.
- An optimized signal timing strategy was evaluated against the baseline.
- Webster-style delay estimation was used to approximate control delay.
- Throughput and queue pressure were analyzed alongside delay.
- Peak-period analysis was performed to isolate high-demand operating conditions.
- Congestion-level and location-level improvements were summarized and visualized.


## External Data Integration

Hourly weather data from Meteostat was merged with the traffic dataset to evaluate whether external conditions improve traffic demand modeling. Weather observations were aligned to the hourly traffic timestamp, and the merged dataset achieved high merge coverage of approximately **99.65%**.

The enriched feature set includes weather and contextual variables such as:

- temperature
- precipitation
- humidity
- pressure
- hour_of_day
- is_peak_hour
- is_weekend
- is_rain

These variables are intended to support future comparison between traffic-only forecasting models and weather-enriched alternatives.


## Current Insights

- Temporal features such as `hour_of_day` and peak-hour indicators remain the strongest drivers of traffic demand.
- Weather variables provide modest contextual signal rather than dominating traffic demand patterns.
- Forecast-driven signal timing improves throughput and reduces queue pressure, with the strongest benefits under higher congestion.


## Project Management

This project follows an **agile development approach**:

- Tasks and milestones are tracked using a GitHub Project Board
- Development is organized into iterative sprints
- Progress and decisions are documented in the `/docs` directory
- Dashboard design requirements are documented in `docs/dashboard-requirements.md`
- Upcoming iterations will extend the current workflow into forecasting, signal optimization, simulation, and dashboard implementation


## Current Status

- Repository structure and notebook pipeline established
- Raw traffic preprocessing and core dataset generation completed
- Historical traffic flow metric design completed
- Exploratory traffic demand analysis completed
- Signal mapping and optimization-oriented feature engineering completed
- Intersection-level signal performance metrics completed
- Baseline fixed-time signal timing benchmark completed
- Short-term traffic demand forecasting completed
- Signal timing strategy comparison and optimization analysis completed
- External hourly weather integration completed
- Dashboard requirements documentation completed
- Forecasting with external factors, additional operational evaluation, and dashboard implementation remain as next stages


## Planned Next Stages

- compare forecasting models with and without external-factor features
- evaluate whether weather-enriched features improve predictive performance
- extend operational evaluation using the enriched demand dataset where appropriate
- implement the documented Power BI dashboards for exploratory and optimization reporting
- assess whether an optional web-based visualization layer is warranted for demonstration purposes


## Academic Context

This project is conducted as part of the **Capstone Project requirement** for the Master of Data Analytics program at the University of Niagara Falls. All analyses adhere to academic integrity guidelines and ethical data usage standards.


## Supervisor

Dr. Hany Osman  
Email: hany.osman@unfc.ca
