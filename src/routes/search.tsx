import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, PlugZap, Search, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/DealCard";
import { EmptyState } from "@/components/EmptyState";
import { store } from "@/lib/store";
import { searchDeals } from "@/lib/deals-api";

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
    setQuery(q ?? "");
    if (q) store.addHistory(q);
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = query.trim();
    if (!v) return;
    store.addHistory(v);
    navigate({ to: "/search", search: { q: v } });
  };

  const {
    data,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["deals", q],
    queryFn: ({ signal }) => searchDeals(q ?? "", signal),
    enabled: !!q,
    staleTime: 30_000,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 animate-fade-in">
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

      {!q ? (
        <EmptyState
          icon={Search}
          title="Начните поиск"
          description="Введите название любого товара, валюты или предмета Roblox — например, Robux, Brainrot или Kitsune."
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Результаты поиска
              </div>
              <h1 className="truncate font-display text-2xl font-black sm:text-3xl">"{q}"</h1>
            </div>
            {isFetching && (
              <div className="shrink-0 text-xs text-muted-foreground animate-pulse">
                Загрузка…
              </div>
            )}
          </div>

          {isFetching && !data ? (
            <ResultsSkeleton />
          ) : isError ? (
            <EmptyState
              icon={AlertTriangle}
              title="Не удалось загрузить результаты"
              description="Проверьте подключение к интернету и попробуйте ещё раз."
              action={
                <Button onClick={() => refetch()} className="bg-gradient-primary">
                  Повторить
                </Button>
              }
            />
          ) : data?.status === "unavailable" ? (
            <EmptyState
              icon={PlugZap}
              title="Поиск по торговым площадкам пока недоступен."
              description="Модули поиска готовы. Как только будут подключены реальные API торговых площадок, результаты начнут появляться автоматически."
            />
          ) : data?.status === "no-results" ? (
            <EmptyState
              icon={SearchX}
              title="Ничего не найдено"
              description="По вашему запросу нет актуальных предложений. Попробуйте изменить формулировку."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.deals.map((d) => (
                <DealCard key={d.id} deal={d} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl border border-border bg-gradient-card"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
