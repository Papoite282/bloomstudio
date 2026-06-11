"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, LayoutDashboard, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/reels/new", label: "Novo", icon: Plus },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-bloom-olive/15 bg-bloom-porcelain/82 px-5 py-6 backdrop-blur lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-bloom-ink font-serif text-2xl text-bloom-cream">
            B
          </span>
          <span>
            <span className="block font-serif text-3xl leading-none text-bloom-ink">
              BloomStudio
            </span>
            <span className="block text-xs uppercase tracking-[0.18em] text-bloom-ink/45">
              Creative reels
            </span>
          </span>
        </Link>

        <nav className="mt-10 space-y-2" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                  active
                    ? "bg-bloom-olive text-bloom-cream shadow-sm"
                    : "text-bloom-ink/62 hover:bg-bloom-cream hover:text-bloom-ink",
                )}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-20 border-b border-bloom-olive/15 bg-bloom-porcelain/88 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bloom-ink font-serif text-xl text-bloom-cream">
              B
            </span>
            <span className="font-serif text-2xl text-bloom-ink">
              BloomStudio
            </span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Navegação móvel">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  title={item.label}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md transition",
                    active
                      ? "bg-bloom-olive text-bloom-cream"
                      : "text-bloom-ink/60 hover:bg-bloom-cream hover:text-bloom-ink",
                  )}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
