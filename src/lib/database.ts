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
      currency TEXT NOT NULL DEFAULT 'TRY',
      notes TEXT
    )
  `);
  console.log("'transactions' table ensured.");

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
      // This state should ideally not be reached if the above logic is correct,
      // but it's a safeguard.
      console.error("PROD: dbInstance is null after initialization attempt. This indicates a persistent issue.");
      throw new Error("Database instance is not available in production after initialization attempt.");
    }
    console.log("PROD: Returning existing database instance.");
    return dbInstance;
  }
};


export const addTransactionToDb = async (date: string, category: string, amount: number, type: 'income' | 'expense', currency: string, notes?: string) => {
  let db: SQLiteDatabase;
  try {
    db = await getDbInstance();
    console.log('DB instance obtained for addTransactionToDb.');
  } catch (initError: any) {
    console.error('Failed to get DB instance in addTransactionToDb:', initError);
    throw new Error(`Database connection error before adding transaction: ${initError.message}`);
  }

  try {
    console.log('Attempting to insert transaction with data:', { date, category, amount, type, currency, notes });
    const result = await db.run(
      'INSERT INTO transactions (date, category, amount, type, currency, notes) VALUES (?, ?, ?, ?, ?, ?)',
      date,
      category,
      amount,
      type,
      currency,
      notes || null
    );
    console.log('Transaction insert attempt result (sqlite/driver specific):', result);
    
    if (result.lastID === undefined || (typeof result.changes === 'number' && result.changes === 0)) {
        console.error('Transaction insert operation made no changes or lastID is undefined. This might indicate an issue.', result);
        throw new Error('Insert operation reported 0 rows affected or failed to return lastID. Transaction may not have been saved.');
    }
    console.log(`Transaction added successfully with ID: ${result.lastID}`);
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
  const transactionsFromDb: Array<{ id: number; date: string; category: string; amount: number; type: 'income' | 'expense'; currency: string; notes?: string }> = await db.all(
    'SELECT * FROM transactions ORDER BY date DESC, id DESC' // Added id DESC for consistent ordering of same-day transactions
  );
  console.log(`Fetched ${transactionsFromDb.length} transactions.`);
  return transactionsFromDb.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date),
  }));
};

export const getTotalBalanceFromDb = async (currency: string): Promise<number> => {
  const db = await getDbInstance();
  console.log(`Calculating total balance for currency: ${currency}`);
  const result = await db.get<{ totalBalance: number }>(
    `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS totalBalance FROM transactions WHERE currency = ?`,
    currency
  );
  console.log(`Total balance for ${currency}: ${result?.totalBalance || 0}`);
  return Number(result?.totalBalance || 0);
};

export const getTotalIncomeFromDb = async (currency: string): Promise<number> => {
  const db = await getDbInstance();
  console.log(`Calculating total income for currency: ${currency}`);
  const result = await db.get<{ totalIncome: number }>(
    `SELECT SUM(amount) AS totalIncome FROM transactions WHERE type = 'income' AND currency = ?`,
    currency
  );
  console.log(`Total income for ${currency}: ${result?.totalIncome || 0}`);
  return Number(result?.totalIncome || 0);
};

export const getTotalExpenseFromDb = async (currency: string): Promise<number> => {
  const db = await getDbInstance();
  console.log(`Calculating total expense for currency: ${currency}`);
  const result = await db.get<{ totalExpense: number }>(
    `SELECT SUM(amount) AS totalExpense FROM transactions WHERE type = 'expense' AND currency = ?`,
    currency
  );
  console.log(`Total expense for ${currency}: ${result?.totalExpense || 0}`);
  return Number(result?.totalExpense || 0);
};

export const getSpendingByCategoryFromDb = async (currency: string): Promise<{ category: string; total: number }[]> => {
  const db = await getDbInstance();
  console.log(`Fetching spending by category for currency: ${currency}`);
  const result: Array<{ category: string; total: number }> = await db.all(
    `SELECT category, SUM(amount) AS total FROM transactions WHERE type = 'expense' AND currency = ? GROUP BY category ORDER BY total DESC`,
    currency
  );
  console.log(`Fetched ${result.length} categories for spending breakdown.`);
  return result.map(item => ({ category: item.category, total: Number(item.total) }));
};

export const resetAllDataInDb = async () => {
  const db = await getDbInstance();
  console.log('Attempting to reset all data in DB.');
  await db.run('DELETE FROM transactions');
  console.log("'transactions' table cleared.");
  await db.run('DELETE FROM users'); 
  console.log("'users' table cleared.");
  // Optional: Resetting sequence for autoincrement IDs if desired (SQLite specific)
  // await db.run("DELETE FROM sqlite_sequence WHERE name='transactions';");
  // await db.run("DELETE FROM sqlite_sequence WHERE name='users';");
  // console.log("Autoincrement sequences reset (optional step).");
  console.log('All data (transactions and users) reset in DB.');
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

    