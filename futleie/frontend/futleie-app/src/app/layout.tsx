import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"; 
import { AuthProvider } from "./components/AuthContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Futleie - Lei og Lei Ut",
  description: "Finn og lei ut ting enkelt med Futleie",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" className="bg-background text-text">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider> {}
          <Header />
          <main className="container mx-auto p-6 flex-grow">{children}</main>
        </AuthProvider>
        <footer className="bg-brick text-white text-center p-4 mt-10 shadow-inner">
          <p>&copy; {new Date().getFullYear()} Futleie - Alle rettigheter reservert.</p>
        </footer>
      </body>
    </html>
  );
}
