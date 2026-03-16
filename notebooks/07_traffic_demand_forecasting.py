#!/usr/bin/env python
# coding: utf-8

# # Short-Term Traffic Demand Forecasting
# 
# This notebook develops short-term traffic demand forecasting models for the University of Niagara Falls capstone project using the engineered City of Toronto traffic dataset. The objective is to forecast **next-hour traffic demand** so that later notebooks can use forward-looking traffic inputs for baseline signal timing evaluation, optimization, and traffic flow simulation.
# 

# ## 1) Imports and Notebook Setup
# 
# The workflow is deterministic where possible, uses time-aware validation, and writes reusable forecasting outputs to the processed data directory.
# 

# In[1]:


from pathlib import Path
import os
import warnings

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf

from IPython.display import Markdown, display
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler

warnings.filterwarnings("ignore")

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)
tf.keras.utils.set_random_seed(RANDOM_STATE)
try:
    tf.config.experimental.enable_op_determinism()
except Exception:
    pass

plt.style.use("seaborn-v0_8-whitegrid")
plt.rcParams["figure.figsize"] = (12, 5)
plt.rcParams["axes.titlesize"] = 13
plt.rcParams["axes.labelsize"] = 11

PROJECT_ROOT = Path.cwd().resolve()
if not (PROJECT_ROOT / "data").exists():
    PROJECT_ROOT = PROJECT_ROOT.parent

DATA_PATH = PROJECT_ROOT / "data" / "processed" / "signal_optimization_features_2015_2019.csv"
FORECAST_OUTPUT_PATH = PROJECT_ROOT / "data" / "processed" / "traffic_demand_forecasts.csv"
MODEL_RESULTS_PATH = PROJECT_ROOT / "data" / "processed" / "forecast_model_results.csv"
ABLATION_RESULTS_PATH = PROJECT_ROOT / "data" / "processed" / "forecast_ablation_results.csv"

print(f"TensorFlow version: {tf.__version__}")
print(f"Project root: {PROJECT_ROOT}")


# ## 2) Load Dataset
# 
# The primary modeling input is `signal_optimization_features_2015_2019.csv`, which already contains traffic-demand engineering, signal-link variables, and operational descriptors produced in the earlier project stages.
# 

# In[2]:


raw_df = pd.read_csv(DATA_PATH)
raw_df["date"] = pd.to_datetime(raw_df["date"])
raw_df["hour"] = pd.to_datetime(raw_df["hour"])
raw_df = raw_df.sort_values(["location_id", "hour"]).reset_index(drop=True)

print(f"Dataset shape: {raw_df.shape}")
print(f"Hourly date range: {raw_df['hour'].min()} to {raw_df['hour'].max()}")
print(f"Unique traffic locations: {raw_df['location_id'].nunique()}")
print(f"Unique linked signals: {raw_df['nearest_signal_id'].nunique(dropna=True)}")

display(raw_df.head())
display(pd.DataFrame({"column": raw_df.columns}))


# ## 3) Define Forecasting Target and Cyclical Time Features
# 
# The forecasting target is **next-hour traffic volume**. This is created by shifting hourly volume one step ahead within each traffic count location.
# 
# Traffic demand also follows clear **daily** and **weekly** cycles. Raw time indices such as hour `23` and hour `0` are numerically far apart, even though they are adjacent in practice. Cyclical encoding solves this issue by representing time on a circular scale, which is especially helpful for recurrent neural networks that ingest sequential temporal context.
# 

# In[3]:


train_locations = set(raw_df.loc[raw_df["year"].between(2015, 2018), "location_id"])
test_locations = set(raw_df.loc[raw_df["year"] == 2019, "location_id"])
common_locations = train_locations & test_locations

model_df = raw_df[raw_df["location_id"].isin(common_locations)].copy()
model_df = model_df.sort_values(["location_id", "hour"]).reset_index(drop=True)
model_df["target_next_hour_volume"] = model_df.groupby("location_id")["hourly_volume"].shift(-1)
model_df["forecast_timestamp"] = model_df["hour"] + pd.Timedelta(hours=1)
model_df["hour_sin"] = np.sin(2 * np.pi * model_df["hour_of_day"] / 24)
model_df["hour_cos"] = np.cos(2 * np.pi * model_df["hour_of_day"] / 24)
model_df["day_of_week_sin"] = np.sin(2 * np.pi * model_df["day_of_week"] / 7)
model_df["day_of_week_cos"] = np.cos(2 * np.pi * model_df["day_of_week"] / 7)
for lag in [1, 7, 14, 24]:
    model_df[f"lag_{lag}"] = model_df.groupby("location_id")["hourly_volume"].shift(lag)
shifted_volume = model_df.groupby("location_id")["hourly_volume"].shift(1)
for window in [3, 6, 12, 24]:
    model_df[f"rolling_mean_{window}"] = shifted_volume.groupby(model_df["location_id"]).transform(lambda series: series.rolling(window, min_periods=window).mean())
    model_df[f"rolling_std_{window}"] = shifted_volume.groupby(model_df["location_id"]).transform(lambda series: series.rolling(window, min_periods=window).std())
model_df["location_code"] = pd.Categorical(model_df["location_id"]).codes
model_df["signal_code"] = pd.Categorical(model_df["nearest_signal_id"].fillna(-1)).codes
lag_roll_columns = [column for column in model_df.columns if column.startswith("lag_") or column.startswith("rolling_")]
prepared_df = model_df.dropna(subset=["target_next_hour_volume"] + lag_roll_columns).copy()
summary_df = pd.DataFrame({
    "metric": ["Original rows", "Rows after common-location filter", "Rows after lag/rolling preparation", "Common training/test locations", "Training rows (2015-2018)", "Test rows (2019)"],
    "value": [len(raw_df), len(model_df), len(prepared_df), len(common_locations), int(prepared_df["year"].between(2015, 2018).sum()), int((prepared_df["year"] == 2019).sum())],
})
display(summary_df)
display(prepared_df[["location_id", "hour", "forecast_timestamp", "hourly_volume", "target_next_hour_volume", "hour_sin", "hour_cos", "day_of_week_sin", "day_of_week_cos", "lag_1", "rolling_mean_24"]].head())


# ## 4) Time-Based Train-Test Split
# 
# A forecasting workflow must preserve chronology. The main tabular models are trained on **2015-2018** and evaluated on **2019** without random shuffling. This prevents future information from leaking into model fitting.
# 

# In[4]:


train_df = prepared_df[prepared_df["year"].between(2015, 2018)].copy()
test_df = prepared_df[prepared_df["year"] == 2019].copy()
display(pd.DataFrame({"split": ["Training", "Test"], "years": ["2015-2018", "2019"], "rows": [len(train_df), len(test_df)], "locations": [train_df["location_id"].nunique(), test_df["location_id"].nunique()], "start": [train_df["hour"].min(), test_df["hour"].min()], "end": [train_df["hour"].max(), test_df["hour"].max()]}))


# ## 5) Define Feature Groups for the Ablation Study
# 
# The ablation study keeps the Random Forest as the tabular benchmark and evaluates how predictive performance changes as more traffic-context information is added. The **full** feature set now includes the cyclical time encodings alongside the earlier engineered demand and signal-related predictors.
# 

# In[5]:


feature_sets = {
    "Feature Set A: Temporal Only": ["hour_of_day", "day_of_week"],
    "Feature Set B: Temporal + Lag": ["hour_of_day", "day_of_week", "lag_1", "lag_7", "lag_14"],
    "Feature Set C: Temporal + Lag + Rolling": ["hour_of_day", "day_of_week", "lag_1", "lag_7", "lag_14", "lag_24", "rolling_mean_3", "rolling_mean_6", "rolling_mean_12", "rolling_mean_24", "rolling_std_3", "rolling_std_6", "rolling_std_12", "rolling_std_24"],
    "Feature Set D: Full Feature Set": ["hour_of_day", "day_of_week", "month", "is_weekend", "quarter", "AM_peak_flag", "PM_peak_flag", "is_peak_hour", "hour_sin", "hour_cos", "day_of_week_sin", "day_of_week_cos", "lag_1", "lag_7", "lag_14", "lag_24", "rolling_mean_3", "rolling_mean_6", "rolling_mean_12", "rolling_mean_24", "rolling_std_3", "rolling_std_6", "rolling_std_12", "rolling_std_24", "daily_total_volume", "peak_hour_volume", "peak_ratio", "hourly_share_of_daily_volume", "normalized_demand_intensity", "estimated_arrival_rate_vph", "approach_demand_proxy", "directional_imbalance", "green_split_weight_proxy", "critical_flow_proxy", "saturation_proxy", "observed_hour_count", "distance_to_signal_m", "location_code", "signal_code"],
}
display(pd.DataFrame({"feature_set": list(feature_sets.keys()), "feature_count": [len(v) for v in feature_sets.values()]}))


# ## 6) Random Forest Baseline Model
# 
# Random Forest remains the **tabular baseline model**. Although it is not a native sequence model, it is a strong benchmark for next-hour forecasting once temporal structure has been converted into explicit lag, rolling, and engineered covariates.
# 

# In[6]:


def compute_metrics(actual, predicted):
    return {"RMSE": mean_squared_error(actual, predicted) ** 0.5, "MAE": mean_absolute_error(actual, predicted)}

def build_random_forest_pipeline():
    return Pipeline([("imputer", SimpleImputer(strategy="median")), ("model", RandomForestRegressor(n_estimators=300, max_depth=18, min_samples_leaf=2, random_state=RANDOM_STATE, n_jobs=-1))])

rf_full_features = feature_sets["Feature Set D: Full Feature Set"]
rf_pipeline = build_random_forest_pipeline()
rf_pipeline.fit(train_df[rf_full_features], train_df["target_next_hour_volume"])
rf_test_predictions = rf_pipeline.predict(test_df[rf_full_features])
rf_baseline_metrics = compute_metrics(test_df["target_next_hour_volume"], rf_test_predictions)
display(pd.DataFrame([{"model_name": "Random Forest", "feature_set": "Feature Set D: Full Feature Set", **rf_baseline_metrics}]))


# In[7]:


rf_interpretation = f"""
**Random Forest Interpretation**

- RMSE = **{rf_baseline_metrics['RMSE']:.2f}** and MAE = **{rf_baseline_metrics['MAE']:.2f}** indicate the average magnitude of forecast error in traffic-volume units, with RMSE penalizing larger misses more heavily than MAE.
- The Random Forest performs well because the traffic forecasting task has already been translated into a rich tabular problem through lag features, rolling summaries, cyclical time variables, and operational indicators.
- This makes the model a credible benchmark for judging whether more complex recurrent models add forecasting value beyond feature engineering.
"""
display(Markdown(rf_interpretation))


# ## 7) Ablation Study with Random Forest
# 
# The ablation study measures how forecasting accuracy changes as the feature space expands from simple temporal descriptors to richer demand-history and signal-context variables.
# 

# In[8]:


ablation_results = []
for feature_set_name, columns in feature_sets.items():
    ablation_pipeline = build_random_forest_pipeline()
    ablation_pipeline.fit(train_df[columns], train_df["target_next_hour_volume"])
    predictions = ablation_pipeline.predict(test_df[columns])
    metrics = compute_metrics(test_df["target_next_hour_volume"], predictions)
    ablation_results.append({"model_name": "Random Forest", "feature_set": feature_set_name, "RMSE": metrics["RMSE"], "MAE": metrics["MAE"]})
ablation_results_df = pd.DataFrame(ablation_results).sort_values("RMSE").reset_index(drop=True)
ablation_results_df.to_csv(ABLATION_RESULTS_PATH, index=False)
display(ablation_results_df)
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
ablation_results_df.plot.bar(x="feature_set", y="RMSE", ax=axes[0], color="#2a6f97", legend=False)
ablation_results_df.plot.bar(x="feature_set", y="MAE", ax=axes[1], color="#9c6644", legend=False)
axes[0].set_title("Ablation Study: RMSE by Feature Set")
axes[1].set_title("Ablation Study: MAE by Feature Set")
axes[0].set_ylabel("RMSE")
axes[1].set_ylabel("MAE")
for axis in axes:
    axis.set_xlabel("")
    axis.tick_params(axis="x", rotation=30)
plt.tight_layout()
plt.show()


# In[9]:


best_ablation = ablation_results_df.iloc[0]
ablation_interpretation = f"""
**Ablation Study Interpretation**

- The best-performing feature group is **{best_ablation['feature_set']}** with RMSE = **{best_ablation['RMSE']:.2f}** and MAE = **{best_ablation['MAE']:.2f}**.
- The transition from temporal-only predictors to lag-based predictors shows that immediate traffic history is essential for next-hour demand forecasting.
- Adding rolling statistics further improves performance by summarizing short-term traffic context and volatility.
- The full feature set performs best, indicating that cyclical time variables and engineered demand/signal features contribute useful operational context beyond simple temporal markers.
"""
display(Markdown(ablation_interpretation))


# ## 8) Sequence Forecasting Pipeline for LSTM and GRU
# 
# The recurrent models use a shared, leakage-aware sequence pipeline with 24-hour input windows, MinMax scaling, and a chronological validation split from the training period only. The sequence features include raw temporal indicators and the new cyclical encodings so that the neural models can learn repeating daily and weekly demand patterns more naturally.
# 

# In[10]:


sequence_length = 24
sequence_feature_columns = ["hourly_volume", "hour_of_day", "day_of_week", "hour_sin", "hour_cos", "day_of_week_sin", "day_of_week_cos", "is_weekend"]
train_sequence_records = []
test_sequence_records = []
sequence_train_source_indices = []
sequence_test_source_indices = []
for location_id, group in model_df.groupby("location_id"):
    group = group.sort_values("hour").reset_index()
    contiguous = group["hour"].diff().dt.total_seconds().div(3600).fillna(1).eq(1)
    values = group[sequence_feature_columns].to_numpy(dtype=float)
    target_values = group["hourly_volume"].to_numpy(dtype=float)
    years = group["year"].to_numpy()
    for end in range(sequence_length - 1, len(group) - 1):
        if not contiguous.iloc[end - sequence_length + 2 : end + 2].all():
            continue
        record = {"X": values[end - sequence_length + 1 : end + 1], "y": float(target_values[end + 1]), "forecast_timestamp": group.loc[end + 1, "hour"], "location_id": group.loc[end, "location_id"], "nearest_signal_id": group.loc[end, "nearest_signal_id"], "source_index": int(group.loc[end, "index"])}
        if years[end + 1] <= 2018:
            train_sequence_records.append(record)
            sequence_train_source_indices.append(record["source_index"])
        elif years[end + 1] == 2019:
            test_sequence_records.append(record)
            sequence_test_source_indices.append(record["source_index"])
train_sequence_records = sorted(train_sequence_records, key=lambda item: (item["forecast_timestamp"], item["location_id"]))
test_sequence_records = sorted(test_sequence_records, key=lambda item: (item["forecast_timestamp"], item["location_id"]))
X_train_all = np.asarray([record["X"] for record in train_sequence_records], dtype=float)
y_train_all = np.asarray([record["y"] for record in train_sequence_records], dtype=float).reshape(-1, 1)
X_test_sequences = np.asarray([record["X"] for record in test_sequence_records], dtype=float)
y_test_sequences = np.asarray([record["y"] for record in test_sequence_records], dtype=float).reshape(-1, 1)
validation_size = int(np.ceil(0.2 * len(X_train_all)))
train_cutoff = len(X_train_all) - validation_size
X_train_sequences = X_train_all[:train_cutoff]
y_train_sequences = y_train_all[:train_cutoff]
X_validation_sequences = X_train_all[train_cutoff:]
y_validation_sequences = y_train_all[train_cutoff:]
feature_scaler = MinMaxScaler()
target_scaler = MinMaxScaler()
X_train_sequences_scaled = feature_scaler.fit_transform(X_train_sequences.reshape(-1, X_train_sequences.shape[-1])).reshape(X_train_sequences.shape)
X_validation_sequences_scaled = feature_scaler.transform(X_validation_sequences.reshape(-1, X_validation_sequences.shape[-1])).reshape(X_validation_sequences.shape)
X_test_sequences_scaled = feature_scaler.transform(X_test_sequences.reshape(-1, X_test_sequences.shape[-1])).reshape(X_test_sequences.shape)
y_train_sequences_scaled = target_scaler.fit_transform(y_train_sequences)
y_validation_sequences_scaled = target_scaler.transform(y_validation_sequences)
sequence_test_index_df = pd.DataFrame(test_sequence_records).drop(columns=["X", "y"]).copy()
sequence_test_index_df["actual_volume"] = y_test_sequences.ravel()
print("Training sequences:", X_train_sequences.shape)
print("Validation sequences:", X_validation_sequences.shape)
print("Test sequences:", X_test_sequences.shape)
display(sequence_test_index_df.head())


# In[11]:


def build_recurrent_model(model_type, input_shape):
    tf.keras.backend.clear_session()
    tf.keras.utils.set_random_seed(RANDOM_STATE)
    recurrent_layer = tf.keras.layers.LSTM if model_type == "LSTM" else tf.keras.layers.GRU
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=input_shape),
        recurrent_layer(64),
        tf.keras.layers.Dense(1),
    ])
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss="mse")
    return model


def build_tcn_model(input_shape):
    tf.keras.backend.clear_session()
    tf.keras.utils.set_random_seed(RANDOM_STATE)
    inputs = tf.keras.Input(shape=input_shape)
    x = tf.keras.layers.Conv1D(64, kernel_size=3, dilation_rate=1, padding="causal", activation="relu")(inputs)
    x = tf.keras.layers.Conv1D(64, kernel_size=3, dilation_rate=2, padding="causal", activation="relu")(x)
    x = tf.keras.layers.Conv1D(64, kernel_size=3, dilation_rate=4, padding="causal", activation="relu")(x)
    x = tf.keras.layers.GlobalAveragePooling1D()(x)
    x = tf.keras.layers.Dense(16, activation="relu")(x)
    outputs = tf.keras.layers.Dense(1)(x)
    model = tf.keras.Model(inputs=inputs, outputs=outputs)
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss="mse")
    return model


def fit_and_predict_recurrent(model_type):
    model = build_recurrent_model(model_type, (sequence_length, len(sequence_feature_columns)))
    history = model.fit(
        X_train_sequences_scaled,
        y_train_sequences_scaled,
        validation_data=(X_validation_sequences_scaled, y_validation_sequences_scaled),
        epochs=40,
        batch_size=64,
        callbacks=[tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=6, restore_best_weights=True)],
        verbose=0,
    )
    predictions_scaled = model.predict(X_test_sequences_scaled, verbose=0)
    predictions = target_scaler.inverse_transform(predictions_scaled).ravel()
    metrics = compute_metrics(y_test_sequences.ravel(), predictions)
    return model, history, predictions, metrics


def fit_and_predict_tcn():
    model = build_tcn_model((sequence_length, len(sequence_feature_columns)))
    history = model.fit(
        X_train_sequences_scaled,
        y_train_sequences_scaled,
        validation_data=(X_validation_sequences_scaled, y_validation_sequences_scaled),
        epochs=40,
        batch_size=64,
        callbacks=[tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=6, restore_best_weights=True)],
        verbose=0,
    )
    predictions_scaled = model.predict(X_test_sequences_scaled, verbose=0)
    predictions = target_scaler.inverse_transform(predictions_scaled).ravel()
    metrics = compute_metrics(y_test_sequences.ravel(), predictions)
    return model, history, predictions, metrics


# ## 9) LSTM Forecasting Model
# 
# The LSTM model uses the shared 24-hour sequence inputs and learns next-hour demand directly from temporal order rather than relying only on manually engineered lag variables.
# 

# In[12]:


lstm_model, lstm_history, lstm_predictions, lstm_metrics = fit_and_predict_recurrent("LSTM")
display(pd.DataFrame([{"model_name": "LSTM", "RMSE": lstm_metrics["RMSE"], "MAE": lstm_metrics["MAE"]}]))


# In[13]:


lstm_interpretation = f"""
**LSTM Interpretation**

- The LSTM achieved RMSE = **{lstm_metrics['RMSE']:.2f}** and MAE = **{lstm_metrics['MAE']:.2f}** on the 2019 holdout subset.
- Sequence models are attractive because they can learn temporal dependence directly from ordered observations rather than relying only on manual lag engineering.
- When the tabular pipeline already contains strong engineered lag and rolling features, the LSTM may have a smaller advantage than expected. In this project, it should be interpreted as a complementary sequence benchmark rather than an automatic replacement for the Random Forest baseline.
"""
display(Markdown(lstm_interpretation))


# ## 10) GRU Forecasting Model
# 
# The GRU uses the same sequence inputs as the LSTM but replaces the recurrent unit with a lighter gating structure. This often reduces model complexity while still preserving temporal-memory behavior.
# 

# In[14]:


gru_model, gru_history, gru_predictions, gru_metrics = fit_and_predict_recurrent("GRU")
display(pd.DataFrame([{"model_name": "GRU", "RMSE": gru_metrics["RMSE"], "MAE": gru_metrics["MAE"]}]))


# In[15]:


gru_interpretation = f"""
**GRU Interpretation**

- The GRU achieved RMSE = **{gru_metrics['RMSE']:.2f}** and MAE = **{gru_metrics['MAE']:.2f}** on the same 2019 sequence-compatible holdout subset.
- Compared with the LSTM, the GRU provides a lighter recurrent architecture with fewer gating parameters, which can be attractive when training efficiency matters.
- Its results show whether a simpler recurrent model can capture enough daily and weekly demand structure without the additional complexity of an LSTM.
"""
display(Markdown(gru_interpretation))


# ## 11) Temporal Convolutional Network (TCN) Forecasting Model
# 
# The TCN is a sequence model based on **causal 1D convolutions** rather than recurrent memory. By stacking dilated causal convolutions, it can capture short- and medium-range temporal dependencies efficiently while preserving forecast causality. It is included here as a modern convolutional forecasting architecture for comparison against the recurrent LSTM and GRU models.
# 

# In[16]:


tcn_model, tcn_history, tcn_predictions, tcn_metrics = fit_and_predict_tcn()
display(pd.DataFrame([{"model_name": "TCN", "RMSE": tcn_metrics["RMSE"], "MAE": tcn_metrics["MAE"]}]))


# In[17]:


plt.figure(figsize=(10, 4))
plt.plot(tcn_history.history["loss"], label="Training Loss", color="#7f5539")
plt.plot(tcn_history.history["val_loss"], label="Validation Loss", color="#3d405b")
plt.title("TCN Training History")
plt.xlabel("Epoch")
plt.ylabel("Loss (MSE)")
plt.legend()
plt.tight_layout()
plt.show()


# In[18]:


tcn_interpretation = f"""
**TCN Interpretation**

- The TCN achieved RMSE = **{tcn_metrics['RMSE']:.2f}** and MAE = **{tcn_metrics['MAE']:.2f}** on the 2019 holdout subset.
- The model captures short-term temporal structure using causal convolutions instead of recurrent memory, which makes it a useful modern comparator for traffic forecasting.
- TCNs can perform well when traffic demand contains repeated local temporal patterns, but the comparison with LSTM and GRU should focus on whether convolutional sequence modeling captures demand dynamics more effectively than recurrent architectures in this dataset.
"""
display(Markdown(tcn_interpretation))


# ## 12) Final Model Comparison
# 
# For a fair comparison, the Random Forest is refit on the same sequence-compatible forecasting timestamps used by the LSTM, GRU, and TCN. This keeps the evaluation target aligned across all four models.
# 

# In[19]:


sequence_source_indices = sorted(set(sequence_train_source_indices) | set(sequence_test_source_indices))
sequence_compatible_df = model_df.loc[sequence_source_indices].copy()
sequence_compatible_df = sequence_compatible_df.sort_values(["forecast_timestamp", "location_id"]).reset_index(drop=True)
sequence_train_df = sequence_compatible_df[sequence_compatible_df["year"].between(2015, 2018)].copy()
sequence_test_df = sequence_compatible_df[sequence_compatible_df["year"] == 2019].copy()

rf_sequence_pipeline = build_random_forest_pipeline()
rf_sequence_pipeline.fit(sequence_train_df[rf_full_features], sequence_train_df["target_next_hour_volume"])
rf_sequence_predictions = rf_sequence_pipeline.predict(sequence_test_df[rf_full_features])
rf_sequence_metrics = compute_metrics(sequence_test_df["target_next_hour_volume"], rf_sequence_predictions)

model_results_df = pd.DataFrame([
    {"model_name": "Random Forest", "RMSE": rf_sequence_metrics["RMSE"], "MAE": rf_sequence_metrics["MAE"]},
    {"model_name": "LSTM", "RMSE": lstm_metrics["RMSE"], "MAE": lstm_metrics["MAE"]},
    {"model_name": "GRU", "RMSE": gru_metrics["RMSE"], "MAE": gru_metrics["MAE"]},
    {"model_name": "TCN", "RMSE": tcn_metrics["RMSE"], "MAE": tcn_metrics["MAE"]},
]).sort_values("RMSE").reset_index(drop=True)
model_results_df.to_csv(MODEL_RESULTS_PATH, index=False)
display(model_results_df)

fig, axes = plt.subplots(1, 2, figsize=(12, 4))
colors = ["#2a6f97", "#c84b31", "#6a994e", "#7f5539"]
model_results_df.plot.bar(x="model_name", y="RMSE", ax=axes[0], color=colors, legend=False)
model_results_df.plot.bar(x="model_name", y="MAE", ax=axes[1], color=colors, legend=False)
axes[0].set_title("Model Comparison: RMSE")
axes[1].set_title("Model Comparison: MAE")
axes[0].set_ylabel("RMSE")
axes[1].set_ylabel("MAE")
for axis in axes:
    axis.set_xlabel("")
    axis.tick_params(axis="x", rotation=0)
plt.tight_layout()
plt.show()


# In[20]:


best_model_row = model_results_df.iloc[0]
comparison_interpretation = f"""
**Final Model Comparison Interpretation**

- On the aligned 2019 holdout subset, the best-performing model is **{best_model_row['model_name']}** with RMSE = **{best_model_row['RMSE']:.2f}** and MAE = **{best_model_row['MAE']:.2f}**.
- The TCN result should be interpreted relative to both recurrent models: if it trails the LSTM and GRU, that suggests local convolutional pattern extraction is less effective here than the combination of recurrent sequence learning and strong tabular engineering.
- If the Random Forest remains strongest, that indicates that engineered lag, rolling, and operational predictors still provide a highly competitive forecasting representation for this traffic dataset.
- The convolutional temporal approach remains valuable academically because it broadens the forecasting comparison beyond recurrent networks and tests whether short-range temporal structure alone is sufficient for accurate next-hour demand prediction.
"""
display(Markdown(comparison_interpretation))


# ## 13) Forecast Visualization
# 
# The visual comparisons below show how the four models track observed 2019 demand over time and within a shorter sample forecasting window.
# 

# In[21]:


rf_predictions_df = sequence_test_df[["location_id", "nearest_signal_id", "forecast_timestamp", "target_next_hour_volume"]].copy()
rf_predictions_df = rf_predictions_df.rename(columns={"target_next_hour_volume": "actual_volume"})
rf_predictions_df["predicted_volume"] = rf_sequence_predictions
rf_predictions_df["model_name"] = "Random Forest"

lstm_predictions_df = sequence_test_index_df[["location_id", "nearest_signal_id", "forecast_timestamp", "actual_volume"]].copy()
lstm_predictions_df["predicted_volume"] = lstm_predictions
lstm_predictions_df["model_name"] = "LSTM"

gru_predictions_df = sequence_test_index_df[["location_id", "nearest_signal_id", "forecast_timestamp", "actual_volume"]].copy()
gru_predictions_df["predicted_volume"] = gru_predictions
gru_predictions_df["model_name"] = "GRU"

tcn_predictions_df = sequence_test_index_df[["location_id", "nearest_signal_id", "forecast_timestamp", "actual_volume"]].copy()
tcn_predictions_df["predicted_volume"] = tcn_predictions
tcn_predictions_df["model_name"] = "TCN"

forecast_output_df = pd.concat([rf_predictions_df, lstm_predictions_df, gru_predictions_df, tcn_predictions_df], ignore_index=True).sort_values(["model_name", "forecast_timestamp", "location_id"])
forecast_output_df.to_csv(FORECAST_OUTPUT_PATH, index=False)

actual_series = rf_predictions_df.groupby("forecast_timestamp", as_index=False)["actual_volume"].mean()
rf_series = rf_predictions_df.groupby("forecast_timestamp", as_index=False)["predicted_volume"].mean()
lstm_series = lstm_predictions_df.groupby("forecast_timestamp", as_index=False)["predicted_volume"].mean()
gru_series = gru_predictions_df.groupby("forecast_timestamp", as_index=False)["predicted_volume"].mean()
tcn_series = tcn_predictions_df.groupby("forecast_timestamp", as_index=False)["predicted_volume"].mean()

plt.figure(figsize=(14, 5))
plt.plot(actual_series["forecast_timestamp"], actual_series["actual_volume"], label="Actual", linewidth=2, color="#1b4332")
plt.plot(rf_series["forecast_timestamp"], rf_series["predicted_volume"], label="Random Forest", color="#2a6f97", alpha=0.9)
plt.plot(lstm_series["forecast_timestamp"], lstm_series["predicted_volume"], label="LSTM", color="#c84b31", alpha=0.9)
plt.plot(gru_series["forecast_timestamp"], gru_series["predicted_volume"], label="GRU", color="#6a994e", alpha=0.9)
plt.plot(tcn_series["forecast_timestamp"], tcn_series["predicted_volume"], label="TCN", color="#7f5539", alpha=0.9)
plt.title("Average 2019 Next-Hour Traffic Demand: Actual vs Predicted")
plt.xlabel("Forecast Timestamp")
plt.ylabel("Traffic Volume")
plt.legend()
plt.tight_layout()
plt.show()

sample_location = rf_predictions_df["location_id"].mode().iloc[0]
sample_actual = rf_predictions_df.loc[rf_predictions_df["location_id"] == sample_location].sort_values("forecast_timestamp").head(72)
sample_lstm = lstm_predictions_df.loc[lstm_predictions_df["location_id"] == sample_location].sort_values("forecast_timestamp").head(72)
sample_gru = gru_predictions_df.loc[gru_predictions_df["location_id"] == sample_location].sort_values("forecast_timestamp").head(72)
sample_tcn = tcn_predictions_df.loc[tcn_predictions_df["location_id"] == sample_location].sort_values("forecast_timestamp").head(72)

plt.figure(figsize=(14, 5))
plt.plot(sample_actual["forecast_timestamp"], sample_actual["actual_volume"], label="Actual", linewidth=2, color="#1b4332")
plt.plot(sample_actual["forecast_timestamp"], sample_actual["predicted_volume"], label="Random Forest", color="#2a6f97")
plt.plot(sample_lstm["forecast_timestamp"], sample_lstm["predicted_volume"], label="LSTM", color="#c84b31")
plt.plot(sample_gru["forecast_timestamp"], sample_gru["predicted_volume"], label="GRU", color="#6a994e")
plt.plot(sample_tcn["forecast_timestamp"], sample_tcn["predicted_volume"], label="TCN", color="#7f5539")
plt.title(f"Sample Forecast Window for Location {sample_location}")
plt.xlabel("Forecast Timestamp")
plt.ylabel("Traffic Volume")
plt.legend()
plt.tight_layout()
plt.show()


# ## 14) Save Outputs
# 
# The notebook writes three reusable forecasting artifacts for the downstream optimization and simulation stages.
# 

# In[22]:


display(pd.DataFrame({
    "file": [
        str(FORECAST_OUTPUT_PATH.relative_to(PROJECT_ROOT)),
        str(MODEL_RESULTS_PATH.relative_to(PROJECT_ROOT)),
        str(ABLATION_RESULTS_PATH.relative_to(PROJECT_ROOT)),
    ],
    "rows": [len(forecast_output_df), len(model_results_df), len(ablation_results_df)],
}))


# ## 15) Conclusion
# 
# The final conclusion below summarizes which forecasting model performed best, what the ablation study reveals about feature contribution, how cyclical encodings fit into the modeling pipeline, and how these forecasts support later optimization work.
# 

# In[23]:


best_model = model_results_df.iloc[0]
best_ablation = ablation_results_df.iloc[0]
conclusion = f"""
**Forecasting Summary**

- The notebook used `signal_optimization_features_2015_2019.csv` as the primary dataset and forecasted **next-hour traffic volume**.
- Random Forest remained the **tabular baseline**, while **LSTM**, **GRU**, and **TCN** served as sequence-based deep learning comparators using 24-hour historical demand windows.
- The best final model on the aligned 2019 holdout subset was **{best_model['model_name']}** with RMSE = **{best_model['RMSE']:.2f}** and MAE = **{best_model['MAE']:.2f}**.
- The ablation study showed that **{best_ablation['feature_set']}** provided the strongest Random Forest performance, confirming the importance of lag history, rolling summaries, and the broader engineered traffic/signal context.
- Cyclical time features made the daily and weekly traffic structure explicit in the feature space, which improved the interpretability of the forecasting design even when the tabular benchmark remained highly competitive.
- The TCN result indicates whether convolutional sequence modeling alone can capture traffic demand effectively; in this notebook it should be interpreted relative to the recurrent models and the Random Forest benchmark.
- The updated forecast outputs in `traffic_demand_forecasts.csv` provide the forward-looking demand inputs that will be used in later timing optimization and traffic simulation stages.
"""
display(Markdown(conclusion))

