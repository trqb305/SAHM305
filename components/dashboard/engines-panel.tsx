import { Zap, ChevronDown, ChevronUp } from "lucide-react";
import { engines } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

const colorMap: Record<string, { ring: string; text: string; bg: string }> = {
  green: { ring: "rgb(var(--green))", text: "text-green", bg: "bg-[rgb(var(--green)/0.08)]" },
  gold: { ring: "rgb(var(--gold-bright))", text: "text-gold-bright", bg: "bg-[rgb(var(--gold)/0.08)]" },
  orange: { ring: "rgb(var(--orange))", text: "text-orange", bg: "bg-[rgb(var(--orange)/0.08)]" },
  red: { ring: "rgb(var(--red))", text: "text-red", bg: "bg-[rgb(var(--red)/0.08)]" },
};

function getLabel(score: number) {
  if (score >= 85) return "قوي جداً";
  if (score >= 70) return "إيجابي";
  if (score >= 55) return "محايد";
  if (score >= 40) return "ضعيف";
  return "سلبي";
}

export function EnginesPanel() {
  const totalScore = Math.round(engines.reduce((s, e) => s + e.score, 0) / engines.length);
  const bullishEngines = engines.filter((e) => e.score >= 70).length;
  const warningEngines = engines.filter((e) => e.score >= 40 && e.score < 70).length;
  const bearishEngines = engines.filter((e) => e.score < 40).length;

  return (
    <div className="card overflow-hidden mb-4">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm font-medium flex items-center gap-2.5">
          <Zap size={16} strokeWidth={1.5} className="text-gold-bright" />
          المحركات السبعة · محرك القرار المركب
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-green">
              <span className="w-2 h-2 rounded-full bg-green" />{bullishEngines} صاعد
            </span>
            <span className="flex items-center gap-1 text-orange">
              <span className="w-2 h-2 rounded-full bg-orange" />{warningEngines} تحذير
            </span>
            {bearishEngines > 0 && (
              <span className="flex items-center gap-1 text-red">
                <span className="w-2 h-2 rounded-full bg-red" />{bearishEngines} سلبي
              </span>
            )}
          </div>
          <div className="text-[11px] text-text-secondary num">آخر تشغيل: 09:14:32</div>
        </div>
      </div>

      {/* Composite Score Bar */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-4" style={{ background: "rgb(var(--bg-deepest))" }}>
        <div className="text-[11px] text-text-secondary whitespace-nowrap">النتيجة المركبة</div>
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden" dir="ltr">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${totalScore}%`,
              background: `linear-gradient(90deg, rgb(var(--gold)) 0%, ${totalScore >= 70 ? "rgb(var(--green))" : totalScore >= 50 ? "rgb(var(--gold-bright))" : "rgb(var(--red))"} 100%)`,
            }}
          />
        </div>
        <div className="num text-sm font-medium text-gold-bright whitespace-nowrap">{totalScore}/100</div>
      </div>

      {/* Engines Grid */}
      <div className="grid grid-cols-7 border-t border-border max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
        {engines.map((e) => {
          const c = colorMap[e.color] || colorMap.green;
          const circumference = 2 * Math.PI * 26;
          const offset = circumference * (1 - e.score / 100);
          const trackOpacity = 0.5 - (e.score / 100) * 0.2;

          return (
            <div
              key={e.id}
              className={cn(
                "px-3 py-4 border-l border-border last:border-l-0 text-center group cursor-pointer transition-colors",
                "max-lg:[&:nth-child(4n)]:border-l-0 max-md:[&:nth-child(3n)]:border-l-0 max-sm:[&:nth-child(2n)]:border-l-0",
                "hover:bg-bg-elevated"
              )}
            >
              <div className="num text-[9px] text-text-tertiary mb-1">/ 0{e.id}</div>
              <div className="text-[11px] text-text-secondary font-medium mb-2.5 leading-tight min-h-[28px] flex items-center justify-center">
                {e.name}
              </div>

              {/* Arc gauge */}
              <div className="relative w-[52px] h-[52px] mx-auto mb-2">
                <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
                  <circle cx="30" cy="30" r="26" fill="none" strokeWidth="4" stroke="rgb(var(--border))" />
                  <circle
                    cx="30" cy="30" r="26"
                    fill="none" strokeWidth="4" strokeLinecap="round"
                    stroke={c.ring}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <div className={cn("absolute inset-0 flex items-center justify-center num text-sm font-medium", c.text)}>
                  {e.score}
                </div>
              </div>

              <div className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded inline-block mb-1", c.bg, c.text)}>
                {e.status}
              </div>
              <div className="text-[9px] text-text-tertiary leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                {e.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Signal Consensus Footer */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between" style={{ background: "rgb(var(--bg-deepest))" }}>
        <div className="flex gap-2">
          {engines.map((e) => {
            const c = colorMap[e.color] || colorMap.green;
            return (
              <div key={e.id} title={`${e.name}: ${e.score}`} className="flex flex-col items-center gap-1">
                <div
                  className="w-1.5 rounded-full transition-all"
                  style={{
                    height: `${Math.max(8, e.score * 0.3)}px`,
                    background: c.ring,
                    opacity: 0.7 + (e.score / 100) * 0.3,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="text-[10px] text-text-tertiary">مرر فوق المحرك لرؤية التفاصيل</div>
      </div>
    </div>
  );
}
