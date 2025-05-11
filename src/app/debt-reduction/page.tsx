
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
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React, { useState, useEffect, useCallback, useMemo } from "react";

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

type DebtPayment = {
  id: string;
  paymentDate: Date;
  amountPaid: number;
  notes?: string;
};

type Debt = {
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

const debtTypeOptions = [
  "Credit Card",
  "Consumer Loan",
  "Mortgage",
  "Student Loan",
  "Auto Loan",
  "Personal Debt",
  "Other",
];
const paymentFrequencyOptions = [
  "Monthly",
  "Weekly",
  "Bi-Weekly",
  "Annually",
  "One-time",
];

export default function DebtManagementPage() {
  const { toast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("₺");

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
      if (storedDarkMode === 'false') {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
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
          console.error("Failed to parse debts from localStorage:", error);
          setDebts([]);
        }
      }
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      localStorage.setItem("pocketLedgerDebts", JSON.stringify(debts));
    }
  }, [debts, isLoading]);

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
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    const parsedInitialAmount = parseFloat(initialAmount);
    const parsedCurrentBalance = parseFloat(currentBalanceForm || initialAmount); // Use initial if current is empty
    const parsedMinimumPayment = parseFloat(minimumPayment);
    const parsedInterestRate = interestRate ? parseFloat(interestRate) : undefined;

    if (isNaN(parsedInitialAmount) || isNaN(parsedCurrentBalance) || isNaN(parsedMinimumPayment) || (interestRate && isNaN(parsedInterestRate as number))) {
        toast({ title: "Error", description: "Please enter valid numbers for amounts and rate.", variant: "destructive" });
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
    toast({ title: "Debt Added", description: `${debtName} has been added to your list.` });
  };

  const handleDeleteDebt = (debtId: string) => {
    setDebts(prev => prev.filter(d => d.id !== debtId));
    toast({ title: "Debt Deleted", variant: "destructive" });
  };

  const handleOpenPaymentModal = (debt: Debt) => {
    setSelectedDebtForPayment(debt);
    setPaymentAmount(debt.minimumPayment.toString()); // Pre-fill with minimum payment
    setPaymentDate(new Date());
    setPaymentNotes("");
    setIsPaymentModalOpen(true);
  };
  
  const handleAddPayment = () => {
    if (!selectedDebtForPayment || !paymentAmount || !paymentDate) {
      toast({ title: "Error", description: "Payment amount and date are required.", variant: "destructive" });
      return;
    }
    const parsedPaymentAmount = parseFloat(paymentAmount);
     if (isNaN(parsedPaymentAmount) || parsedPaymentAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid positive payment amount.", variant: "destructive" });
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
    
    toast({ title: "Payment Added", description: `Payment of ${currencySymbol}${parsedPaymentAmount} for ${selectedDebtForPayment.name} recorded.` });
    setIsPaymentModalOpen(false); // Close modal
    setSelectedDebtForPayment(null); // Clear selected debt
  };

  const handleMarkAsPaid = (debtId: string) => {
    setDebts(prevDebts => {
      const updatedDebts = prevDebts.map(debt =>
        debt.id === debtId ? { ...debt, isPaidOff: true, currentBalance: 0 } : debt
      );
      // Re-sort to move paid debts to the end or a separate list
      return [...updatedDebts.filter(d => !d.isPaidOff), ...updatedDebts.filter(d => d.isPaidOff)];
    });
    toast({ title: "Debt Status Updated", description: "Debt marked as fully paid." });
  };

  const activeDebts = useMemo(() => debts.filter(d => !d.isPaidOff), [debts]);
  const paidDebts = useMemo(() => debts.filter(d => d.isPaidOff), [debts]);

  const totalRemainingDebt = useMemo(() => activeDebts.reduce((sum, debt) => sum + debt.currentBalance, 0), [activeDebts]);
  const totalMinimumMonthlyPayment = useMemo(() => activeDebts.filter(d=> d.paymentFrequency === "Monthly").reduce((sum, debt) => sum + debt.minimumPayment, 0), [activeDebts]);


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
        <Icons.loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading debt information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm text-foreground">
      <Toaster />
      <header className="flex flex-col text-center sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.trendingDown className="mr-2 h-8 w-8 sm:h-10 sm:w-10" />
          Borç Yönetimi
        </h1>
        <Link href="/" passHref>
          <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
            <Icons.arrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      {/* Add New Debt Form */}
      <Card className="mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Yeni Borç Ekle</CardTitle>
          <CardDescription>Yeni bir borç kaydı oluşturun.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="debtName">Borç Adı/Açıklaması</Label>
            <Input id="debtName" value={debtName} onChange={e => setDebtName(e.target.value)} placeholder="Örn: Kredi Kartı Borcu (Akbank)" className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="lender">Alacaklı/Borç Veren</Label>
            <Input id="lender" value={lender} onChange={e => setLender(e.target.value)} placeholder="Örn: Akbank" className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="initialAmount">Borcun Başlangıç Tutarı ({currencySymbol})</Label>
            <Input id="initialAmount" type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} placeholder="Örn: 5000" className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="currentBalanceForm">Mevcut Kalan Bakiye ({currencySymbol})</Label>
            <Input id="currentBalanceForm" type="number" value={currentBalanceForm} onChange={e => setCurrentBalanceForm(e.target.value)} placeholder="Başlangıç tutarı ile aynı olabilir" className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="interestRate">Faiz Oranı (Yıllık %)</Label>
            <Input id="interestRate" type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="Örn: 18.5 (Faizsiz ise boş bırakın)" className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="minimumPayment">Min. Aylık / Düzenli Ödeme ({currencySymbol})</Label>
            <Input id="minimumPayment" type="number" value={minimumPayment} onChange={e => setMinimumPayment(e.target.value)} placeholder="Örn: 250" className="rounded-lg shadow-inner" />
          </div>
          <div>
            <Label htmlFor="paymentFrequency">Ödeme Sıklığı</Label>
            <Select value={paymentFrequency} onValueChange={(value) => setPaymentFrequency(value as Debt["paymentFrequency"])}>
              <SelectTrigger className="rounded-lg shadow-inner"><SelectValue placeholder="Ödeme sıklığı seçin" /></SelectTrigger>
              <SelectContent className="bg-popover rounded-lg shadow-lg">
                {paymentFrequencyOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nextDueDate">Son Ödeme Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-lg shadow-inner", !nextDueDate && "text-muted-foreground")}>
                  <Icons.calendarDays className="mr-2 h-4 w-4" />
                  {nextDueDate ? format(nextDueDate, "PPP") : <span>Tarih seçin</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg" align="start">
                <Calendar mode="single" selected={nextDueDate} onSelect={setNextDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="debtType">Borç Türü</Label>
            <Select value={debtType} onValueChange={(value) => setDebtType(value as Debt["debtType"])}>
              <SelectTrigger className="rounded-lg shadow-inner"><SelectValue placeholder="Borç türü seçin" /></SelectTrigger>
              <SelectContent className="bg-popover rounded-lg shadow-lg">
                {debtTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <Label htmlFor="startDate">Borç Başlangıç Tarihi (Opsiyonel)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-lg shadow-inner", !startDate && "text-muted-foreground")}>
                  <Icons.calendarDays className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Tarih seçin</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
              </PopoverContent>
            </Popover>
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <Label htmlFor="debtNotes">Notlar (Opsiyonel)</Label>
            <Textarea id="debtNotes" value={debtNotes} onChange={e => setDebtNotes(e.target.value)} placeholder="Borçla ilgili ek detaylar..." className="rounded-lg shadow-inner min-h-[40px]" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddDebt} className="rounded-lg shadow-md bg-primary hover:bg-primary/90">
            <Icons.plusCircle className="mr-2 h-5 w-5" /> Borcu Ekle
          </Button>
        </CardFooter>
      </Card>

      {/* Debt List Overview */}
      <Card className="mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Borç Genel Bakışı</CardTitle>
          <div className="flex flex-col sm:flex-row justify-between text-sm mt-2">
            <p>Toplam Kalan Borç: <span className="font-bold text-destructive">{currencySymbol}{totalRemainingDebt.toFixed(2)}</span></p>
            <p>Toplam Min. Aylık Ödeme: <span className="font-bold text-primary">{currencySymbol}{totalMinimumMonthlyPayment.toFixed(2)}</span></p>
          </div>
        </CardHeader>
        <CardContent>
          {activeDebts.length === 0 && <p className="text-muted-foreground text-center py-4">Aktif borcunuz bulunmamaktadır.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDebts.map(debt => (
              <Card key={debt.id} className="rounded-xl shadow-md hover:shadow-lg transition-shadow bg-card/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">{debt.name}</CardTitle>
                  <CardDescription>{debt.lender} - {debt.debtType}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Kalan Bakiye: <span className="font-bold text-lg text-destructive">{currencySymbol}{debt.currentBalance.toFixed(2)}</span></p>
                  <Progress value={(debt.initialAmount - debt.currentBalance) / debt.initialAmount * 100} className="h-2 my-1" />
                  <p>Min. Ödeme: {currencySymbol}{debt.minimumPayment.toFixed(2)} ({debt.paymentFrequency})</p>
                  <p>Son Ödeme Tarihi: <span className={cn(new Date(debt.nextDueDate) < new Date() && "text-destructive font-bold")}>{format(new Date(debt.nextDueDate), "PPP")}</span></p>
                  {debt.interestRate !== undefined && <p>Faiz Oranı: {debt.interestRate.toFixed(2)}%</p>}
                  <p className="text-xs text-muted-foreground">Eklenme: {format(new Date(debt.createdAt), "PP")}</p>
                </CardContent>
                <CardFooter className="flex justify-between pt-3">
                  <Button size="sm" variant="outline" onClick={() => handleOpenPaymentModal(debt)} className="rounded-lg shadow-sm hover:bg-primary/10">
                    <Icons.creditCard className="mr-2 h-4 w-4" /> Ödeme Yap/Görüntüle
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-md h-8 w-8">
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md">
                      <AlertDialogHeader><AlertDialogTitle>Borcu Sil?</AlertDialogTitle><AlertDialogDescription>"{debt.name}" adlı borcu silmek istediğinizden emin misiniz?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteDebt(debt.id)} className="bg-destructive hover:bg-destructive/90 rounded-lg">Sil</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Paid Off Debts */}
       {paidDebts.length > 0 && (
        <Card className="mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold">Ödenmiş Borçlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidDebts.map(debt => (
                <Card key={debt.id} className="rounded-xl shadow-md bg-card/60 backdrop-blur-sm opacity-70">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">{debt.name}</CardTitle>
                    <CardDescription>{debt.lender} - {debt.debtType}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p className="text-green-600 dark:text-green-400 font-bold">Tamamen Ödendi</p>
                    <p>Başlangıç Tutarı: {currencySymbol}{debt.initialAmount.toFixed(2)}</p>
                     <p className="text-xs text-muted-foreground">Eklenme: {format(new Date(debt.createdAt), "PP")}</p>
                     {debt.payments.length > 0 && <p className="text-xs text-muted-foreground">Son Ödeme: {format(new Date(debt.payments[debt.payments.length-1].paymentDate), "PP")}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Debt Management Strategies and Advice */}
      <Card className="mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Borç Azaltma Stratejileri</CardTitle>
          <CardDescription>Borçlarınızı daha hızlı ve etkili bir şekilde ödemek için yöntemler.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-primary">1. Borç Kartopu Yöntemi (Debt Snowball)</h3>
            <p className="text-sm text-muted-foreground">En küçük borçtan başlayarak ödeme yapın, diğerlerine minimum ödeme yapmaya devam edin. Bu yöntem motivasyon sağlar. (Detaylı analiz yakında eklenecektir.)</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-primary">2. Borç Çığ Yöntemi (Debt Avalanche)</h3>
            <p className="text-sm text-muted-foreground">En yüksek faizli borçtan başlayarak ödeme yapın. Bu yöntem genellikle uzun vadede daha fazla faiz tasarrufu sağlar. (Detaylı analiz yakında eklenecektir.)</p>
          </div>
          <p className="text-sm text-center py-4 text-muted-foreground">[Kişiselleştirilmiş strateji önerileri ve analiz araçları bu bölümde yer alacaktır.]</p>
        </CardContent>
      </Card>


      {/* Payment Modal */}
      {selectedDebtForPayment && (
        <Dialog open={isPaymentModalOpen} onOpenChange={(isOpen) => {
            setIsPaymentModalOpen(isOpen);
            if (!isOpen) setSelectedDebtForPayment(null);
        }}>
          <DialogContent className="sm:max-w-[525px] bg-card/90 backdrop-blur-md rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Ödeme Yap / Geçmişi Görüntüle: {selectedDebtForPayment.name}</DialogTitle>
              <DialogDescription>
                Kalan Bakiye: {currencySymbol}{selectedDebtForPayment.currentBalance.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-md">Yeni Ödeme Ekle</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="paymentAmount">Ödeme Tutarı ({currencySymbol})</Label>
                    <Input id="paymentAmount" type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="rounded-lg shadow-inner" />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Ödeme Tarihi</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-lg shadow-inner", !paymentDate && "text-muted-foreground")}>
                          <Icons.calendarDays className="mr-2 h-4 w-4" />
                          {paymentDate ? format(paymentDate, "PPP") : <span>Tarih seçin</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg"><Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus /></PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="paymentNotes">Ödeme Notları (Opsiyonel)</Label>
                    <Textarea id="paymentNotes" value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Ödeme ile ilgili notlar..." className="rounded-lg shadow-inner min-h-[60px]" />
                  </div>
                  <Button onClick={handleAddPayment} className="w-full rounded-lg shadow-md bg-primary hover:bg-primary/90"><Icons.checkCircle className="mr-2 h-5 w-5" /> Ödemeyi Kaydet</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-md">Ödeme Geçmişi</CardTitle></CardHeader>
                <CardContent>
                  {selectedDebtForPayment.payments.length === 0 ? <p className="text-sm text-muted-foreground">Bu borç için henüz ödeme yapılmamış.</p> : (
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
                  <Icons.checkCircle className="mr-2 h-5 w-5" /> Tamamen Ödendi Olarak İşaretle
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="rounded-lg shadow-md">Kapat</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


      <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-foreground">
            © {new Date().getFullYear()} PocketLedger Pro. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}

    