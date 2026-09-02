import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { MatchCard } from "@/components/match-card";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLastEvents, getNextEvents, getStandings } from "@/lib/thesportsdb";
import { loadSettings } from "@/lib/settings";
import { POPULAR_LEAGUES } from "@/lib/types";

export const Route = createFileRoute("/liga/$id")({
  head: () => ({
    meta: [
      { title: "Liga — raspored i tablica | Correct Score AI" },
      { name: "description", content: "Tablica lige, nadolazeće i odigrane utakmice." },
      { property: "og:title", content: "Liga — raspored i tablica" },
      { property: "og:description", content: "Tablica lige, nadolazeće i odigrane utakmice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaguePage,
});

function LeaguePage() {
  const { id } = Route.useParams();
  const leagueName = POPULAR_LEAGUES.find((l) => l.id === id)?.name ?? "Liga";

  const key = typeof window === "undefined" ? "3" : loadSettings().sportsDbApiKey;

  const next = useQuery({ queryKey: ["next", id], queryFn: () => getNextEvents(id, key) });
  const last = useQuery({ queryKey: ["last", id], queryFn: () => getLastEvents(id, key) });
  const table = useQuery({ queryKey: ["table", id], queryFn: () => getStandings(id, key) });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">{leagueName}</h1>

      <Tabs defaultValue="next" className="mt-6">
        <TabsList>
          <TabsTrigger value="next">Nadolazeće</TabsTrigger>
          <TabsTrigger value="last">Odigrano</TabsTrigger>
          <TabsTrigger value="table">Tablica</TabsTrigger>
        </TabsList>

        <TabsContent value="next" className="mt-4 space-y-3">
          {next.isLoading ? <Spinner /> : null}
          {next.data?.length ? (
            next.data.map((m) => <MatchCard key={m.idEvent} match={m} />)
          ) : next.isLoading ? null : (
            <Empty />
          )}
        </TabsContent>

        <TabsContent value="last" className="mt-4 space-y-3">
          {last.isLoading ? <Spinner /> : null}
          {last.data?.length ? (
            last.data.map((m) => <MatchCard key={m.idEvent} match={m} />)
          ) : last.isLoading ? null : (
            <Empty />
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          {table.isLoading ? <Spinner /> : null}
          {table.data?.length ? (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Momčad</th>
                    <th className="p-3">U</th>
                    <th className="p-3">P</th>
                    <th className="p-3">N</th>
                    <th className="p-3">I</th>
                    <th className="p-3">Bod</th>
                  </tr>
                </thead>
                <tbody>
                  {table.data.map((row) => (
                    <tr key={row.idStanding} className="border-b border-border/50 last:border-0">
                      <td className="p-3">{row.intRank}</td>
                      <td className="p-3 font-medium">
                        <Link
                          to="/momcad/$id"
                          params={{ id: row.idTeam }}
                          className="hover:text-primary"
                        >
                          {row.strTeam}
                        </Link>
                      </td>
                      <td className="p-3 text-center">{row.intPlayed}</td>
                      <td className="p-3 text-center">{row.intWin}</td>
                      <td className="p-3 text-center">{row.intDraw}</td>
                      <td className="p-3 text-center">{row.intLoss}</td>
                      <td className="p-3 text-center font-bold">{row.intPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : table.isLoading ? null : (
            <Empty />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-10 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

function Empty() {
  return <p className="py-10 text-center text-muted-foreground">Nema dostupnih podataka.</p>;
}
