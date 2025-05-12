
'use server';

import { open, Database as SQLiteDatabase } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { format, parse } from 'date-fns';

const DB_FILE_PATH = path.join(process.cwd(), 'pocketledger.db');

let dbInstance: SQLiteDatabase | null = null;

declare global {
  var __dbPromise: Promise<SQLiteDatabase> | undefined;
}

const initializeDatabase = async (db: SQLiteDatabase): Promise<void> => {
  console.log("Ensuring database schema...");
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      notes TEXT
    )
  `);
  console.log("'transactions' table schema ensured.");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT NOT NULL
    )
  `);
  console.log("'users' table schema ensured.");
};


const getDbInstance = async (): Promise<SQLiteDatabase> => {
  if (process.env.NODE_ENV === 'development') {
    if (!globalThis.__dbPromise) {
      console.log("DEV: Creating new database initialization promise.");
      globalThis.__dbPromise = open({
        filename: DB_FILE_PATH,
        driver: sqlite3.Database,
      }).then(async (db) => {
        console.log('DEV: Database opened successfully.');
        await db.run('PRAGMA journal_mode = WAL;').catch(walError => console.warn('DEV: Failed to enable WAL mode.', walError));
        await initializeDatabase(db);
        return db;
      }).catch(err => {
        console.error("DEV: Database initialization failed, clearing promise.", err);
        globalThis.__dbPromise = undefined;
        throw err;
      });
    }
    console.log("DEV: Returning/awaiting database promise from globalThis.");
    return globalThis.__dbPromise;
  } else {
    if (!dbInstance) {
      console.log("PROD: Initializing new database instance.");
      try {
        const db = await open({
          filename: DB_FILE_PATH,
          driver: sqlite3.Database,
        });
        console.log('PROD: Database opened successfully.');
        await db.run('PRAGMA journal_mode = WAL;').catch(walError => console.warn('PROD: Failed to enable WAL mode.', walError));
        await initializeDatabase(db);
        dbInstance = db;
      } catch (error) {
        console.error("PROD: Database initialization failed.", error);
        dbInstance = null;
        throw error;
      }
    }
    if (!dbInstance) {
      throw new Error("Database instance is not available in production.");
    }
    console.log("PROD: Returning existing database instance.");
    return dbInstance;
  }
};


export const addTransactionToDb = async (date: string, category: string, amount: number, type: 'income' | 'expense', notes?: string) => {
  let db: SQLiteDatabase;
  try {
    db = await getDbInstance();
  } catch (initError: any) {
    console.error('Failed to get DB instance in addTransactionToDb:', initError);
    throw new Error(`Database connection error: ${initError.message}`);
  }

  try {
    const result = await db.run(
      'INSERT INTO transactions (date, category, amount, type, notes) VALUES (?, ?, ?, ?, ?)',
      date,
      category,
      amount,
      type,
      notes || null
    );
    if (result.lastID === undefined || (typeof result.changes === 'number' && result.changes === 0)) {
        console.error('Transaction insert failed or made no changes.', result);
        throw new Error('Insert operation reported 0 rows affected or lastID is undefined.');
    }
    console.log(`Transaction added. Last ID: ${result.lastID}, Changes: ${result.changes}`);
  } catch (insertError: any) {
    console.error('Error inserting transaction:', insertError);
    throw new Error(`Failed to insert transaction: ${insertError.message}`);
  }
};

export const updateTransactionInDb = async (id: number, date: string, category: string, amount: number, type: 'income' | 'expense', notes?: string) => {
  let db: SQLiteDatabase;
  try {
    db = await getDbInstance();
  } catch (initError: any) {
    console.error('Failed to get DB instance in updateTransactionInDb:', initError);
    throw new Error(`Database connection error: ${initError.message}`);
  }

  try {
    const result = await db.run(
      'UPDATE transactions SET date = ?, category = ?, amount = ?, type = ?, notes = ? WHERE id = ?',
      date,
      category,
      amount,
      type,
      notes || null,
      id
    );
    if (typeof result.changes === 'number' && result.changes === 0) {
      // This could mean the transaction ID didn't exist, or the data was identical.
      // For simplicity, we'll log a warning but not throw an error if no rows were found/changed.
      // If strict "not found" error is needed, a SELECT check could be done first.
      console.warn(`Update operation for transaction ID ${id} affected 0 rows. ID might not exist or data was unchanged.`);
    } else {
      console.log(`Transaction ID ${id} updated. Rows affected: ${result.changes}`);
    }
  } catch (updateError: any) {
    console.error(`Error updating transaction ID ${id}:`, updateError);
    throw new Error(`Failed to update transaction: ${updateError.message}`);
  }
};


export const deleteTransactionFromDb = async (id: number) => {
  const db = await getDbInstance();
  console.log(`Attempting to delete transaction ID: ${id}`);
  const result = await db.run('DELETE FROM transactions WHERE id = ?', id);
  if (result.changes === 0) {
    console.warn(`No transaction found with ID ${id} to delete.`);
  } else {
    console.log(`Transaction ID ${id} deleted. Rows affected: ${result.changes}`);
  }
};

export const getAllTransactionsFromDb = async () => {
  const db = await getDbInstance();
  const transactionsFromDb: Array<{ id: number; date: string; category: string; amount: number; type: 'income' | 'expense'; notes?: string }> = await db.all(
    'SELECT id, date, category, amount, type, notes FROM transactions ORDER BY date DESC, id DESC'
  );
  return transactionsFromDb.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date),
  }));
};

export const getTotalBalanceFromDb = async (): Promise<number> => {
  const db = await getDbInstance();
  const result = await db.get<{ totalBalance: number }>(
    `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS totalBalance FROM transactions`
  );
  return Number(result?.totalBalance || 0);
};

export const getTotalIncomeFromDb = async (): Promise<number> => {
  const db = await getDbInstance();
  const result = await db.get<{ totalIncome: number }>(
    `SELECT SUM(amount) AS totalIncome FROM transactions WHERE type = 'income'`
  );
  return Number(result?.totalIncome || 0);
};

export const getTotalExpenseFromDb = async (): Promise<number> => {
  const db = await getDbInstance();
  const result = await db.get<{ totalExpense: number }>(
    `SELECT SUM(amount) AS totalExpense FROM transactions WHERE type = 'expense'`
  );
  return Number(result?.totalExpense || 0);
};

export const getSpendingByCategoryFromDb = async (): Promise<{ category: string; total: number }[]> => {
  const db = await getDbInstance();
  const result: Array<{ category: string; total: number }> = await db.all(
    `SELECT category, SUM(amount) AS total FROM transactions WHERE type = 'expense' GROUP BY category ORDER BY total DESC`
  );
  return result.map(item => ({ category: item.category, total: Number(item.total) }));
};

export const backupAndResetAllData = async (): Promise<string> => {
  const db = await getDbInstance();
  const backupTimestamp = format(new Date(), "yyyyMMddHHmmss");
  const backupTransactionsTableName = `transactions_backup_${backupTimestamp}`;
  const backupUsersTableName = `users_backup_${backupTimestamp}`;

  console.log(`Starting backup and reset process. Backup ID: ${backupTimestamp}`);

  try {
    await db.exec('BEGIN TRANSACTION;');

    // Backup transactions table
    let transactionsTableExists = false;
    try {
        const checkTransactions = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions';");
        if (checkTransactions) transactionsTableExists = true;
    } catch (e) { /* table doesn't exist, which is fine */ }

    if (transactionsTableExists) {
        console.log(`Renaming 'transactions' to '${backupTransactionsTableName}'`);
        await db.exec(`ALTER TABLE transactions RENAME TO ${backupTransactionsTableName};`);
    } else {
        console.log("'transactions' table does not exist, skipping rename.");
    }
    
    // Backup users table
    let usersTableExists = false;
    try {
        const checkUsers = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';");
        if (checkUsers) usersTableExists = true;
    } catch (e) { /* table doesn't exist */ }

    if (usersTableExists) {
        console.log(`Renaming 'users' to '${backupUsersTableName}'`);
        await db.exec(`ALTER TABLE users RENAME TO ${backupUsersTableName};`);
    } else {
        console.log("'users' table does not exist, skipping rename.");
    }

    // Re-initialize (create new empty tables)
    console.log("Re-initializing database schema for empty tables.");
    await initializeDatabase(db);

    await db.exec('COMMIT;');
    console.log(`Backup and reset completed successfully. Backup ID: ${backupTimestamp}`);
    return backupTimestamp;
  } catch (error: any) {
    console.error("Error during backup and reset, attempting rollback:", error);
    try {
      await db.exec('ROLLBACK;');
      console.log("Rollback successful.");
    } catch (rbError) {
      console.error("Error during rollback:", rbError);
    }
    throw new Error(`Failed to backup and reset data: ${error.message}`);
  }
};

export const listDatabaseBackups = async (): Promise<string[]> => {
  const db = await getDbInstance();
  console.log("Listing database backups...");
  const tables = await db.all<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'transactions_backup_%';");
  const backupIds = tables
    .map(t => t.name.replace('transactions_backup_', '').replace('users_backup_','')) 
    .filter((value, index, self) => self.indexOf(value) === index) 
    .sort((a, b) => b.localeCompare(a)); 
  console.log(`Found ${backupIds.length} database backups.`);
  return backupIds;
};

export const restoreDatabaseBackup = async (backupId: string): Promise<void> => {
  const db = await getDbInstance();
  const backupTransactionsTableName = `transactions_backup_${backupId}`;
  const backupUsersTableName = `users_backup_${backupId}`;

  console.log(`Attempting to restore database from backup ID: ${backupId}`);

  try {
    await db.exec('BEGIN TRANSACTION;');

    console.log(`Dropping current 'transactions' table if it exists.`);
    await db.exec('DROP TABLE IF EXISTS transactions;');
    
    const backupTransactionsTableExists = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${backupTransactionsTableName}';`);
    if (backupTransactionsTableExists) {
      console.log(`Renaming '${backupTransactionsTableName}' to 'transactions'.`);
      await db.exec(`ALTER TABLE ${backupTransactionsTableName} RENAME TO transactions;`);
    } else {
      console.log(`Backup table '${backupTransactionsTableName}' not found. Re-initializing empty 'transactions' table.`);
      await db.exec(`CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL, type TEXT NOT NULL CHECK(type IN ('income', 'expense')), notes TEXT)`);
    }
    
    console.log(`Dropping current 'users' table if it exists.`);
    await db.exec('DROP TABLE IF EXISTS users;');

    const backupUsersTableExists = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${backupUsersTableName}';`);
    if (backupUsersTableExists) {
      console.log(`Renaming '${backupUsersTableName}' to 'users'.`);
      await db.exec(`ALTER TABLE ${backupUsersTableName} RENAME TO users;`);
    } else {
      console.log(`Backup table '${backupUsersTableName}' not found. Re-initializing empty 'users' table.`);
       await db.exec(`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, password TEXT NOT NULL)`);
    }


    await db.exec('COMMIT;');
    console.log(`Database restoration from backup ID ${backupId} completed successfully.`);
  } catch (error: any) {
    console.error(`Error during database restoration from backup ID ${backupId}, attempting rollback:`, error);
    try {
      await db.exec('ROLLBACK;');
       console.log("Rollback successful.");
    } catch (rbError) {
      console.error("Error during rollback:", rbError);
    }
    throw new Error(`Failed to restore database backup: ${error.message}`);
  }
};

export const deleteDatabaseBackupTables = async (backupId: string): Promise<void> => {
  const db = await getDbInstance();
  const backupTransactionsTableName = `transactions_backup_${backupId}`;
  const backupUsersTableName = `users_backup_${backupId}`;

  console.log(`Attempting to delete database backup tables for ID: ${backupId}`);
  try {
    await db.exec('BEGIN TRANSACTION;');
    
    const transactionsBackupExists = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${backupTransactionsTableName}'`);
    if (transactionsBackupExists) {
      await db.exec(`DROP TABLE IF EXISTS ${backupTransactionsTableName};`);
      console.log(`Table ${backupTransactionsTableName} deleted.`);
    } else {
      console.log(`Table ${backupTransactionsTableName} not found, skipping deletion.`);
    }

    const usersBackupExists = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${backupUsersTableName}'`);
    if (usersBackupExists) {
      await db.exec(`DROP TABLE IF EXISTS ${backupUsersTableName};`);
      console.log(`Table ${backupUsersTableName} deleted.`);
    } else {
      console.log(`Table ${backupUsersTableName} not found, skipping deletion.`);
    }
    
    await db.exec('COMMIT;');
    console.log(`Database backup tables for ID ${backupId} deleted successfully.`);
  } catch (error: any) {
    console.error(`Error deleting database backup tables for ID ${backupId}, attempting rollback:`, error);
    try {
      await db.exec('ROLLBACK;');
      console.log("Rollback successful.");
    } catch (rbError) {
      console.error("Error during rollback:", rbError);
    }
    throw new Error(`Failed to delete database backup tables: ${error.message}`);
  }
};


export const isPasswordSet = async (): Promise<boolean> => {
  const db = await getDbInstance();
  try {
    const user = await db.get('SELECT password FROM users WHERE id = 1');
    return !!user && !!user.password;
  } catch (error) {
     console.warn("Error checking if password is set (users table might not exist yet):", error);
     return false; 
  }
};

export const setPassword = async (password: string): Promise<void> => {
  const db = await getDbInstance();
  const user = await db.get('SELECT id FROM users WHERE id = 1');
  if (user) {
    await db.run('UPDATE users SET password = ? WHERE id = 1', password);
  } else {
    await db.run('INSERT INTO users (id, password) VALUES (1, ?)', password);
  }
  console.log('Password set/updated.');
};

export const checkPassword = async (passwordToCheck: string): Promise<boolean> => {
  const db = await getDbInstance();
  const user = await db.get<{ password?: string }>('SELECT password FROM users WHERE id = 1');
  if (user && user.password) {
    return user.password === passwordToCheck;
  }
  return false; 
};
    
