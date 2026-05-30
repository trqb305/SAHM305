import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { marketBreadth as mb } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

export function MarketBreadthPanel() {
  const adRatio = mb.advancing / (mb.advancing + mb.declining);
  const totalStocks = mb.advancing + mb.declining + mb.unchanged;
  const breadthSignal =
    mb.mcclellanOscillator > 50 ? { label: "صاعد قوي", color: "text-green", bg: "bg-[rgb(var(--green)/0.08)] border-[rgb(var(--green)/0.2)]" } :
    mb.mcclellanOscillator > 0 ? { label: "صاعد معتدل", color: "text-green", bg: "bg-[rgb(var(--green)/0.05)] border-[rgb(var(--green)/0.15)]" } :
    mb.mcclellanOscillator > -50 ? { label: "هابط معتدل", color: "text-orange", bg: "bg-[rgb(var(--orange)/0.08)] border-[rgb(var(--orange)/0.2)]" } :
    { label: "هابط قوي", color: "text-red", bg: "bg-[rgb(var(--red)/0.08)] border-[rgb(var(--red)/0.2)]" };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2.5">
          <Activity size={16} strokeWidth={1.5} className="text-blue" />
          اتساع السوق والزخم
        </div>
        <div className={cn("text-[11px] font-medium px-2.5 py-1 rounded-lg border", breadthSignal.bg, breadthSignal.color)}>
          {breadthSignal.label}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* A/D Line */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-text-secondary font-medium">خط التراكم/التوزيع (A/D)</span>
            <span className="num text-[11px] text-gold-bright">{(adRatio * 100).toFixed(1)}% صاعد</span>
          </div>
          <div className="relative flex rounded-full overflow-hidden h-3">
            <div className="bg-green flex items-center justify-center" style={{ width: `${adRatio * 100}%` }}>
              {adRatio > 0.4 && <span className="text-[8px] text-white font-medium">{mb.advancing}</span>}
            </div>
            <div className="bg-border" style={{ width: `${(mb.unchanged / totalStocks) * 100}%` }} />
            <div className="bg-red flex items-center justify-center" style={{ flex: 1 }}>
              {(1 - adRatio) > 0.2 && <span className="text-[8px] text-white font-medium">{mb.declining}</span>}
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-text-tertiary mt-1">
            <span className="text-green">↑ {mb.advancing} صاعد</span>
            <span>— {mb.unchanged} ثابت</span>
            <span className="text-red">↓ {mb.declining} هابط</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <BreadthCell label="قمم 52 أسبوع" value={mb.newHighs52w} sub="سهم جديد" tone="green" icon={<TrendingUp size={10} />} />
          <BreadthCell label="قيعان 52 أسبوع" value={mb.newLows52w} sub="سهم جديد" tone="red" icon={<TrendingDown size={10} />} />
          <BreadthCell label="فوق EMA20" value={mb.aboveEma20} sub="% من الأسهم" tone={mb.aboveEma20 > 60 ? "green" : "orange"} />
          <BreadthCell label="فوق EMA50" value={mb.aboveEma50} sub="% من الأسهم" tone={mb.aboveEma50 > 60 ? "green" : "orange"} />
        </div>

        {/* McClellan + ARM */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-bg-deepest rounded-xl border border-border">
            <div className="text-[10px] text-text-secondary mb-1">مذبذب McClellan</div>
            <div className={cn("num text-xl font-medium", mb.mcclellanOscillator >= 0 ? "text-green" : "text-red")}>
              {mb.mcclellanOscillator >= 0 ? "+" : ""}{mb.mcclellanOscillator}
            </div>
            <div className="mt-1.5 h-[4px] bg-border rounded-full relative" dir="ltr">
              <div className="absolute top-0 left-1/2 w-px h-full bg-border-strong" />
              <div
                className={cn("absolute top-0 h-full rounded-full", mb.mcclellanOscillator >= 0 ? "bg-green left-1/2" : "bg-red right-1/2")}
                style={{ width: `${Math.min(50, Math.abs(mb.mcclellanOscillator))}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-bg-deepest rounded-xl border border-border">
            <div className="text-[10px] text-text-secondary mb-1">ARMS Index (TRIN)</div>
            <div className={cn("num text-xl font-medium", mb.armIndex < 1 ? "text-green" : "text-red")}>
              {mb.armIndex.toFixed(2)}
            </div>
            <div className={cn("text-[10px] font-medium mt-1", mb.armIndex < 0.8 ? "text-green" : mb.armIndex > 1.2 ? "text-red" : "text-gold-bright")}>
              {mb.armIndex < 0.8 ? "ضغط شراء قوي" : mb.armIndex > 1.2 ? "ضغط بيع قوي" : "متوازن"}
            </div>
          </div>
        </div>

        {/* Volume Distribution */}
        <div>
          <div className="text-[10px] text-text-secondary mb-1.5">توزيع الحجم · {mb.upVolumePct}% في الأسهم الصاعدة</div>
          <div className="flex rounded-full overflow-hidden h-2">
            <div className="bg-green" style={{ width: `${mb.upVolumePct}%` }} />
            <div className="bg-red" style={{ width: `${100 - mb.upVolumePct}%` }} />
          </div>
        </div>

        {/* Above EMA200 */}
        <div className="p-3 bg-bg-deepest rounded-xl border border-border">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-text-secondary">الأسهم فوق EMA200</span>
            <span className={cn("num text-sm font-medium", mb.aboveEma200 >= 60 ? "text-green" : "text-orange")}>
              {mb.aboveEma200}%
            </span>
          </div>
          <div className="mt-2 h-[5px] bg-border rounded-full overflow-hidden" dir="ltr">
            <div
              className={cn("h-full rounded-full", mb.aboveEma200 >= 60 ? "bg-green" : "bg-orange")}
              style={{ width: `${mb.aboveEma200}%` }}
            />
          </div>
          <div className="text-[10px] text-text-tertiary mt-1">المتوسط الهيكلي طويل الأمد · {mb.aboveEma200 >= 60 ? "صحة سوق جيدة" : "تحذير هيكلي"}</div>
        </div>
      </div>
    </div>
  );
}

function BreadthCell({
  label, value, sub, tone, icon
}: {
  label: string; value: number; sub: string; tone: "green" | "red" | "orange"; icon?: React.ReactNode;
}) {
  const colorMap = { green: "text-green", red: "text-red", orange: "text-orange" };
  return (
    <div className="p-3 bg-bg-deepest rounded-xl border border-border">
      <div className="text-[10px] text-text-secondary mb-1 flex items-center gap-1">{icon} {label}</div>
      <div className={cn("num text-xl font-medium", colorMap[tone])}>{value}</div>
      <div className="text-[10px] text-text-tertiary mt-0.5">{sub}</div>
    </div>
  );
}
