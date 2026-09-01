import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold text-foreground">Correct Score AI</span>
            <span>·</span>
            <span>Podaci: TheSportsDB</span>
            <span>·</span>
            <span>AI: Gemini 3.6</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/postavke" className="transition-colors hover:text-foreground">
              Postavke
            </Link>
            <Link to="/predvidanja" className="transition-colors hover:text-foreground">
              Predviđanja
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
