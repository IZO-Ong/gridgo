import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GRIDGO",
  description: "GO_MAZE_GENERATOR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="selection:bg-yellow-200">
      <body
        className={`${geistMono.variable} font-mono antialiased bg-white text-black`}
      >
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none bg-[inline-url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9ImJsYWNrIi8+PC9zdmc+')] shadow-inner" />

        <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
