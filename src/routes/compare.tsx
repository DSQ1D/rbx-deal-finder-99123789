import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Scale, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { store, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

function parsePrice(p: string): number {
  const n = parseFloat(p.replace(/[^\d.,-]/g, "").replace(",", "."));
  return isNaN(n) ? Infinity : n;
}

function ComparePage() {
  const items = useStore((s) => s.compare);
  const min = items.length ? Math.min(...items.map((i) => parsePrice(i.price))) : Infinity;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Сравнение</div>
          <h1 className="font-display text-3xl font-black">Сравнение товаров</h1>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              store.clearCompare();
              toast("Сравнение очищено");
            }}
          >
            <Trash2 className="h-4 w-4" /> Очистить сравнение
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Список сравнения пуст"
          description="Добавляйте товары к сравнению с помощью кнопки ⚖️ на карточках предложений."
          action={
            <Button asChild className="bg-gradient-primary">
              <Link to="/search">Перейти к поиску</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-gradient-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Товар</th>
                <th className="p-4">Площадка</th>
                <th className="p-4">Цена</th>
                <th className="p-4">Продавец</th>
                <th className="p-4">Ссылка</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => {
                const isMin = parsePrice(d.price) === min;
                return (
                  <tr key={d.id} className="border-b border-border/60 last:border-none">
                    <td className="p-4 font-medium">{d.title}</td>
                    <td className="p-4 text-muted-foreground">{d.marketplace}</td>
                    <td
                      className={cn(
                        "p-4 font-black font-display",
                        isMin ? "text-success" : "text-foreground",
                      )}
                    >
                      {d.price}
                      {isMin && (
                        <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                          Лучшая
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{d.seller}</td>
                    <td className="p-4">
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Открыть <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => store.removeCompare(d.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                        aria-label="Удалить"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
