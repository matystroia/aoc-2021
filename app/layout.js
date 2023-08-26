"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "react-error-boundary";
import { useEffect } from "react";

import { MobileFallback } from "./MobileFallback";

class MobileError extends Error {}

function AssertDesktop() {
    useEffect(() => {
        const mediaQuery = matchMedia("(min-width: 800px) and (min-height: 600px)");
        if (!mediaQuery.matches) throw new MobileError();
    }, []);
    return "";
}
const inter = Inter({ subsets: ["latin"] });

function fallbackRender({ error }) {
    if (error instanceof MobileError) return <MobileFallback />;
    return (
        <div className="h-screen font-serif text-4xl italic center text-zinc-200 bg-zinc-950">
            fin
        </div>
    );
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ErrorBoundary fallbackRender={fallbackRender}>
                    <AssertDesktop />
                    {children}
                </ErrorBoundary>
            </body>
        </html>
    );
}
