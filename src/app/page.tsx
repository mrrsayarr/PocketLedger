
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
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
import {
  addTransactionToDb,
  deleteTransactionFromDb,
  getAllTransactionsFromDb,
  getTotalBalanceFromDb,
  getTotalIncomeFromDb,
  getTotalExpenseFromDb,
  getSpendingByCategoryFromDb,
  getUserPasswordFromDb,
  setUserPasswordInDb,
} from "@/lib/database";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from 'react-hook-form';

// Define type for a transaction
type Transaction = {
  id: number;
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
  "Rent",
  "Healthcare",
  "Education",
  "Shopping",
  "Investments",
  "Gifts",
  "Travel",
  "Personal Care",
  "Home Improvement",
  "Insurance",
  "Taxes",
  "Debt Payments",
  "Savings",
  "Other",
  "Bonus",
  "Freelance",
  "Side Hustle",
  "Dividends",
  "Grants",
  "Lottery",
  "Refunds",
  "Allowance",
  "Pocket Money",
  "Social Security",
  "Pension",
  "Retirement Fund",
  "Charity",
  "Books",
  "Subscriptions",
  "Pet Care",
  "Groceries",
  "Eating Out",
  "Public Transport",
  "Fuel",
  "Cinema",
  "Concerts",
  "Streaming Services",
  "Electricity",
  "Water",
  "Gas",
  "Internet",
  "Mobile Phone",
  "Property Tax",
  "Service Charge",
  "Property Insurance",
  "Stationery",
  "Courses",
  "Tuition Fees",
  "Clothes",
  "Shoes",
  "Gadgets",
  "Furniture",
  "Stocks",
  "Bonds",
  "Mutual Funds",
  "Gifts Given",
  "Wedding Gifts",
  "Birthday Gifts",
  "Holiday Gifts",
  "Flights",
  "Hotels",
  "Activities",
  "Cosmetics",
  "Hairdressing",
  "Spa Treatments",
  "DIY",
  "Gardening",
  "Repairs",
  "Life Insurance",
  "Car Insurance",
  "Health Insurance",
  "National Insurance",
  "Council Tax",
  "VAT",
  "Income Tax",
  "Credit Card Payments",
  "Loan Payments",
  "Emergency Fund",
  "Holiday Fund",
  "New Car Fund",
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#33b8ff"];

const PASSWORD_KEY = "appPassword";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState<number | undefined>(0);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [notes, setNotes] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [spendingData, setSpendingData] = useState<
    { name: string; value: number }[]
  >([]);

  const [password, setPassword] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const passwordForm = useForm();
  const { register, handleSubmit } = passwordForm;

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    // Load dark mode state from localStorage
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    const checkPassword = async () => {
      const storedPassword = await getUserPasswordFromDb();
      setIsPasswordSet(!!storedPassword);
      if (storedPassword) {
        setIsPasswordSet(true);
        setIsAuthenticated(false); // Require login
      } else {
        setIsPasswordSet(false);
      }
    };

    checkPassword();
    checkAuthentication();
    loadTransactions();
    loadDashboardData();
  }, []);

  const checkAuthentication = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      setIsAuthenticated(true);
    }
  };

  useEffect(() => {
    // Save dark mode state to localStorage
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const loadTransactions = async () => {
    const transactionsFromDb = await getAllTransactionsFromDb();
    setTransactions(transactionsFromDb);
  };

  const loadDashboardData = async () => {
    const balance = await getTotalBalanceFromDb();
    setCurrentBalance(balance);

    const income = await getTotalIncomeFromDb();
    setTotalIncome(income);

    const expenses = await getTotalExpenseFromDb();
    setTotalExpenses(expenses);

    const spending = await getSpendingByCategoryFromDb();
    setSpendingData(
      spending.map((item) => ({ name: item.category, value: item.total }))
    );
  };

  // Function to add a new transaction
  const addTransaction = async () => {
    if (!date || !category || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    await addTransactionToDb(
      date.toISOString(),
      category,
      amount,
      type,
      notes
    );

    setAmount(0);
    setNotes("");
    toast({
      title: "Success",
      description: "Transaction added successfully",
    });

    loadTransactions();
    loadDashboardData();
  };

  // Function to delete a transaction
  const deleteTransaction = async (id: number) => {
    await deleteTransactionFromDb(id);
    loadTransactions();
    loadDashboardData();
  };


  // Toggle between dark and light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", (!darkMode).toString());
    document.documentElement.classList.toggle("dark");
  };

  const handleSetPassword = async (data: any) => {
    await setUserPasswordInDb(data.password);
    setIsPasswordSet(true);
    toast({
      title: "Success",
      description: "Password set successfully",
    });
  };

  const handleLogin = async (data: any) => {
    const storedPassword = await getUserPasswordFromDb();
    if (data.password === storedPassword) {
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      toast({
        title: "Success",
        description: "Login successful",
      });
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
      });
    }
    setPassword("");
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  const handleChangePassword = async () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter a new password",
      });
      return;
    }
    await setUserPasswordInDb(password);
    toast({
      title: "Success",
      description: "Password changed successfully",
    });
    setPassword("");

    // Display a success toast for 2 seconds
    toast({
      title: "Success",
      description: "Password changed successfully",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-md mx-auto rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">{isPasswordSet ? "Login" : "Set Password"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(isPasswordSet ? handleLogin : handleSetPassword)}>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                {...register("password")}
                className="rounded-md shadow-sm"
              />
              <Button
                className="mt-4 rounded-md shadow-md"
                type="submit"
              >
                {isPasswordSet ? "Login" : "Set Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Logout Button */}
      <div className="flex justify-between mb-4">
        <Button variant="secondary" onClick={handleLogout} className="rounded-md shadow-md">
          Logout
        </Button>

        {/* Change Password Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="rounded-md shadow-md">Change Password</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-lg shadow-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Change Password</DialogTitle>
              <DialogDescription>
                Enter your new password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  New Password
                </Label>
                <Input
                  type="password"
                  id="newPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3 rounded-md shadow-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="rounded-md shadow-md">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={handleChangePassword} className="rounded-md shadow-md">Change Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Theme Toggle */}
      <div className="flex justify-end mb-4">
        <Label htmlFor="dark-mode" className="mr-2">
          Dark Mode
        </Label>
        <Switch
          id="dark-mode"
          checked={darkMode}
          onCheckedChange={toggleDarkMode}
          className="rounded-md shadow-sm"
        />
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            ₺{currentBalance.toFixed(2)}
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="text-green-500">
            ₺{totalIncome.toFixed(2)}
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-red-500">
            ₺{totalExpenses.toFixed(2)}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Input */}
      <Card className="mb-4 rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Add Transaction</CardTitle>
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
                className="rounded-md border p-2 w-full shadow-sm"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="w-full rounded-md border p-2 bg-background shadow-sm"
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
                className="rounded-md shadow-sm"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="w-full rounded-md border p-2 bg-background shadow-sm"
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
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-md shadow-sm"
              />
            </div>
          </div>
          <Button className="mt-4 rounded-md shadow-md" onClick={addTransaction}>
             Add Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="mb-4 rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Transaction History</CardTitle>
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
                <TableHead>Actions</TableHead>
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
                    ₺{transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.notes}</TableCell>
                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => deleteTransaction(transaction.id)}
                      className="rounded-md shadow-sm"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Spending Chart */}
      <Card className="h-[500px] rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={true}
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
                  const radius = outerRadius + 30; // Increased radius for better visibility
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill={COLORS[index % COLORS.length]}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize={16} // Increased font size
                    >
                      {value > 0 ? spendingData[index].name : null}
                    </text>
                  );
                }}
                dataKey="value"
                nameKey="name"
                outerRadius={180} // Increased outer radius
                fill="#8884d8"
              >
                {spendingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend 
                wrapperStyle={{
                  fontSize: '14px', // Increased legend font size
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

