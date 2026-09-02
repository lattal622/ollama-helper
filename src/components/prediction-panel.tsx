import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPrediction } from "@/lib/ai";
import { loadSettings, savePrediction, loadPredictions } from "@/lib/settings";
import { getStandings, getTeamLastEvents } from "@/lib/thesportsdb";
import type { MatchEvent, Prediction } from "@/lib/types";

export function PredictionPanel({ match }: { match: MatchEvent }) {
  const [loading, setLoading] = React.useState(false);
  const [prediction, setPrediction] = React.useState<Prediction | null>(null);

  React.useEffect(() => {
    const existing = loadPredictions().find((p) => p.matchId === match.idEvent);
    setPrediction(existing ?? null);
  }, [match.idEvent]);

  async function run() {
    setLoading(true);
    try {
      const settings = loadSettings();
      const key = settings.sportsDbApiKey;
      const [homeForm, awayForm, standings] = await Promise.all([
        getTeamLastEvents(match.idHomeTeam, key).catch(() => []),
        getTeamLastEvents(match.idAwayTeam, key).catch(() => []),
        getStandings(match.idLeague, key).catch(() => []),
      ]);

      const result = await getPrediction(match, homeForm, awayForm, standings, settings);

      const saved: Prediction = {
        id: `${match.idEvent}-${Date.now()}`,
        matchId: match.idEvent,
        homeTeam: match.strHomeTeam,
        awayTeam: match.strAwayTeam,
        league: match.strLeague,
        dateEvent: match.dateEvent ?? "",
        predictedHomeScore: result.homeScore,
        predictedAwayScore: result.awayScore,
        predictedScore: `${result.homeScore}:${result.awayScore}`,
        reasoning: result.reasoning,
        confidence: result.confidence,
        createdAt: new Date().toISOString(),
      };
      savePrediction(saved);
      setPrediction(saved);
    } catch (err) {
      toast.error("Greška pri predviđanju", {
        description: err instanceof Error ? err.message : "Nepoznata greška.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
          <Sparkles className="h-4 w-4 text-primary" /> AI predviđanje
        </h3>
        <Button size="sm" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {prediction ? "Ponovi" : "Predvidi"}
        </Button>
      </div>

      {prediction ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-primary p-5 text-center text-primary-foreground">
            <p className="text-xs opacity-80">Točan rezultat</p>
            <p className="text-4xl font-black">{prediction.predictedScore}</p>
            {prediction.confidence != null ? (
              <p className="mt-1 text-xs opacity-80">Sigurnost: {prediction.confidence}%</p>
            ) : null}
          </div>
          {prediction.reasoning ? (
            <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Pokreni AI analizu forme i tablice za predviđanje točnog rezultata.
        </p>
      )}
    </Card>
  );
}
