import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Heart, Scale, Search, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О сервисе — RBXDeals" },
      {
        name: "description",
        content: "RBXDeals — как работает сервис поиска и сравнения цен Roblox.",
      },
      { property: "og:title", content: "О сервисе — RBXDeals" },
      {
        property: "og:description",
        content: "RBXDeals — как работает сервис поиска и сравнения цен Roblox.",
      },
    ],
  }),
  component: AboutPage,
});

const points = [
  { icon: Search, title: "Единая точка поиска", desc: "Один запрос — десятки площадок." },
  { icon: Zap, title: "Скорость", desc: "Оптимизированные парсеры и API." },
  { icon: Scale, title: "Прозрачное сравнение", desc: "Все предложения в одной таблице." },
  { icon: Heart, title: "Избранное", desc: "Сохраняйте товары, к которым захочется вернуться." },
  { icon: Bell, title: "Уведомления о цене", desc: "Не пропустите скидку на нужный предмет." },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="text-center animate-fade-in">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> О RBXDeals
        </div>
        <h1 className="font-display text-4xl font-black sm:text-5xl">
          Умный агрегатор <span className="text-gradient">цен Roblox</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          RBXDeals помогает игрокам находить лучшие предложения на Robux, лимитированные предметы и
          валюты популярных игр. Сервис объединяет данные с десятков торговых площадок в одном
          удобном интерфейсе.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {points.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-border bg-gradient-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-primary/30 bg-gradient-card p-8 text-center shadow-elegant">
        <h2 className="font-display text-2xl font-black">Сервис в активной разработке</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Интерфейс и архитектура готовы к подключению реальных данных через официальные API и
          собственные парсеры. Настоящие цены и предложения появятся сразу после интеграции.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg" className="bg-gradient-primary shadow-glow">
            <Link to="/">Попробовать поиск</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
