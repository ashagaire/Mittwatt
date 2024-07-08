from scripts.db_utils import connect_to_db
from scripts.api_data import get_elec_archive, get_elec_tomorrow, get_current_and_forecast_weather
from scripts.data_insertion import insert_data_fact_table
from datetime import datetime, timedelta
import logging

def update_database():
    conn_mw, cursor_mw = connect_to_db('./db.sqlite') # if None it doesn't work
    today = datetime.today()
    weekday = today.weekday()
    if weekday == 0: # Monday
        date_to_fetch = (today - timedelta(days=2)).replace(hour=0, minute=0, second=0, microsecond=0)
        days = 2
        elec_df = get_elec_archive("https://porssisahko.net/api/internal/excel-export", date_to_fetch)
    else:
        date_to_fetch = today.replace(hour=0, minute=0, second=0, microsecond=0)
        days = 0
        elec_df = get_elec_tomorrow("https://api.porssisahko.net/v1/latest-prices.json", date_to_fetch)
        elec_df.set_index('startDate', inplace=True)
    #get current and forecast weather data for the nex 14 days
    weather_current_and_forecast = get_current_and_forecast_weather(
            expire_after = 3600, 
            retries =5, 
            backoff_factor = 0.2,
            url = "https://api.open-meteo.com/v1/forecast", 
            latitude = 64, 
            longitude = 26, 
            past_days = days,
            forecast_days = 14,
            timezone = "auto",
        )
    weather_current_and_forecast = weather_current_and_forecast[weather_current_and_forecast['date_value'] > date_to_fetch].reset_index(drop=True)
    weather_current_and_forecast['price'] = weather_current_and_forecast['date_value'].map(elec_df['price'])
    insert_data_fact_table(conn_mw, cursor_mw, 'HistoricalElectricityWeather', 'dateId, temperature, precipitation, weatherCodeId, cloudCover, windSpeed10m, shortwaveRadiation, price, createdDate, modifiedDate', weather_current_and_forecast)
    logging.info(f'Database has been updated succesfully from {date_to_fetch}')