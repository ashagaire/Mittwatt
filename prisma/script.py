from retry_requests import retry
from datetime import date, datetime, timedelta
import sqlite3
import openmeteo_requests
import requests_cache
import pandas as pd
import numpy as np
import requests
import pytz
import logging
import schedule
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("database_population.log"),
    ]
)

def get_last_modified_date(cursor):
    cursor.execute('SELECT ModifiedDate from HistoricalElectricityWeather ORDER BY ModifiedDate DESC LIMIT 1;')
    last_modifiedDate = cursor.fetchone()[0]
    date_obj = datetime.strptime(last_modifiedDate, "%Y-%m-%d %H:%M:%S")
    now = datetime.now()
    difference = now - date_obj
    return difference.days, date_obj

def get_historical_elec_prices(url_source, start_date):
    """
    Downloads data from API and saves it to a file.
    """
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
    start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    try:
        response = requests.get(url_source)
        if response.status_code == 200:
            with open('downloaded_file.xlsx', 'wb') as file:
                file.write(response.content)
            downloaded_df = pd.read_excel('downloaded_file.xlsx', skiprows=3)
            downloaded_df = downloaded_df.rename(columns={'Aika': 'date_value', 'Hinta (snt/kWh)': 'price'})
            downloaded_df = downloaded_df.drop_duplicates(keep='first', subset=['date_value'], ignore_index=True)
            downloaded_df['date_value'] = pd.to_datetime(downloaded_df['date_value'], format="%Y-%m-%d %H:%M", errors='coerce')
            downloaded_df['date_value'] = downloaded_df['date_value'].apply(truncate_to_midnight)
            downloaded_df = downloaded_df[downloaded_df['date_value'] >= start_date].reset_index(drop=True)
            return downloaded_df
        else:
            logging.error('Failed to download the file. Status code:', response.status_code)
    except Exception as e:
        logging.error(f"Failed to fetch data from this {url_source}: {e}")

def get_today_tomorrow_elec_prices(url, date_today):
    """
    Get tomorrow electricity prices from API
    """
    finland_tz = pytz.timezone('Europe/Helsinki')
    try:
        response = requests.get(url)
        if response.status_code == 200:
            today_tomorrow_elec_prices_json = response.json()
            today_tomorrow_elec_prices = pd.DataFrame.from_records(today_tomorrow_elec_prices_json['prices'], columns=['price', 'startDate'])
            today_tomorrow_elec_prices['startDate'] = pd.to_datetime(today_tomorrow_elec_prices['startDate'], errors='coerce').dt.tz_convert(finland_tz)
            today_tomorrow_elec_prices['startDate'] = pd.to_datetime(today_tomorrow_elec_prices['startDate'], format="%Y-%m-%d %H:%M:%S", errors='coerce').dt.tz_localize(None)
            today_tomorrow_elec_prices = today_tomorrow_elec_prices[today_tomorrow_elec_prices['startDate'] > date_today].reset_index(drop=True)
            return today_tomorrow_elec_prices
        else:
            raise Exception(f"Failed to fetch tomorrow electricity prices. Status code: {response.status_code}")
    except Exception as e:
        logging.error(f"Error fetching tomorrow electricity prices: {e}")

def insert_data_weather_and_elec(table_name, table_columns, url, weather_data, cursor, conn, start_date ='2022-01-01 00:00:00'):
    """
    Inserts data from a DataFrame into SQLite fact table
    """
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    date_today = datetime.now().replace(hour=00, minute=0, second=0)
    if 'excel-export' in url:
        elec_prices = get_historical_elec_prices('https://porssisahko.net/api/internal/excel-export', start_date)
        elec_prices.set_index('date_value', inplace=True)
    else:
        elec_prices = get_today_tomorrow_elec_prices(url, date_today)
        elec_prices.set_index('startDate', inplace=True)
        weather_data = weather_data[weather_data['date_value'] > date_today].reset_index(drop=True)
    weather_data['created'] = now
    weather_data['modified'] = now
    weather_data['price'] = weather_data['date_value'].map(elec_prices['price'])
    columns_list = table_columns.split(", ")
    placeholders = ", ".join(["?" for _ in range(len(columns_list))])
    update_columns = ", ".join([f"{col}=excluded.{col}" for col in columns_list if col not in ("dateId", "createdDate")])
    query = f'''
    INSERT INTO {table_name} ({table_columns})
    VALUES ({placeholders})
    ON CONFLICT(dateId) DO UPDATE SET {update_columns};
    '''
    try:
        for _, row in weather_data.iterrows():
            cursor.execute('SELECT id FROM CalendarDate WHERE dateValue = ?;', (str(row['date_value']),))
            date_id = cursor.fetchone()[0]
            row = list(row)[1:]
            row.insert(0, date_id)
            cursor.execute(query, tuple(row))    
        conn.commit()
    except Exception as e:
        logging.error(f"Error inserting data into {table_name}: {e}")

def truncate_to_midnight(dt: datetime) -> datetime:
    dt = dt + timedelta(hours=1)
    return dt.replace(minute=0, second=0, microsecond=0)

def insert_data_dim_table(table_name, table_columns, data, cursor, conn):
    """
    Inserts data from a DataFrame into SQLite dimension table
    """
    cursor.execute(f'SELECT count(1) from {table_name};')
    if cursor.fetchone()[0] != 0:
        cursor.execute(f'DELETE FROM {table_name};')
        conn.commit()
    if isinstance(data, str):
        data = pd.read_csv(data, sep=';', header=None)
    placeholders = ", ".join(["?" for _ in range(len(table_columns.split(",")))])
    query = f'INSERT INTO {table_name} ({table_columns}) VALUES ({placeholders});'
    try:
        cursor.executemany(query, data.values.tolist())   
        conn.commit()
    except Exception as e:
        logging.error(f"Error inserting data into {table_name}: {e}")

def initialize_date_dataframe(start_date, end_date, freq):
    """
    Initialize date dataFrame
    """
    date_range = pd.date_range(start=start_date, end=end_date, freq=freq)
    dates_df = pd.DataFrame({
            'date_value': date_range.strftime('%Y-%m-%d %H:%M:%S'),
            'year': date_range.year,
            'quarter': date_range.quarter,
            'month': date_range.month,
            'day': date_range.day,
            'hour': date_range.hour,
            'day_of_week': date_range.dayofweek,
            'day_name': date_range.strftime('%A'),
            'month_name': date_range.strftime('%B'),
            'year_month': date_range.strftime('%Y-%m')
        })
    return dates_df

def get_weather_data(expire_after, 
                     retries, 
                     backoff_factor,
                     url, 
                     latitude, 
                     longitude,
                     timezone = "auto",
                     start_date = None,
                     end_date = None,
                     past_days = None,
                     forecast_days = None
                     ):
    """
    Retrieves weather data from an API and returns it as a pandas DataFrame.
    """
    try:
        cache_session = requests_cache.CachedSession('.cache', expire_after = expire_after)
        retry_session = retry(cache_session, retries = retries, backoff_factor = backoff_factor)
        openmeteo = openmeteo_requests.Client(session = retry_session)
        if 'archive' in url:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "start_date": start_date,
                timezone: timezone,
                "end_date": end_date,
                "hourly": ["temperature_2m", "precipitation", "weather_code", "cloud_cover", "wind_speed_10m", "shortwave_radiation"]
            }
        else:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "hourly": ["temperature_2m", "precipitation", "weather_code", "cloud_cover", "wind_speed_10m", "shortwave_radiation"],
                timezone: timezone,
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
        hourly_data['price'] = np.NaN
        hourly_dataframe = pd.DataFrame(data = hourly_data)
        return hourly_dataframe
    except Exception as e:
        logging.error(f"Error fetching data from {url}: {e}")
        return pd.DataFrame()

def delete_data_from_table (table_list, cur, conn):
    for table in table_list:
        cur.execute(f'DELETE FROM {table};')
        conn.commit()

def is_database_empty(cur):
    cur.execute('SELECT count(1) FROM HistoricalElectricityWeather;')
    result = cur.fetchone()[0]
    return result == 0

def initialize_database():
    """
    Initializes the database and populates it with initial data if empty.
    """
    try:
        sqliteConnection = sqlite3.connect('db.sqlite')
        cursor = sqliteConnection.cursor()
        logging.info('Database connection established')
        if not is_database_empty(cursor):
            logging.info('The database is not empty. The data has been deleted and refilled.')
            delete_data_from_table(['WeatherCode', 'SubscriptionType', 'CalendarDate', 'HistoricalElectricityWeather'], cursor, sqliteConnection)
        logging.info('Database is empty. The database will be populated')
        #populate weather_code table
        insert_data_dim_table(
            'WeatherCode',
            'id, descriptionCode', 
            'weather_code.csv', 
            cursor, 
            sqliteConnection
        )
        #populate subscription_type table
        insert_data_dim_table(
            'SubscriptionType',
            'id, descriptionSubscription', 
            'subscription_types.csv', 
            cursor, 
            sqliteConnection
        )
        #create date dataframe
        date_df = initialize_date_dataframe('2022-01-01', '2024-12-31', 'h')
        # Save to SQLite database
        insert_data_dim_table(
            'CalendarDate',
            'dateValue, year, quarter, month, day, hour, dayOfWeek, dayName, monthName, yearMonth', 
            date_df, 
            cursor, 
            sqliteConnection
        )
        #get historical weather data
        weather_archive_df = get_weather_data(
            expire_after = -1, 
            retries =5, 
            backoff_factor = 0.2,
            timezone = "auto", 
            url = "https://archive-api.open-meteo.com/v1/archive", 
            latitude = 64, 
            longitude = 26, 
            start_date = "2022-01-01",
            end_date = (date.today() - timedelta(days = 5)).strftime("%Y-%m-%d")
        )
        #get current and forecast weather data for the nex 14 days
        weather_current_and_forecast = get_weather_data(
            expire_after = 3600, 
            retries =5, 
            backoff_factor = 0.2,
            timezone = "auto",
            url = "https://api.open-meteo.com/v1/forecast", 
            latitude = 64, 
            longitude = 26, 
            past_days = 4,
            forecast_days = 14
        )
        # Concatenate historical and current/forecast weather data
        weather_df = pd.concat([weather_archive_df, weather_current_and_forecast], axis=0, ignore_index=True)
        # Save data to SQLite table
        insert_data_weather_and_elec(
            'HistoricalElectricityWeather',
            'dateId, temperature, precipitation, weatherCodeId, cloudCover, windSpeed10m, shortwaveRadiation, price, createdDate, modifiedDate',
            'https://porssisahko.net/api/internal/excel-export',
            weather_df,
            cursor,
            sqliteConnection
        )
        sqliteConnection.close()
    except sqlite3.Error as error:
        logging.error('Error occurred - ', error)

def update_database():
    try:
        sqliteConnection = sqlite3.connect('db.sqlite')
        cursor = sqliteConnection.cursor()
        last_modified_day = get_last_modified_date(cursor)
        logging.info(f'New data from {last_modified_day} will be added to the database.')
        weather_forecast_update = get_weather_data(
            expire_after = 3600, 
            retries =5, 
            backoff_factor = 0.2,
            timezone = "auto",
            url = "https://api.open-meteo.com/v1/forecast", 
            latitude = 64, 
            longitude = 26, 
            past_days = last_modified_day[0],
            forecast_days = 14
        )
        if last_modified_day[0] >= 2:                
            insert_data_weather_and_elec(
            'HistoricalElectricityWeather',
            'dateId, temperature, precipitation, weatherCodeId, cloudCover, windSpeed10m, shortwaveRadiation, price, createdDate, modifiedDate',
            'https://porssisahko.net/api/internal/excel-export',
            weather_forecast_update,
            cursor,
            sqliteConnection,
            last_modified_day[1]
            )
        else:   
            insert_data_weather_and_elec(
                'HistoricalElectricityWeather',
                'dateId, temperature, precipitation, weatherCodeId, cloudCover, windSpeed10m, shortwaveRadiation, price, createdDate, modifiedDate',
                'https://api.porssisahko.net/v1/latest-prices.json',
                weather_forecast_update,
                cursor,
                sqliteConnection
            )        
        sqliteConnection.close()
    except sqlite3.Error as error:
        logging.error('Error occurred - ', error)

def job():
    logging.info("First start...")
    initialize_database()

def scheduled_job():
    logging.info("Running sheduled job...")
    update_database()

# Run the job immediately
job()

# Schedule the job every weekday at 15:00 (3 PM)
schedule.every().monday.at("15:00").do(update_database)
schedule.every().tuesday.at("15:00").do(update_database)
schedule.every().wednesday.at("15:00").do(update_database)
schedule.every().thursday.at("15:00").do(update_database)
schedule.every().friday.at("15:00").do(update_database)

while True:
    schedule.run_pending()
    time.sleep(1)



