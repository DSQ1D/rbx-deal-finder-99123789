import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Scale, Heart, Bell, History, Info, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Главная", icon: Home },
  { to: "/search", label: "Поиск", icon: Search },
  { to: "/compare", label: "Сравнение", icon: Scale },
  { to: "/favorites", label: "Избранное", icon: Heart },
  { to: "/tracking", label: "Отслеживание", icon: Bell },
  { to: "/history", label: "История", icon: History },
  { to: "/about", label: "О сайте", icon: Info },
] as const;

function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-105">
        <span className="font-display text-lg font-black text-primary-foreground">R</span>
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-primary opacity-40 blur-md -z-10" />
      </div>
      <div className="leading-none">
        <div className="font-display text-lg font-black tracking-tight">
          RBX<span className="text-gradient">Deals</span>
        </div>
      </div>
    </Link>
  );
}

function Counter({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
      {n}
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const favs = useStore((s) => s.favorites.length);
  const cmp = useStore((s) => s.compare.length);
  const trk = useStore((s) => s.tracking.length);

  useEffect(() => setOpen(false), [pathname]);

  const counts: Record<string, number> = {
    "/favorites": favs,
    "/compare": cmp,
    "/tracking": trk,
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <Counter n={counts[item.to] ?? 0} />
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-border bg-card lg:hidden"
            aria-label="Меню"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-border/60 bg-background/95 px-3 pb-3 pt-2 lg:hidden animate-fade-in">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <Counter n={counts[item.to] ?? 0} />
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 mt-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <div className="text-center sm:text-right">
            <div>RBXDeals © 2026</div>
            <div className="text-xs">Поиск и сравнение предложений Roblox.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
