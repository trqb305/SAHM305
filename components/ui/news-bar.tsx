import { cn } from "@/lib/cn";

type NewsLevel = "calm" | "caution" | "danger";

interface NewsBarProps {
  level: NewsLevel;
  score: number;
  text: string;
  eventsCount?: number;
  className?: string;
}

const levelConfig: Record<NewsLevel, { label: string; tone: string; bar: string }> = {
  calm: {
    label: "هادئ",
    tone: "text-green",
    bar: "border-green/30 bg-[rgb(var(--green)/0.05)]",
  },
  caution: {
    label: "حذر",
    tone: "text-orange",
    bar: "border-orange/30 bg-[rgb(var(--orange)/0.05)]",
  },
  danger: {
    label: "خطر",
    tone: "text-red",
    bar: "border-red/40 bg-[rgb(var(--red)/0.06)]",
  },
};

export function NewsBar({ level, score, text, eventsCount, className }: NewsBarProps) {
  const cfg = levelConfig[level];
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 px-4 py-3 rounded-xl border bg-bg-card text-sm",
        cfg.bar,
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide flex-shrink-0",
          cfg.tone
        )}
        style={{ background: "rgb(var(--bg-elevated))" }}
      >
        <span className="pulse-dot" />
        {cfg.label}
      </span>
      <span className="num font-medium text-text-primary">{score} / 100</span>
      <span className="flex-1 truncate text-text-primary">{text}</span>
      {eventsCount !== undefined && (
        <span className="text-xs text-text-secondary flex-shrink-0">{eventsCount} أحداث</span>
      )}
    </div>
  );
}
