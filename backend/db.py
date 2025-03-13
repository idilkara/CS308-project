import psycopg2
import os
from flask import g
from psycopg2 import OperationalError

def get_db_connection():
    # If a connection is not already created, create one
    if 'db' not in g or g.db.closed != 0:  # Check if the connection is closed
        retries = 0
        max_retries = 5
        retry_interval = 2  # Retry interval in seconds
        
        while retries < max_retries:
            try:
                # Reconnect to the database if the connection is closed or doesn't exist
                g.db = psycopg2.connect(
                    host="db",
                    database=os.getenv('POSTGRES_DB'),
                    user=os.getenv('POSTGRES_USER'),
                    password=os.getenv('POSTGRES_PASSWORD')
                )
                print("Successfully connected to the database.")
                return g.db

            except OperationalError as e:
                # If the connection fails, retry a few times
                print(f"Connection failed (attempt {retries + 1}/{max_retries}): {str(e)}")
                retries += 1
                if retries < max_retries:
                    time.sleep(retry_interval)  # Wait before retrying
                else:
                    # If max retries reached, raise an exception
                    print("Max retries reached. Could not connect to the database.")
                    raise e

    return g.db
