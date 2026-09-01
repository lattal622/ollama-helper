import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applyTheme, type ThemeMode } from "@/lib/theme";

export function ThemeToggle() {
  function set(mode: ThemeMode) {
    applyTheme(mode, true);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Promijeni temu">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Promijeni temu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => set("light")}>
          <Sun className="mr-2 h-4 w-4" /> Svijetlo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => set("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Tamno
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => set("system")}>
          <Monitor className="mr-2 h-4 w-4" /> Sustav
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeInit() {
  React.useEffect(() => {
    applyTheme(undefined, false);
  }, []);
  return null;
}
