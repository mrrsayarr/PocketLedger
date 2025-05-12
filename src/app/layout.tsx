
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
  userScalable: true, 
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
        {/* Script to set theme preference from localStorage, defaulting to light mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedDarkMode = localStorage.getItem('darkMode');
                  if (storedDarkMode === 'true') {
                    document.documentElement.classList.add('dark');
                  } else { 
                    // If 'false' or null (not set), remove 'dark' class (default to light)
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback or if localStorage is unavailable, default to removing 'dark' class (light mode)
                  document.documentElement.classList.remove('dark');
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

