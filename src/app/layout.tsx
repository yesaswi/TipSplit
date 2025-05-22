import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans'; // Corrected import for Geist Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const geistSans = GeistSans({ // Corrected variable name usage if needed, ensure it matches export
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// GeistMono is available if needed, but geistSans is primary for UI
// import { GeistMono } from 'geist/font/mono';
// const geistMono = GeistMono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'TipSplit', // Updated title
  description: 'Calculate tips and split bills with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}> {/* Simplified font class */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
