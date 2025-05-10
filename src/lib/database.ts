'use server';

import { open, Database as SQLiteDatabase } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// Database file path (project root)
const DB_FILE_PATH = path.join(process.cwd(), 'pocketledger.db');

let dbInstance: SQLiteDatabase | null = null;

const getDbInstance = async (): Promise<SQLiteDatabase> => {
  if (!dbInstance) {
    try {
      // Try to open the database
      const newDbInstance = await open({
        filename: DB_FILE_PATH,
        driver: sqlite3.Database,
      });

      // Initialize tables if they don't exist
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

      await newDbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          password TEXT NOT NULL
        )
      `);
      
      // If all initializations are successful, assign to the global instance
      dbInstance = newDbInstance;

    } catch (error: any) {
      console.error('Failed to initialize database during open/exec:', error);
      const originalErrorMessage = error.message || 'No original error message provided by the driver.';
      dbInstance = null; // Ensure dbInstance is null if any part of initialization fails
      throw new Error(`Database initialization or table creation failed. Please check server logs. Original error: ${originalErrorMessage}`);
    }
  }
  
  // After the initialization block, if dbInstance is still null, it means a persistent error occurred.
  if (!dbInstance) {
      // This should ideally not be reached if the above try-catch correctly throws and nullifies.
      // However, it's a safeguard.
      console.error("dbInstance is null after initialization attempt. This indicates a persistent issue and a previous error should have been thrown.");
      throw new Error("Database instance is not available. Initialization may have failed previously.");
  }

  return dbInstance;
};


// Add a new transaction to the database
export const addTransactionToDb = async (date: string, category: string, amount: number, type: 'income' | 'expense', currency: string, notes?: string) => {
  const db = await getDbInstance();
  await db.run(
    'INSERT INTO transactions (date, category, amount, type, currency, notes) VALUES (?, ?, ?, ?, ?, ?)',
    date,
    category,
    amount,
    type,
    currency,
    notes
  );
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
  await db.run('DELETE FROM users'); 
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
