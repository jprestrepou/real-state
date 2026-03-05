import sqlite3

try:
    conn = sqlite3.connect('pms_dev.db')
    cursor = conn.cursor()
    cursor.execute('PRAGMA foreign_keys=off;')

    # 1. Get old schema
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='bank_accounts'")
    schema = cursor.fetchone()[0]
    print('Old schema:', schema)

    # 2. Create new temp table
    new_schema = """CREATE TABLE bank_accounts_new (
        id VARCHAR(36) NOT NULL, 
        account_name VARCHAR(200) NOT NULL, 
        account_type VARCHAR(10) NOT NULL, 
        bank_name VARCHAR(100), 
        account_number VARCHAR(50), 
        currency VARCHAR(3) NOT NULL, 
        current_balance NUMERIC(15, 2) NOT NULL, 
        is_active BOOLEAN NOT NULL, 
        created_at DATETIME DEFAULT (CURRENT_TIMESTAMP) NOT NULL, 
        PRIMARY KEY (id)
    )"""
    cursor.execute(new_schema)

    # 3. Copy data
    cursor.execute("""
        INSERT INTO bank_accounts_new 
        (id, account_name, account_type, bank_name, account_number, currency, current_balance, is_active, created_at) 
        SELECT id, account_name, account_type, bank_name, account_number, currency, current_balance, is_active, created_at 
        FROM bank_accounts
    """)

    # 4. Drop old, rename new
    cursor.execute('DROP TABLE bank_accounts')
    cursor.execute('ALTER TABLE bank_accounts_new RENAME TO bank_accounts')
    
    # 5. Re-enable FKs and commit
    cursor.execute('PRAGMA foreign_keys=on;')
    conn.commit()
    print('Migration successful.')

except Exception as e:
    print('Failed:', e)
finally:
    conn.close()
