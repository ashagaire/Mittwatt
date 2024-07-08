import openmeteo_requests
import requests_cache
from retry_requests import retry
import pandas as pd
import logging
from datetime import datetime
import requests
from scripts.truncate_to_midhight import truncate_to_midnight
import pytz

def get_archive_weather(expire_after, 
                     retries, 
                     backoff_factor,
                     url, 
                     latitude,
                     longitude,
                     start_date,
                     end_date,
                     timezone = "auto"
                     ):
    """
    Retrieves weather data from an API and returns it as a pandas DataFrame.
    """
    try:
        cache_session = requests_cache.CachedSession('.cache', expire_after = expire_after)
        retry_session = retry(cache_session, retries = retries, backoff_factor = backoff_factor)
        openmeteo = openmeteo_requests.Client(session = retry_session)
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "timezone": timezone,
            "end_date": end_date,
            "hourly": ["temperature_2m", "precipitation", "weather_code", "cloud_cover", "wind_speed_10m", "shortwave_radiation"]
        }
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
        hourly = response.Hourly()
        hourly_data = {"date_value": pd.date_range(
            start = pd.to_datetime(hourly.Time(), unit='s', utc = True).strftime("%Y-%m-%d %H:%M:%S"),
            end = pd.to_datetime(hourly.TimeEnd(),  unit='s', utc = True).strftime("%Y-%m-%d %H:%M:%S"),
            freq = pd.Timedelta(seconds = hourly.Interval(), unit='h'),
            inclusive = "left"
        )}
        hourly_data["temperature_2m"] = hourly.Variables(0).ValuesAsNumpy()
        hourly_data["precipitation"] = hourly.Variables(1).ValuesAsNumpy()
        hourly_data["weather_code"] = hourly.Variables(2).ValuesAsNumpy()
        hourly_data["cloud_cover"] = hourly.Variables(3).ValuesAsNumpy()
        hourly_data["wind_speed_10m"] = hourly.Variables(4).ValuesAsNumpy()
        hourly_data["shortwave_radiation"] = hourly.Variables(5).ValuesAsNumpy()
        hourly_dataframe = pd.DataFrame(data = hourly_data)
        hourly_dataframe = hourly_dataframe[hourly_dataframe['date_value'] >= start_date].reset_index(drop=True)
        logging.info(f'Archive weather data has been received')
        return hourly_dataframe
    except Exception as e:
        logging.error(f"Error fetching data from {url}: {e}")
        return pd.DataFrame()

def get_current_and_forecast_weather(expire_after, 
                    retries, 
                    backoff_factor,
                    url, 
                    latitude, 
                    longitude,
                    past_days,
                    forecast_days,
                    timezone = "auto"):
    """
    Retrieves weather data from an API and returns it as a pandas DataFrame.
    """
    try:
        cache_session = requests_cache.CachedSession('.cache', expire_after = expire_after)
        retry_session = retry(cache_session, retries = retries, backoff_factor = backoff_factor)
        openmeteo = openmeteo_requests.Client(session = retry_session)
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ["temperature_2m", "precipitation", "weather_code", "cloud_cover", "wind_speed_10m", "shortwave_radiation"],
            "timezone": timezone,
            "past_days": past_days,
            "forecast_days": forecast_days
        }
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
        hourly = response.Hourly()
        hourly_data = {"date_value": pd.date_range(
            start = pd.to_datetime(hourly.Time(), unit='s', utc = True).strftime("%Y-%m-%d %H:%M:%S"),
            end = pd.to_datetime(hourly.TimeEnd(),  unit='s', utc = True).strftime("%Y-%m-%d %H:%M:%S"),
            freq = pd.Timedelta(seconds = hourly.Interval(), unit='h'),
            inclusive = "left"
        )}
        hourly_data["temperature_2m"] = hourly.Variables(0).ValuesAsNumpy()
        hourly_data["precipitation"] = hourly.Variables(1).ValuesAsNumpy()
        hourly_data["weather_code"] = hourly.Variables(2).ValuesAsNumpy()
        hourly_data["cloud_cover"] = hourly.Variables(3).ValuesAsNumpy()
        hourly_data["wind_speed_10m"] = hourly.Variables(4).ValuesAsNumpy()
        hourly_data["shortwave_radiation"] = hourly.Variables(5).ValuesAsNumpy()
        hourly_dataframe = pd.DataFrame(data = hourly_data)
        logging.info(f'Current and forecast weather data has been received')
        return hourly_dataframe
    except Exception as e:
        logging.error(f"Error fetching data from {url}: {e}")
        return pd.DataFrame()

def get_elec_archive(url_source, start_date):
    """
    Downloads data from API and saves it to a file.
    """
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
    try:
        response = requests.get(url_source)
        if response.status_code == 200:
            with open('./source_data/downloaded_file.xlsx', 'wb') as file:
                file.write(response.content)
            downloaded_df = pd.read_excel('./source_data/downloaded_file.xlsx', skiprows=3)
            downloaded_df = downloaded_df.rename(columns={'Aika': 'date_value', 'Hinta (snt/kWh)': 'price'})
            downloaded_df = downloaded_df.drop_duplicates(keep='first', subset=['date_value'], ignore_index=True)
            downloaded_df['date_value'] = pd.to_datetime(downloaded_df['date_value'], format="%Y-%m-%d %H:%M", errors='coerce')
            downloaded_df['date_value'] = downloaded_df['date_value'].apply(truncate_to_midnight)
            downloaded_df = downloaded_df[downloaded_df['date_value'] > start_date].reset_index(drop=True)
            downloaded_df.set_index('date_value', inplace=True)
            logging.info('Archive electricity data has been received')
            return downloaded_df
        else:
            logging.error('Failed to download the file. Status code:', response.status_code)
    except Exception as e:
        logging.error(f"Failed to fetch data from this {url_source}: {e}")


def get_elec_tomorrow(url, start_date):
    """
    Get tomorrow electricity prices from API
    """
    try:
        response = requests.get(url)
        if response.status_code == 200:
            today_tomorrow_elec_prices_json = response.json()
            today_tomorrow_elec_prices = pd.DataFrame.from_records(today_tomorrow_elec_prices_json['prices'], columns=['price', 'startDate'])
            today_tomorrow_elec_prices['startDate'] = pd.to_datetime(today_tomorrow_elec_prices['startDate'], errors='coerce').dt.tz_convert(pytz.timezone('Europe/Helsinki'))
            today_tomorrow_elec_prices['startDate'] = pd.to_datetime(today_tomorrow_elec_prices['startDate'], format="%Y-%m-%d %H:%M:%S", errors='coerce').dt.tz_localize(None)
            today_tomorrow_elec_prices = today_tomorrow_elec_prices[today_tomorrow_elec_prices['startDate'] > start_date].reset_index(drop=True)
            logging.info('Tomorrow electricity data has been received')
            return today_tomorrow_elec_prices
        else:
            raise Exception(f"Failed to fetch tomorrow electricity prices. Status code: {response.status_code}")
    except Exception as e:
        logging.error(f"Error fetching tomorrow electricity prices: {e}")