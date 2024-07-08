
import schedule
import time
import logging
from scripts.initialize_db import initilize_database
from scripts.update_db import update_database


#setup logging
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("./logs/database.log"),
    ]
)

# first start
def job():
    logging.info("First start...")
    initilize_database()


# running scheduled job
def scheduled_job():
    logging.info("Running scheduled job...")
    update_database()

# run job immediately
job()

# Schedule the job every weekday at 15:00 (3 PM)
schedule.every().monday.at("15:00").do(scheduled_job)
schedule.every().tuesday.at("15:00").do(scheduled_job)
schedule.every().wednesday.at("15:00").do(scheduled_job)
schedule.every().thursday.at("15:00").do(scheduled_job)
schedule.every().friday.at("15:00").do(scheduled_job)

while True:
    schedule.run_pending()
    time.sleep(1)

