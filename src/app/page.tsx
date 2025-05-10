"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  addTransactionToDb,
  deleteTransactionFromDb,
  getAllTransactionsFromDb,
  getTotalBalanceFromDb,
  getTotalIncomeFromDb,
  getTotalExpenseFromDb,
  getSpendingByCategoryFromDb,
} from "@/lib/database";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";


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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#33b8ff", "#a4de6c", "#d0ed57", "#ffc658"];


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-md shadow-md">
        <p className="font-semibold">{`${data.name}`}</p>
        <p className="text-sm">{`Amount: ₺${data.value.toFixed(2)}`}</p>
        <p className="text-sm">{`Percentage: ${(payload[0].percent * 100).toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};


export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState<number | undefined>(0);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [notes, setNotes] = useState<string>("");
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [spendingData, setSpendingData] = useState<
    { name: string; value: number }[]
  >([]);


  useEffect(() => {
    // Load dark mode state from localStorage
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode) {
      const isDark = storedDarkMode === "true";
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // If no preference, default to dark mode
      document.documentElement.classList.add("dark");
    }


    loadTransactions();
    loadDashboardData();
  }, []);


  useEffect(() => {
    // Save dark mode state to localStorage
    localStorage.setItem("darkMode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
    if (!date || !category || amount === undefined || amount === null) {
      toast({
        title: "Error",
        description: "Please fill in date, category, and amount.",
        variant: "destructive",
      });
      return;
    }
     if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than zero.",
        variant: "destructive",
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

    setDate(new Date());
    setCategory(categories[0]);
    setAmount(0);
    setNotes("");
    setType("expense");

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
    toast({
      title: "Success",
      description: "Transaction deleted successfully",
    });
    loadTransactions();
    loadDashboardData();
  };


  // Toggle between dark and light mode
  const toggleDarkMode = () => {
    const newDarkModeState = !darkMode;
    setDarkMode(newDarkModeState);
    localStorage.setItem("darkMode", newDarkModeState.toString());
    if (newDarkModeState) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };



  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <Toaster />
      {/* Theme Toggle */}
      <div className="flex justify-end mb-6">
        <Label htmlFor="dark-mode" className="mr-2 self-center">
          Dark Mode
        </Label>
        <Switch
          id="dark-mode"
          checked={darkMode}
          onCheckedChange={toggleDarkMode}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300 shadow-md rounded-full"
        />
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold">Current Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            ₺{currentBalance.toFixed(2)}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-green-500">
            ₺{totalIncome.toFixed(2)}
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-500">
            ₺{totalExpenses.toFixed(2)}
          </CardContent>
        </Card>
      </div>
      {/* Transaction Input */}
      <Card className="mb-8 rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <Label htmlFor="date" className="mb-1 font-medium">Date</Label>
              <Calendar
                id="date"
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border p-3 w-full shadow-sm bg-background/70 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-6">
                <div>
                  <Label htmlFor="category" className="mb-1 font-medium">Category</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border p-3 bg-background/70 backdrop-blur-sm shadow-sm text-foreground focus:ring-2 focus:ring-primary"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount" className="mb-1 font-medium">Amount (₺)</Label>
                  <Input
                    type="number"
                    id="amount"
                    value={amount === undefined || amount === 0 ? '' : amount}
                    onChange={(e) => setAmount(e.target.value === '' ? undefined : Number(e.target.value))}
                    className="rounded-md shadow-sm p-3 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 100.50"
                  />
                </div>
                 <div>
                  <Label htmlFor="type" className="mb-1 font-medium">Type</Label>
                  <select
                    id="type"
                    className="w-full rounded-md border p-3 bg-background/70 backdrop-blur-sm shadow-sm text-foreground focus:ring-2 focus:ring-primary"
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "income" | "expense")
                    }
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
            </div>


            <div className="md:col-span-2">
              <Label htmlFor="notes" className="mb-1 font-medium">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-md shadow-sm p-3 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary"
                placeholder="Add any relevant notes..."
              />
            </div>
          </div>
          <Button className="mt-6 w-full md:w-auto rounded-md shadow-md text-lg py-3 px-6 bg-primary hover:bg-primary/90 transition-colors duration-300" onClick={addTransaction}>
             Add Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="mb-8 rounded-xl shadow-lg flex-grow">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold text-right">Amount</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No transactions yet. Add one above to get started!
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50 transition-colors duration-200">
                  <TableCell>
                    {format(new Date(transaction.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      transaction.type === "income"
                        ? "text-green-500"
                        : "text-red-500"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    ₺{transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", 
                      transaction.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300'
                    )}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{transaction.notes || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTransaction(transaction.id)}
                      className="rounded-md shadow-sm text-red-500 hover:bg-red-500/10"
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
      {spendingData.length > 0 && (
        <Card className="h-[550px] rounded-xl shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)] pt-4"> {/* Adjust height for header */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
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
                    percent,
                    index,
                    name,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const textRadius = outerRadius + 25;
                    const xLabel = cx + textRadius * Math.cos(-midAngle * RADIAN);
                    const yLabel = cy + textRadius * Math.sin(-midAngle * RADIAN);


                    if (percent * 100 < 2) return null; // Hide small percentage labels

                    return (
                      <>
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                        <text
                          x={xLabel}
                          y={yLabel}
                          fill={darkMode ? "hsl(var(--foreground))" : "hsl(var(--foreground))"} // Adapts to theme
                          textAnchor={xLabel > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize={14}
                        >
                          {name}
                        </text>
                      </>
                    );
                  }}
                  outerRadius="80%" // Relative to container
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  stroke="hsl(var(--background))" // Border for pie slices
                  strokeWidth={2}
                >
                  {spendingData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="focus:outline-none transition-opacity duration-200 hover:opacity-80"
                      tabIndex={0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}/>
                <Legend
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{
                    fontSize: '14px',
                    paddingTop: '20px',
                  }}
                  iconSize={12}
                  formatter={(value, entry) => <span style={{ color: darkMode ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
