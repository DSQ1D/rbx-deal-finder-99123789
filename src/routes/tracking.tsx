import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Switch } from "@/components/ui/switch";
import { store, useStore } from "@/lib/store";
import type { TrackedDeal } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tracking")({
  component: TrackingPage,
});

const statusMap: Record<TrackedDeal["status"], { label: string; cls: string }> = {
  pending: { label: "Ожидание проверки", cls: "bg-muted text-muted-foreground" },
  decreased: { label: "Цена снизилась", cls: "bg-success/15 text-success" },
  increased: { label: "Цена повысилась", cls: "bg-destructive/15 text-destructive" },
  unchanged: { label: "Без изменений", cls: "bg-primary/10 text-primary" },
};

function fmt(ts: number) {
  return new Date(ts).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function TrackingPage() {
  const items = useStore((s) => s.tracking);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Отслеживание</div>
        <h1 className="font-display text-3xl font-black">Отслеживание цен</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Мы уведомим вас, как только цена на отслеживаемый товар изменится.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Нет отслеживаемых товаров"
          description="Нажмите 🔔 на карточке товара, чтобы начать отслеживать его цену."
          action={
            <Button asChild className="bg-gradient-primary">
              <Link to="/search">К поиску</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
          {items.map((d) => {
            const s = statusMap[d.status];
            return (
              <div
                key={d.id}
                className="rounded-2xl border border-border bg-gradient-card p-4 transition-all hover:border-primary/40 hover:shadow-glow sm:p-5"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:grid-cols-[minmax(0,2fr)_1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {d.marketplace}
                    </div>
                    <div className="truncate font-display text-base font-bold sm:text-lg">
                      {d.title}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Проверено: {fmt(d.lastCheckedAt)}
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Цена
                    </div>
                    <div className="font-display text-lg font-black text-gradient sm:text-xl">
                      {d.price}
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 sm:col-span-1 sm:border-none sm:pt-0">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                        s.cls,
                      )}
                    >
                      {s.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        Следить
                        <Switch
                          checked={d.active}
                          onCheckedChange={(v) => store.setTrackActive(d.id, v)}
                        />
                      </label>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        aria-label="Открыть"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => store.removeTrack(d.id)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      )}
    </div>
  );
}
