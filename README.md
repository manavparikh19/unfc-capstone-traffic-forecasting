# Smart City Traffic Signal Timing Optimization and Simulation (Toronto)

## Capstone Project – University of Niagara Falls (UNF)

### Team Members

- Manav Parikh
- Dhyey Modi
- Rudra Patel
- Arpit Desai


## Project Overview

This capstone project focuses on **historical traffic demand analysis, signalized intersection mapping, signal timing optimization, and traffic flow simulation** using City of Toronto traffic data from **2015–2019** as a stable pre-COVID baseline.

The repository is organized around a reproducible notebook pipeline that:
- prepares daily and hourly traffic flow datasets from raw Speed Volume Classification (SVC) records
- maps traffic count locations to nearby signalized intersections
- derives traffic flow metrics and optimization-oriented features
- supports later signal timing analysis, simulation, and smart city decision support


## Problem Definition

Traffic count locations and signalized intersections are stored in separate Toronto Open Data datasets and do not share a common identifier. To support signal timing analysis, the project links these datasets through geographic nearest-neighbor matching and builds features that can inform candidate intersection selection, timing design, and simulation-based evaluation.


## Objectives

- analyze recurring historical traffic demand patterns across Toronto traffic count locations
- map traffic count locations to nearby signalized intersections
- engineer optimization-oriented traffic flow features for downstream signal timing analysis
- support candidate intersection selection, timing strategy evaluation, and simulation
- provide a structured and reproducible capstone workflow for academic review


## Data Sources

- **City of Toronto Open Data Portal**
  - Traffic Volume – Speed Volume Classification (SVC)
  - Traffic Signals dataset

These official City of Toronto Open Data sources are used strictly for academic research purposes.


## Notebook Execution Order

Main pipeline:

```text
1. notebooks/00_raw_preprocessing.ipynb
2. notebooks/01_define_congestion_metric.ipynb
3. notebooks/03_eda_traffic_data.ipynb
4. notebooks/04_feature_engineering.ipynb
```

Optional notebook:

```text
notebooks/02_dataset_validation.ipynb
```

- `02_dataset_validation.ipynb` can be run independently.
- It validates dataset coverage, temporal consistency, and summary-data quality.
- It is not required for the downstream notebook pipeline.


## Data Pipeline

```text
Raw traffic data
  -> notebooks/00_raw_preprocessing.ipynb
  -> data/processed/modeling_dataset_2015_2019.csv
  -> data/processed/traffic_signal_hourly_dataset_2015_2019.csv

Processed daily/hourly traffic datasets
  -> notebooks/01_define_congestion_metric.ipynb
  -> data/processed/traffic_flow_metrics_2015_2019.csv

Processed daily/hourly traffic datasets
  -> notebooks/03_eda_traffic_data.ipynb
  -> exploratory insights only

Hourly traffic dataset + raw signal dataset
  -> notebooks/04_feature_engineering.ipynb
  -> data/processed/signal_optimization_features_2015_2019.csv
```

`04_feature_engineering.ipynb` enriches the hourly traffic dataset by mapping traffic count locations to the nearest signalized intersections and attaching signal metadata needed for downstream optimization work.


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
│       └── signal_optimization_features_2015_2019.csv
├── notebooks/
│   ├── 00_raw_preprocessing.ipynb
│   ├── 01_define_congestion_metric.ipynb
│   ├── 02_dataset_validation.ipynb
│   ├── 03_eda_traffic_data.ipynb
│   └── 04_feature_engineering.ipynb
├── docs/
├── src/
├── api/
├── web/
└── README.md
```

This structure supports reproducible research, notebook-based analysis, and later extension into optimization and application layers.

Note: The `api` and `web` components are optional extensions intended for model serving and interactive dashboards if time and scope permit.


## Reproducibility

To reproduce the current notebook pipeline:

1. Place the raw traffic files in `data/raw/traffic/`.
2. Place the signal files in `data/raw/signals/`.
3. Run the main notebooks in the documented order.
4. Review the processed outputs generated along the way.

Key processed outputs:

- `data/processed/modeling_dataset_2015_2019.csv`
- `data/processed/traffic_signal_hourly_dataset_2015_2019.csv`
- `data/processed/traffic_flow_metrics_2015_2019.csv`
- `data/processed/signal_optimization_features_2015_2019.csv`

The project is designed so that the processed datasets are generated incrementally by the notebooks rather than being treated as manual prerequisites.


## Project Management

This project follows an **agile development approach**:

- Tasks and milestones are tracked using a GitHub Project Board
- Development is organized into iterative sprints
- Progress and decisions are documented in the `/docs` directory


## Current Status

- Repository structure and notebook pipeline established
- Raw traffic and signal datasets integrated
- Feature engineering pipeline aligned with signal optimization workflow
- Additional optimization and simulation stages in progress


## Academic Context

This project is conducted as part of the **Capstone Project requirement** for the Master of Data Analytics program at the University of Niagara Falls. All analyses adhere to academic integrity guidelines and ethical data usage standards.


## Supervisor

Dr. Hany Osman  
Email: hany.osman@unfc.ca
