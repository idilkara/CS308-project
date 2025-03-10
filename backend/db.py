import psycopg2
from flask import current_app, g
import os

def get_db_connection():
    if 'db' not in g:
        g.db = psycopg2.connect(
        host="db",
        database=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD')
    )
    return g.db