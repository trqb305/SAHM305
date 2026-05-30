import { Lock, Ban, TrendingUp, Activity, Shield, ChevronRight } from "lucide-react";
import { opportunities, type StockOpportunity } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

const tierConfig = {
  best: {
    label: "الأفضل",
    bg: "bg-gold",
    text: "text-[rgb(var(--bg-deepest))]",
    border: "border-gold",
    glow: "shadow-[0_0_20px_rgb(var(--gold)/0.12)]",
    headerBg: "from-[rgb(var(--gold)/0.08)] to-transparent",
    icon: "⭐",
  },
  alt: {
    label: "البديل",
    bg: "bg-green",
    text: "text-[rgb(var(--bg-deepest))]",
    border: "border-[rgb(var(--green)/0.4)]",
    glow: "shadow-[0_0_20px_rgb(var(--green)/0.08)]",
    headerBg: "from-[rgb(var(--green)/0.06)] to-transparent",
    icon: "✦",
  },
  safe: {
    label: "المحافظ",
    bg: "bg-blue",
    text: "text-white",
    border: "border-[rgb(var(--blue)/0.4)]",
    glow: "shadow-[0_0_20px_rgb(var(--blue)/0.08)]",
    headerBg: "from-[rgb(var(--blue)/0.06)] to-transparent",
    icon: "🛡",
  },
} as const;

const warnConfig = {
  green: "bg-[rgb(var(--green)/0.10)] text-green border border-[rgb(var(--green)/0.2)]",
  amber: "bg-[rgb(var(--orange)/0.10)] text-orange border border-[rgb(var(--orange)/0.2)]",
  blue: "bg-[rgb(var(--blue)/0.10)] text-blue border border-[rgb(var(--blue)/0.2)]",
  red: "bg-[rgb(var(--red)/0.10)] text-red border border-[rgb(var(--red)/0.2)]",
};

export function StockCards() {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4 max-lg:grid-cols-1">
      {opportunities.map((s) => (
        <StockCard key={s.symbol} stock={s} />
      ))}
    </div>
  );
}

function StockCard({ stock }: { stock: StockOpportunity }) {
  const t = tierConfig[stock.tier];
  const volumeRatio = Math.round((stock.volume / stock.avgVolume) * 100);

  return (
    <div className={cn("card border relative overflow-hidden transition-all hover:scale-[1.005]", t.border, t.glow)}>
      {/* Header gradient */}
      <div className={cn("absolute top-0 left-0 right-0 h-16 bg-gradient-to-b", t.headerBg)} />

      {/* Tier badge */}
      <div className={cn("absolute top-3.5 left-3.5 px-2.5 py-1 rounded text-[10px] font-medium tracking-wide flex items-center gap-1", t.bg, t.text)}>
        {t.icon} {t.label}
      </div>

      {/* Frozen badge */}
      <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium bg-bg-deepest border border-border-soft text-text-tertiary tracking-wide">
        <Lock size={9} strokeWidth={1.5} /> {stock.frozenAt}
      </div>

      <div className="pt-12 px-5 pb-5 relative">
        {/* Symbol & Name */}
        <div className="flex items-baseline gap-2.5 mb-0.5">
          <span className="num text-lg font-medium text-gold-bright">{stock.symbol}</span>
          <span className="font-medium text-sm">{stock.name}</span>
          <span className="text-[10px] text-text-tertiary bg-bg-deepest px-2 py-0.5 rounded border border-border">{stock.sector}</span>
        </div>
        <div className="text-[11px] text-text-secondary mb-3 font-medium">{stock.strategy}</div>

        {/* Strength bar */}
        <div className="flex items-center gap-2.5 mb-3.5 p-2.5 bg-bg-deepest rounded-lg border border-border">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-text-secondary">قوة الإشارة</span>
              <span className="font-medium text-gold-bright num">{stock.strength}/100</span>
            </div>
            <div className="h-[5px] bg-border rounded-full overflow-hidden" dir="ltr">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${stock.strength}%`,
                  background: stock.strength >= 85 ? "linear-gradient(90deg, rgb(var(--gold)) 0%, rgb(var(--gold-bright)) 100%)" :
                    stock.strength >= 70 ? "rgb(var(--green))" : "rgb(var(--orange))",
                }}
              />
            </div>
          </div>
          <div className={cn("text-xs font-medium px-2 py-1 rounded num",
            stock.riskReward >= 3 ? "bg-[rgb(var(--green)/0.1)] text-green" : "bg-[rgb(var(--gold)/0.1)] text-gold-bright"
          )}>
            R:R {stock.riskReward}×
          </div>
        </div>

        {/* Bid/Mid/Ask */}
        <div className="grid grid-cols-3 gap-2 mb-3 p-2.5 bg-bg-deepest rounded-lg border border-border">
          <BACell label="BID" value={stock.bid} />
          <BACell label="دخول مقترح" value={stock.mid} highlight />
          <BACell label="ASK" value={stock.ask} />
        </div>

        {/* Targets */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {stock.targets.map((tg, i) => (
            <div key={i} className="text-center p-2 bg-[rgb(var(--green)/0.05)] border border-[rgb(var(--green)/0.2)] rounded-lg">
              <div className="text-[10px] font-medium text-green mb-0.5">T{i + 1}</div>
              <div className="num text-[13px] font-medium">{tg.price}</div>
              <div className="num text-[10px] text-green">+{tg.pct}%</div>
            </div>
          ))}
        </div>

        {/* Stop loss */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-[rgb(var(--red)/0.05)] border border-[rgb(var(--red)/0.2)] rounded-lg mb-3">
          <span className="text-[11px] font-medium text-red flex items-center gap-1.5">
            <Ban size={11} strokeWidth={1.5} /> وقف الخسارة
          </span>
          <span className="num font-medium text-red text-[13px]">
            {stock.stopLoss.price} <span className="text-[10px]">({stock.stopLoss.pct}%)</span>
          </span>
        </div>

        {/* Technical Indicators Row */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          <TechBadge label="RSI" value={stock.rsi} color={stock.rsi >= 70 ? "red" : stock.rsi <= 30 ? "green" : stock.rsi >= 55 ? "gold" : "blue"} />
          <TechBadge label="ADX" value={stock.adx} color={stock.adx >= 25 ? "green" : "orange"} />
          <TechBadge
            label="VWAP"
            value={stock.vwapRelation === "above" ? "↑" : "↓"}
            color={stock.vwapRelation === "above" ? "green" : "red"}
            isText
          />
          <TechBadge
            label="حجم"
            value={`${volumeRatio}%`}
            color={volumeRatio >= 120 ? "green" : volumeRatio >= 80 ? "gold" : "red"}
            isText
          />
        </div>

        {/* Technical Signals */}
        <div className="flex flex-wrap gap-1 mb-3">
          {stock.technicalSignals.map((sig, i) => (
            <span key={i} className="text-[9px] font-medium px-2 py-0.5 rounded bg-[rgb(var(--blue)/0.08)] border border-[rgb(var(--blue)/0.2)] text-blue">
              {sig}
            </span>
          ))}
        </div>

        {/* Position Size */}
        <div className="flex gap-1.5 mb-3">
          <div className="flex-1 text-center p-2 bg-bg-deepest rounded-lg border border-border">
            <div className="text-[9px] text-text-tertiary mb-0.5">حجم محافظ</div>
            <div className="text-[11px] font-medium text-text-secondary num">{stock.positionSize.conservative}%</div>
          </div>
          <div className="flex-1 text-center p-2 bg-bg-deepest rounded-lg border border-border">
            <div className="text-[9px] text-text-tertiary mb-0.5">حجم معتدل</div>
            <div className="text-[11px] font-medium text-gold-bright num">{stock.positionSize.moderate}%</div>
          </div>
          <div className="flex-1 text-center p-2 bg-bg-deepest rounded-lg border border-border">
            <div className="text-[9px] text-text-tertiary mb-0.5">ATR</div>
            <div className="text-[11px] font-medium text-text-secondary num">{stock.atr}</div>
          </div>
        </div>

        {/* Warnings */}
        <div className="flex flex-wrap gap-1.5">
          {stock.warnings.map((w, i) => (
            <span key={i} className={cn("text-[10px] font-medium px-2 py-0.5 rounded", warnConfig[w.type])}>
              {w.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BACell({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn("text-center", highlight && "bg-[rgb(var(--gold)/0.10)] rounded-lg p-1.5")}>
      <div className={cn("text-[10px] font-medium mb-0.5 tracking-wide", highlight ? "text-gold-bright" : "text-text-secondary")}>{label}</div>
      <div className={cn("num text-sm font-medium", highlight && "text-gold-bright")}>{value}</div>
    </div>
  );
}

function TechBadge({ label, value, color, isText }: { label: string; value: number | string; color: string; isText?: boolean }) {
  const colorMap: Record<string, string> = {
    green: "text-green bg-[rgb(var(--green)/0.08)] border-[rgb(var(--green)/0.2)]",
    red: "text-red bg-[rgb(var(--red)/0.08)] border-[rgb(var(--red)/0.2)]",
    gold: "text-gold-bright bg-[rgb(var(--gold)/0.08)] border-[rgb(var(--gold)/0.2)]",
    orange: "text-orange bg-[rgb(var(--orange)/0.08)] border-[rgb(var(--orange)/0.2)]",
    blue: "text-blue bg-[rgb(var(--blue)/0.08)] border-[rgb(var(--blue)/0.2)]",
  };
  return (
    <div className={cn("text-center p-1.5 rounded-lg border", colorMap[color])}>
      <div className="text-[9px] text-text-tertiary mb-0.5">{label}</div>
      <div className={cn("font-medium", isText ? "text-xs" : "num text-xs")}>{value}</div>
    </div>
  );
}
