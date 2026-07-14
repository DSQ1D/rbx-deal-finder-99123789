import { Bell, ExternalLink, Heart, Scale } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { store, useStore } from "@/lib/store";
import type { Deal } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DealCard({ deal }: { deal: Deal }) {
  const isFav = useStore((s) => s.favorites.some((d) => d.id === deal.id));
  const isCmp = useStore((s) => s.compare.some((d) => d.id === deal.id));
  const isTrk = useStore((s) => s.tracking.some((d) => d.id === deal.id));

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-5 shadow-elegant transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow animate-scale-in">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-primary opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {deal.marketplace}
          </div>
          <h3 className="mt-1 truncate font-display text-lg font-bold">{deal.title}</h3>
          <div className="mt-1 text-xs text-muted-foreground">Продавец: {deal.seller}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-gradient font-display">{deal.price}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button asChild size="sm" className="bg-gradient-primary hover:opacity-90">
          <a href={deal.url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" /> Открыть объявление
          </a>
        </Button>
        <IconToggle
          active={isFav}
          onClick={() => {
            store.toggleFavorite(deal);
            toast(isFav ? "Убрано из избранного" : "Товар добавлен в избранное");
          }}
          label="В избранное"
        >
          <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
        </IconToggle>
        <IconToggle
          active={isCmp}
          onClick={() => {
            store.toggleCompare(deal);
            toast(isCmp ? "Убрано из сравнения" : "Товар добавлен к сравнению");
          }}
          label="К сравнению"
        >
          <Scale className="h-4 w-4" />
        </IconToggle>
        <IconToggle
          active={isTrk}
          onClick={() => {
            store.toggleTrack(deal);
            toast(isTrk ? "Отслеживание отключено" : "Теперь вы следите за ценой");
          }}
          label="Следить"
        >
          <Bell className="h-4 w-4" />
        </IconToggle>
      </div>
    </div>
  );
}

function IconToggle({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg border transition-all",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}
