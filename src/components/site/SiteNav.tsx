"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/components/ui/cn";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/admin", label: "Admin" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl glass neon-ring flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-300" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">ElectroHub</div>
            <div className="text-[11px] text-muted-2 -mt-0.5">
              Build • Share • Inspire
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10"
          aria-label="Toggle navigation"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-6xl px-5 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

