
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
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
  listDatabaseBackups, 
  restoreDatabaseBackup, 
  deleteDatabaseBackupTables,
  backupAndResetAllData 
} from "@/lib/database";
import { format, parse } from 'date-fns';
import SlideToConfirmButton from '@/components/ui/slide-to-confirm-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BackupInfo {
  id: string;
  date: Date;
  formattedDate: string;
  hasTransactions: boolean; 
  hasNotes: boolean;
  hasDebts: boolean;
}

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


export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [darkMode, setDarkMode] = useState(true); // Default to dark
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies.find(c => c.code === 'TRY') || currencies[0]);

  const { toast } = useToast();

  const loadBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbBackupIds = await listDatabaseBackups(); 
      const allBackupIds = new Set<string>(dbBackupIds);

      const noteBackupPrefix = "financialNotes_backup_";
      const debtBackupPrefix = "pocketLedgerDebts_backup_";
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(noteBackupPrefix)) {
            allBackupIds.add(key.substring(noteBackupPrefix.length));
          }
          if (key?.startsWith(debtBackupPrefix)) {
            allBackupIds.add(key.substring(debtBackupPrefix.length));
          }
        }
      }
      
      const parsedBackups: BackupInfo[] = Array.from(allBackupIds).map(id => {
        let date = new Date(); 
        try {
          date = parse(id, "yyyyMMddHHmmss", new Date());
          if (isNaN(date.getTime())) {
             throw new Error("Invalid date parsed from ID");
          }
        } catch (e) {
          console.warn(`Failed to parse backup ID ${id} as date, using current date as fallback:`, e);
          date = new Date(); 
        }
        return {
          id,
          date,
          formattedDate: format(date, "PPP ppp"),
          hasTransactions: dbBackupIds.includes(id), 
          hasNotes: typeof window !== "undefined" && !!localStorage.getItem(`${noteBackupPrefix}${id}`),
          hasDebts: typeof window !== "undefined" && !!localStorage.getItem(`${debtBackupPrefix}${id}`),
        };
      }).sort((a,b) => b.date.getTime() - a.date.getTime()); 

      setBackups(parsedBackups);

    } catch (error: any) {
      console.error("Error loading backups:", error);
      toast({
        title: "Error Loading Backups",
        description: error.message || "Could not load backup information.",
        variant: "destructive",
      });
      setBackups([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (typeof window !== "undefined") {
        const storedDarkMode = localStorage.getItem('darkMode');
        const initialDarkMode = storedDarkMode === 'false' ? false : true; // Default to dark
        setDarkMode(initialDarkMode);
        if (initialDarkMode) { 
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
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
    loadBackups();
  }, [loadBackups]);

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
    if (typeof window !== 'undefined') {
      localStorage.setItem("selectedCurrencyCode", selectedCurrency.code);
    }
  }, [selectedCurrency]);


  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    toast({
      title: "Currency Updated",
      description: `Display currency changed to ${currency.name} (${currency.code}). Applied on next dashboard load.`,
    });
  };

  const handleRestoreData = async (backupId: string) => {
    setIsProcessing(true);
    try {
      const backupToRestore = backups.find(b => b.id === backupId);
      if (!backupToRestore) {
        throw new Error("Selected backup not found.");
      }

      if (backupToRestore.hasTransactions) {
        await restoreDatabaseBackup(backupId);
        console.log(`Database (transactions & users) for backup ${backupId} restored.`);
      }

      if (typeof window !== "undefined") {
        if (backupToRestore.hasNotes) {
            const notesData = localStorage.getItem(`financialNotes_backup_${backupId}`);
            if (notesData) {
            localStorage.setItem("financialNotes", notesData);
            console.log(`Financial notes for backup ${backupId} restored.`);
            }
        }
        if (backupToRestore.hasDebts) {
            const debtData = localStorage.getItem(`pocketLedgerDebts_backup_${backupId}`);
            if (debtData) {
            localStorage.setItem("pocketLedgerDebts", debtData);
            console.log(`Debt data for backup ${backupId} restored.`);
            }
        }
      }

      toast({
        title: "Data Restored",
        description: `Data from backup ${backupToRestore.formattedDate} has been restored. Please refresh other pages if open.`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error restoring data:", error);
      toast({
        title: "Error Restoring Data",
        description: error.message || "Could not restore data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBackup = async (backup: BackupInfo) => {
    setIsProcessing(true);
    try {
      if (backup.hasTransactions) {
        await deleteDatabaseBackupTables(backup.id);
        console.log(`Database tables for backup ID ${backup.id} deleted.`);
      }
      if (typeof window !== "undefined") {
        if (backup.hasNotes) {
          localStorage.removeItem(`financialNotes_backup_${backup.id}`);
          console.log(`LocalStorage notes for backup ID ${backup.id} deleted.`);
        }
        if (backup.hasDebts) {
          localStorage.removeItem(`pocketLedgerDebts_backup_${backup.id}`);
          console.log(`LocalStorage debts for backup ID ${backup.id} deleted.`);
        }
      }
      toast({
        title: "Backup Deleted",
        description: `Backup from ${backup.formattedDate} has been successfully deleted.`,
      });
      await loadBackups(); 
    } catch (error: any) {
      console.error("Error deleting backup:", error);
      toast({
        title: "Error Deleting Backup",
        description: error.message || "Could not delete the backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetData = useCallback(async () => {
    setIsProcessing(true);
    try {
      const backupId = await backupAndResetAllData();
      const notesData = localStorage.getItem("financialNotes");
      if (notesData) {
        localStorage.setItem(`financialNotes_backup_${backupId}`, notesData);
      }
      localStorage.removeItem("financialNotes");
      const debtData = localStorage.getItem("pocketLedgerDebts");
      if (debtData) {
        localStorage.setItem(`pocketLedgerDebts_backup_${backupId}`, debtData);
      }
      localStorage.removeItem("pocketLedgerDebts");

      toast({
        title: "Data Reset & Backed Up!",
        description: "All application data has been reset. A backup was created.",
        duration: 5000,
      });
      await loadBackups(); // Refresh backup list
    } catch (error: any) {
      console.error("Error resetting data:", error);
      toast({
        title: "Error Resetting Data",
        description: error.message || "Could not reset data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, loadBackups]);

  useEffect(() => {
    const pressedKeys = new Set<string>();
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() !== 'control' && event.key.toLowerCase() !== 'shift' && event.key.toLowerCase() !== 'alt' && event.key.toLowerCase() !== 'meta') {
            pressedKeys.add(event.key.toLowerCase());
        }
        if (event.shiftKey && pressedKeys.has('s') && pressedKeys.has('d')) {
            if (event.key.toLowerCase() === 's' || event.key.toLowerCase() === 'd') {
                event.preventDefault(); 
                handleResetData(); 
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


  if (isLoading && backups.length === 0 && !isProcessing) { 
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm text-foreground">
        <Icons.loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm text-foreground">
      <Toaster />
      <header className="flex flex-col text-center sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.settings className="h-8 w-8 sm:h-10 sm:w-10 md:mr-2" />
          <span className="hidden md:inline">Application Settings</span>
        </h1>
        <Link href="/" passHref>
          <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
            <Icons.arrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Appearance</CardTitle>
            <CardDescription className="text-muted-foreground">Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
              <Label htmlFor="dark-mode-toggle-settings" className="text-base font-medium text-card-foreground flex items-center">
                <Icons.moon className="mr-2 h-5 w-5 text-primary" /> Dark Mode
              </Label>
              <Switch
                id="dark-mode-toggle-settings"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted shadow-inner rounded-full"
                aria-label="Toggle dark mode"
              />
            </div>
             <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                <Label htmlFor="currency-select-settings" className="text-base font-medium text-card-foreground flex items-center">
                    <Icons.coins className="mr-2 h-5 w-5 text-primary" /> Display Currency
                </Label>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-lg shadow-sm hover:bg-primary/10 transition-all text-sm h-9">
                    {selectedCurrency.code}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card/90 backdrop-blur-md rounded-xl shadow-lg">
                    <DropdownMenuLabel className="text-card-foreground">Select Currency</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {currencies.map((currency) => (
                    <DropdownMenuItem
                        key={currency.code}
                        onClick={() => handleCurrencyChange(currency)}
                        className={cn(
                        "text-card-foreground hover:bg-primary/10",
                        selectedCurrency.code === currency.code && "bg-primary/20 font-semibold"
                        )}
                    >
                        {currency.symbol} {currency.name} ({currency.code})
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Data Management</CardTitle>
             <CardDescription className="text-muted-foreground">Manage your application data, including backups and resets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg bg-background/50 space-y-4">
                <h3 className="text-lg font-medium text-card-foreground">Erase Application Data</h3>
                <p className="text-sm text-muted-foreground">
                    This will delete all transactions, notes, and debt information. This action creates a backup first, which you can restore later.
                </p>
                <SlideToConfirmButton
                    onConfirm={handleResetData}
                    buttonText="Erase All Application Data"
                    slideText="Slide to Erase All Data"
                    icon={<Icons.alertTriangle className="h-5 w-5 transition-transform group-hover:scale-110 duration-200 ease-out" />}
                    confirmedText="All Data Erased!"
                    className="w-full"
                    buttonClassName="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                />
                <p className="text-xs text-muted-foreground/80 text-center">
                    (Tip: Press Shift + S + D to reset data without slider confirmation)
                </p>
            </div>
          </CardContent>
        </Card>
      </div>


      <Card className="mt-6 sm:mt-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Data Backups &amp; Restoration</CardTitle>
          <CardDescription className="text-muted-foreground">
            Restore your application data from a previous backup. Backups are created automatically when you use the "Erase All Application Data" feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && backups.length === 0 && <p className="text-muted-foreground text-center py-4">Refreshing backup list...</p>}
          {!isLoading && backups.length === 0 && (
            <div className="text-center py-6">
              <Icons.fileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg font-medium text-card-foreground">No backups found.</p>
              <p className="text-sm text-muted-foreground">Backups are created when you reset application data from the main dashboard or settings.</p>
            </div>
          )}
          {!isLoading && backups.length > 0 && (
            <ul className="space-y-4 max-h-96 overflow-y-auto p-1">
              {backups.map((backup) => (
                <li key={backup.id} className="p-4 border rounded-lg shadow-sm bg-background/50 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <p className="font-semibold text-card-foreground">Backup from: {backup.formattedDate}</p>
                    <p className="text-xs text-muted-foreground">
                      Contains: 
                      {backup.hasTransactions && " Transactions"}
                      {backup.hasNotes && (backup.hasTransactions ? ", Notes" : " Notes")}
                      {backup.hasDebts && ((backup.hasTransactions || backup.hasNotes) ? ", Debt Data" : " Debt Data")}
                      {(!backup.hasTransactions && !backup.hasNotes && !backup.hasDebts) && " (Empty or unknown content)"}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-md shadow-sm hover:bg-primary/10 transition-all" disabled={isProcessing}>
                          <Icons.refreshCw className="mr-2 h-4 w-4" /> Restore
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md z-[110]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-card-foreground">Confirm Restore</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to restore data from {backup.formattedDate}? 
                            This will overwrite your current application data. This action cannot be undone directly, but you can restore another backup later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-lg hover:bg-muted/20" disabled={isProcessing}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRestoreData(backup.id)}
                            className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Restore
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="rounded-md shadow-sm hover:bg-destructive/90 transition-all" disabled={isProcessing}>
                          <Icons.trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md z-[110]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-card-foreground">Confirm Delete Backup</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to permanently delete the backup from {backup.formattedDate}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-lg hover:bg-muted/20" disabled={isProcessing}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBackup(backup)}
                            className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            disabled={isProcessing}
                          >
                            {isProcessing ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete Backup
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

       <Card className="mt-6 sm:mt-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">About PocketLedger Pro</CardTitle>
            <CardDescription className="text-muted-foreground">
              Learn more about the application, its purpose, and how your data is handled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-around items-center gap-4 p-4 border rounded-lg bg-background/50">
                <Link href="/about" passHref>
                  <Button variant="link" className="text-primary hover:underline text-base">
                    About (English)
                  </Button>
                </Link>
                <Link href="/about-tr" passHref>
                  <Button variant="link" className="text-primary hover:underline text-base">
                    Hakkında (Türkçe)
                  </Button>
                </Link>
                <Link href="/about-es" passHref>
                  <Button variant="link" className="text-primary hover:underline text-base">
                    Acerca de (Español)
                  </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
      
      <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-foreground">
            © {new Date().getFullYear()} PocketLedger Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
    
