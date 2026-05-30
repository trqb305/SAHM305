import { LayoutGrid, TrendingUp, TrendingDown } from "lucide-react";
import { sectors } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

function getMomentumColor(momentum: number) {
  if (momentum >= 80) return { bg: "bg-[rgb(var(--green)/0.9)]", text: "text-white", border: "border-[rgb(var(--green))]" };
  if (momentum >= 65) return { bg: "bg-[rgb(var(--green)/0.45)]", text: "text-green", border: "border-[rgb(var(--green)/0.4)]" };
  if (momentum >= 50) return { bg: "bg-[rgb(var(--gold)/0.2)]", text: "text-gold-bright", border: "border-[rgb(var(--gold)/0.4)]" };
  if (momentum >= 35) return { bg: "bg-[rgb(var(--orange)/0.15)]", text: "text-orange", border: "border-[rgb(var(--orange)/0.3)]" };
  return { bg: "bg-[rgb(var(--red)/0.3)]", text: "text-red", border: "border-[rgb(var(--red)/0.4)]" };
}

function getChangeTone(change: number) {
  if (change > 1.5) return "text-green";
  if (change > 0) return "text-green/70";
  if (change < -1) return "text-red";
  return "text-red/70";
}

export function SectorHeatmap() {
  const bullish = sectors.filter((s) => s.trend === "bullish");
  const bearish = sectors.filter((s) => s.trend === "bearish");
  const neutral = sectors.filter((s) => s.trend === "neutral");

  const totalLiquidity = sectors.reduce((sum, s) => sum + s.volume, 0);
  const leadingSector = sectors.reduce((a, b) => (a.momentum > b.momentum ? a : b));

  return (
    <div className="card overflow-hidden mb-4">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm font-medium flex items-center gap-2.5">
          <LayoutGrid size={16} strokeWidth={1.5} className="text-gold-bright" />
          خريطة حرارة القطاعات · تداول
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-green"><TrendingUp size={11} /> {bullish.length} قطاع صاعد</span>
          <span className="flex items-center gap-1.5 text-text-secondary">— {neutral.length} محايد</span>
          <span className="flex items-center gap-1.5 text-red"><TrendingDown size={11} /> {bearish.length} هابط</span>
          <span className="text-text-tertiary">القائد: <span className="text-gold-bright font-medium">{leadingSector.name}</span></span>
        </div>
      </div>

      {/* Treemap-style heatmap */}
      <div className="p-4">
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          {sectors
            .sort((a, b) => b.weight - a.weight)
            .map((sector) => {
              const c = getMomentumColor(sector.momentum);
              return (
                <div
                  key={sector.id}
                  className={cn("relative p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md", c.bg, c.border)}
                  style={{ minHeight: `${Math.max(80, sector.weight * 3.5)}px` }}
                >
                  <div className={cn("text-[11px] font-medium leading-tight mb-1", c.text)}>{sector.name}</div>
                  <div className={cn("num text-lg font-medium", getChangeTone(sector.change))}>
                    {sector.change >= 0 ? "+" : ""}{sector.change}%
                  </div>
                  <div className={cn("text-[9px] mt-1 opacity-80", c.text)}>
                    {sector.weight}% · {sector.stocks} سهم
                  </div>
                  {/* Volume bar */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="h-[3px] bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/50"
                        style={{ width: `${(sector.volume / totalLiquidity) * 100 * 3}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Sector summary bar */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-[10px] text-text-secondary mb-2">توزيع السيولة بين القطاعات (%)</div>
          <div className="flex rounded-full overflow-hidden h-2 gap-px">
            {sectors
              .sort((a, b) => b.volume - a.volume)
              .map((s) => (
                <div
                  key={s.id}
                  title={`${s.name}: ${((s.volume / totalLiquidity) * 100).toFixed(1)}%`}
                  style={{
                    width: `${(s.volume / totalLiquidity) * 100}%`,
                    background:
                      s.trend === "bullish" ? "rgb(var(--green))" :
                      s.trend === "bearish" ? "rgb(var(--red))" :
                      "rgb(var(--gold))",
                  }}
                />
              ))}
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-text-secondary">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green inline-block" /> صاعد</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gold inline-block" /> محايد</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red inline-block" /> هابط</span>
          </div>
        </div>
      </div>
    </div>
  );
}
