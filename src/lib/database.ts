
'use server';

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Database file path (project root)
const DB_FILE_PATH = './pocketledger.db';

// Initialize the database connection and create tables if they don't exist
const initializeDatabase = async () => {
  const db = await open({
    filename: DB_FILE_PATH,
    driver: sqlite3.Database,
  });

  // Create transactions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,          -- ISO string format for dates
      category TEXT NOT NULL,
      amount REAL NOT NULL,        -- Using REAL for monetary values
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')), -- Ensures type is either 'income' or 'expense'
      currency TEXT NOT NULL DEFAULT 'TRY', -- Added currency, default to TRY
      notes TEXT                   -- Optional notes for the transaction
    )
  `);
  
  return db;
};

// Add a new transaction to the database
export const addTransactionToDb = async (date: string, category: string, amount: number, type: 'income' | 'expense', currency: string, notes?: string) => {
  const db = await initializeDatabase();
  await db.run(
    'INSERT INTO transactions (date, category, amount, type, currency, notes) VALUES (?, ?, ?, ?, ?, ?)',
    date,
    category,
    amount,
    type,
    currency,
    notes
  );
  await db.close();
};


// Delete a transaction from the database by its ID
export const deleteTransactionFromDb = async (id: number) => {
  const db = await initializeDatabase();
  await db.run('DELETE FROM transactions WHERE id = ?', id);
  await db.close();
};

// Retrieve all transactions from the database, ordered by date descending
export const getAllTransactionsFromDb = async () => {
  const db = await initializeDatabase();
  // Explicitly type the transactions to avoid 'any'
  const transactions: Array<{ id: number; date: string; category: string; amount: number; type: 'income' | 'expense'; currency: string; notes?: string }> = await db.all(
    'SELECT * FROM transactions ORDER BY date DESC'
  );
  await db.close();
  return transactions.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date), // Convert ISO string date back to Date object
  }));
};

// Calculate and return the total balance (income - expenses) for a specific currency
export const getTotalBalanceFromDb = async (currency: string): Promise<number> => {
  const db = await initializeDatabase();
  const result = await db.get<{ totalBalance: number }>(
    `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS totalBalance FROM transactions WHERE currency = ?`,
    currency
  );
  await db.close();
  return Number(result?.totalBalance || 0);
};

// Calculate and return the total income for a specific currency
export const getTotalIncomeFromDb = async (currency: string): Promise<number> => {
  const db = await initializeDatabase();
  const result = await db.get<{ totalIncome: number }>(
    `SELECT SUM(amount) AS totalIncome FROM transactions WHERE type = 'income' AND currency = ?`,
    currency
  );
  await db.close();
  return Number(result?.totalIncome || 0);
};

// Calculate and return the total expenses for a specific currency
export const getTotalExpenseFromDb = async (currency: string): Promise<number> => {
  const db = await initializeDatabase();
  const result = await db.get<{ totalExpense: number }>(
    `SELECT SUM(amount) AS totalExpense FROM transactions WHERE type = 'expense' AND currency = ?`,
    currency
  );
  await db.close();
  return Number(result?.totalExpense || 0);
};

// Retrieve spending data grouped by category for expenses for a specific currency
export const getSpendingByCategoryFromDb = async (currency: string): Promise<{ category: string; total: number }[]> => {
  const db = await initializeDatabase();
  // Explicitly type the result items
  const result: Array<{ category: string; total: number }> = await db.all(
    `SELECT category, SUM(amount) AS total FROM transactions WHERE type = 'expense' AND currency = ? GROUP BY category ORDER BY total DESC`,
    currency
  );
  await db.close();
  return result.map(item => ({ category: item.category, total: Number(item.total) }));
};

// Reset all transaction data from the database
export const resetAllDataInDb = async () => {
  const db = await initializeDatabase();
  await db.run('DELETE FROM transactions');
  // Optionally, you might want to reset AUTOINCREMENT sequence for the table if needed,
  // though for this app, it might not be strictly necessary.
  // await db.run("DELETE FROM sqlite_sequence WHERE name='transactions';");
  await db.close();
};

      
