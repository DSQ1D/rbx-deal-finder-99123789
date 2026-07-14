import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Search, Zap, Wallet, Star, Scale, Bell, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { store, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

const features = [
  { icon: Zap, title: "Быстрый поиск", desc: "Результаты за секунды по всем площадкам." },
  { icon: Wallet, title: "Сравнение цен", desc: "Выбирай самое выгодное предложение." },
  { icon: Star, title: "Избранное", desc: "Сохраняй интересные товары в один клик." },
  { icon: Scale, title: "Сравнение товаров", desc: "Ставь предложения рядом друг с другом." },
  { icon: Bell, title: "Отслеживание цен", desc: "Узнавай о снижении цены первым." },
];

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const favs = useStore((s) => s.favorites.length);
  const cmp = useStore((s) => s.compare.length);
  const trk = useStore((s) => s.tracking.length);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    store.addHistory(query);
    navigate({ to: "/search", search: { q: query } });
  };

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-hero pointer-events-none" />

      <section className="relative mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Все площадки Roblox в одном месте
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl">
            Найди лучшие <span className="text-gradient">предложения Roblox</span> за секунды
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            RBXDeals ищет, сравнивает и отслеживает цены на Robux, лимитированные предметы и игровые
            валюты с десятков торговых площадок.
          </p>

          <form onSubmit={submit} className="mt-10 w-full">
            <div className="group relative flex flex-col gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-elegant backdrop-blur sm:flex-row sm:items-center">
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 blur-xl transition-opacity group-focus-within:opacity-30" />
              <div className="relative flex flex-1 items-center gap-3 rounded-xl px-4">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Введите название товара Roblox..."
                  className="min-w-0 flex-1 bg-transparent py-4 text-base outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="relative bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                <Search className="h-5 w-5" /> Найти цены
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Например:</span>
              {["Robux", "Brainrot", "Kitsune", "Dragonfly", "Huge Cat"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQ(s)}
                  className="rounded-full border border-border bg-card px-3 py-1 transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Найденных предложений" value="—" hint="После подключения API" />
          <Stat label="В избранном" value={favs} />
          <Stat label="В сравнении" value={cmp} />
          <Stat label="Отслеживается" value={trk} />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-black sm:text-4xl">Возможности сервиса</h2>
          <p className="mt-2 text-muted-foreground">Всё, что нужно для умных покупок в Roblox.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
            <Link to="/about">
              Узнать больше о RBXDeals <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-4 sm:p-5">
      <div className="text-2xl font-black font-display text-gradient sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-medium text-foreground/80 sm:text-sm">{label}</div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
