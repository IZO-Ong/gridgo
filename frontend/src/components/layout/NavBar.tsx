"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const user = null;

  const navItems = [
    { label: "Create", href: "/" },
    { label: "Solve", href: "/solve" },
    { label: "Forum", href: "/forum" },
  ];

  return (
    <div className="flex items-center gap-6">
      <Link
        href="/login"
        className="flex items-center gap-3 group cursor-pointer"
      >
        <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center transition-colors group-hover:bg-zinc-100">
          <span className="text-xs font-black">G</span>
        </div>

        <div className="flex flex-col justify-center h-full">
          <span className="text-xs font-black uppercase tracking-tighter leading-tight">
            Guest_Session
          </span>
          <span className="text-[8px] font-mono opacity-40 uppercase tracking-tight -mt-0.5">
            Click to Sign_In
          </span>
        </div>
      </Link>

      <nav className="flex border-2 border-black divide-x-2 divide-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`px-4 py-1 text-xs font-black uppercase transition-colors ${
              pathname === item.href
                ? "bg-black text-white"
                : "hover:bg-zinc-100 text-black"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
