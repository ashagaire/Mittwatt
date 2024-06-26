import sqlite3
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import load_model

# Load the model
model = load_model('electricity_price_model.h5')

# Connect to the SQLite database
conn = sqlite3.connect("../../prisma/db.sqlite")

# Query recent new feature data
query = "SELECT * FROM HistoricalElectricityWeather LIMIT 360 "
data = pd.read_sql_query(query, conn)

# Select specific columns using .filter
new_df_filter = data.filter(['temperature', 'precipitation', 'weatherCodeId', 'cloudCover', 'windSpeed10m', 'shortwaveRadiation'])
new_df_filter.round(1)


# Normalize the features
# Load the scalers from disk
scaler_X = joblib.load('scaler_X.pkl')
scaler_y = joblib.load('scaler_y.pkl')

X_normalized = scaler_X.transform(new_df_filter)

# Predict using the trained model
y_pred_scaled = model.predict(X_normalized)

# Inverse transform the predicted values to get them back to the original scale
y_pred = scaler_y.inverse_transform(y_pred_scaled)

# Display the first few rows of the data
print(y_pred)

# Query for pushing new data to future price table

# Close the connection
conn.close()