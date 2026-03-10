import sqlite3
import os

db_path = "pms_dev.db"
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(bank_accounts)")
    columns = cursor.fetchall()
    print("Columns in bank_accounts:")
    for col in columns:
        print(col)
    conn.close()
