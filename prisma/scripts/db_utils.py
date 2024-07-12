import psycopg2
import logging
from psycopg2 import sql


def connect_to_db(conn_params):
    try:
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor()
        logging.info('Database connection established')
        return conn, cur
    except psycopg2.Error as error:
        logging.error(f'Error occured - {error}')
        return None, None


def is_database_empty(cur, table_list):
    try:
        logging.info('Checking whether there is data in the database...')
        for table in table_list:
            cur.execute(sql.SQL(f'SELECT count(1) FROM "{table}";'))
            result = cur.fetchone()[0]
            if result != 0:
                return False
        return True
    except Exception as e:
        logging.error(f'Failed to check if the database is empty: {e}')


def delete_data_from_table(conn, cur, table_list):
    for table in table_list:
        cur.execute(sql.SQL(f'DELETE FROM "{table}";'))
        logging.info(f'The data has been deleted from {table}')
        conn.commit()
