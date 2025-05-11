
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { listDatabaseBackups, restoreDatabaseBackup, deleteDatabaseBackupTables } from "@/lib/database";
import { format, parse } from 'date-fns';


interface BackupInfo {
  id: string;
  date: Date;
  formattedDate: string;
  hasTransactions: boolean; // Indicates DB backup (transactions and users tables)
  hasNotes: boolean;
  hasDebts: boolean;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const { toast } = useToast();

  const loadBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbBackupIds = await listDatabaseBackups(); // Lists IDs from DB table names like transactions_backup_ID
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
          if (isNaN(date.getTime())) { // Check if parsing failed
             throw new Error("Invalid date parsed from ID");
          }
        } catch (e) {
          console.warn(`Failed to parse backup ID ${id} as date, using current date as fallback:`, e);
          date = new Date(); // Fallback for unparsable IDs (should be rare)
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
        if (storedDarkMode === 'false') { 
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
    }
    loadBackups();
  }, [loadBackups]);

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
      await loadBackups(); // Refresh the list
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


  if (isLoading && backups.length === 0) { 
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm text-foreground">
        <Icons.loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading settings and backups...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm text-foreground">
      <Toaster />
      <header className="flex flex-col text-center sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.settings className="mr-2 h-8 w-8 sm:h-10 sm:w-10" />
          Application Settings
        </h1>
        <Link href="/" passHref>
          <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
            <Icons.arrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <Card className="mb-6 sm:mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Data Backups &amp; Restoration</CardTitle>
          <CardDescription className="text-muted-foreground">
            Restore your application data from a previous backup. Backups are created automatically when you use the "Erase All Application Data" feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground text-center py-4">Refreshing backup list...</p>}
          {!isLoading && backups.length === 0 && (
            <div className="text-center py-6">
              <Icons.fileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg font-medium text-card-foreground">No backups found.</p>
              <p className="text-sm text-muted-foreground">Backups are created when you reset application data from the main dashboard.</p>
            </div>
          )}
          {!isLoading && backups.length > 0 && (
            <ul className="space-y-4">
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
                            This will overwrite your current application data (transactions, notes, debts). This action cannot be undone directly, but you can restore another backup later.
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

      <Card className="mb-6 sm:mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Future Settings Ideas</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enhancements that could be added to this page in the future.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-card-foreground">
          <p><strong>Data Management:</strong></p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Export all data (transactions, notes, debts) to CSV/JSON.</li>
            <li>Import data from CSV/JSON (requires careful validation).</li>
          </ul>
          <p><strong>Customization:</strong></p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Set a global default currency (currently managed on main page).</li>
            <li>More theme options (e.g., accent color picker).</li>
          </ul>
           <p><strong>Advanced:</strong></p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Data integrity check/validation tool.</li>
          </ul>
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
    
