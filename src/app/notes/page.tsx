
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { format } from "date-fns";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";


type Note = {
  id: string;
  title: string;
  content: string;
  assetType?: string;
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: Date;
  createdAt: Date;
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

const assetCategories = ["Cryptocurrency", "Stocks", "Bonds", "Real Estate", "Commodities", "Forex", "Other"];

type SortableKeys = keyof Pick<Note, 'title' | 'assetType' | 'quantity' | 'purchasePrice' | 'createdAt' | 'purchaseDate'>;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteAssetType, setNewNoteAssetType] = useState("");
  const [newNoteQuantity, setNewNoteQuantity] = useState<number | undefined>(undefined);
  const [newNotePurchasePrice, setNewNotePurchasePrice] = useState<number | undefined>(undefined);
  const [newNotePurchaseDate, setNewNotePurchaseDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCurrencySymbol, setDisplayCurrencySymbol] = useState("₺");
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });


  useEffect(() => {
    if (typeof window !== "undefined") {
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode === 'true') { 
            document.documentElement.classList.add('dark');
        } else { 
            document.documentElement.classList.remove('dark');
        }

        const storedCurrencyCode = localStorage.getItem("selectedCurrencyCode");
        if (storedCurrencyCode) {
            const foundCurrency = currencies.find(c => c.code === storedCurrencyCode);
            if (foundCurrency) {
            setDisplayCurrencySymbol(foundCurrency.symbol);
            }
        } else {
            setDisplayCurrencySymbol(currencies.find(c => c.code === 'TRY')?.symbol || '₺');
        }

        const storedNotes = localStorage.getItem("financialNotes");
        if (storedNotes) {
            try {
            setNotes(
                JSON.parse(storedNotes).map((note: any) => ({
                ...note,
                createdAt: new Date(note.createdAt),
                purchaseDate: note.purchaseDate ? new Date(note.purchaseDate) : undefined,
                }))
            );
            } catch (error) {
            console.error("Failed to parse notes from localStorage:", error);
            setNotes([]);
            }
        }
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
      localStorage.setItem("financialNotes", JSON.stringify(notes));
    }
  }, [notes, isLoading]);

  const handleAddNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title and content for your note.",
        variant: "destructive",
      });
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      assetType: newNoteAssetType.trim() || undefined,
      quantity: newNoteQuantity,
      purchasePrice: newNotePurchasePrice,
      purchaseDate: newNotePurchaseDate,
      createdAt: new Date(),
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteAssetType("");
    setNewNoteQuantity(undefined);
    setNewNotePurchasePrice(undefined);
    setNewNotePurchaseDate(undefined);
    toast({
      title: "Note Added",
      description: "Your financial note has been successfully added.",
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    toast({
      title: "Note Deleted",
      description: "The note has been successfully deleted.",
      variant: "destructive",
    });
  };

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedNotes = useMemo(() => {
    let sortableItems = [...notes];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === undefined && valB === undefined) return 0;
        if (valA === undefined) return sortConfig.direction === 'ascending' ? -1 : 1; // or 1 / -1 depending on how you want to sort undefined
        if (valB === undefined) return sortConfig.direction === 'ascending' ? 1 : -1; // or -1 / 1
        
        // For date fields, compare timestamps
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'purchaseDate') {
            const dateA = new Date(valA as Date).getTime();
            const dateB = new Date(valB as Date).getTime();
            if (dateA < dateB) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (dateA > dateB) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        }


        if (valA! < valB!) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA! > valB!) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [notes, sortConfig]);

  const getSortIndicator = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowDownUp className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'ascending' ? <Icons.arrowUp className="ml-2 h-4 w-4" /> : <Icons.arrowDown className="ml-2 h-4 w-4" />;
  };


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
        <Icons.loader className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground">Loading notes...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm">
      <Toaster />
      <header className="flex flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.notebook className="h-8 w-8 sm:h-10 sm:w-10 md:mr-2" />
          <span className="hidden md:inline">Financial Notes</span>
        </h1>
        <Link href="/" passHref>
          <Button variant="outline" className="w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
            <Icons.arrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <Card className="mb-6 sm:mb-8 rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Add New Financial Note</CardTitle>
          <CardDescription>Keep track of your investments, assets, or other financial details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="note-title" className="font-medium text-card-foreground">Note Title</Label>
            <Input
              id="note-title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="e.g., Bitcoin Purchase, Gold Investment"
              className="rounded-lg shadow-inner bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="note-asset-type" className="font-medium text-card-foreground">Asset Type (Optional)</Label>
              <select
                  id="note-asset-type"
                  className="w-full rounded-lg border p-3 bg-background/70 backdrop-blur-sm shadow-inner text-foreground focus:ring-2 focus:ring-primary transition-all h-10"
                  value={newNoteAssetType}
                  onChange={(e) => setNewNoteAssetType(e.target.value)}
                  aria-label="Select asset type"
                >
                  <option value="">Select type (optional)</option>
                  {assetCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
            </div>
            <div>
              <Label htmlFor="note-quantity" className="font-medium text-card-foreground">Quantity (Optional)</Label>
              <Input
                id="note-quantity"
                type="number"
                value={newNoteQuantity === undefined ? "" : newNoteQuantity}
                onChange={(e) => setNewNoteQuantity(e.target.value === "" ? undefined : Number(e.target.value))}
                placeholder="e.g., 0.5"
                className="rounded-lg shadow-inner bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="note-purchase-price" className="font-medium text-card-foreground">Purchase Price ({displayCurrencySymbol}) (Optional)</Label>
              <Input
                id="note-purchase-price"
                type="number"
                value={newNotePurchasePrice === undefined ? "" : newNotePurchasePrice}
                onChange={(e) => setNewNotePurchasePrice(e.target.value === "" ? undefined : Number(e.target.value))}
                placeholder="e.g., 50000"
                className="rounded-lg shadow-inner bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
                <Label htmlFor="note-purchase-date" className="font-medium text-card-foreground">Purchase Date (Optional)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal rounded-lg shadow-inner bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary h-10",
                                !newNotePurchaseDate && "text-muted-foreground"
                            )}
                            id="note-purchase-date"
                        >
                            <Icons.calendarDays className="mr-2 h-4 w-4" />
                            {newNotePurchaseDate ? format(newNotePurchaseDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card/90 backdrop-blur-md rounded-xl shadow-lg z-[51]" align="start">
                        <Calendar
                            mode="single"
                            selected={newNotePurchaseDate}
                            onSelect={setNewNotePurchaseDate}
                            initialFocus
                            className="bg-card/95 rounded-md"
                        />
                    </PopoverContent>
                </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="note-content" className="font-medium text-card-foreground">Note Content</Label>
            <Textarea
              id="note-content"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Details about the asset, purchase date, strategy, etc."
              className="min-h-[120px] rounded-lg shadow-inner bg-background/70 backdrop-blur-sm focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddNote} className="w-full sm:w-auto rounded-lg shadow-md bg-primary hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105">
            <Icons.plusCircle className="mr-2 h-5 w-5" />
            Add Note
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="card" onValueChange={(value) => setViewMode(value as 'card' | 'table')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px] rounded-lg shadow-md mb-6 bg-card/80 backdrop-blur-md">
          <TabsTrigger value="card" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Card View</TabsTrigger>
          <TabsTrigger value="table" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Table View</TabsTrigger>
        </TabsList>
        
        {notes.length === 0 ? (
          <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md col-span-2">
            <CardContent className="py-10 text-center">
              <Icons.fileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-card-foreground">No financial notes yet.</p>
              <p className="text-muted-foreground">Add your first note using the form above.</p>
            </CardContent>
          </Card>
        ) : (
        <>
        <TabsContent value="card">
          <div className="space-y-6">
            {sortedNotes.map((note) => (
              <Card key={note.id} className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="flex flex-row justify-between items-start pb-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground">{note.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Created: {format(new Date(note.createdAt), "PPP p")}
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 rounded-md">
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md z-[51]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-card-foreground">Delete Note?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Are you sure you want to delete the note titled "{note.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg hover:bg-muted/20">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteNote(note.id)}
                          className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {note.assetType && (
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Asset Type:</span> {note.assetType}
                    </p>
                  )}
                  {(note.quantity !== undefined || note.purchasePrice !== undefined || note.purchaseDate) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground">
                      {note.quantity !== undefined && (
                      <p><span className="font-medium">Quantity:</span> {note.quantity}</p>
                      )}
                      {note.purchasePrice !== undefined && (
                      <p><span className="font-medium">Purchase Price:</span> {displayCurrencySymbol}{note.purchasePrice.toFixed(2)}</p>
                      )}
                      {note.purchaseDate && (
                      <p><span className="font-medium">Purchase Date:</span> {format(new Date(note.purchaseDate), "PPP")}</p>
                      )}
                  </div>
                  )}
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table">
            <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead onClick={() => requestSort('title')} className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center">Title {getSortIndicator('title')}</div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('assetType')} className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center">Asset Type {getSortIndicator('assetType')}</div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('quantity')} className="text-right cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-end">Quantity {getSortIndicator('quantity')}</div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('purchasePrice')} className="text-right cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-end">Price ({displayCurrencySymbol}) {getSortIndicator('purchasePrice')}</div>
                    </TableHead>
                     <TableHead onClick={() => requestSort('purchaseDate')} className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center">Purchase Date {getSortIndicator('purchaseDate')}</div>
                    </TableHead>
                    <TableHead onClick={() => requestSort('createdAt')} className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center">Created Date {getSortIndicator('createdAt')}</div>
                    </TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedNotes.map((note) => (
                    <TableRow key={note.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{note.title}</TableCell>
                        <TableCell>{note.assetType || "-"}</TableCell>
                        <TableCell className="text-right">{note.quantity !== undefined ? note.quantity : "-"}</TableCell>
                        <TableCell className="text-right">{note.purchasePrice !== undefined ? `${displayCurrencySymbol}${note.purchasePrice.toFixed(2)}` : "-"}</TableCell>
                        <TableCell>{note.purchaseDate ? format(new Date(note.purchaseDate), "PP") : "-"}</TableCell>
                        <TableCell>{format(new Date(note.createdAt), "PP")}</TableCell>
                        <TableCell>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                            <p className="max-w-[150px] truncate cursor-default">{note.content}</p>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="max-w-sm bg-popover text-popover-foreground border shadow-lg rounded-md p-2 text-sm z-50">
                            <p className="whitespace-pre-wrap">{note.content}</p>
                            </TooltipContent>
                        </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-md h-8 w-8">
                                <Icons.trash className="h-4 w-4" />
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl bg-card/90 backdrop-blur-md z-[51]">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-card-foreground">Delete Note?</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                Are you sure you want to delete the note titled "{note.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg hover:bg-muted/20">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                onClick={() => handleDeleteNote(note.id)}
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
        </TabsContent>
        </>
        )}
      </Tabs>

      <footer className="mt-auto border-t border-border/50 pt-8 pb-6 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-foreground">
            © {new Date().getFullYear()} PocketLedger Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
}

