# Real-Time Traffic Congestion Forecasting and Operational Optimization (Toronto)

## Capstone Project – University of Niagara Falls (UNF)

### Team Members

- Manav Parikh
- Dhyey Modi
- Rudra Patel
- Arpit Desai


## Project Overview

This capstone project focuses on the development of a data-driven traffic analytics system for **short-term traffic congestion forecasting** in the City of Toronto. The project integrates **historical traffic data**, **real-time traffic feeds**, and **weather information** to predict congestion levels and evaluate **operational optimization strategies** aimed at reducing congestion impacts.

The project is designed as an applied analytics and decision-support system, with practical relevance for commuters, delivery service operators, and urban transportation planners.


## Problem Definition

Traffic congestion is treated as a **continuous quantitative phenomenon**, rather than a binary condition. Congestion levels are derived from traffic-related metrics such as traffic volume, estimated delay, and speed reduction at intersections or road segments.

The primary analytical task is formulated as a **short-term forecasting problem (regression / time-series forecasting)**. Secondary analysis may involve categorizing congestion levels (e.g., low, medium, high) for interpretability and decision support.


## Objectives

- Forecast short-term traffic congestion levels using historical, real-time, and weather data
- Evaluate the impact of real-time traffic information on forecasting accuracy
- Analyze the effect of weather conditions on congestion patterns
- Perform scenario-based operational optimization to assess congestion reduction strategies
- Deliver actionable insights through analytical dashboards and visualizations


## Data Sources

- **City of Toronto Open Data Portal** – Historical traffic volume and congestion-related datasets
- **TomTom / HERE Traffic Services** – Near real-time traffic flow and congestion data
- **OpenWeather** – Real-time and forecasted weather variables

All data sources are publicly accessible or commercially documented and are used strictly for academic research purposes.


## Methodology Overview

1. **Data Ingestion & Preprocessing**
   - Collection of historical traffic data
   - Integration of real-time traffic and weather feeds
   - Temporal alignment and feature engineering

2. **Exploratory Data Analysis (EDA)**
   - Trend analysis
   - Missing data assessment
   - Peak vs off-peak pattern analysis

3. **Forecasting Models**
   - Baseline time-series models (e.g., moving average, ARIMA)
   - Machine learning regression models (e.g., Random Forest, Gradient Boosting)
   - Deep learning spatio-temporal models (e.g., LSTM)

4. **Model Evaluation**
   - Performance measured using RMSE and MAE
   - Comparative analysis across model types and data configurations

5. **Operational Optimization**
   - Scenario-based analysis (peak/off-peak, weather conditions)
   - Evaluation of congestion reduction strategies using predicted outputs


## Repository Structure

The repository is organized to clearly separate data management, analytical workflows, and software components.

```
unfc-capstone-traffic-forecasting/
│
├── docs/                # Proposal, meeting notes, references, and reports
│   ├── proposal/
│   └── reporting/
│
├── data/                # Traffic and weather datasets
│   ├── raw/             # Original datasets (not committed)
│   ├── interim/         # Intermediate processed data
│   └── processed/       # Final modeling-ready datasets
│
├── notebooks/           # Exploratory data analysis and experiments
│
├── src/                 # Core source code
│   ├── ingestion/       # Data collection and API clients
│   ├── preprocessing/   # Data cleaning and feature engineering
│   ├── modeling/        # Forecasting models and evaluation
│   └── optimization/    # Scenario analysis and optimization logic
│
├── api/                 # Model serving and backend services
│
├── web/                 # Frontend dashboards and user interface
│
└── README.md
```

This structure supports reproducible research, modular development, and iterative experimentation throughout the project lifecycle.

Note: The `api` and `web` components are optional extensions intended for model serving
and interactive dashboards if time and scope permit.


## Project Management

This project follows an **agile development approach**:

- Tasks and milestones are tracked using a GitHub Project Board
- Development is organized into iterative sprints
- Progress and decisions are documented in the `/docs` directory


## Current Status

- Repository initialized
- Project proposal revised based on supervisor feedback
- Data source identification completed
- Modeling and data ingestion in progress


## Academic Context

This project is conducted as part of the **Capstone Project requirement** for the Master of Data Analytics program at the University of Niagara Falls. All analyses adhere to academic integrity guidelines and ethical data usage standards.


## Supervisor

Dr. Hany Osman  
Email: hany.osman@unfc.ca
