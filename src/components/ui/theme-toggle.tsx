import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="relative h-9 w-9 rounded-lg flex items-center justify-center
                 text-muted-foreground hover:text-foreground
                 hover:bg-accent transition-colors duration-150
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <Sun
        size={17}
        className={`absolute transition-all duration-300
          ${theme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-75"
          }`}
      />
      <Moon
        size={17}
        className={`absolute transition-all duration-300
          ${theme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-75"
          }`}
      />
    </button>
  );
}