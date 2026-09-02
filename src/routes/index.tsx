import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Trophy } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { POPULAR_LEAGUES } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Correct Score AI — Nogometne lige i AI predviđanja" },
      {
        name: "description",
        content:
          "Pregledaj nogometne lige svijeta, tablice i rasporede te dobij AI predviđanje točnog rezultata.",
      },
      { property: "og:title", content: "Correct Score AI — Nogometne lige" },
      {
        property: "og:description",
        content: "AI predviđanje točnog rezultata za utakmice iz liga cijelog svijeta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaguesPage,
});

function LeaguesPage() {
  const [q, setQ] = React.useState("");
  const filtered = POPULAR_LEAGUES.filter(
    (l) =>
      l.name.toLowerCase().includes(q.toLowerCase()) ||
      l.country.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Nogometne lige</h1>
      <p className="mt-1 text-muted-foreground">Odaberi ligu za tablicu, raspored i predviđanja.</p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Pretraži lige ili države…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((league) => (
          <Link key={league.id} to="/liga/$id" params={{ id: league.id }}>
            <Card className="flex h-full flex-row items-center gap-3 p-4 transition-colors hover:bg-accent">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{league.name}</p>
                <p className="text-xs text-muted-foreground">{league.country}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Nema rezultata za “{q}”.</p>
      ) : null}
    </div>
  );
}
