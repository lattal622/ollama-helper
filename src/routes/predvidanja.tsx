import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearPredictions, deletePrediction, loadPredictions } from "@/lib/settings";
import { formatMatchDate } from "@/lib/format";
import type { Prediction } from "@/lib/types";

export const Route = createFileRoute("/predvidanja")({
  head: () => ({
    meta: [
      { title: "Moja AI predviđanja | Correct Score AI" },
      { name: "description", content: "Spremljena AI predviđanja točnih rezultata utakmica." },
      { property: "og:title", content: "Moja AI predviđanja" },
      { property: "og:description", content: "Spremljena predviđanja točnih rezultata." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PredictionsPage,
});

function PredictionsPage() {
  const [items, setItems] = React.useState<Prediction[]>([]);

  React.useEffect(() => setItems(loadPredictions()), []);

  function remove(id: string) {
    deletePrediction(id);
    setItems(loadPredictions());
  }

  function clearAll() {
    clearPredictions();
    setItems([]);
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Moja predviđanja</h1>
        {items.length > 0 ? (
          <Button variant="outline" size="sm" onClick={clearAll}>
            Obriši sve
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          Još nema spremljenih predviđanja. Otvori utakmicu i pokreni AI analizu.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to="/utakmica/$id"
                  params={{ id: p.matchId }}
                  className="min-w-0 flex-1 hover:text-primary"
                >
                  <p className="truncate font-semibold">
                    {p.homeTeam} vs {p.awayTeam}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.league} · {formatMatchDate(p.dateEvent)}
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary px-3 py-1 font-mono font-bold text-primary-foreground">
                    {p.predictedScore}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Obriši predviđanje"
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {p.reasoning ? (
                <p className="mt-2 text-sm text-muted-foreground">{p.reasoning}</p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
