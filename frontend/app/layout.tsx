import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Orbitron,
  Inter,
} from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EvePost - Event Management & Attendance System",
  description:
    "Complete event management system with QR code attendance tracking, registration, and real-time analytics",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${orbitron.variable} ${inter.variable} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
              maxWidth: "90vw",
              fontSize: "14px",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "hsl(var(--chart-2))",
                secondary: "hsl(var(--card-foreground))",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "hsl(var(--destructive))",
                secondary: "hsl(var(--card-foreground))",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
