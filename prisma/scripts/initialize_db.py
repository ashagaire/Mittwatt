from scripts.db_utils import connect_to_db, is_database_empty, delete_data_from_table
from scripts.data_insertion import insert_data_dim_table, insert_data_fact_table
from scripts.api_data import get_archive_weather, get_current_and_forecast_weather, get_elec_archive, get_elec_tomorrow
from scripts.initialize_date_df import initialize_date_dataframe
import logging
from datetime import date, datetime, timedelta
import pandas as pd

def initilize_database():
    try:
        conn_mw, cursor_mw = connect_to_db('./db.sqlite') # if None it doesn't work
        if not is_database_empty(cursor_mw, ['WeatherCode', 'SubscriptionType', 'CalendarDate', 'HistoricalElectricityWeather']):
            logging.info('The database is not empty. The data has been deleted and refilled.')
            delete_data_from_table(conn_mw, cursor_mw, ['WeatherCode', 'SubscriptionType', 'CalendarDate', 'HistoricalElectricityWeather'])
        #populate weather_code table
        insert_data_dim_table(
            conn_mw,
            cursor_mw,
            'WeatherCode',
            'id, descriptionCode', 
            './source_data/weather_code.csv'
        )
        #populate subscription_type table
        insert_data_dim_table(
            conn_mw,
            cursor_mw,
            'SubscriptionType',
            'id, descriptionSubscription', 
            './source_data/subscription_types.csv'
        )
        #create date dataframe
        date_df = initialize_date_dataframe('2022-01-01', '2024-12-31', 'h')
        # Save to SQLite database
        insert_data_dim_table(
            conn_mw,
            cursor_mw,
            'CalendarDate',
            'dateValue, year, quarter, month, day, hour, dayOfWeek, dayName, monthName, yearMonth', 
            date_df
        )
        #get historical weather data
        weather_archive_df = get_archive_weather(
            expire_after = -1, 
            retries =5, 
            backoff_factor = 0.2,
            url = "https://archive-api.open-meteo.com/v1/archive", 
            latitude = 64, 
            longitude = 26, 
            start_date = "2022-01-01",
            end_date = (date.today() - timedelta(days = 5)).strftime("%Y-%m-%d"),
            timezone = "auto", 
        )
        #get current and forecast weather data for the nex 14 days
        weather_current_and_forecast = get_current_and_forecast_weather(
            expire_after = 3600, 
            retries =5, 
            backoff_factor = 0.2,
            url = "https://api.open-meteo.com/v1/forecast", 
            latitude = 64, 
            longitude = 26, 
            past_days = 4,
            forecast_days = 14,
            timezone = "auto",
        )
        elec_archive_data = get_elec_archive("https://porssisahko.net/api/internal/excel-export", "2022-01-01 00:00:00")
        weather_elec_df = pd.concat([weather_archive_df, weather_current_and_forecast], axis=0, ignore_index=True)
        weather_elec_df['price'] = weather_elec_df['date_value'].map(elec_archive_data['price'])
        insert_data_fact_table(conn_mw, cursor_mw, 'HistoricalElectricityWeather', 'dateId, temperature, precipitation, weatherCodeId, cloudCover, windSpeed10m, shortwaveRadiation, price, createdDate, modifiedDate', weather_elec_df)
        logging.info('Database has been populated succesfully')
    except Exception as e:
        logging.error(f'Exception occured - {e}')

    