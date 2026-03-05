import sqlite3

try:
    conn = sqlite3.connect('pms_dev.db')
    cursor = conn.cursor()
    cursor.execute('ALTER TABLE budgets ADD COLUMN month INTEGER NOT NULL DEFAULT 1;')
    conn.commit()
    print('Migration successful. Column month added to budgets.')
except Exception as e:
    print('Failed:', e)
finally:
    conn.close()
