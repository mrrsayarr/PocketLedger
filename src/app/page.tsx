
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  addTransactionToDb,
  deleteTransactionFromDb,
  getAllTransactionsFromDb,
  getTotalBalanceFromDb,
  getTotalIncomeFromDb,
  getTotalExpenseFromDb,
  getSpendingByCategoryFromDb,
  resetAllDataInDb,
} from "@/lib/database";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { Icons } from "@/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  "Salary", "Food", "Transport", "Entertainment", "Utilities", "Rent", "Healthcare", "Education", "Shopping", "Investments", "Gifts", "Travel", "Personal Care", "Home Improvement", "Insurance", "Taxes", "Debt Payments", "Savings", "Other",
  "Bonus", "Freelance", "Side Hustle", "Dividends", "Grants", "Lottery", "Refunds", "Allowance", "Pocket Money", "Social Security", "Pension", "Retirement Fund",
  "Charity", "Books", "Subscriptions", "Pet Care", "Groceries", "Eating Out", "Public Transport", "Fuel", "Cinema", "Concerts", "Streaming Services",
  "Electricity", "Water", "Gas", "Internet", "Mobile Phone", "Property Tax", "Service Charge", "Property Insurance", "Stationery", "Courses", "Tuition Fees",
  "Clothes", "Shoes", "Gadgets", "Furniture", "Stocks", "Bonds", "Mutual Funds", "Gifts Given", "Wedding Gifts", "Birthday Gifts", "Holiday Gifts",
  "Flights", "Hotels", "Activities", "Cosmetics", "Hairdressing", "Spa Treatments", "DIY", "Gardening", "Repairs",
  "Life Insurance", "Car Insurance", "Health Insurance", "National Insurance", "Council Tax", "VAT", "Income Tax", "Credit Card Payments", "Loan Payments",
  "Emergency Fund", "Holiday Fund", "New Car Fund", "Business Expense", "Office Supplies", "Software", "Hardware", "Marketing", "Advertising",
  "Legal Fees", "Accounting Fees", "Consulting Fees", "Bank Fees", "Interest Paid", "Childcare", "Hobbies", "Donations", "Memberships", "Home Decor",
  "Kitchenware", "Electronics", "Sporting Goods", "Toys & Games", "Baby Supplies", "Pet Food", "Veterinary", "Grooming", "Car Maintenance", "Parking Fees",
  "Public Transport Pass", "Taxi/Rideshare", "Bike Maintenance", "Gym Membership", "Sports Classes", "Medical Bills", "Prescriptions", "Dental Care", "Eye Care",
  "Therapy", "Vitamins & Supplements", "Concert Tickets", "Museums & Galleries", "Sporting Events", "Night Out", "Day Trips", "Vacation Accommodation", "Souvenirs"
];


const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#33b8ff",
  "#a4de6c", "#d0ed57", "#ffc658", "#ff7f50", "#e066ff", "#6a5acd",
  "#4CAF50", "#FFEB3B", "#9C27B0", "#795548", "#607D8B", "#F44336",
  "#E91E63", "#2196F3", "#03A9F4", "#00BCD4", "#8BC34A", "#CDDC39",
  "#FFC107", "#FF9800", "#FF5722", "#9E9E9E", "#3F51B5",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = data.name;
    const value = data.value;
    const percent = payload[0].percent;

    let displayPercentText;
    if (typeof percent === 'number' && !isNaN(percent)) {
      const percentScaled = percent * 100;
      if (percentScaled === 0) {
        displayPercentText = "0.00";
      } else if (percentScaled > 0 && percentScaled.toFixed(2) === "0.00") {
        // For very small percentages that round to 0.00, show more precision
        displayPercentText = percentScaled.toFixed(4); 
      } else {
        displayPercentText = percentScaled.toFixed(2);
      }
    } else {
      displayPercentText = '0.00'; // Fallback if percent is not a valid number
    }
    
    const displayCurrencySymbol = "₺";

    return (
      <div className="bg-background/80 backdrop-blur-sm p-3 border border-border rounded-lg shadow-xl text-sm">
        <p className="font-bold text-foreground mb-1">{name}</p>
        <p className="text-muted-foreground">
          Amount: <span className="font-medium text-foreground">{displayCurrencySymbol}{typeof value === 'number' ? value.toFixed(2) : 'N/A'}</span>
        </p>
        <p className="text-muted-foreground">
          Percentage: <span className="font-medium text-foreground">{displayPercentText}%</span>
        </p>
      </div>
    );
  }
  return null;
};


export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState<string>(""); 
  const [type, setType] = useState<"income" | "expense">("expense");
  const [notes, setNotes] = useState<string>("");
  
  const [darkMode, setDarkMode] = useState(true); 

  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [spendingData, setSpendingData] = useState<{ name: string; value: number }[]>([]);
  const { toast } = useToast();
  const displayCurrencySymbol = "₺";

  const loadTransactions = useCallback(async () => {
    const transactionsFromDb = await getAllTransactionsFromDb();
    setTransactions(transactionsFromDb);
  }, []);

  const loadDashboardData = useCallback(async () => {
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
  }, []); 

  const loadInitialData = useCallback(async () => {
    await loadTransactions();
    await loadDashboardData();
  }, [loadTransactions, loadDashboardData]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDarkMode = localStorage.getItem("darkMode");
      const initialDarkMode = storedDarkMode === null ? true : storedDarkMode === "true";
      setDarkMode(initialDarkMode);
      // Class application is handled by the useEffect hook observing `darkMode` state.
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("darkMode", darkMode.toString());
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode]);

  useEffect(() => {
    loadInitialData().catch(error => {
        console.error("Error Loading Data:", error);
        toast({
            title: "Error Loading Data",
            description: "Could not load initial financial data. Please refresh.",
            variant: "destructive",
        });
    });
  }, [loadInitialData, toast]);


  const addTransaction = async () => {
    const numericAmount = parseFloat(amount);
    if (!date || !category || amount === "" || isNaN(numericAmount)) {
      toast({
        title: "Error",
        description: "Please fill in date, category, and a valid amount.",
        variant: "destructive",
      });
      return;
    }
    if (numericAmount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }
    let dbOpSuccessful = false;
    try {
      await addTransactionToDb(
        date.toISOString(),
        category,
        numericAmount,
        type,
        notes
      );
      dbOpSuccessful = true;

      setDate(new Date());
      setCategory(categories[0]);
      setAmount(""); 
      setNotes("");
      setType("expense");
      toast({
        title: "Success",
        description: "Transaction added successfully.",
      });
      await loadTransactions(); 
      await loadDashboardData(); 
    } catch (error) { 
        console.error("Error during transaction operation:", error);
        if (dbOpSuccessful) {
            toast({
              title: "Data Reload Error",
              description: "Transaction saved, but failed to reload data. Please refresh.",
              variant: "destructive",
            });
        } else {
            toast({
              title: "Database Error",
              description: "Could not save the transaction. Please try again.",
              variant: "destructive",
            });
        }
    }
  };

  const deleteTransaction = async (id: number) => {
    await deleteTransactionFromDb(id);
    toast({
      title: "Success",
      description: "Transaction deleted successfully.",
    });
    await loadTransactions();
    await loadDashboardData();
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleResetData = useCallback(async () => {
    await resetAllDataInDb();
    toast({
      title: "Success!",
      description: "All your data has been reset.",
    });
    await loadInitialData();
  }, [toast, loadInitialData]);

  useEffect(() => {
    const pressedKeys = new Set<string>();

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() !== 'control' && event.key.toLowerCase() !== 'shift' && event.key.toLowerCase() !== 'alt' && event.key.toLowerCase() !== 'meta') {
            pressedKeys.add(event.key.toLowerCase());
        }

        // Check for Shift + S + D
        if (event.shiftKey && pressedKeys.has('s') && pressedKeys.has('d')) {
             // Ensure the last key pressed is S or D to complete the combo
            if (event.key.toLowerCase() === 's' || event.key.toLowerCase() === 'd') {
                event.preventDefault(); 
                handleResetData(); 
                // Clear the pressed keys after action
                pressedKeys.delete('s');
                pressedKeys.delete('d');
            }
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        pressedKeys.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleResetData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers (integers)
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent '.', ',', 'e', '+', '-'
    if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };


  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm">
        <Toaster />
        <header className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center">
            <Icons.wallet className="mr-2 h-8 w-8 sm:h-10 sm:w-10" />
            PocketLedger Pro
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/notes" passHref>
              <Button variant="outline" className="rounded-lg shadow-md hover:bg-primary/10 transition-all text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                <Icons.notebook className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                My Notes
              </Button>
            </Link>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Label htmlFor="dark-mode" className="text-sm font-medium text-foreground sr-only sm:not-sr-only">
                {darkMode ? <Icons.dark className="h-5 w-5" /> : <Icons.light className="h-5 w-5" />}
              </Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted shadow-inner rounded-full"
                aria-label="Toggle dark mode"
              />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out bg-card/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground">Current Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-xl sm:text-3xl font-bold text-card-foreground">
              {displayCurrencySymbol}{currentBalance.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out bg-card/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent className="text-xl sm:text-3xl font-bold text-[hsl(var(--income))]">
              {displayCurrencySymbol}{totalIncome.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out bg-card/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent className="text-xl sm:text-3xl font-bold text-[hsl(var(--expense))]">
              {displayCurrencySymbol}{totalExpenses.toFixed(2)}
            </CardContent>
          </Card>
        </section>

        <Card className="mb-6 sm:mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <Label htmlFor="date-calendar" className="mb-2 font-medium text-card-foreground self-start">Date</Label>
                <Calendar
                  id="date-calendar"
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg border p-3 w-full shadow-inner bg-background/70 backdrop-blur-sm"
                  aria-label="Select transaction date"
                />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="category-select" className="mb-1 font-medium text-card-foreground">Category</Label>
                  <select
                    id="category-select"
                    className="w-full rounded-lg border p-3 bg-background/70 backdrop-blur-sm shadow-inner text-foreground focus:ring-2 focus:ring-primary transition-all h-10 text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Select transaction category"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount-input" className="mb-1 font-medium text-card-foreground">Amount</Label>
                  <Input
                    type="text" 
                    id="amount-input"
                    value={amount}
                    onChange={handleAmountChange}
                    onKeyDown={handleAmountKeyDown}
                    className="rounded-lg shadow-inner p-3 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary transition-all text-sm h-10"
                    placeholder="e.g. 100"
                    aria-label="Enter transaction amount"
                    inputMode="numeric" 
                    pattern="[0-9]*"
                  />
                </div>
                <div>
                  <Label htmlFor="type-select" className="mb-1 font-medium text-card-foreground">Type</Label>
                  <select
                    id="type-select"
                    className="w-full rounded-lg border p-3 bg-background/70 backdrop-blur-sm shadow-inner text-foreground focus:ring-2 focus:ring-primary transition-all h-10 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value as "income" | "expense")}
                    aria-label="Select transaction type"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes-textarea" className="mb-1 font-medium text-card-foreground">Notes (Optional)</Label>
                <Textarea
                  id="notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-lg shadow-inner p-3 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary transition-all min-h-[80px] text-sm"
                  placeholder="Add any relevant notes..."
                  aria-label="Enter transaction notes"
                />
              </div>
            </div>
            <Button className="mt-6 w-full md:w-auto rounded-lg shadow-md text-base sm:text-lg py-2.5 sm:py-3 px-5 sm:px-6 bg-primary hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105" onClick={addTransaction}>
              Add Transaction
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6 sm:mb-8 rounded-xl shadow-lg flex-grow bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-card-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-card-foreground">Category</TableHead>
                  <TableHead className="font-semibold text-right text-card-foreground">Amount</TableHead>
                  <TableHead className="font-semibold text-card-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-card-foreground">Notes</TableHead>
                  <TableHead className="font-semibold text-right text-card-foreground">Actions</TableHead>
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
                  <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors duration-200 ease-in-out">
                    <TableCell className="text-foreground whitespace-nowrap text-sm">
                      {format(new Date(transaction.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-foreground text-sm">{transaction.category}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium whitespace-nowrap text-sm",
                        transaction.type === "income"
                          ? "text-[hsl(var(--income))]"
                          : "text-[hsl(var(--expense))]"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {displayCurrencySymbol}{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                          transaction.type === "income"
                            ? "bg-[hsl(var(--income))]/20 text-[hsl(var(--income))]"
                            : "bg-[hsl(var(--expense))]/20 text-[hsl(var(--expense))]"
                        )}
                      >
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {transaction.notes ? (
                        transaction.notes.split(" ").length > 6 ? (
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger className="cursor-default text-left w-full">
                              <p className="max-w-xs truncate">
                                {transaction.notes.split(" ").slice(0, 6).join(" ") + "..."}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              align="start"
                              className="max-w-md bg-popover text-popover-foreground border shadow-lg rounded-md p-2 text-sm"
                            >
                              <p className="whitespace-pre-wrap">{transaction.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <p className="max-w-xs truncate">{transaction.notes}</p>
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-md shadow-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 transition-all transform hover:scale-105"
                            aria-label={`Delete transaction for ${transaction.category} on ${format(new Date(transaction.date), "PPP")}`}
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md z-[110]"> {/* Ensure z-index is high enough */}
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-card-foreground">Delete Transaction?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Are you sure you want to delete this transaction? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg hover:bg-muted/20">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTransaction(transaction.id)}
                              className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {spendingData.length > 0 && (
          <Card className="h-[450px] sm:h-[550px] rounded-xl shadow-lg mb-6 sm:mb-8 bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Spending by Category ({displayCurrencySymbol})</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
                      const RADIAN = Math.PI / 180;
                      const radiusPercentLabel = innerRadius + (outerRadius - innerRadius) * 0.45;
                      const xPercentLabel = cx + radiusPercentLabel * Math.cos(-midAngle * RADIAN);
                      const yPercentLabel = cy + radiusPercentLabel * Math.sin(-midAngle * RADIAN);

                      const radiusNameLabel = outerRadius + (window.innerWidth < 640 ? 20 : 30);
                      const xNameLabel = cx + radiusNameLabel * Math.cos(-midAngle * RADIAN);
                      const yNameLabel = cy + radiusNameLabel * Math.sin(-midAngle * RADIAN);

                      const displayPercentVal = (typeof percent === 'number' && !isNaN(percent)) ? (percent * 100).toFixed(0) : '0';

                      // Do not render label if value is 0 or percent is too small (for many categories)
                      if (typeof value === 'number' && value === 0) return null; 
                      if (spendingData.length > 5 && parseFloat(displayPercentVal) < 2) return null;


                      return (
                        <>
                          <text
                            x={xPercentLabel}
                            y={yPercentLabel}
                            fill="hsl(var(--card-foreground))"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={window.innerWidth < 640 ? 10 : 12}
                            fontWeight="bold"
                            className="opacity-90 pointer-events-none"
                          >
                            {`${displayPercentVal}%`}
                          </text>
                          <text
                            x={xNameLabel}
                            y={yNameLabel}
                            fill="hsl(var(--foreground))"
                            textAnchor={xNameLabel > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fontSize={window.innerWidth < 640 ? 10 : 14}
                            className="font-medium pointer-events-none"
                          >
                            {name}
                          </text>
                        </>
                      );
                    }}
                    outerRadius="70%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {spendingData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="focus:outline-none transition-opacity duration-200 hover:opacity-70 cursor-pointer"
                        tabIndex={0} // Make cells focusable for accessibility/keyboard nav
                        aria-label={`${entry.name}: ${displayCurrencySymbol}${entry.value.toFixed(2)}`}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      fontSize: window.innerWidth < 640 ? '10px' : '12px', // Responsive font size
                      paddingTop: '15px', // Space above legend
                      color: "hsl(var(--foreground))", // Ensure legend text color matches theme
                    }}
                    iconSize={window.innerWidth < 640 ? 8 : 10} // Responsive icon size
                    formatter={(value) => ( // Ensure legend item text uses foreground color
                      <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
          <div className="container mx-auto flex flex-col items-center space-y-4">
             <div className="flex space-x-4">
                <Link href="/about" passHref>
                    <Button variant="link" className="text-primary hover:underline">
                    About (English)
                    </Button>
                </Link>
                <Link href="/about-tr" passHref>
                    <Button variant="link" className="text-primary hover:underline">
                    Hakkında (Türkçe)
                    </Button>
                </Link>
                <Link href="/about-es" passHref>
                    <Button variant="link" className="text-primary hover:underline">
                    Acerca de (Español)
                    </Button>
                </Link>
             </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-lg shadow-md hover:bg-destructive/90 transition-all">
                  <Icons.refreshCw className="mr-2 h-4 w-4" /> Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md z-[110]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-card-foreground">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This action cannot be undone. This will permanently delete all
                    your transaction data from the application.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg hover:bg-muted/20">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetData}
                    className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground/80">
              (Tip: Press Shift + S + D to reset data without confirmation)
            </p>
            <p className="text-sm text-foreground">
              © {new Date().getFullYear()} PocketLedger Pro. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}



