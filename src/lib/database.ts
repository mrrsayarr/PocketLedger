'use server';

import { open, Database as SQLiteDatabase } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), 'pocketledger.db');

// For production, dbInstance will hold the actual SQLiteDatabase object.
let dbInstance: SQLiteDatabase | null = null;

// For development, __dbPromise will hold the promise of the SQLiteDatabase object
// to ensure that HMR doesn't cause multiple initializations or lose the instance.
declare global {
  // eslint-disable-next-line no-var
  var __dbPromise: Promise<SQLiteDatabase> | undefined;
}

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
  console.log("Attempting to open/initialize database at path:", DB_FILE_PATH);
  const db = await open({
    filename: DB_FILE_PATH,
    driver: sqlite3.Database,
  });
  console.log('Database opened successfully.');

  try {
    await db.run('PRAGMA journal_mode = WAL;');
    console.log('WAL mode enabled for the database.');
  } catch (walError) {
    console.warn('Failed to enable WAL mode. This might impact concurrency but is not critical for basic operations.', walError);
  }

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
  console.log("'transactions' table ensured (created without currency column if not exists).");
  
  // Check if 'currency' column exists and remove it if it does (for older DBs)
  try {
    const tableInfo = await db.all(`PRAGMA table_info(transactions);`);
    const columns = tableInfo as Array<{ name: string; [key: string]: any }>;
    const currencyColumnExists = columns.some(column => column.name === 'currency');

    if (currencyColumnExists) {
      console.log("'transactions' table has a 'currency' column. Attempting to remove it by recreating the table.");
      // Recreate table without currency column
      await db.exec('BEGIN TRANSACTION;');
      await db.exec(`
        CREATE TABLE transactions_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          category TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          notes TEXT
        );
      `);
      // Copy data from old table to new table, omitting currency
      await db.exec(`
        INSERT INTO transactions_new (id, date, category, amount, type, notes)
        SELECT id, date, category, amount, type, notes FROM transactions;
      `);
      await db.exec('DROP TABLE transactions;');
      await db.exec('ALTER TABLE transactions_new RENAME TO transactions;');
      await db.exec('COMMIT;');
      console.log("'currency' column removed from 'transactions' table by recreating it.");
    } else {
      console.log("'currency' column does not exist in 'transactions' table or was already removed.");
    }
  } catch (e: any) {
    await db.exec('ROLLBACK;').catch(rbError => console.error("Error rolling back transaction during currency column removal:", rbError));
    console.warn("Could not remove 'currency' column from 'transactions' via table recreation. This might be an issue if the table schema is outdated.", e.message);
  }


  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT NOT NULL
    )
  `);
  console.log("'users' table ensured.");
  
  return db;
};

const getDbInstance = async (): Promise<SQLiteDatabase> => {
  if (process.env.NODE_ENV === 'development') {
    if (!globalThis.__dbPromise) {
      console.log("DEV: Creating new database initialization promise and storing on globalThis.");
      globalThis.__dbPromise = initializeDatabase().catch(err => {
        console.error("DEV: Database initialization failed catastrophically, clearing promise.", err);
        globalThis.__dbPromise = undefined; // Allow re-attempt on next call
        throw err; // Re-throw the error to be caught by the caller
      });
    }
    console.log("DEV: Returning/awaiting database promise from globalThis.");
    return globalThis.__dbPromise;
  } else {
    // Production environment
    if (!dbInstance) {
      console.log("PROD: Initializing new database instance.");
      try {
        dbInstance = await initializeDatabase();
      } catch (error) {
        console.error("PROD: Database initialization failed catastrophically.", error);
        dbInstance = null; // Ensure dbInstance is null if init fails
        throw error; // Re-throw the error
      }
    }
    if (!dbInstance) {
      console.error("PROD: dbInstance is null after initialization attempt. This indicates a persistent issue.");
      throw new Error("Database instance is not available in production after initialization attempt.");
    }
    console.log("PROD: Returning existing database instance.");
    return dbInstance;
  }
};


export const addTransactionToDb = async (date: string, category: string, amount: number, type: 'income' | 'expense', notes?: string) => {
  let db: SQLiteDatabase;
  try {
    db = await getDbInstance();
    console.log('DB instance obtained for addTransactionToDb.');
  } catch (initError: any) {
    console.error('Failed to get DB instance in addTransactionToDb:', initError);
    throw new Error(`Database connection error before adding transaction: ${initError.message}`);
  }

  try {
    console.log('Attempting to insert transaction with data:', { date, category, amount, type, notes });
    const result = await db.run(
      'INSERT INTO transactions (date, category, amount, type, notes) VALUES (?, ?, ?, ?, ?)',
      date,
      category,
      amount,
      type,
      notes || null
    );
    console.log('Transaction insert attempt result (sqlite/driver specific):', result);
    
    if (result.lastID === undefined || (typeof result.changes === 'number' && result.changes === 0)) {
        console.error('Transaction insert operation made no changes or lastID is undefined. This might indicate an issue.', result);
        if (typeof result.changes === 'number' && result.changes === 0) {
          throw new Error('Insert operation reported 0 rows affected. Transaction may not have been saved.');
        }
    }
    console.log(`Transaction added successfully. Last ID: ${result.lastID}, Changes: ${result.changes}`);
  } catch (insertError: any) {
    console.error('Error during db.run for INSERT in addTransactionToDb:', insertError);
    const errorCode = insertError.code ? ` (SQLite Code: ${insertError.code})` : '';
    throw new Error(`Failed to execute insert transaction: ${insertError.message}${errorCode}`);
  }
};

export const deleteTransactionFromDb = async (id: number) => {
  const db = await getDbInstance();
  console.log(`Attempting to delete transaction with ID: ${id}`);
  const result = await db.run('DELETE FROM transactions WHERE id = ?', id);
  if (result.changes === 0) {
    console.warn(`Attempted to delete transaction ID ${id}, but no rows were affected. It might have already been deleted.`);
  } else {
    console.log(`Transaction ID ${id} deleted successfully. Rows affected: ${result.changes}`);
  }
};

export const getAllTransactionsFromDb = async () => {
  const db = await getDbInstance();
  console.log('Fetching all transactions from DB.');
  const transactionsFromDb: Array<{ id: number; date: string; category: string; amount: number; type: 'income' | 'expense'; notes?: string }> = await db.all(
    'SELECT id, date, category, amount, type, notes FROM transactions ORDER BY date DESC, id DESC'
  );
  console.log(`Fetched ${transactionsFromDb.length} transactions.`);
  return transactionsFromDb.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date),
  }));
};

export const getTotalBalanceFromDb = async (): Promise<number> => {
  const db = await getDbInstance();
  console.log(`Calculating total balance.`);
  const result = await db.get<{ totalBalance: number }>(
    `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS totalBalance FROM transactions`
  );
  console.log(`Total balance: ${result?.totalBalance || 0}`);
  return Number(result?.totalBalance || 0);
};

export const getTotalIncomeFromDb = async (): Promise<number> => {
  const db = await getDbInstance();
  console.log(`Calculating total income.`);
  const result = await db.get<{ totalIncome: number }>(
    `SELECT SUM(amount) AS totalIncome FROM transactions WHERE type = 'income'`
  );
  console.log(`Total income: ${result?.totalIncome || 0}`);
  return Number(result?.totalIncome || 0);
};

export const getTotalExpenseFromDb = async (): Promise<number> => {
  const db = await getDbInstance();
  console.log(`Calculating total expense.`);
  const result = await db.get<{ totalExpense: number }>(
    `SELECT SUM(amount) AS totalExpense FROM transactions WHERE type = 'expense'`
  );
  console.log(`Total expense: ${result?.totalExpense || 0}`);
  return Number(result?.totalExpense || 0);
};

export const getSpendingByCategoryFromDb = async (): Promise<{ category: string; total: number }[]> => {
  const db = await getDbInstance();
  console.log(`Fetching spending by category.`);
  const result: Array<{ category: string; total: number }> = await db.all(
    `SELECT category, SUM(amount) AS total FROM transactions WHERE type = 'expense' GROUP BY category ORDER BY total DESC`
  );
  console.log(`Fetched ${result.length} categories for spending breakdown.`);
  return result.map(item => ({ category: item.category, total: Number(item.total) }));
};

export const resetAllDataInDb = async () => {
  const db = await getDbInstance();
  console.log('Attempting to reset all data in DB (transactions and users tables).');
  
  try {
    console.log("Dropping 'transactions' table if it exists...");
    await db.exec('DROP TABLE IF EXISTS transactions;');
    console.log("'transactions' table dropped.");

    console.log("Dropping 'users' table if it exists...");
    await db.exec('DROP TABLE IF EXISTS users;');
    console.log("'users' table dropped.");

    console.log("Re-initializing database tables via initializeDatabase logic...");
     await db.exec(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        notes TEXT
      )
    `);
    console.log("'transactions' table re-created.");
    await db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT NOT NULL
      )
    `);
    console.log("'users' table re-created.");

  } catch (error: any) {
    console.error("Error during table drop/recreate in resetAllDataInDb:", error);
    console.log("Fallback: Deleting data from tables instead of dropping. This might not fix schema issues.");
    await db.run('DELETE FROM transactions').catch(e => console.error("Failed to delete from transactions during fallback:", e));
    await db.run('DELETE FROM users').catch(e => console.error("Failed to delete from users during fallback:", e));
  }
  
  console.log('All data reset in DB completed.');
};

export const isPasswordSet = async (): Promise<boolean> => {
  const db = await getDbInstance();
  console.log('Checking if password is set.');
  const user = await db.get('SELECT password FROM users WHERE id = 1');
  const PIsSet = !!user && !!user.password;
  console.log(`Password is set: ${PIsSet}`);
  return PIsSet;
};

export const setPassword = async (password: string): Promise<void> => {
  const db = await getDbInstance();
  const user = await db.get('SELECT id FROM users WHERE id = 1');
  if (user) {
    console.log('Updating existing password for user ID 1.');
    await db.run('UPDATE users SET password = ? WHERE id = 1', password);
  } else {
    console.log('Inserting new password for user ID 1.');
    await db.run('INSERT INTO users (id, password) VALUES (1, ?)', password);
  }
  console.log('Password set/updated in DB.');
};

export const checkPassword = async (passwordToCheck: string): Promise<boolean> => {
  const db = await getDbInstance();
  console.log('Checking provided password.');
  const user = await db.get<{ password?: string }>('SELECT password FROM users WHERE id = 1');
  if (user && user.password) {
    const match = user.password === passwordToCheck;
    console.log(`Password check result: ${match}`);
    return match;
  }
  console.log('No password found for user ID 1 or user does not exist.');
  return false; 
};
