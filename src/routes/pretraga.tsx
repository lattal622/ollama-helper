import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loadSettings } from "@/lib/settings";
import { searchTeams } from "@/lib/thesportsdb";

export const Route = createFileRoute("/pretraga")({
  head: () => ({
    meta: [
      { title: "Pretraga klubova | Correct Score AI" },
      { name: "description", content: "Pretraži nogometne klubove iz cijelog svijeta po imenu." },
      { property: "og:title", content: "Pretraga klubova" },
      { property: "og:description", content: "Pretraži nogometne klubove po imenu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = React.useState("");
  const [term, setTerm] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setTerm(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const key = typeof window === "undefined" ? "3" : loadSettings().sportsDbApiKey;
  const results = useQuery({
    queryKey: ["searchTeams", term],
    queryFn: () => searchTeams(term, key),
    enabled: term.length > 1,
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Pretraga klubova</h1>

      <div className="relative mt-6">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Npr. Dinamo Zagreb"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {results.isFetching ? (
        <div className="flex justify-center py-10 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : null}

      <div className="mt-6 space-y-3">
        {results.data?.map((t) => (
          <Link key={t.idTeam} to="/momcad/$id" params={{ id: t.idTeam }}>
            <Card className="flex flex-row items-center gap-3 p-4 transition-colors hover:bg-accent">
              {t.strBadge ? (
                <img src={t.strBadge} alt={`Grb ${t.strTeam}`} className="h-10 w-10" />
              ) : null}
              <div className="min-w-0">
                <p className="truncate font-semibold">{t.strTeam}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[t.strLeague, t.strCountry].filter(Boolean).join(" · ")}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {term.length > 1 && !results.isFetching && results.data?.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Nema rezultata.</p>
      ) : null}
    </div>
  );
}
