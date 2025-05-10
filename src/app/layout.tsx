
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  weight: ['400', '700'], // Common weights for monospace
});

export const metadata: Metadata = {
  title: 'PocketLedger Pro - Smart Finance Tracker',
  description: 'Track your income and expenses effortlessly with PocketLedger Pro. Gain insights into your spending habits and manage your finances effectively.',
  keywords: ['finance', 'tracker', 'expenses', 'income', 'budget', 'personal finance', 'money management'],
  authors: [{ name: 'PocketLedger Team' }],
  applicationName: 'PocketLedger Pro',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(0 0% 100%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(0 0% 3.9%)' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Script to set dark mode preference from localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedDarkMode = localStorage.getItem('darkMode');
                  if (storedDarkMode === 'false') {
                    document.documentElement.classList.remove('dark');
                  } else { 
                    // Default to dark or if value is 'true' or null
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // Fallback if localStorage is not available or other error
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}