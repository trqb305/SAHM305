import { ListChecks, Globe, Bell, ArrowUpDown } from "lucide-react";
import { shortlist, previousSession, todayEvents } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

const typeBadge: Record<string, string> = {
  متوسط: "bg-[rgb(var(--gold)/0.10)] text-gold-bright border border-[rgb(var(--gold)/0.2)]",
  مضاربة: "bg-[rgb(var(--orange)/0.10)] text-orange border border-[rgb(var(--orange)/0.2)]",
  قصير: "bg-[rgb(var(--blue)/0.10)] text-blue border border-[rgb(var(--blue)/0.2)]",
  طويل: "bg-[rgb(var(--green)/0.10)] text-green border border-[rgb(var(--green)/0.2)]",
};

const impactColor: Record<string, string> = {
  high: "bg-red",
  med: "bg-gold",
  low: "bg-blue",
};
const impactLabel: Record<string, string> = {
  high: "تأثير عالي",
  med: "تأثير متوسط",
  low: "تأثير منخفض",
};

function getRsiColor(rsi: number) {
  if (rsi >= 70) return "text-red";
  if (rsi <= 30) return "text-green";
  if (rsi >= 55) return "text-gold-bright";
  return "text-text-secondary";
}

export function ShortlistAndSessions() {
  return (
    <div className="grid grid-cols-[1.6fr_1fr] gap-4 mb-4 max-lg:grid-cols-1">
      {/* Shortlist */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="text-sm font-medium flex items-center gap-2.5">
            <ListChecks size={16} strokeWidth={1.5} className="text-gold-bright" />
            القائمة المختصرة
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[11px] text-text-secondary">8 من قطاع الطاقة</div>
            <div className="flex items-center gap-1 text-[10px] bg-[rgb(var(--green)/0.08)] border border-[rgb(var(--green)/0.2)] text-green px-2 py-0.5 rounded">
              <span className="w-1 h-1 rounded-full bg-green pulse-dot" />
              مباشر
            </div>
          </div>
        </div>
        <div className="px-4 py-2.5 border-b border-border">
          <input type="text" placeholder="ابحث برمز السهم أو الاسم..." className="input text-right" dir="rtl" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead>
              <tr style={{ background: "rgb(var(--bg-deepest))" }}>
                <Th>الرمز</Th>
                <Th>الشركة</Th>
                <Th>السعر</Th>
                <Th>التغيير</Th>
                <Th>RSI</Th>
                <Th>حجم</Th>
                <Th>VWAP</Th>
                <Th>النوع</Th>
              </tr>
            </thead>
            <tbody>
              {shortlist.map((row) => (
                <tr key={row.symbol} className="border-b border-border last:border-b-0 hover:bg-bg-elevated cursor-pointer transition-colors">
                  <td className="px-3.5 py-3">
                    <span className="num text-[13px] font-medium text-gold-bright">{row.symbol}</span>
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="font-medium text-sm">{row.name}</div>
                    <div className="text-[10px] text-text-tertiary">{row.sector}</div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="num text-sm">{row.price}</span>
                  </td>
                  <td className={cn("px-3.5 py-3 num font-medium", row.change >= 0 ? "text-green" : "text-red")}>
                    {row.change >= 0 ? "+" : ""}{row.change}%
                  </td>
                  <td className="px-3.5 py-3">
                    <span className={cn("num text-sm font-medium", getRsiColor(row.rsi))}>{row.rsi}</span>
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-[44px] h-[4px] bg-bg-deepest rounded-full overflow-hidden" dir="ltr">
                        <div
                          className={cn("h-full rounded-full", parseInt(row.vol) >= 100 ? "bg-green" : "bg-orange")}
                          style={{ width: `${Math.min(100, parseInt(row.vol) / 2)}%` }}
                        />
                      </div>
                      <span className={cn("num text-[11px]", parseInt(row.vol) >= 100 ? "text-green" : "text-orange")}>{row.vol}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className={cn("num font-medium text-sm", row.vwap === "↑" ? "text-green" : "text-red")}>{row.vwap}</span>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", typeBadge[row.type])}>{row.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sessions + Events */}
      <div className="space-y-4">
        {/* Previous Session */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2.5">
              <Globe size={16} strokeWidth={1.5} className="text-gold-bright" />
              جلسة الأمس · إغلاق التاسي
            </div>
            <div className="text-[10px] font-medium px-2 py-0.5 rounded bg-bg-elevated text-text-tertiary">مُغلقة</div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              <SessCell label="HIGH" value={previousSession.high} tone="up" />
              <SessCell label="LOW" value={previousSession.low} tone="down" />
              <SessCell label="OPEN" value={previousSession.open} />
              <SessCell label="CLOSE" value={previousSession.close} />
            </div>

            {/* S/R Visualizer */}
            <div className="relative h-3 bg-border rounded-full mx-1 mb-3">
              <div
                className="absolute top-0 bottom-0 rounded-full"
                style={{
                  left: `${((previousSession.support - previousSession.low - 20) / (previousSession.high - previousSession.low + 40)) * 100}%`,
                  right: `${100 - ((previousSession.resistance - previousSession.low - 20) / (previousSession.high - previousSession.low + 40)) * 100}%`,
                  background: "rgb(var(--blue)/0.2)",
                  border: "1px solid rgb(var(--blue)/0.3)",
                }}
              />
              {/* Close marker */}
              <div
                className="absolute top-0.5 bottom-0.5 w-1.5 bg-gold-bright rounded-full"
                style={{
                  left: `${((previousSession.close - previousSession.low - 20) / (previousSession.high - previousSession.low + 40)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              />
            </div>

            <div className="flex justify-between text-[11px] mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green" />
                <span>دعم: <span className="num font-medium">{previousSession.support}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-bright" />
                <span className="text-text-tertiary text-[10px]">إغلاق</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>مقاومة: <span className="num font-medium">{previousSession.resistance}</span></span>
                <span className="w-2 h-2 rounded-full bg-red" />
              </div>
            </div>

            {/* Volume vs avg */}
            <div className="p-2.5 bg-bg-deepest rounded-lg border border-border">
              <div className="flex justify-between text-[10px] text-text-secondary mb-1.5">
                <span>حجم الجلسة</span>
                <span className="num font-medium">{previousSession.volume}م · المتوسط 5ي: {previousSession.avgVolume5d}م</span>
              </div>
              <div className="h-[4px] bg-border rounded-full overflow-hidden" dir="ltr">
                <div
                  className={cn("h-full rounded-full", previousSession.volume > previousSession.avgVolume5d ? "bg-green" : "bg-orange")}
                  style={{ width: `${(previousSession.volume / previousSession.avgVolume5d) * 75}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2.5">
              <Bell size={16} strokeWidth={1.5} className="text-gold-bright" />
              أحداث اليوم
            </div>
            <div className="text-[11px] text-text-secondary">{todayEvents.length} أحداث</div>
          </div>
          <div>
            {todayEvents.map((ev, i) => (
              <div key={i} className={cn(
                "flex gap-3 px-5 py-3 border-b border-border last:border-b-0 items-start transition-colors hover:bg-bg-elevated",
                ev.impact === "high" && "bg-[rgb(var(--red)/0.02)]"
              )}>
                <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", impactColor[ev.impact])} />
                <div className="flex-1">
                  <div className="text-[13px]"><strong className="font-medium num">{ev.time}</strong> · {ev.title}</div>
                  <div className={cn("text-[10px] mt-0.5 num",
                    ev.impact === "high" ? "text-red" : ev.impact === "med" ? "text-orange" : "text-blue"
                  )}>{impactLabel[ev.impact]}</div>
                </div>
                {ev.impact === "high" && (
                  <span className="text-[9px] bg-[rgb(var(--red)/0.1)] text-red border border-[rgb(var(--red)/0.2)] px-1.5 py-0.5 rounded">
                    تأثير كبير
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SessCell({ label, value, tone }: { label: string; value: number; tone?: "up" | "down" }) {
  const cls = tone === "up" ? "text-green" : tone === "down" ? "text-red" : "";
  return (
    <div className="bg-bg-deepest p-2 rounded-md text-center border border-border">
      <div className="text-[9px] text-text-secondary font-medium mb-0.5 tracking-wide">{label}</div>
      <div className={cn("num text-xs font-medium", cls)}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-right text-[10px] font-medium text-text-secondary px-3.5 py-2.5 tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}
