import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PredictionPanel } from "@/components/prediction-panel";
import { Card } from "@/components/ui/card";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { loadSettings } from "@/lib/settings";
import { getEventById } from "@/lib/thesportsdb";

export const Route = createFileRoute("/utakmica/$id")({
  head: () => ({
    meta: [
      { title: "Utakmica — AI predviđanje točnog rezultata | Correct Score AI" },
      {
        name: "description",
        content: "Detalji utakmice i AI predviđanje točnog konačnog rezultata.",
      },
      { property: "og:title", content: "Utakmica — AI predviđanje" },
      { property: "og:description", content: "Detalji utakmice i AI predviđanje rezultata." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatchPage,
});

function MatchPage() {
  const { id } = Route.useParams();
  const key = typeof window === "undefined" ? "3" : loadSettings().sportsDbApiKey;
  const match = useQuery({ queryKey: ["event", id], queryFn: () => getEventById(id, key) });

  if (match.isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!match.data) {
    return <p className="py-20 text-center text-muted-foreground">Utakmica nije pronađena.</p>;
  }

  const m = match.data;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <p className="text-sm text-muted-foreground">{m.strLeague}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">
        {m.strHomeTeam} vs {m.strAwayTeam}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatMatchDate(m.dateEvent ?? "")} {formatMatchTime(m.strTime ?? "")}
        {m.strVenue ? ` · ${m.strVenue}` : ""}
      </p>

      <Card className="mt-6 flex flex-row items-center justify-between gap-4 p-6">
        <Link
          to="/momcad/$id"
          params={{ id: m.idHomeTeam }}
          className="flex-1 text-center font-semibold hover:text-primary"
        >
          {m.strHomeTeam}
        </Link>
        <span className="font-mono text-2xl font-black text-primary">
          {m.intHomeScore != null && m.intAwayScore != null
            ? `${m.intHomeScore} : ${m.intAwayScore}`
            : "vs"}
        </span>
        <Link
          to="/momcad/$id"
          params={{ id: m.idAwayTeam }}
          className="flex-1 text-center font-semibold hover:text-primary"
        >
          {m.strAwayTeam}
        </Link>
      </Card>

      <div className="mt-6">
        <PredictionPanel match={m} />
      </div>
    </div>
  );
}
