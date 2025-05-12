
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc, // Renamed to avoid conflict
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getDebtTranslation, getTranslatedOptions, getDebtTypeKeyFromValue, getPaymentFrequencyKeyFromValue, type Language, debtTranslations } from "./translations";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


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

export type DebtPayment = {
  id: string;
  paymentDate: Date;
  amountPaid: number;
  notes?: string;
};

export type Debt = {
  id: string;
  name: string;
  lender: string;
  initialAmount: number;
  currentBalance: number;
  interestRate?: number; // Annual percentage
  minimumPayment: number;
  paymentFrequency:
    | "Monthly"
    | "Weekly"
    | "Bi-Weekly"
    | "Annually"
    | "One-time";
  nextDueDate: Date;
  debtType:
    | "Credit Card"
    | "Consumer Loan"
    | "Mortgage"
    | "Student Loan"
    | "Auto Loan"
    | "Personal Debt"
    | "Other";
  startDate?: Date;
  notes?: string;
  payments: DebtPayment[];
  createdAt: Date;
  isPaidOff: boolean;
};


export default function DebtManagementPage() {
  const { toast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("₺");
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  // New Debt Form State
  const [debtName, setDebtName] = useState("");
  const [lender, setLender] = useState("");
  const [initialAmount, setInitialAmount] = useState<string>("");
  const [currentBalanceForm, setCurrentBalanceForm] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [minimumPayment, setMinimumPayment] = useState<string>("");
  const [paymentFrequency, setPaymentFrequency] = useState<Debt["paymentFrequency"]>("Monthly");
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>(new Date());
  const [debtType, setDebtType] = useState<Debt["debtType"]>("Credit Card");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [debtNotes, setDebtNotes] = useState("");

  // Payment Modal State
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [paymentNotes, setPaymentNotes] = useState("");
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDarkMode = localStorage.getItem("darkMode");
      if (storedDarkMode === 'true') {
        document.documentElement.classList.add("dark");
      } else { 
        document.documentElement.classList.remove("dark"); 
      }

      const storedCurrencyCode = localStorage.getItem("selectedCurrencyCode");
      const foundCurrency = currencies.find(c => c.code === storedCurrencyCode) || currencies.find(c => c.code === 'TRY') || currencies[0];
      setCurrencySymbol(foundCurrency.symbol);

      const storedDebts = localStorage.getItem("pocketLedgerDebts");
      if (storedDebts) {
        try {
          setDebts(
            JSON.parse(storedDebts).map((debt: any) => ({
              ...debt,
              nextDueDate: new Date(debt.nextDueDate),
              startDate: debt.startDate ? new Date(debt.startDate) : undefined,
              createdAt: new Date(debt.createdAt),
              payments: debt.payments.map((p: any) => ({...p, paymentDate: new Date(p.paymentDate)})),
            }))
          );
        } catch (error) {
          console.error(getDebtTranslation(currentLanguage, "toastLoadingError"), error);
          setDebts([]);
        }
      }
      const storedLang = localStorage.getItem("pocketLedgerDebtLang") as Language | null;
      if (storedLang && debtTranslations[storedLang]) {
        setCurrentLanguage(storedLang);
      } else {
        setCurrentLanguage("en"); // Default to English if no preference or invalid preference
      }
      setIsLoading(false);
    }
  }, [currentLanguage]); 

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      localStorage.setItem("pocketLedgerDebts", JSON.stringify(debts));
    }
  }, [debts, isLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
     localStorage.setItem("pocketLedgerDebtLang", currentLanguage);
    }
  }, [currentLanguage]);


  const resetDebtForm = () => {
    setDebtName("");
    setLender("");
    setInitialAmount("");
    setCurrentBalanceForm("");
    setInterestRate("");
    setMinimumPayment("");
    setPaymentFrequency("Monthly");
    setNextDueDate(new Date());
    setDebtType("Credit Card");
    setStartDate(undefined);
    setDebtNotes("");
  };

  const handleAddDebt = () => {
    if (!debtName || !lender || !initialAmount || !minimumPayment || !nextDueDate || !paymentFrequency || !debtType) {
      toast({ title: getDebtTranslation(currentLanguage, "toastErrorTitle"), description: getDebtTranslation(currentLanguage, "toastFillRequiredFields"), variant: "destructive" });
      return;
    }
    const parsedInitialAmount = parseFloat(initialAmount);
    const parsedCurrentBalance = parseFloat(currentBalanceForm || initialAmount);
    const parsedMinimumPayment = parseFloat(minimumPayment);
    const parsedInterestRate = interestRate ? parseFloat(interestRate) : undefined;

    if (isNaN(parsedInitialAmount) || isNaN(parsedCurrentBalance) || isNaN(parsedMinimumPayment) || (interestRate && isNaN(parsedInterestRate as number))) {
        toast({ title: getDebtTranslation(currentLanguage, "toastErrorTitle"), description: getDebtTranslation(currentLanguage, "toastValidNumbers"), variant: "destructive" });
        return;
    }
    
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: debtName,
      lender,
      initialAmount: parsedInitialAmount,
      currentBalance: parsedCurrentBalance,
      interestRate: parsedInterestRate,
      minimumPayment: parsedMinimumPayment,
      paymentFrequency, 
      nextDueDate,
      debtType, 
      startDate,
      notes: debtNotes,
      payments: [],
      createdAt: new Date(),
      isPaidOff: false,
    };
    setDebts(prev => [newDebt, ...prev.filter(d => !d.isPaidOff), ...prev.filter(d => d.isPaidOff)]);
    resetDebtForm();
    toast({ title: getDebtTranslation(currentLanguage, "toastDebtAddedTitle"), description: getDebtTranslation(currentLanguage, "toastDebtAddedDescription", debtName) });
  };

  const handleDeleteDebt = (debtId: string) => {
    setDebts(prev => prev.filter(d => d.id !== debtId));
    toast({ title: getDebtTranslation(currentLanguage, "toastDebtDeletedTitle"), variant: "destructive" });
  };

  const handleOpenPaymentModal = (debt: Debt) => {
    setSelectedDebtForPayment(debt);
    setPaymentAmount(debt.minimumPayment.toString()); 
    setPaymentDate(new Date());
    setPaymentNotes("");
    setIsPaymentModalOpen(true);
  };
  
  const handleAddPayment = () => {
    if (!selectedDebtForPayment || !paymentAmount || !paymentDate) {
      toast({ title: getDebtTranslation(currentLanguage, "toastErrorTitle"), description: getDebtTranslation(currentLanguage, "toastPaymentAmountDateRequired"), variant: "destructive" });
      return;
    }
    const parsedPaymentAmount = parseFloat(paymentAmount);
     if (isNaN(parsedPaymentAmount) || parsedPaymentAmount <= 0) {
      toast({ title: getDebtTranslation(currentLanguage, "toastErrorTitle"), description: getDebtTranslation(currentLanguage, "toastValidPositivePayment"), variant: "destructive" });
      return;
    }

    const newPayment: DebtPayment = {
      id: Date.now().toString(),
      paymentDate,
      amountPaid: parsedPaymentAmount,
      notes: paymentNotes,
    };

    setDebts(prevDebts => prevDebts.map(debt => {
      if (debt.id === selectedDebtForPayment.id) {
        const updatedBalance = Math.max(0, debt.currentBalance - parsedPaymentAmount);
        return {
          ...debt,
          currentBalance: updatedBalance,
          payments: [...debt.payments, newPayment],
          isPaidOff: updatedBalance === 0 ? true : debt.isPaidOff,
        };
      }
      return debt;
    }));
    
    toast({ title: getDebtTranslation(currentLanguage, "toastPaymentAddedTitle"), description: getDebtTranslation(currentLanguage, "toastPaymentAddedDescription", currencySymbol, parsedPaymentAmount, selectedDebtForPayment.name) });
    setIsPaymentModalOpen(false); 
    setSelectedDebtForPayment(null); 
  };

  const handleMarkAsPaid = (debtId: string) => {
    setDebts(prevDebts => {
      const updatedDebts = prevDebts.map(debt =>
        debt.id === debtId ? { ...debt, isPaidOff: true, currentBalance: 0 } : debt
      );
      return [...updatedDebts.filter(d => !d.isPaidOff), ...updatedDebts.filter(d => d.isPaidOff)];
    });
    toast({ title: getDebtTranslation(currentLanguage, "toastDebtStatusUpdatedTitle"), description: getDebtTranslation(currentLanguage, "toastDebtMarkedAsPaid") });
  };

  const activeDebts = useMemo(() => debts.filter(d => !d.isPaidOff), [debts]);
  const paidDebts = useMemo(() => debts.filter(d => d.isPaidOff), [debts]);

  const totalRemainingDebt = useMemo(() => activeDebts.reduce((sum, debt) => sum + debt.currentBalance, 0), [activeDebts]);
  const totalMinimumMonthlyPayment = useMemo(() => activeDebts.filter(d=> d.paymentFrequency === "Monthly").reduce((sum, debt) => sum + debt.minimumPayment, 0), [activeDebts]);
  const totalMinimumWeeklyPayment = useMemo(() => activeDebts.filter(d=> d.paymentFrequency === "Weekly").reduce((sum, debt) => sum + debt.minimumPayment, 0), [activeDebts]);


  const translatedDebtTypeOptions = useMemo(() => getTranslatedOptions(currentLanguage, 'debtTypes'), [currentLanguage]);
  const translatedPaymentFrequencyOptions = useMemo(() => getTranslatedOptions(currentLanguage, 'paymentFrequencies'), [currentLanguage]);


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
        <Icons.loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading debt information...</p>
      </div>
    );
  }
  
  const currentPaymentFrequencyDisplay = debtTranslations[currentLanguage]?.paymentFrequencies[paymentFrequency] || debtTranslations.en.paymentFrequencies[paymentFrequency];
  const currentDebtTypeDisplay = debtTranslations[currentLanguage]?.debtTypes[debtType] || debtTranslations.en.debtTypes[debtType];


  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm text-foreground">
      <Toaster />
      <header className="flex flex-col text-center sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.trendingDown className="h-8 w-8 sm:h-10 sm:w-10 md:mr-2" />
          <span className="hidden md:inline">{getDebtTranslation(currentLanguage, "pageTitle")}</span>
        </h1>
        <div className="flex items-center space-x-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-lg shadow-md">
                        <Icons.languages className="mr-2 h-5 w-5" />
                        {currentLanguage.toUpperCase()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/90 backdrop-blur-md rounded-xl shadow-lg">
                    <DropdownMenuItem onClick={() => setCurrentLanguage("en")} className={cn("cursor-pointer",currentLanguage === "en" && "bg-primary/20 font-semibold")}>
                        {getDebtTranslation("en", "english")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentLanguage("tr")} className={cn("cursor-pointer", currentLanguage === "tr" && "bg-primary/20 font-semibold")}>
                        {getDebtTranslation("tr", "turkish")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/" passHref>
            <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
                <Icons.arrowLeft className="mr-2 h-5 w-5" />
                {getDebtTranslation(currentLanguage, "backToDashboard")}
            </Button>
            </Link>
        </div>
      </header>

      <Card className="mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">{getDebtTranslation(currentLanguage, "addNewDebt")}</CardTitle>
          <CardDescription>{getDebtTranslation(currentLanguage, "addNewDebtDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="debtName">{getDebtTranslation(currentLanguage, "debtNameLabel")}</Label>
            <Input id="debtName" value={debtName} onChange={e => setDebtName(e.target.value)} placeholder={getDebtTranslation(currentLanguage, "debtNamePlaceholder")} className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="lender">{getDebtTranslation(currentLanguage, "lenderLabel")}</Label>
            <Input id="lender" value={lender} onChange={e => setLender(e.target.value)} placeholder={getDebtTranslation(currentLanguage, "lenderPlaceholder")} className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="initialAmount">{getDebtTranslation(currentLanguage, "initialAmountLabel")} ({currencySymbol})</Label>
            <Input id="initialAmount" type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} placeholder="Örn: 5000" className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="currentBalanceForm">{getDebtTranslation(currentLanguage, "currentBalanceLabel")} ({currencySymbol})</Label>
            <Input id="currentBalanceForm" type="number" value={currentBalanceForm} onChange={e => setCurrentBalanceForm(e.target.value)} placeholder={getDebtTranslation(currentLanguage, "currentBalancePlaceholder")} className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="interestRate">{getDebtTranslation(currentLanguage, "interestRateLabel")}</Label>
            <Input id="interestRate" type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder={getDebtTranslation(currentLanguage, "interestRatePlaceholder")} className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="minimumPayment">{getDebtTranslation(currentLanguage, "minimumPaymentLabel")} ({currencySymbol})</Label>
            <Input id="minimumPayment" type="number" value={minimumPayment} onChange={e => setMinimumPayment(e.target.value)} placeholder={getDebtTranslation(currentLanguage, "minimumPaymentPlaceholder")} className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="paymentFrequency">{getDebtTranslation(currentLanguage, "paymentFrequencyLabel")}</Label>
            <Select 
                value={currentPaymentFrequencyDisplay} 
                onValueChange={(value) => setPaymentFrequency(getPaymentFrequencyKeyFromValue(value, currentLanguage))}
            >
              <SelectTrigger className="rounded-lg shadow-inner"><SelectValue placeholder={getDebtTranslation(currentLanguage, "paymentFrequencyPlaceholder")} /></SelectTrigger>
              <SelectContent className="bg-popover rounded-lg shadow-lg">
                {translatedPaymentFrequencyOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nextDueDate">{getDebtTranslation(currentLanguage, "nextDueDateLabel")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-lg shadow-inner", !nextDueDate && "text-muted-foreground")}>
                  <Icons.calendarDays className="mr-2 h-4 w-4" />
                  {nextDueDate ? format(nextDueDate, "PPP") : <span>{getDebtTranslation(currentLanguage, "pickDate")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg z-[51]" align="start">
                <Calendar mode="single" selected={nextDueDate} onSelect={setNextDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="debtType">{getDebtTranslation(currentLanguage, "debtTypeLabel")}</Label>
            <Select 
                value={currentDebtTypeDisplay}
                onValueChange={(value) => setDebtType(getDebtTypeKeyFromValue(value, currentLanguage))}
            >
              <SelectTrigger className="rounded-lg shadow-inner"><SelectValue placeholder={getDebtTranslation(currentLanguage, "debtTypePlaceholder")} /></SelectTrigger>
              <SelectContent className="bg-popover rounded-lg shadow-lg">
                {translatedDebtTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <Label htmlFor="startDate">{getDebtTranslation(currentLanguage, "startDateLabel")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-lg shadow-inner", !startDate && "text-muted-foreground")}>
                  <Icons.calendarDays className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>{getDebtTranslation(currentLanguage, "pickDate")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg z-[51]" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <Label htmlFor="debtNotes">{getDebtTranslation(currentLanguage, "notesLabel")}</Label>
            <Textarea id="debtNotes" value={debtNotes} onChange={e => setDebtNotes(e.target.value)} placeholder={getDebtTranslation(currentLanguage, "debtNotesPlaceholder")} className="rounded-lg shadow-inner min-h-[40px]" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddDebt} className="rounded-lg shadow-md bg-primary hover:bg-primary/90">
            <Icons.plusCircle className="mr-2 h-5 w-5" /> {getDebtTranslation(currentLanguage, "addDebtButton")}
          </Button>
        </CardFooter>
      </Card>

      <Card className="mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">{getDebtTranslation(currentLanguage, "debtOverview")}</CardTitle>
          <div className="flex flex-col sm:flex-row justify-between text-sm mt-2">
            <p>{getDebtTranslation(currentLanguage, "totalRemainingDebt")}: <span className="font-bold text-destructive">{currencySymbol}{totalRemainingDebt.toFixed(2)}</span></p>
            <p>{getDebtTranslation(currentLanguage, "totalMinPaymentByType", debtTranslations[currentLanguage].paymentFrequencies["Monthly"] )}: <span className="font-bold text-primary">{currencySymbol}{totalMinimumMonthlyPayment.toFixed(2)}</span></p>
          </div>
        </CardHeader>
        <CardContent>
          {activeDebts.length === 0 && <p className="text-muted-foreground text-center py-4">{getDebtTranslation(currentLanguage, "noActiveDebts")}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDebts.map(debt => (
              <Card key={debt.id} className="rounded-xl shadow-md hover:shadow-lg transition-shadow bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">{debt.name}</CardTitle>
                  <CardDescription>{debt.lender} - {debtTranslations[currentLanguage]?.debtTypes[debt.debtType] || debt.debtType}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>{getDebtTranslation(currentLanguage, "remainingBalance")}: <span className="font-bold text-lg text-destructive">{currencySymbol}{debt.currentBalance.toFixed(2)}</span></p>
                  <Progress value={(debt.initialAmount - debt.currentBalance) / debt.initialAmount * 100} className="h-2 my-1" />
                  <p>{getDebtTranslation(currentLanguage, "minPayment")}: {currencySymbol}{debt.minimumPayment.toFixed(2)} ({debtTranslations[currentLanguage]?.paymentFrequencies[debt.paymentFrequency] || debt.paymentFrequency})</p>
                  <p>{getDebtTranslation(currentLanguage, "nextDueDateLabel")}: <span className={cn(new Date(debt.nextDueDate) < new Date() && "text-destructive font-bold")}>{format(new Date(debt.nextDueDate), "PPP")}</span></p>
                  {debt.interestRate !== undefined && <p>{getDebtTranslation(currentLanguage, "interestRate")}: {debt.interestRate.toFixed(2)}%</p>}
                  <p className="text-xs text-muted-foreground">{getDebtTranslation(currentLanguage, "addedOn")}: {format(new Date(debt.createdAt), "PP")}</p>
                </CardContent>
                <CardFooter className="flex justify-between pt-3">
                  <Button size="sm" variant="outline" onClick={() => handleOpenPaymentModal(debt)} className="rounded-lg shadow-sm hover:bg-primary/10">
                    <Icons.creditCard className="mr-2 h-4 w-4" /> {getDebtTranslation(currentLanguage, "makeViewPaymentButton")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-md h-8 w-8">
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>{getDebtTranslation(currentLanguage, "deleteDebtTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{getDebtTranslation(currentLanguage, "deleteDebtDescription", debt.name)}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">{getDebtTranslation(currentLanguage, "cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteDebt(debt.id)} className="bg-destructive hover:bg-destructive/90 rounded-lg">{getDebtTranslation(currentLanguage, "delete")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
       {paidDebts.length > 0 && (
        <Card className="mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold">{getDebtTranslation(currentLanguage, "paidOffDebts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidDebts.map(debt => (
                <Card key={debt.id} className="rounded-xl shadow-md bg-card/60 backdrop-blur-sm opacity-70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">{debt.name}</CardTitle>
                    <CardDescription>{debt.lender} - {debtTranslations[currentLanguage]?.debtTypes[debt.debtType] || debt.debtType}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="text-green-600 dark:text-green-400 font-bold">{getDebtTranslation(currentLanguage, "fullyPaid")}</p>
                    <p>{getDebtTranslation(currentLanguage, "initialAmount")}: {currencySymbol}{debt.initialAmount.toFixed(2)}</p>
                     <p className="text-xs text-muted-foreground">{getDebtTranslation(currentLanguage, "addedOn")}: {format(new Date(debt.createdAt), "PP")}</p>
                     {debt.payments.length > 0 && <p className="text-xs text-muted-foreground">{getDebtTranslation(currentLanguage, "lastPayment")}: {format(new Date(debt.payments[debt.payments.length-1].paymentDate), "PP")}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">{getDebtTranslation(currentLanguage, "debtReductionStrategies")}</CardTitle>
          <CardDescription>{getDebtTranslation(currentLanguage, "debtReductionStrategiesDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="snowball">
              <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                {getDebtTranslation(currentLanguage, "debtSnowballTitle")}
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>{getDebtTranslation(currentLanguage, "debtSnowballDescription")}</p>
                <h4 className="font-semibold text-card-foreground">{getDebtTranslation(currentLanguage, "strategyHowItWorks")}</h4>
                <p>{getDebtTranslation(currentLanguage, "snowballHowItWorks")}</p>
                <h4 className="font-semibold text-card-foreground">{getDebtTranslation(currentLanguage, "strategyPros")}</h4>
                <p>{getDebtTranslation(currentLanguage, "snowballPros")}</p>
                <h4 className="font-semibold text-card-foreground">{getDebtTranslation(currentLanguage, "strategyCons")}</h4>
                <p>{getDebtTranslation(currentLanguage, "snowballCons")}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="avalanche">
              <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                {getDebtTranslation(currentLanguage, "debtAvalancheTitle")}
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                <p>{getDebtTranslation(currentLanguage, "debtAvalancheDescription")}</p>
                <h4 className="font-semibold text-card-foreground">{getDebtTranslation(currentLanguage, "strategyHowItWorks")}</h4>
                <p>{getDebtTranslation(currentLanguage, "avalancheHowItWorks")}</p>
                <h4 className="font-semibold text-card-foreground">{getDebtTranslation(currentLanguage, "strategyPros")}</h4>
                <p>{getDebtTranslation(currentLanguage, "avalanchePros")}</p>
                <h4 className="font-semibold text-card-foreground">{getDebtTranslation(currentLanguage, "strategyCons")}</h4>
                <p>{getDebtTranslation(currentLanguage, "avalancheCons")}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="mt-6 p-4 border border-dashed border-border rounded-lg bg-background/50">
             <h4 className="font-semibold text-card-foreground mb-2">{getDebtTranslation(currentLanguage, "considerations")}</h4>
            <p className="text-sm text-muted-foreground">{getDebtTranslation(currentLanguage, "considerationsText")}</p>
          </div>
           <Card data-ai-hint="finance planning" className="bg-primary/5 p-6 rounded-lg shadow-sm border border-primary/20">
            <CardHeader className="p-0 mb-3">
                <CardTitle className="text-lg font-semibold text-primary flex items-center">
                    <Icons.sparkles className="mr-2 h-5 w-5 text-primary" /> 
                    {getDebtTranslation(currentLanguage, "aiStrategyTitle")}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <p className="text-sm text-muted-foreground mb-4">
                    {getDebtTranslation(currentLanguage, "aiStrategyDescription")}
                </p>
                <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-sm border-primary/30 text-primary hover:bg-primary/10">
                    <Icons.wand2 className="mr-2 h-4 w-4" /> {getDebtTranslation(currentLanguage, "aiStrategyButton")}
                </Button>
                <p className="text-xs text-muted-foreground/70 mt-3 text-center">
                    {getDebtTranslation(currentLanguage, "aiStrategyComingSoon")}
                </p>
            </CardContent>
        </Card>
        </CardContent>
      </Card>

      {selectedDebtForPayment && (
        <Dialog open={isPaymentModalOpen} onOpenChange={(isOpen) => {
            setIsPaymentModalOpen(isOpen);
            if (!isOpen) setSelectedDebtForPayment(null);
        }}>
          <DialogContent className="sm:max-w-[525px] bg-card/90 backdrop-blur-md rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{getDebtTranslation(currentLanguage, "paymentModalTitle", selectedDebtForPayment.name)}</DialogTitle>
              <DialogDesc>
                {getDebtTranslation(currentLanguage, "remainingBalance")}: {currencySymbol}{selectedDebtForPayment.currentBalance.toFixed(2)}
              </DialogDesc>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-md">{getDebtTranslation(currentLanguage, "addPaymentCardTitle")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="paymentAmount">{getDebtTranslation(currentLanguage, "paymentAmountLabel")} ({currencySymbol})</Label>
                    <Input id="paymentAmount" type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="rounded-lg shadow-inner" />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">{getDebtTranslation(currentLanguage, "paymentDateLabel")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-lg shadow-inner", !paymentDate && "text-muted-foreground")}>
                          <Icons.calendarDays className="mr-2 h-4 w-4" />
                          {paymentDate ? format(paymentDate, "PPP") : <span>{getDebtTranslation(currentLanguage, "pickDate")}</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg z-[51]" align="start">
                        <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="paymentNotes">{getDebtTranslation(currentLanguage, "paymentNotesLabel")}</Label>
                    <Textarea id="paymentNotes" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder={getDebtTranslation(currentLanguage, "paymentNotesPlaceholder")} className="rounded-lg shadow-inner min-h-[60px]" />
                  </div>
                  <Button onClick={handleAddPayment} className="w-full rounded-lg shadow-md bg-primary hover:bg-primary/90"><Icons.checkCircle className="mr-2 h-5 w-5" /> {getDebtTranslation(currentLanguage, "savePaymentButton")}</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-md">{getDebtTranslation(currentLanguage, "paymentHistoryCardTitle")}</CardTitle></CardHeader>
                <CardContent>
                  {selectedDebtForPayment.payments.length === 0 ? <p className="text-sm text-muted-foreground">{getDebtTranslation(currentLanguage, "noPaymentsYet")}</p> : (
                    <ul className="space-y-2 text-sm">
                      {selectedDebtForPayment.payments.slice().reverse().map(p => (
                        <li key={p.id} className="flex justify-between items-center border-b pb-1 last:border-b-0">
                          <span>{format(new Date(p.paymentDate), "PPP")}</span>
                          <span className="font-medium">{currencySymbol}{p.amountPaid.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="sm:justify-between">
              {!selectedDebtForPayment.isPaidOff && selectedDebtForPayment.currentBalance === 0 && (
                <Button variant="outline" onClick={() => { handleMarkAsPaid(selectedDebtForPayment.id); setIsPaymentModalOpen(false); }} className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md">
                  <Icons.checkCircle className="mr-2 h-5 w-5" /> {getDebtTranslation(currentLanguage, "markAsFullyPaidButton")}
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="rounded-lg shadow-md">{getDebtTranslation(currentLanguage, "closeButton")}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-foreground">
            {getDebtTranslation(currentLanguage, "footerText", new Date().getFullYear())}
          </p>
        </div>
      </footer>
    </div>
  );
}

