
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useEffect } from "react";

export default function AboutPage() {
    useEffect(() => {
    // Theme synchronization
    const storedDarkMode = localStorage.getItem('darkMode');
    if (typeof window !== "undefined") { // Ensure this runs client-side
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
          <Icons.info className="mr-2 h-8 w-8 sm:h-10 sm:w-10" />
          About PocketLedger Pro
        </h1>
        <Link href="/" passHref>
          <Button variant="outline" className="w-full sm:w-auto rounded-lg shadow-md hover:bg-primary/10 transition-all">
            <Icons.arrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <div className="space-y-6 sm:space-y-8">
        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Project Purpose</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              PocketLedger Pro is a personal finance management application designed to help you track your income and expenses effortlessly.
              The primary goal is to provide users with a clear overview of their financial health, enabling them to make informed decisions about their spending and saving habits.
            </p>
            <p>
              With PocketLedger Pro, you can categorize transactions, visualize your spending patterns through charts, and keep notes related to your financial activities.
              The application aims to be intuitive, user-friendly, and accessible, making financial tracking a simple and manageable task for everyone.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">Data Storage and Security</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              <strong>Where is my data stored?</strong>
              <br />
              All your financial data, including transactions and notes, is stored locally on your own device within your web browser&apos;s storage (specifically, using IndexedDB for transactions and localStorage for notes and theme preferences).
            </p>
            <p>
              <strong>How is my data stored?</strong>
              <br />
              The data is stored in a structured format. Transactions are stored in an IndexedDB database, which is a robust client-side storage solution. Financial notes and application settings (like your theme preference) are stored in localStorage.
              This means your data does not leave your computer or device and is not sent to any external server.
            </p>
            <p>
              <strong>Who can access my data?</strong>
              <br />
              Only you can access your data. Since the data is stored locally in your browser, it is sandboxed and cannot be accessed by other websites or users on other devices. PocketLedger Pro does not have any server-side components that store or process your personal financial information.
            </p>
             <p>
              <strong><u>Data Persistence:</u></strong>
              <br />
              Your data will persist in your browser as long as you don&apos;t clear your browser&apos;s site data for PocketLedger Pro. If you use a different browser or a different device, the data will not be synchronized as it is entirely local to the specific browser instance you used to enter it.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">How the Project Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm sm:text-base text-card-foreground space-y-3">
            <p>
              PocketLedger Pro is built using modern web technologies, primarily Next.js (a React framework) and TypeScript.
              ShadCN UI components and Tailwind CSS are used for styling to create a responsive and visually appealing interface.
            </p>
            <p>
              <strong>Frontend Application:</strong> The entire application runs in your web browser. When you add a transaction or a note, it&apos;s processed by JavaScript running on the client-side and then saved to your browser&apos;s local storage.
            </p>
            <p>
              <strong>Local Database:</strong> We utilize IndexedDB, a low-level API for client-side storage of significant amounts of structured data, including files/blobs. This allows for efficient querying and management of your transaction history directly within your browser.
            </p>
            <p>
              <strong>State Management:</strong> React&apos;s state management (useState, useEffect, useCallback) is used to handle the application&apos;s data flow and UI updates.
            </p>
            <p>
              <strong>No Server-Side Processing for Personal Data:</strong> It&apos;s important to reiterate that your personal financial data is not transmitted to, stored on, or processed by any remote servers. All operations are handled locally.
            </p>
          </CardContent>
        </Card>
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
