'use server';

import { open, Database as SQLiteDatabase } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// Database file path (project root)
const DB_FILE_PATH = path.join(process.cwd(), 'pocketledger.db');

let dbInstance: SQLiteDatabase | null = null;

const getDbInstance = async (): Promise<SQLiteDatabase> => {
  if (!dbInstance) {
    console.log("Attempting to open/initialize database at path:", DB_FILE_PATH);
    try {
      // Assign to a temporary variable first
      const newDbInstance = await open({
        filename: DB_FILE_PATH,
        driver: sqlite3.Database,
      });
      console.log('Database opened successfully.');

      await newDbInstance.exec(`
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

      await newDbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          password TEXT NOT NULL
        )
      `);
      console.log("'users' table ensured.");
      
      // If all initializations are successful, assign to the global instance
      dbInstance = newDbInstance;

    } catch (error: any) {
      console.error('Failed to initialize database during open/exec:', error);
      const originalErrorMessage = error.message || 'No original error message provided by the driver.';
      dbInstance = null; // Ensure dbInstance is null if any part of initialization fails
      throw new Error(`Database initialization or table creation failed. Please check server logs. Original error: ${originalErrorMessage}`);
    }
  }
  
  if (!dbInstance) {
      console.error("dbInstance is null after initialization attempt. This indicates a persistent issue and a previous error should have been thrown.");
      throw new Error("Database instance is not available. Initialization may have failed previously.");
  }

  return dbInstance;
};


// Add a new transaction to the database
export const addTransactionToDb = async (date: string, category: string, amount: number, type: 'income' | 'expense', currency: string, notes?: string) => {
  let db: SQLiteDatabase;
  try {
    db = await getDbInstance();
    console.log('DB instance obtained for addTransactionToDb.');
  } catch (initError: any) {
    console.error('Failed to get DB instance in addTransactionToDb:', initError);
    // This error will be caught by the caller (e.g., the page's server action)
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
      notes || null // Ensure NULL is passed if notes is undefined/empty
    );
    console.log('Transaction insert attempt result (sqlite/driver specific):', result);
    // Check if the insert actually changed any rows. For an INSERT, this should be 1.
    // result.changes might be undefined for some drivers if the statement failed before execution.
    if (typeof result.changes === 'number' && result.changes === 0) {
        console.error('Transaction insert operation made no changes to the database. This might indicate an issue prior to execution or with the data itself.');
        // This specific error might not be hit if db.run throws directly for constraint violations etc.
        throw new Error('Insert operation reported 0 rows affected. Transaction may not have been saved.');
    }
    console.log('Transaction added/insert run in DB successfully.');
  } catch (insertError: any) {
    console.error('Error during db.run for INSERT in addTransactionToDb:', insertError);
    // Include SQLite error code if available, which can be very helpful for debugging.
    const errorCode = insertError.code ? ` (SQLite Code: ${insertError.code})` : '';
    throw new Error(`Failed to execute insert transaction: ${insertError.message}${errorCode}`);
  }
};


// Delete a transaction from the database by its ID
export const deleteTransactionFromDb = async (id: number) => {
  const db = await getDbInstance();
  await db.run('DELETE FROM transactions WHERE id = ?', id);
};

// Retrieve all transactions from the database, ordered by date descending
export const getAllTransactionsFromDb = async () => {
  const db = await getDbInstance();
  const transactionsFromDb: Array<{ id: number; date: string; category: string; amount: number; type: 'income' | 'expense'; currency: string; notes?: string }> = await db.all(
    'SELECT * FROM transactions ORDER BY date DESC'
  );
  return transactionsFromDb.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date), // Ensure date is a Date object
  }));
};

// Calculate and return the total balance (income - expenses) for a specific currency
export const getTotalBalanceFromDb = async (currency: string): Promise<number> => {
  const db = await getDbInstance();
  const result = await db.get<{ totalBalance: number }>(
    `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS totalBalance FROM transactions WHERE currency = ?`,
    currency
  );
  return Number(result?.totalBalance || 0);
};

// Calculate and return the total income for a specific currency
export const getTotalIncomeFromDb = async (currency: string): Promise<number> => {
  const db = await getDbInstance();
  const result = await db.get<{ totalIncome: number }>(
    `SELECT SUM(amount) AS totalIncome FROM transactions WHERE type = 'income' AND currency = ?`,
    currency
  );
  return Number(result?.totalIncome || 0);
};

// Calculate and return the total expenses for a specific currency
export const getTotalExpenseFromDb = async (currency: string): Promise<number> => {
  const db = await getDbInstance();
  const result = await db.get<{ totalExpense: number }>(
    `SELECT SUM(amount) AS totalExpense FROM transactions WHERE type = 'expense' AND currency = ?`,
    currency
  );
  return Number(result?.totalExpense || 0);
};

// Retrieve spending data grouped by category for expenses for a specific currency
export const getSpendingByCategoryFromDb = async (currency: string): Promise<{ category: string; total: number }[]> => {
  const db = await getDbInstance();
  const result: Array<{ category: string; total: number }> = await db.all(
    `SELECT category, SUM(amount) AS total FROM transactions WHERE type = 'expense' AND currency = ? GROUP BY category ORDER BY total DESC`,
    currency
  );
  return result.map(item => ({ category: item.category, total: Number(item.total) }));
};

// Reset all transaction data from the database
export const resetAllDataInDb = async () => {
  const db = await getDbInstance();
  await db.run('DELETE FROM transactions');
  // Also reset users table if it's part of the full reset logic
  await db.run('DELETE FROM users'); 
  console.log('All data (transactions and users) reset in DB.');
};

// Check if a password is set for the user (assuming user ID 1)
export const isPasswordSet = async (): Promise<boolean> => {
  const db = await getDbInstance();
  const user = await db.get('SELECT password FROM users WHERE id = 1');
  return !!user && !!user.password;
};

// Set or update the password for the user (assuming user ID 1)
export const setPassword = async (password: string): Promise<void> => {
  const db = await getDbInstance();
  const user = await db.get('SELECT id FROM users WHERE id = 1');
  if (user) {
    await db.run('UPDATE users SET password = ? WHERE id = 1', password);
  } else {
    await db.run('INSERT INTO users (id, password) VALUES (1, ?)', password);
  }
  console.log('Password set/updated in DB.');
};

// Check the provided password against the stored password for user ID 1
export const checkPassword = async (passwordToCheck: string): Promise<boolean> => {
  const db = await getDbInstance();
  const user = await db.get('SELECT password FROM users WHERE id = 1');
  if (user && user.password) {
    return user.password === passwordToCheck;
  }
  return false; 
};
