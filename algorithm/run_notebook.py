import schedule
import time
import os
from datetime import datetime
import pytz

def run_notebook():
    # Path to your Jupyter Notebook
    notebook_path = 'prediction.ipynb'
    # Command to convert the notebook to a script and execute it
    os.system(f'jupyter nbconvert --to notebook --execute {notebook_path} --output {notebook_path}')

# Define timezone
europe_helsinki = pytz.timezone('Europe/Helsinki')

# Schedule the notebook to run every weekday at 4 PM in Europe/Helsinki timezone
schedule.every().monday.at("16:00").do(run_notebook).tag('notebook')
schedule.every().tuesday.at("16:00").do(run_notebook).tag('notebook')
schedule.every().wednesday.at("16:00").do(run_notebook).tag('notebook')
schedule.every().thursday.at("16:00").do(run_notebook).tag('notebook')
schedule.every().friday.at("16:00").do(run_notebook).tag('notebook')

# Function to convert time to Europe/Helsinki timezone
def convert_to_helsinki_time(dt):
    return dt.astimezone(europe_helsinki)


while True:
    now = datetime.now()
    current_time = convert_to_helsinki_time(now)
    print(f"Scheduled tasks for {current_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")

    schedule.run_pending()
    time.sleep(60)  # wait one minute