import NavBar from "@/components/layout/NavBar";
import MazeMargin from "@/components/layout/MazeMargin";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black min-h-screen relative font-mono overflow-x-hidden">
        {/* Maze Side Margins */}
        <MazeMargin side="left" />
        <MazeMargin side="right" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col min-h-screen">
          <header className="pt-12 pb-2 flex justify-between items-end border-b-4 border-black bg-white">
            <h1 className="text-4xl font-black uppercase tracking-tighter px-8">
              GRIDGO
            </h1>
            <div className="px-8">
              <NavBar />
            </div>
          </header>

          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
