'use server';

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const initializeDatabase = async () => {
  const db = await open({
    filename: './pocketledger.db', // Store in the project root
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      notes TEXT
    )
  `);

  await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    password TEXT NOT NULL
  )
`);

  // Ensure there is always one user record to simplify password management.
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount && (userCount as any).count === 0) {
    await db.run('INSERT INTO users (password) VALUES (?)', ''); // Initial empty password
  }
  return db;
};

export const addTransactionToDb = async (date: string, category: string, amount: number, type: string, notes?: string) => {
  const db = await initializeDatabase();
  await db.run(
    'INSERT INTO transactions (date, category, amount, type, notes) VALUES (?, ?, ?, ?, ?)',
    date,
    category,
    amount,
    type,
    notes
  );
  await db.close();
};

export const editTransactionInDb = async (id: number, date: string, category: string, amount: number, type: string, notes?: string) => {
  const db = await initializeDatabase();
  await db.run(
    'UPDATE transactions SET date = ?, category = ?, amount = ?, type = ?, notes = ? WHERE id = ?',
    date,
    category,
    amount,
    type,
    notes,
    id
  );
  await db.close();
};

export const deleteTransactionFromDb = async (id: number) => {
  const db = await initializeDatabase();
  await db.run('DELETE FROM transactions WHERE id = ?', id);
  await db.close();
};

export const getAllTransactionsFromDb = async () => {
  const db = await initializeDatabase();
  const transactions = await db.all('SELECT * FROM transactions ORDER BY date DESC');
  await db.close();
  return transactions.map((transaction: any) => ({
    ...transaction,
    date: new Date(transaction.date), // Convert back to Date object
  }));
};

export const getTotalBalanceFromDb = async (): Promise<number> => {
  const db = await initializeDatabase();
  const result = await db.get(
    `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS totalBalance FROM transactions`
  );
  await db.close();
  return Number(result?.totalBalance || 0);
};

export const getTotalIncomeFromDb = async (): Promise<number> => {
  const db = await initializeDatabase();
  const result = await db.get(`SELECT SUM(amount) AS totalIncome FROM transactions WHERE type = 'income'`);
  await db.close();
  return Number(result?.totalIncome || 0);
};

export const getTotalExpenseFromDb = async (): Promise<number> => {
  const db = await initializeDatabase();
  const result = await db.get(`SELECT SUM(amount) AS totalExpense FROM transactions WHERE type = 'expense'`);
  await db.close();
  return Number(result?.totalExpense || 0);
};

export const getSpendingByCategoryFromDb = async (): Promise<{ category: string; total: number }[]> => {
  const db = await initializeDatabase();
  const result = await db.all(
    `SELECT category, SUM(amount) AS total FROM transactions WHERE type = 'expense' GROUP BY category`
  );
  await db.close();
  return result.map((item: any) => ({ category: item.category, total: Number(item.total) }));
};

export const getUserPasswordFromDb = async (): Promise<string | null> => {
  const db = await initializeDatabase();
  const user = await db.get('SELECT password FROM users WHERE id = 1'); // Assuming single user with ID 1
  await db.close();
  return user ? (user as any).password : null;
};

export const setUserPasswordInDb = async (password: string) => {
  const db = await initializeDatabase();
  await db.run('UPDATE users SET password = ? WHERE id = 1', password); // Assuming single user with ID 1
  await db.close();
};
