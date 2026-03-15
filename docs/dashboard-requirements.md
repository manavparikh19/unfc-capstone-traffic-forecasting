# Traffic Demand and Signal Optimization Dashboard Requirements

## Objective

This document defines the dashboard requirements for the capstone project's reporting and decision-support layer. Its purpose is to establish a clear specification for the key performance indicators, visual components, data dependencies, and presentation structure that will guide subsequent Power BI development. The dashboards are intended to translate processed analytical outputs into an interpretable interface for academic evaluation, stakeholder communication, and evidence-based assessment of traffic signal optimization opportunities across Toronto intersections.

## Dashboard Scope

The dashboarding work is divided into two complementary layers:

1. The Exploratory Traffic Analysis Dashboard, designed to support descriptive analysis of historical traffic demand patterns observed between 2015 and 2019.
2. The Traffic Signal Optimization Dashboard, designed to evaluate operational conditions at signalized intersections and present comparative insights related to optimization and future simulation outputs.

Together, these dashboards should support both foundational understanding of urban traffic demand and applied assessment of where signal timing interventions may provide the greatest benefit.

## Core KPIs

### Traffic Demand KPIs

### Average Daily Traffic Volume

Average daily traffic volume represents the mean total number of vehicles observed across a full day at a location or mapped intersection. This KPI provides a baseline measure of sustained demand and supports comparison across locations with different temporal usage patterns.

### Average Hourly Traffic Volume

Average hourly traffic volume captures the mean observed volume per hour across the available study period. This KPI supports the assessment of typical flow intensity and is especially useful for identifying corridors or intersections with consistently high demand throughout the day.

### Peak-Hour Traffic Volume

Peak-hour traffic volume identifies the maximum observed hourly volume for a given location or intersection. This KPI is critical for operational analysis because signal timing strategies are often most sensitive to the highest-demand periods rather than daily averages alone.

### Peak-to-Average Traffic Ratio

The peak-to-average traffic ratio measures the relationship between the highest observed hourly demand and the average operating level. This KPI helps distinguish locations with highly concentrated surges from those with comparatively stable demand profiles and is therefore relevant for prioritizing timing interventions.

### Intersection Demand Ranking

Intersection demand ranking orders signalized intersections according to selected demand indicators such as average daily volume, average hourly volume, or peak-hour volume. This KPI supports comparative screening and provides a practical basis for identifying candidate intersections for optimization analysis.

### Traffic Signal Optimization KPIs

### Estimated Vehicle Delay (Proxy Metric)

Estimated vehicle delay is a proxy measure intended to reflect the relative operational burden experienced at an intersection under existing or alternative signal conditions. Where direct delay measurements are not yet available, this KPI should be derived from demand intensity, peak load, and performance metrics that approximate likely queuing and service pressure.

### Traffic Throughput

Traffic throughput represents the number of vehicles that can be served or are estimated to be served within a given period under baseline and optimized conditions. This KPI is central to evaluating whether a proposed timing strategy improves intersection performance without introducing additional inefficiencies.

### Intersection Load Index

The intersection load index summarizes the degree to which traffic demand places pressure on an intersection relative to its observed operating profile. This KPI is useful because it converts multiple traffic intensity characteristics into a single comparative measure for prioritization and dashboard interpretation.

### Signal Optimization Improvement Percentage

Signal optimization improvement percentage expresses the relative change between baseline and optimized conditions for selected outcome measures such as delay or throughput. This KPI is especially important for communicating the practical value of optimization results in a concise and stakeholder-friendly form.

## Dashboard 1: Exploratory Traffic Analysis

The exploratory dashboard should emphasize descriptive understanding of historical traffic demand, temporal variation, and intersection-level concentration of volume. It should allow the user to move from a high-level system view to more detailed examination of peak conditions and high-demand locations.

### Traffic Volume Trends Over Time

**Visualization name:** Traffic Volume Trends Over Time  
**Chart type:** Multi-series line chart  
**Purpose:** Display daily or monthly traffic volume patterns across the historical study period.  
**Expected insight:** This visualization should reveal broad temporal stability, recurring seasonal patterns, and the relative magnitude of traffic demand across years or selected locations.

### Monthly and Weekly Traffic Patterns

**Visualization name:** Monthly and Weekly Traffic Patterns  
**Chart type:** Clustered column chart with slicers or matrix heatmap  
**Purpose:** Compare average demand by month and day of week to identify recurring temporal patterns.  
**Expected insight:** This visualization should help distinguish regular weekday demand from weekend traffic behaviour and show whether specific months exhibit elevated or reduced traffic intensity.

### Peak-Hour Traffic Distribution

**Visualization name:** Peak-Hour Traffic Distribution  
**Chart type:** Histogram or column chart by hour of day  
**Purpose:** Show how traffic volume is distributed across hours, with emphasis on morning and afternoon peak periods.  
**Expected insight:** This visualization should identify the hours at which traffic demand concentrates most strongly and confirm the operational relevance of AM and PM peak intervals.

### High-Demand Intersection Ranking

**Visualization name:** High-Demand Intersection Ranking  
**Chart type:** Horizontal bar chart  
**Purpose:** Rank intersections or traffic count locations by daily, hourly, or peak-hour demand.  
**Expected insight:** This visualization should identify the locations that contribute most to observed traffic demand and therefore warrant closer operational assessment.

### Spatial Distribution of Traffic Demand

**Visualization name:** Spatial Distribution of Traffic Demand  
**Chart type:** Map with proportional symbols  
**Purpose:** Display the geographic distribution of traffic volume and mapped signalized intersections across Toronto.  
**Expected insight:** This visualization should reveal whether high-demand conditions are spatially clustered and support geographic interpretation of candidate optimization zones.

## Dashboard 2: Traffic Signal Optimization

The optimization dashboard should present operational indicators, comparative performance measures, and geographically interpretable results for baseline and optimized conditions. It should support intersection-level decision analysis rather than broad descriptive exploration alone.

### Baseline vs Optimized Signal Timing Comparison

**Visualization name:** Baseline vs Optimized Signal Timing Comparison  
**Chart type:** Clustered bar chart or side-by-side KPI cards  
**Purpose:** Compare baseline and optimized performance values for selected intersections.  
**Expected insight:** This visualization should show whether optimization materially changes key operating measures and which intersections experience the greatest benefit.

### Estimated Delay Reduction

**Visualization name:** Estimated Delay Reduction  
**Chart type:** Waterfall chart or bar chart  
**Purpose:** Quantify the reduction in estimated vehicle delay between baseline and optimized conditions.  
**Expected insight:** This visualization should allow users to assess where optimization is likely to improve movement efficiency and reduce operational pressure.

### Throughput Improvement

**Visualization name:** Throughput Improvement  
**Chart type:** Clustered column chart  
**Purpose:** Compare throughput under baseline and optimized scenarios across selected intersections.  
**Expected insight:** This visualization should indicate whether proposed timing adjustments improve the number of vehicles served during critical operating periods.

### Intersection Demand Comparison

**Visualization name:** Intersection Demand Comparison  
**Chart type:** Scatter plot  
**Purpose:** Compare intersections using demand and performance metrics such as peak-hour volume and intersection load index.  
**Expected insight:** This visualization should highlight which intersections combine high demand with high operational strain and are therefore stronger candidates for optimization.

### Optimization Results Map

**Visualization name:** Optimization Results Map  
**Chart type:** Interactive map with conditional formatting  
**Purpose:** Present intersection locations alongside baseline conditions, optimization indicators, and improvement values.  
**Expected insight:** This visualization should support location-based interpretation of results and make it easier to identify clusters of intersections where optimization benefits are most pronounced.

## Mapping Visualizations to Research Objectives

The dashboard requirements directly support the project's research objectives.

- Visualizations such as traffic volume trends, monthly and weekly patterns, and peak-hour distributions support the objective of understanding historical traffic demand patterns across Toronto.
- Intersection ranking views and spatial demand maps support the objective of identifying candidate intersections for signal timing analysis and prioritization.
- Comparative charts for estimated delay, throughput, and optimization improvement support the objective of evaluating the potential benefit of signal timing adjustments.
- Map-based optimization views support the smart city dimension of the project by linking analytical results to a geographic decision context rather than treating intersections as isolated records.

## Data Sources

The dashboard components should be built from processed project outputs to preserve consistency with the analytical pipeline and maintain reproducibility.

### `data/processed/signal_optimization_features_2015_2019.csv`

This dataset should serve as the primary source for the exploratory traffic analysis dashboard. It contains hourly traffic observations, temporal attributes, mapped signal identifiers, and optimization-oriented feature fields such as daily total volume, hourly volume, peak-hour volume, peak ratio, normalized demand intensity, estimated arrival rate, directional imbalance, and peak-hour flags. It is therefore suitable for temporal trend analysis, peak-period profiling, spatial demand mapping, and intersection demand ranking.

### `data/processed/signal_performance_metrics_2015_2019.csv`

This dataset should serve as the primary source for summarized operational performance reporting. It includes signal-level aggregate indicators such as average hourly volume, peak-hour volume, average daily volume, peak-to-average ratio, traffic variability index, intersection load index, and peak load index. These fields support KPI cards, ranking tables, comparative plots, and screening of intersections for optimization priority.

### `data/processed/signal_simulation_results.csv`

This future dataset should support the comparative and scenario-based elements of the Traffic Signal Optimization Dashboard once simulation outputs are finalized. It is expected to contain baseline and optimized timing outcomes, including estimated delay, throughput, and improvement measures required for direct before-and-after comparison.

## Dashboard Layout

The recommended dashboard layout should be organized into four major reporting sections so that users can move logically from system-wide traffic understanding to operational evaluation.

### 1. Traffic Demand Overview

This section should contain high-level KPI cards for average daily traffic volume, average hourly traffic volume, and the number of mapped intersections included in the current filter context. It should also include the main temporal trend visualization and primary slicers for year, month, day type, and intersection.

### 2. Peak Traffic Analysis

This section should focus on temporal concentration of traffic demand. It should include the peak-hour traffic distribution, monthly and weekly pattern views, and supporting indicators such as peak-hour volume and peak-to-average traffic ratio.

### 3. Intersection Ranking

This section should present comparative views of the highest-demand or highest-load intersections. It should include ranked bar charts, a supporting table of key metrics, and a spatial map to connect ranked observations to their geographic locations.

### 4. Signal Optimization Results

This section should present baseline versus optimized comparisons, delay reduction indicators, throughput improvement measures, and map-based optimization results. If simulation outputs are not yet available, placeholder components may be structured in advance using current proxy metrics from the performance dataset.

## Expected Outcomes

The completed dashboards should allow stakeholders to identify where traffic demand is consistently highest, understand when demand concentrates most strongly, determine which intersections are the most appropriate candidates for operational intervention, and evaluate the extent to which proposed signal timing strategies may improve performance. The dashboards should also provide a clear visual bridge between historical traffic analysis and applied smart city optimization objectives within the capstone framework.

## Notes for Implementation

These requirements are intended to guide the next stage of Power BI dashboard development and should be treated as the baseline specification for report design, KPI selection, and dataset integration. Minor refinement may be required once simulation outputs are finalized and the structure of `data/processed/signal_simulation_results.csv` is confirmed. Any future changes should preserve the current distinction between exploratory demand analysis and optimization-oriented evaluation.
