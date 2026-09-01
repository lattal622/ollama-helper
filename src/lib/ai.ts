import { predictMatch } from "./ai.functions";
import type { AISettings, MatchEvent, TeamLastEvent, TeamStanding } from "./types";

export interface PredictionResult {
  homeScore: number;
  awayScore: number;
  reasoning: string;
  confidence: number;
}

interface AIPredictionResponse {
  homeScore?: number;
  awayScore?: number;
  reasoning?: string;
  confidence?: number;
}

function formLine(events: TeamLastEvent[], teamId: string): string {
  return events
    .slice(0, 5)
    .map((e) => {
      const isHome = e.idHomeTeam === teamId;
      const hs = parseInt(e.intHomeScore || "0", 10);
      const as = parseInt(e.intAwayScore || "0", 10);
      const result = isHome
        ? hs > as
          ? "P"
          : hs < as
            ? "I"
            : "N"
        : hs < as
          ? "P"
          : hs > as
            ? "I"
            : "N";
      return `${e.strHomeTeam} ${e.intHomeScore}-${e.intAwayScore} ${e.strAwayTeam} (${result})`;
    })
    .join(", ");
}

function buildPrompt(
  match: MatchEvent,
  homeForm: TeamLastEvent[],
  awayForm: TeamLastEvent[],
  standings: TeamStanding[],
): string {
  const homeTeam = match.strHomeTeam;
  const awayTeam = match.strAwayTeam;
  const homeStand = standings.find((s) => s.strTeam === homeTeam);
  const awayStand = standings.find((s) => s.strTeam === awayTeam);

  const standLine = (s?: TeamStanding) =>
    s
      ? `Pozicija ${s.intRank}, ${s.intPlayed} utakmica, ${s.intWin}P ${s.intDraw}N ${s.intLoss}I, Golovi ${s.intGoalsFor}:${s.intGoalsAgainst}, Bodovi ${s.intPoints}, Forma ${s.strForm}`
      : "Nema podataka";

  return `Ti si nogometni analitičar. Predvidi TOČAN konačni rezultat utakmice.

Utakmica: ${homeTeam} vs ${awayTeam}
Liga: ${match.strLeague}
Datum: ${match.dateEvent || "nepoznat"}

Tablica:
${homeTeam}: ${standLine(homeStand)}
${awayTeam}: ${standLine(awayStand)}

Zadnjih 5 utakmica ${homeTeam}: ${formLine(homeForm, match.idHomeTeam) || "Nema podataka"}
Zadnjih 5 utakmica ${awayTeam}: ${formLine(awayForm, match.idAwayTeam) || "Nema podataka"}

Odgovori isključivo u JSON formatu, bez dodatnog teksta:
{
  "homeScore": <cijeli broj>,
  "awayScore": <cijeli broj>,
  "confidence": <broj 0-100>,
  "reasoning": "<kratko obrazloženje na hrvatskom, max 3 rečenice>"
}`;
}

function parseResponse(text: string): PredictionResult {
  let jsonStr = text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  const jsonStart = jsonStr.indexOf("{");
  const jsonEnd = jsonStr.lastIndexOf("}");
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
  }

  try {
    const parsed: AIPredictionResponse = JSON.parse(jsonStr);
    if (typeof parsed.homeScore === "number" && typeof parsed.awayScore === "number") {
      return {
        homeScore: Math.max(0, Math.round(parsed.homeScore)),
        awayScore: Math.max(0, Math.round(parsed.awayScore)),
        reasoning: parsed.reasoning || "",
        confidence:
          typeof parsed.confidence === "number"
            ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
            : 50,
      };
    }
  } catch {
    // fall through to regex parsing
  }

  const scoreMatch = text.match(/(\d+)\s*[-:]\s*(\d+)/);
  if (scoreMatch) {
    return {
      homeScore: parseInt(scoreMatch[1], 10),
      awayScore: parseInt(scoreMatch[2], 10),
      reasoning: text.substring(0, 300),
      confidence: 50,
    };
  }

  throw new Error("AI nije vratio valjan rezultat. Pokušajte ponovno.");
}

export async function getPrediction(
  match: MatchEvent,
  homeForm: TeamLastEvent[],
  awayForm: TeamLastEvent[],
  standings: TeamStanding[],
  settings: AISettings,
): Promise<PredictionResult> {
  const prompt = buildPrompt(match, homeForm, awayForm, standings);

  const { text } = await predictMatch({
    data: {
      prompt,
      source: settings.aiSource,
      geminiApiKey: settings.aiSource === "gemini" ? settings.geminiApiKey : undefined,
    },
  });

  return parseResponse(text);
}
