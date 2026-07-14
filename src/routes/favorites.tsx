import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/DealCard";
import { EmptyState } from "@/components/EmptyState";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const items = useStore((s) => s.favorites);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Избранное</div>
        <h1 className="font-display text-3xl font-black">Сохранённые товары</h1>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="В избранном пока пусто"
          description="Отмечайте интересные предложения сердечком, чтобы вернуться к ним позже."
          action={
            <Button asChild className="bg-gradient-primary">
              <Link to="/search">К поиску</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      )}
    </div>
  );
}
