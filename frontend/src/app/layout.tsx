import NavBar from "@/components/layout/NavBar";
import MazeMargin from "@/components/layout/MazeMargin";
import "./globals.css";

// RootLayout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black relative font-mono overflow-x-hidden">
        <MazeMargin side="left" />
        <MazeMargin side="right" />
        <div
          id="main-content-wrapper"
          className="relative z-10 max-w-5xl mx-auto flex flex-col"
        >
          <div className="p-8 flex flex-col">
            <header className="pt-4 pb-2 flex justify-between items-end border-b-4 border-black bg-white">
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                GRIDGO
              </h1>
              <NavBar />
            </header>
            <main className="pt-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
