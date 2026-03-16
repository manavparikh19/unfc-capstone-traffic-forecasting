# Smart City Traffic Signal Timing Optimization and Simulation (Toronto)

## Capstone Project – University of Niagara Falls (UNF)

### Team Members
- Manav Parikh
- Dhyey Modi
- Rudra Patel
- Arpit Desai

---

# Project Overview

This capstone project examines **smart city traffic signal timing optimization and simulation** using historical City of Toronto traffic data from **2015–2019** as a stable pre-COVID baseline.

The repository implements a reproducible analytical workflow combining **traffic data analytics, machine learning forecasting, signal timing evaluation, and intersection simulation** to understand how demand-aware signal timing strategies can improve traffic operations.

The project evolves from raw traffic data preparation to forecasting and operational simulation to support **data-driven traffic signal management insights**.

---

# Methodology Pipeline

The project follows a structured analytical workflow connecting historical traffic data analysis with forecasting and operational traffic engineering evaluation.

Raw Traffic Data (Toronto SVC)  
↓  
Data Preprocessing  
↓  
Traffic Flow Metrics  
↓  
Intersection Mapping  
↓  
Signal Performance Metrics  
↓  
Traffic Demand Forecasting  
↓  
Signal Timing Optimization Formulation  
↓  
Signal Timing Strategy Comparison  
↓  
Intersection Simulation  
↓  
Operational Performance Evaluation  
↓  
Dashboard Reporting

---

# Problem Definition

Traffic count locations and signalized intersections exist in separate Toronto Open Data datasets and do not share a common identifier.

To support signal timing analysis, this project:

- links traffic count locations to nearby signalized intersections using geographic matching
- derives traffic flow and operational indicators
- builds short-term traffic demand forecasting models
- evaluates how forecast-driven signal timing strategies affect intersection performance

The resulting workflow provides a **reproducible analytical foundation for signal timing optimization and decision-support reporting**.

---

# Objectives

- analyze recurring historical traffic demand patterns across Toronto traffic count locations
- derive interpretable traffic flow metrics from daily and hourly observations
- map traffic count locations to nearby signalized intersections
- engineer optimization-oriented traffic features
- compute intersection signal performance metrics
- develop next-hour traffic demand forecasting models
- evaluate baseline and optimized signal timing strategies
- integrate hourly weather and temporal external factors
- simulate intersection performance under different demand scenarios
- support dashboard-based reporting and operational interpretation

---

# Data Sources

### City of Toronto Open Data Portal

- Traffic Volume – Speed Volume Classification (SVC)
- Traffic Signals dataset

### Meteostat Weather Data

Hourly weather observations used to enrich traffic demand modeling with external environmental factors.

These datasets are used strictly for **academic research purposes**.

---

# Notebook Execution Order

Main pipeline:

1. notebooks/00_raw_preprocessing.ipynb  
2. notebooks/01_define_congestion_metric.ipynb  
3. notebooks/03_eda_traffic_data.ipynb  
4. notebooks/04_feature_engineering.ipynb  
5. notebooks/05_signal_performance_metrics.ipynb  
6. notebooks/06_baseline_signal_timing.ipynb  
7. notebooks/07_traffic_demand_forecasting.ipynb  
8. notebooks/08_signal_timing_strategy_comparison.ipynb  
9. notebooks/09_external_factors_integration.ipynb  
10. notebooks/10_traffic_flow_optimization_formulation.ipynb  
11. notebooks/11_intersection_traffic_flow_simulation.ipynb  

Optional validation notebook:

notebooks/02_dataset_validation.ipynb

---

# Traffic Demand Forecasting

The project evaluates multiple models for **next-hour traffic demand prediction**:

- Random Forest
- LSTM
- GRU
- Temporal Convolutional Network (TCN)

A structured model comparison and ablation study evaluates how engineered traffic features influence predictive performance.

Forecast outputs are later used in signal timing evaluation.

Notebook:

notebooks/07_traffic_demand_forecasting.ipynb

---

# Signal Timing Strategy Comparison

Baseline and optimized signal timing strategies are evaluated using forecast-driven traffic demand.

Metrics evaluated include:

- Webster-style delay estimation
- throughput (vehicles/hour)
- queue pressure (unmet demand)

Analysis includes:

- peak period evaluation
- congestion-level comparison
- location-level improvement summaries

Notebook:

notebooks/08_signal_timing_strategy_comparison.ipynb

---

# Signal Timing Optimization Formulation

A simplified traffic signal optimization framework is defined to guide signal timing evaluation.

### Objective

The optimization objective is to **minimize total intersection delay** across traffic movements.

Minimize:

Total Delay = Σ Delay_i

Where Delay_i represents delay experienced by vehicles in movement i.

### Decision Variables

- g_NS → green time for North-South phase
- g_EW → green time for East-West phase

### Constraints

Fixed Cycle Length

g_NS + g_EW = C

Minimum Green Time

g_NS ≥ g_min  
g_EW ≥ g_min

Capacity Constraint

Movement capacity depends on allocated green time and saturation flow.

### Interpretation

Signal timing optimization **does not increase total intersection capacity**.  
Instead it **redistributes available green time between phases** to better match traffic demand.

Notebook:

notebooks/10_traffic_flow_optimization_formulation.ipynb

---

# Intersection Traffic Flow Simulation

This stage evaluates intersection performance under different traffic demand scenarios.

### Intersection Model

Two-phase signalized intersection:

Phase 1 → North-South traffic  
Phase 2 → East-West traffic  

Cycle length remains constant across strategies.

### Signal Timing Strategies

Baseline Strategy

- equal green allocation

Optimized Strategy

- green time redistributed toward higher-demand phase

### Traffic Demand Scenarios

| Scenario | Description |
|--------|-------------|
| Off-Peak | Low traffic demand |
| Normal | Typical demand |
| Peak | High demand approaching capacity |

### Performance Metrics

Average Delay – vehicle delay per movement  

Throughput – vehicles served per hour  

Queue Pressure

Queue Pressure = Demand − Capacity

Demand Served per Cycle – vehicles processed per signal cycle

Queue Pressure Ratio – normalized unmet demand

Volume-to-Capacity Ratio (V/C)

V/C = Demand / Capacity

Interpretation:

V/C < 1 → below capacity  
V/C ≈ 1 → near capacity  
V/C > 1 → oversaturated

### Key Findings

Simulation results indicate:

- optimized timing reduces vehicle delay
- throughput increases under peak demand
- queue pressure is significantly reduced
- benefits grow as demand approaches capacity

Optimization improves performance **by redistributing capacity between phases**, not by increasing intersection capacity.

Notebook:

notebooks/11_intersection_traffic_flow_simulation.ipynb

---

# External Data Integration

Hourly weather data from Meteostat is merged with traffic observations.

Weather variables include:

- temperature
- precipitation
- humidity
- pressure
- weekend indicator
- peak-hour indicator

Weather merge coverage:

~99.65%

Notebook:

notebooks/09_external_factors_integration.ipynb

---

# Example Performance Improvements

Peak demand simulation results:

| Metric | Baseline | Optimized | Improvement |
|------|------|------|------|
| Average Delay | 34.47 sec/veh | 22.30 sec/veh | 35% reduction |
| Throughput | 1600 veh/hr | 1800 veh/hr | +12.5% |
| Queue Pressure | 220 veh/hr | 20 veh/hr | 90% reduction |

---

# Environment Setup

Recommended Python version:

Python 3.11 (TensorFlow compatible)

Required libraries:

pandas  
numpy  
matplotlib  
seaborn  
scikit-learn  
tensorflow  
meteostat  
geopy  

Example installation:

pip install pandas numpy matplotlib seaborn scikit-learn tensorflow meteostat geopy

---

# Academic Context

This project is conducted as part of the **Capstone Project requirement for the Master of Data Analytics program at the University of Niagara Falls**.

All analysis adheres to academic integrity and responsible data usage standards.

---

# Supervisor

Dr. Hany Osman  
hany.osman@unfc.ca

---

# References

Highway Capacity Manual (HCM) – Transportation Research Board  
Webster, F. V. (1958). Traffic Signal Settings  
City of Toronto Open Data Portal  
Meteostat Weather Data API

---

# License

This repository is provided for **academic and educational purposes** as part of the UNF capstone program.

Traffic data originates from the City of Toronto Open Data Portal and remains subject to the original dataset licensing terms.
