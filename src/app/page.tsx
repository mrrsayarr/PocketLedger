
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons";
import { toast } from "@/hooks/use-toast";

// Define type for a transaction
type Transaction = {
  id: string;
  date: Date;
  category: string;
  amount: number;
  type: "income" | "expense";
  notes?: string;
};

// Predefined categories
const categories = [
  "Salary",
  "Food",
  "Transport",
  "Entertainment",
  "Utilities",
  "Other",
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#33b8ff"];

const initialTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date(),
    category: "Salary",
    amount: 5000,
    type: "income",
    notes: "Received monthly salary",
  },
  {
    id: "2",
    date: new Date(),
    category: "Food",
    amount: 500,
    type: "expense",
    notes: "Groceries for the week",
  },
];

export default function Home() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState<number | undefined>(0);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [notes, setNotes] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);

  // Function to add a new transaction
  const addTransaction = () => {
    if (!date || !category || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(7), // Generate a random ID
      date: date,
      category: category,
      amount: amount,
      type: type,
      notes: notes,
    };
    setTransactions([...transactions, newTransaction]);
    setAmount(0);
    setNotes("");
    toast({
      title: "Success",
      description: "Transaction added successfully",
    });
  };

  // Calculate current balance, total income, and total expenses
  const currentBalance = transactions.reduce((acc, transaction) => {
    return transaction.type === "income"
      ? acc + transaction.amount
      : acc - transaction.amount;
  }, 0);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  // Prepare data for the pie chart
  const spendingData = categories.map((category) => {
    const total = transactions
      .filter(
        (transaction) => transaction.category === category && transaction.type === "expense"
      )
      .reduce((acc, transaction) => acc + transaction.amount, 0);
    return { name: category, value: total };
  });

  // Toggle between dark and light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="container mx-auto p-4">
      {/* Theme Toggle */}
      <div className="flex justify-end mb-4">
        <Label htmlFor="dark-mode" className="mr-2">
          Dark Mode
        </Label>
        <Switch
          id="dark-mode"
          checked={darkMode}
          onCheckedChange={toggleDarkMode}
        />
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            ${currentBalance.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent className="text-green-500">
            ${totalIncome.toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-red-500">
            ${totalExpenses.toFixed(2)}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Input */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Calendar
                id="date"
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border p-2 w-full"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full rounded-md border p-2 bg-background"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="w-full rounded-md border p-2 bg-background"
                value={type}
                onChange={(e) =>
                  setType(e.target.value === "income" ? "income" : "expense")
                }
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                type="text"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={addTransaction}>
            Add Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(transaction.date, "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell
                    className={cn(
                      transaction.type === "income"
                        ? "text-green-500"
                        : "text-red-500"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value,
                  index,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = 25 + outerRadius;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill={COLORS[index % COLORS.length]}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                    >
                      {value > 0 ? spendingData[index].name : null}
                    </text>
                  );
                }}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                fill="#8884d8"
              >
                {spendingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
