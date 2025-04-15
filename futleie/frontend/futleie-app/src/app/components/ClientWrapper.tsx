"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/" || pathname === "/registerUser"; // Sjekker om vi er på login eller register

  return (
    <>
      {!isAuthPage && <Header />} {/* Skjuler Header på login og registerUser */}
      {children}
    </>
  );
}
