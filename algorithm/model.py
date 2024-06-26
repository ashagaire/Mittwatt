import sqlite3
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import load_model
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam


# Load the model
model = load_model('electricity_price_model.h5')

# Connect to the SQLite database
conn = sqlite3.connect("../prisma/db.sqlite")

# Query recent new feature with target dataset
query = "SELECT * FROM HistoricalElectricityWeather LIMIT 500 "
data = pd.read_sql_query(query, conn)

# Select specific columns using .filter
X = data.filter(['temperature', 'precipitation', 'weatherCodeId', 'cloudCover', 'windSpeed10m', 'shortwaveRadiation'])
y=data.filter(['price'])

#renaming columns name because of imported scaler.pkl
X.columns = ['temperature_2m', 'precipitation', 'weather_code', 'cloud_cover', 'wind_speed_10m', 'shortwave_radiation']

# Normalize the features
# Load the scalers from disk
scaler_X = joblib.load('scaler_X.pkl')
scaler_y = joblib.load('scaler_y.pkl')

X_normalized = scaler_X.transform(X)
y_normalize = scaler_y.transform(y.values.reshape(-1, 1))

# Step 3: Retrain the model on the new data
# Adjust the batch_size and epochs as needed
model.fit(X_normalized, y_normalize, batch_size=32, epochs=100, validation_split=0.2)

# Step 4: Save the updated model
model.save('updated_electricity_price_model.h5')

# Close the connection
conn.close()