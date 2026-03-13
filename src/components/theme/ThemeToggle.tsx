import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { useTheme, type ThemeColor } from "./ThemeProvider";
import { t } from "@/i18n";

const themeColors: { value: ThemeColor; label: string; gradient: string }[] = [
  {
    value: "indigo",
    label: t("theme.color.indigo"),
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    value: "emerald",
    label: t("theme.color.emerald"),
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    value: "rose",
    label: t("theme.color.rose"),
    gradient: "from-rose-500 to-pink-600",
  },
  {
    value: "amber",
    label: t("theme.color.amber"),
    gradient: "from-amber-500 to-orange-600",
  },
  {
    value: "cyan",
    label: t("theme.color.cyan"),
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    value: "violet",
    label: t("theme.color.violet"),
    gradient: "from-violet-500 to-purple-600",
  },
  {
    value: "orange",
    label: t("theme.color.orange"),
    gradient: "from-orange-500 to-red-600",
  },
  {
    value: "pink",
    label: t("theme.color.pink"),
    gradient: "from-pink-500 to-rose-600",
  },
];

export function ThemeToggle() {
  const { theme, setTheme, themeColor, setThemeColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const Icon = icons[theme];

  const modeOptions: {
    value: "light" | "dark" | "system";
    label: string;
    icon: typeof Sun;
  }[] = [
      { value: "light", label: t("theme.light"), icon: Sun },
      { value: "dark", label: t("theme.dark"), icon: Moon },
      { value: "system", label: t("theme.system"), icon: Monitor },
    ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 rounded-xl glass-card hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-90 group"
      >
        <Icon className="h-5 w-5 transition-all duration-500 group-hover:rotate-12 group-active:rotate-45" />
        <span className="sr-only">Toggle theme</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-52 glass-card py-2 z-[100] shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
          style={{
            animation: "dropdownIn 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
            backdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          {/* Mode Selection */}
          <div className="px-3 pb-2 border-b border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {t("theme.mode")}
            </span>
          </div>
          {modeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/10 transition-colors ${theme === option.value ? "bg-primary/10 text-primary" : ""
                }`}
            >
              <option.icon className="h-4 w-4" />
              <span>{option.label}</span>
              {theme === option.value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}

          {/* Color Selection */}
          <div className="px-3 py-2 border-t border-border/50 mt-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Palette className="h-4 w-4" />
              <span>{t("theme.color.label")}</span>
            </button>
          </div>

          {showColorPicker && (
            <div
              className="px-3 pb-2 grid grid-cols-4 gap-2"
              style={{ animation: "fadeIn 0.2s ease-out" }}
            >
              {themeColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setThemeColor(color.value)}
                  className={`h-8 w-8 rounded-lg bg-gradient-to-br ${color.gradient} transition-all duration-200 hover:scale-110 ${themeColor === color.value
                    ? "ring-2 ring-offset-2 ring-primary scale-110"
                    : ""
                    }`}
                  title={color.label}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
