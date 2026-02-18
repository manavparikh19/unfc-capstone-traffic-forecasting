# Toronto Traffic Forecasting – Data Sources Documentation

This document identifies and evaluates the selected traffic and weather datasets for congestion forecasting and optimization modeling in Toronto.


# Traffic Dataset 1: Multimodal Intersection Turning Movement Counts (TMC)

**Source URL:**  
https://open.toronto.ca/dataset/traffic-volumes-at-intersections-for-all-modes/

**Publisher:**  
City of Toronto – Transportation Services

## Description
This dataset contains historical turning movement counts collected at signalized and unsignalized intersections across Toronto. It includes traffic volumes for vehicles, cyclists, and pedestrians.

## Dataset Evaluation

### Time Granularity
Counts are typically collected in peak-hour blocks or multi-hour sessions. Each record includes the date of observation and movement direction.

### Spatial Coverage
Covers multiple intersections across the City of Toronto.

### Historical Range
Data available from approximately 1984 to recent years.

### Missing Values
Some intersections may have incomplete directional counts. Missing or null values will be handled during preprocessing and cleaning.

## Key Variables to be Used

- Intersection ID / location name
- Latitude / Longitude (if available)
- Date of count
- Direction of movement
- Mode (vehicle, bicycle, pedestrian)
- Volume count

## Justification

Intersection-level traffic counts are critical for congestion modeling. They help identify peak-hour demand patterns, directional congestion trends, and seasonal variations across the city.


# Traffic Dataset 2: Midblock Vehicle Speed, Volume and Classification Counts

**Source URL:**  
https://open.toronto.ca/dataset/traffic-volumes-midblock-vehicle-speed-volume-and-classification-counts/

**Publisher:**  
City of Toronto – Transportation Services

## Description
This dataset contains midblock traffic counts collected using pneumatic tube technology. It includes vehicle volume, speed measurements, and vehicle classification data.

## Dataset Evaluation

### Time Granularity
Typically hourly or daily counts collected over 1–7 consecutive days.

### Spatial Coverage
Covers various road segments across Toronto.

### Historical Range
Multiple years of historical midblock data are available.

### Missing Values
Some speed measurements or classification fields may contain missing values. These will be handled during preprocessing.

## Key Variables to be Used

- Road segment location
- Count date range
- Vehicle volume
- Average vehicle speed
- Vehicle classification (if available)

## Justification

Speed and volume data are directly related to congestion severity. This dataset enables modeling of traffic flow degradation, congestion buildup, and road segment performance.


# Weather Dataset: Environment and Climate Change Canada – Historical Climate Data

**Source URL:**  
https://climate.weather.gc.ca/

**Publisher:**  
Environment and Climate Change Canada (ECCC)

## Description
This dataset provides historical weather observations from Toronto-area weather stations, including temperature, precipitation, wind speed, and visibility.

## Dataset Evaluation

### Time Granularity
Hourly and daily observations available.

### Spatial Coverage
Toronto Pearson International Airport station and other Toronto-area stations.

### Historical Range
Multiple decades of historical data available.

### Missing Values
Some hourly observations may contain gaps. These will be handled using interpolation or removal depending on modeling needs.

## Key Variables to be Used

- Temperature
- Precipitation (rain and snow)
- Wind speed
- Visibility
- Humidity

## Justification

Weather conditions significantly impact traffic congestion. Rain, snow, wind, and low visibility increase travel time variability and congestion levels. Including weather variables improves forecast accuracy and model robustness.


# Final Selection Summary

The above two traffic datasets and one weather dataset provide:

- Strong spatial coverage across Toronto
- Sufficient historical depth
- Relevant variables for congestion forecasting
- Complementary speed, volume, and environmental features

These datasets are selected for feature engineering and congestion prediction modeling.
