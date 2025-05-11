
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useEffect } from "react";

export default function DebtReductionPage() {
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (typeof window !== "undefined") {
      if (storedDarkMode === 'false') {
        document.documentElement.classList.remove('dark');
      } else {
        // Default to dark if 'true' or null (not set)
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen flex flex-col bg-background/70 backdrop-blur-sm text-foreground">
      <header className="flex flex-col text-center sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center justify-center sm:justify-start">
          <Icons.trendingDown className="mr-2 h-8 w-8 sm:h-10 sm:w-10" />
          Debt Reduction Plans
        </h1>
        <Link href="/" passHref>
          <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
            <Icons.arrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* Column 1: Add/Manage Debts */}
        <div className="space-y-6 sm:space-y-8">
          <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Track Your Debts</CardTitle>
              <CardDescription>Add and manage your outstanding debts to get a clear picture.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
              <p className="text-center py-8 text-muted-foreground">
                [Debt entry form and list of current debts will appear here.]
              </p>
              {/* 
                Future implementation:
                - Input fields for: Debt Name, Total Amount, Interest Rate (%), Minimum Payment
                - "Add Debt" button
                - A list or table displaying added debts with options to edit/delete.
                - Calculation of total debt, estimated payoff time based on strategy.
              */}
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Strategies and Advice */}
        <div className="space-y-6 sm:space-y-8">
          <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Debt Reduction Strategies</CardTitle>
              <CardDescription>Explore effective methods to pay off your debts faster.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm sm:text-base text-card-foreground space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">1. Debt Snowball Method</h3>
                <p>Pay off debts in order of smallest balance to largest, regardless of interest rate. This method provides psychological wins, keeping you motivated as you see debts disappear quickly.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">2. Debt Avalanche Method</h3>
                <p>Prioritize paying off debts with the highest interest rates first, while making minimum payments on others. This method generally saves you more money on interest in the long run.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">3. Debt Consolidation</h3>
                <p>Combine multiple debts into a single, new loan, ideally with a lower interest rate. This can simplify your monthly payments and potentially reduce the total interest paid.</p>
                <p className="mt-1 text-xs text-muted-foreground">Common options include balance transfer credit cards or personal loans. Be sure to check terms and fees.</p>
              </div>
               <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">General Tips:</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Create a detailed budget to identify areas where you can cut spending and allocate more funds towards debt.</li>
                    <li>Consider increasing your income through a side hustle or by negotiating a raise.</li>
                    <li>Make more than the minimum payment whenever possible.</li>
                    <li>Automate your payments to avoid late fees.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">Personalized Advice (Coming Soon)</h3>
                <p className="text-muted-foreground">
                  Future updates may include AI-powered personalized strategies based on your specific debt situation and financial goals.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
