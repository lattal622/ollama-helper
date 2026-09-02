import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import type { MatchEvent } from "@/lib/types";

export function MatchCard({ match }: { match: MatchEvent }) {
  const hasScore = match.intHomeScore != null && match.intAwayScore != null;

  return (
    <Link to="/utakmica/$id" params={{ id: match.idEvent }}>
      <Card className="border-l-4 border-l-primary p-4 transition-colors hover:bg-accent">
        <div className="flex items-center justify-between gap-3">
          <span className="flex-1 text-right text-sm font-semibold">{match.strHomeTeam}</span>
          <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-bold text-primary">
            {hasScore ? `${match.intHomeScore} : ${match.intAwayScore}` : "vs"}
          </span>
          <span className="flex-1 text-sm font-semibold">{match.strAwayTeam}</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatMatchDate(match.dateEvent ?? "")}
          </span>
          {match.strTime ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatMatchTime(match.strTime)}
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
