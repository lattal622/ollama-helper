import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatMatchDate } from "@/lib/format";
import { loadSettings } from "@/lib/settings";
import { getTeamById, getTeamLastEvents } from "@/lib/thesportsdb";

export const Route = createFileRoute("/momcad/$id")({
  head: () => ({
    meta: [
      { title: "Momčad — profil i forma | Correct Score AI" },
      { name: "description", content: "Profil momčadi, stadion i zadnje odigrane utakmice." },
      { property: "og:title", content: "Momčad — profil i forma" },
      { property: "og:description", content: "Profil momčadi i zadnje odigrane utakmice." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { id } = Route.useParams();
  const key = typeof window === "undefined" ? "3" : loadSettings().sportsDbApiKey;
  const team = useQuery({ queryKey: ["team", id], queryFn: () => getTeamById(id, key) });
  const form = useQuery({ queryKey: ["teamlast", id], queryFn: () => getTeamLastEvents(id, key) });

  if (team.isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!team.data) {
    return <p className="py-20 text-center text-muted-foreground">Momčad nije pronađena.</p>;
  }

  const t = team.data;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-4">
        {t.strBadge ? (
          <img src={t.strBadge} alt={`Grb momčadi ${t.strTeam}`} className="h-16 w-16" />
        ) : null}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.strTeam}</h1>
          <p className="text-sm text-muted-foreground">
            {[t.strLeague, t.strCountry, t.intFormedYear].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {t.strStadium ? (
        <Card className="mt-6 p-4 text-sm">
          <span className="text-muted-foreground">Stadion: </span>
          {t.strStadium}
        </Card>
      ) : null}

      <h2 className="mt-8 text-lg font-semibold">Zadnje utakmice</h2>
      <div className="mt-3 space-y-2">
        {form.data?.length ? (
          form.data.slice(0, 10).map((e) => (
            <Card key={e.idEvent} className="p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="flex-1 truncate">{e.strHomeTeam}</span>
                <span className="font-mono font-bold text-primary">
                  {e.intHomeScore}:{e.intAwayScore}
                </span>
                <span className="flex-1 truncate text-right">{e.strAwayTeam}</span>
              </div>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {formatMatchDate(e.dateEvent)}
              </p>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">Nema podataka.</p>
        )}
      </div>
    </div>
  );
}
