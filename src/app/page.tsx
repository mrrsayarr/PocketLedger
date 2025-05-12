"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { useToast } from "@/hooks/use-toast";
import {
  addTransactionToDb,
  deleteTransactionFromDb,
  getAllTransactionsFromDb,
  getTotalBalanceFromDb,
  getTotalIncomeFromDb,
  getTotalExpenseFromDb,
  getSpendingByCategoryFromDb,
  updateTransactionInDb,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc, 
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; 
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


type Transaction = {
  id: number;
  date: Date;
  category: string;
  amount: number;
  type: "income" | "expense";
  notes?: string;
};

interface Currency {
  symbol: string;
  code: string;
  name: string;
}

const currencies: Currency[] = [
  { symbol: "₺", code: "TRY", name: "Turkish Lira" },
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "€", code: "EUR", name: "Euro" },
  { symbol: "£", code: "GBP", name: "British Pound" },
  { symbol: "¥", code: "JPY", name: "Japanese Yen" },
];

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

const CHART_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#33b8ff",
  "#a4de6c", "#d0ed57", "#ffc658", "#ff7f50", "#e066ff", "#6a5acd",
  "#4CAF50", "#FFEB3B", "#9C27B0", "#795548", "#607D8B", "#F44336",
  "#E91E63", "#2196F3", "#03A9F4", "#00BCD4", "#8BC34A", "#CDDC39",
  "#FFC107", "#FF9800", "#FF5722", "#9E9E9E", "#3F51B5",
];

const CustomTooltip = ({ active, payload, currencySymbol }: { active?: boolean; payload?: any[]; currencySymbol: string; }) => {
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
      } else if (percentScaled > 0 && percentScaled.toFixed(2) === "0.00" && percentScaled !== 0) {
        displayPercentText = percentScaled.toFixed(Math.max(2, -Math.floor(Math.log10(percentScaled)) + 1 )); 
      } else {
        displayPercentText = percentScaled.toFixed(2);
      }
    } else {
      displayPercentText = 'N/A'; 
    }
    
    return (
      <div className="bg-background/80 backdrop-blur-sm p-3 border border-border rounded-lg shadow-xl text-sm">
        <p className="font-bold text-foreground mb-1">{name}</p>
        <p className="text-muted-foreground">
          Amount: <span className="font-medium text-foreground">{currencySymbol}{typeof value === 'number' ? value.toFixed(2) : 'N/A'}</span>
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
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState<string>(""); 
  const [type, setType] = useState<"income" | "expense">("expense");
  const [notesInput, setNotesInput] = useState<string>("");
  
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies.find(c => c.code === 'TRY') || currencies[0]);

  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [spendingData, setSpendingData] = useState<{ name: string; value: number }[]>([]);
  const { toast } = useToast();

  const prevBalanceRef = useRef<number>(0);
  const [showNegativeBalanceAlert, setShowNegativeBalanceAlert] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Edit Transaction State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState<{
    date: Date | undefined;
    category: string;
    amount: string;
    type: "income" | "expense";
    notes: string;
  }>({
    date: new Date(),
    category: categories[0],
    amount: "",
    type: "expense",
    notes: "",
  });


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
    setIsLoading(true);
    try {
      await loadTransactions();
      await loadDashboardData();
    } catch (error) {
        console.error("Error Loading Data:", error);
        toast({
            title: "Error Loading Data",
            description: "Could not load initial financial data. Please refresh.",
            variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  }, [loadTransactions, loadDashboardData, toast]);
  
 useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDarkMode = localStorage.getItem("darkMode");
      if (storedDarkMode === 'false') { 
        document.documentElement.classList.remove("dark");
      } else { 
        // Default to dark or if value is 'true' or null
        document.documentElement.classList.add("dark");
      }

      const storedCurrencyCode = localStorage.getItem("selectedCurrencyCode");
      if (storedCurrencyCode) {
        const foundCurrency = currencies.find(c => c.code === storedCurrencyCode);
        if (foundCurrency) {
          setSelectedCurrency(foundCurrency);
        }
      } else {
         setSelectedCurrency(currencies.find(c => c.code === 'TRY') || currencies[0]);
      }
    }
    loadInitialData();
  }, [loadInitialData]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedCurrencyCode", selectedCurrency.code);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    if (currentBalance < 0 && prevBalanceRef.current >= 0) {
      setShowNegativeBalanceAlert(true);
    } else if (currentBalance >= 0) {
      setShowNegativeBalanceAlert(false);
    }
    prevBalanceRef.current = currentBalance;
  }, [currentBalance]);


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
        notesInput
      );
      dbOpSuccessful = true;

      setDate(new Date());
      setCategory(categories[0]);
      setAmount(""); 
      setNotesInput("");
      setType("expense");
      toast({
        title: "Success",
        description: "Transaction added successfully.",
      });
      await loadTransactions(); 
      await loadDashboardData(); 
    } catch (error: any) { 
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
              description: error.message || "Could not save the transaction. Please try again.",
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

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      date: transaction.date instanceof Date && !isNaN(transaction.date.getTime()) ? new Date(transaction.date) : new Date(),
      category: transaction.category,
      amount: transaction.amount.toString(),
      type: transaction.type,
      notes: transaction.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction || !editFormData.date || isNaN(editFormData.date.getTime()) || !editFormData.category || editFormData.amount === "") {
      toast({ title: "Error", description: "Please fill all required fields with valid data for editing.", variant: "destructive" });
      return;
    }
    const numericAmount = parseFloat(editFormData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Error", description: "Amount must be a valid positive number.", variant: "destructive" });
      return;
    }

    try {
      await updateTransactionInDb(
        editingTransaction.id,
        editFormData.date.toISOString(),
        editFormData.category,
        numericAmount,
        editFormData.type,
        editFormData.notes
      );
      toast({ title: "Success", description: "Transaction updated successfully." });
      setIsEditModalOpen(false);
      setEditingTransaction(null);
      await loadTransactions();
      await loadDashboardData();
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      toast({ title: "Database Error", description: error.message || "Could not update transaction.", variant: "destructive" });
    }
  };


  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    toast({
      title: "Currency Updated",
      description: `Display currency changed to ${currency.name} (${currency.code}). Refresh page to see changes across all amounts.`,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits
    if (/^\d*$/.test(value) || value === "") { 
      setAmount(value);
    }
  };
  
  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     // Allow only digits
    if (/^\d*$/.test(value) || value === "") {
      setEditFormData(prev => ({ ...prev, amount: value }));
    }
  };


  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-6 text-xl text-foreground font-medium">Loading dashboard...</p>
        <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }


  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm text-foreground">
        <Toaster />
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center text-center sm:text-left shrink-0">
            <Icons.wallet className="h-8 w-8 sm:h-10 sm:w-10 md:mr-2" />
            <span className="hidden md:inline">PocketLedger Pro</span>
          </h1>
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/notes" passHref>
                <Button variant="outline" className="rounded-lg shadow-md hover:bg-primary/10 transition-all text-xs sm:text-sm px-3 py-1.5">
                  <Icons.notebook className="mr-1 h-4 w-4" /> My Notes
                </Button>
              </Link>
              <Link href="/debt-reduction" passHref>
                <Button variant="outline" className="rounded-lg shadow-md hover:bg-primary/10 transition-all text-xs sm:text-sm px-3 py-1.5">
                  <Icons.trendingDown className="mr-1 h-4 w-4" /> Debt Plans
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-lg shadow-md h-9 w-9">
                    <Icons.menu className="h-5 w-5" />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/90 backdrop-blur-md rounded-xl shadow-lg w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/notes" className="flex items-center w-full px-2 py-1.5 text-sm">
                      <Icons.notebook className="mr-2 h-4 w-4" /> My Notes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/debt-reduction" className="flex items-center w-full px-2 py-1.5 text-sm">
                      <Icons.trendingDown className="mr-2 h-4 w-4" /> Debt Plans
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                     <Link href="/settings" className="flex items-center w-full px-2 py-1.5 text-sm">
                       <Icons.settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out bg-card/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground">Current Balance</CardTitle>
            </CardHeader>
            <CardContent className="text-xl sm:text-3xl font-bold text-card-foreground">
              {selectedCurrency.symbol}{currentBalance.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out bg-card/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent className="text-xl sm:text-3xl font-bold text-[hsl(var(--income))]">
              {selectedCurrency.symbol}{totalIncome.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out bg-card/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent className="text-xl sm:text-3xl font-bold text-[hsl(var(--expense))]">
              {selectedCurrency.symbol}{totalExpenses.toFixed(2)}
            </CardContent>
          </Card>
        </section>

        {showNegativeBalanceAlert && (
          <Alert variant="destructive" className="mb-6 sm:mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
            <Icons.alertTriangle className="h-5 w-5" />
            <AlertTitle className="font-semibold text-lg">Attention: Balance is Negative</AlertTitle>
            <AlertDescription className="text-base">
              Your current balance has dropped below zero. It might be a good time to review your recent expenses or look for ways to increase your income. Careful planning can help you get back on track!
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 sm:mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col items-center">
                <Label htmlFor="date-calendar" className="mb-2 font-medium text-card-foreground self-start">Date</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-lg shadow-inner bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary h-10",
                        !date && "text-muted-foreground"
                      )}
                      id="date-calendar"
                    >
                      <Icons.calendarDays className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="bg-card/95 rounded-md"
                    />
                  </PopoverContent>
                </Popover>
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
                  <Label htmlFor="amount-input" className="mb-1 font-medium text-card-foreground">Amount ({selectedCurrency.symbol})</Label>
                  <Input
                    type="text" 
                    id="amount-input"
                    value={amount}
                    onChange={handleAmountChange}
                    className="rounded-lg shadow-inner p-3 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary transition-all text-sm h-10"
                    placeholder="e.g. 100"
                    aria-label="Enter transaction amount"
                    inputMode="numeric" 
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
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
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
                {currentTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No transactions yet. Add one above to get started!
                    </TableCell>
                  </TableRow>
                )}
                {currentTransactions.map((transaction) => (
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
                      {selectedCurrency.symbol}{transaction.amount.toFixed(2)}
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
                              className="max-w-md bg-popover text-popover-foreground border shadow-lg rounded-md p-2 text-sm z-50"
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
                    <TableCell className="text-right space-x-1">
                       <Button variant="ghost" size="icon" className="rounded-md shadow-sm text-primary hover:bg-primary/10 h-8 w-8 transform hover:scale-105" onClick={() => openEditModal(transaction)} aria-label={`Edit transaction for ${transaction.category} on ${format(new Date(transaction.date), "PPP")}`}>
                        <Icons.edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-md shadow-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 h-8 w-8 transition-all transform hover:scale-105"
                            aria-label={`Delete transaction for ${transaction.category} on ${format(new Date(transaction.date), "PPP")}`}
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md z-[110]">
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
            {transactions.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-lg shadow-md hover:bg-primary/10"
                >
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-lg shadow-md hover:bg-primary/10"
                >
                  Next
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Edit Transaction Modal */}
        {editingTransaction && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[525px] bg-card/90 backdrop-blur-md rounded-xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-card-foreground">Edit Transaction</DialogTitle>
                <DialogDesc className="text-muted-foreground">
                  Update the details for transaction ID: {editingTransaction.id}
                </DialogDesc>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <Label htmlFor="edit-date-calendar" className="mb-1 font-medium text-card-foreground">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal rounded-lg shadow-inner bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary h-10",
                                !editFormData.date && "text-muted-foreground"
                            )}
                            id="edit-date-calendar"
                            >
                            <Icons.calendarDays className="mr-2 h-4 w-4" />
                            {editFormData.date && !isNaN(editFormData.date.getTime()) ? format(editFormData.date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg" align="start">
                            <Calendar
                            mode="single"
                            selected={editFormData.date && !isNaN(editFormData.date.getTime()) ? editFormData.date : undefined}
                            onSelect={(d) => setEditFormData(prev => ({ ...prev, date: d }))}
                            initialFocus
                            className="bg-card/95 rounded-md"
                            />
                        </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="edit-category-select" className="mb-1 font-medium text-card-foreground">Category</Label>
                    <select
                      id="edit-category-select"
                      className="w-full rounded-lg border p-3 bg-background/70 backdrop-blur-sm shadow-inner text-foreground focus:ring-2 focus:ring-primary transition-all h-10 text-sm"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-amount-input" className="mb-1 font-medium text-card-foreground">Amount ({selectedCurrency.symbol})</Label>
                    <Input
                      type="text"
                      id="edit-amount-input"
                      value={editFormData.amount}
                      onChange={handleEditAmountChange}
                      className="rounded-lg shadow-inner p-3 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary transition-all text-sm h-10"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-type-select" className="mb-1 font-medium text-card-foreground">Type</Label>
                    <select
                      id="edit-type-select"
                      className="w-full rounded-lg border p-3 bg-background/70 backdrop-blur-sm shadow-inner text-foreground focus:ring-2 focus:ring-primary transition-all h-10 text-sm"
                      value={editFormData.type}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value as "income" | "expense" }))}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-notes-textarea" className="mb-1 font-medium text-card-foreground">Notes (Optional)</Label>
                  <Textarea
                    id="edit-notes-textarea"
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="rounded-lg shadow-inner p-3 bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary transition-all min-h-[80px] text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="rounded-lg shadow-md">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdateTransaction} className="rounded-lg shadow-md bg-primary hover:bg-primary/90">Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}


        {spendingData.length > 0 && (
          <Card className="h-[450px] sm:h-[550px] rounded-xl shadow-lg mb-6 sm:mb-8 bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Spending by Category ({selectedCurrency.symbol})</CardTitle>
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
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        className="focus:outline-none transition-opacity duration-200 hover:opacity-70 cursor-pointer"
                        tabIndex={0} 
                        aria-label={`${entry.name}: ${selectedCurrency.symbol}${entry.value.toFixed(2)}`}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip currencySymbol={selectedCurrency.symbol} />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      fontSize: window.innerWidth < 640 ? '10px' : '12px', 
                      paddingTop: '15px', 
                      color: "hsl(var(--foreground))", 
                    }}
                    iconSize={window.innerWidth < 640 ? 8 : 10} 
                    formatter={(value) => ( 
                      <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
         <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
          <div className="container mx-auto flex flex-col items-center space-y-6">
            
            <Link href="/settings" passHref>
              <Button variant="outline" className="w-full max-w-xs sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                <Icons.settings className="mr-2 h-5 w-5" />
                Application Settings
              </Button>
            </Link>
            
            <div className="w-full border-t border-border/30 pt-6 mt-2">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                © {new Date().getFullYear()} PocketLedger Pro. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
    
