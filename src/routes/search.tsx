import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PlugZap, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { store } from "@/lib/store";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: (s) => searchSchema.parse(s),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(q ?? "");

  useEffect(() => {
    if (q) store.addHistory(q);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = query.trim();
    if (!v) return;
    store.addHistory(v);
    navigate({ to: "/search", search: { q: v } });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <form onSubmit={submit} className="mb-8">
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/80 p-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Введите название товара Roblox..."
              className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" className="bg-gradient-primary text-primary-foreground shadow-glow">
            <Search className="h-4 w-4" /> Найти цены
          </Button>
        </div>
      </form>

      {q ? (
        <>
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Результаты поиска
              </div>
              <h1 className="font-display text-2xl font-black sm:text-3xl">"{q}"</h1>
            </div>
          </div>

          <EmptyState
            icon={PlugZap}
            title="Здесь появятся реальные предложения"
            description="Модуль поиска готов. Как только будут подключены API торговых площадок и парсеры, карточки товаров начнут появляться на этой странице автоматически."
          />
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="Начните поиск"
          description="Введите название любого товара, валюты или предмета Roblox — например, Robux, Brainrot или Kitsune."
        />
      )}
    </div>
  );
}
