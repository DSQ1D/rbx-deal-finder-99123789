import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { History, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { store, useStore } from "@/lib/store";


export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function fmt(ts: number) {
  return new Date(ts).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function HistoryPage() {
  const items = useStore((s) => s.history);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">История</div>
          <h1 className="font-display text-3xl font-black">История поиска</h1>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              store.clearHistory();
              toast("История очищена");
            }}
          >
            <Trash2 className="h-4 w-4" /> Очистить историю
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={History}
          title="История пуста"
          description="Здесь появятся ваши последние поисковые запросы."
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-gradient-card">
          {items.map((h) => (
            <li
              key={h.at}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <History className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{h.query}</div>
                <div className="text-xs text-muted-foreground">{fmt(h.at)}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: "/search", search: { q: h.query } })}
              >
                <RotateCcw className="h-4 w-4" /> Повторить
              </Button>
              <button
                onClick={() =>
                  store.clearHistory() /* per-item removal not required; simpler API */
                }
                className="hidden"
                aria-hidden
              >
                <X />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
