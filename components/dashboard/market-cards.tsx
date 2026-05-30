import { TrendingUp, AlertTriangle, MoveHorizontal, Droplet, BarChart2, Users, Globe, ArrowUpDown } from "lucide-react";
import { marketSnapshot } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

export function MarketCards() {
  const m = marketSnapshot;
  const breadthPct = Math.round((m.marketWidth.up / (m.marketWidth.up + m.marketWidth.down + m.marketWidth.unchanged)) * 100);

  return (
    <div className="grid grid-cols-4 gap-3 mb-4 max-lg:grid-cols-2 max-md:grid-cols-1">
      {/* TASI */}
      <Card label="التاسي" sub="Tadawul All Share" icon={<TrendingUp size={11} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--gold)/0.10)] text-gold-bright">
        <Value>{m.tasi.value.toLocaleString()}</Value>
        <Meta tone="up">▲ +{m.tasi.change} (+{m.tasi.changePct}%)</Meta>
        <div className="mt-2 w-full h-[3px] bg-border rounded-full overflow-hidden" dir="ltr">
          <div className="h-full rounded-full bg-gold-bright" style={{ width: `${Math.min(100, ((m.tasi.value - m.tasi.prevClose) / m.tasi.prevClose) * 100 * 40 + 50)}%` }} />
        </div>
      </Card>

      {/* نوموا */}
      <Card label="نوموا" sub="السوق الموازي" icon={<BarChart2 size={11} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--purple)/0.10)] text-purple">
        <Value>{m.nomu.value.toLocaleString()}</Value>
        <Meta tone="up">▲ +{m.nomu.change} (+{m.nomu.changePct}%)</Meta>
      </Card>

      {/* سيولة السوق */}
      <Card label="سيولة السوق" sub={`مقابل متوسط 30 يوم`} icon={<Droplet size={11} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--blue)/0.10)] text-blue">
        <Value><span className="text-gold-bright">{m.liquidity.value}</span><span className="text-sm text-text-secondary mr-1">م.ر.س</span></Value>
        <Meta tone="up">▲ +{m.liquidity.vsAvg}% من المتوسط</Meta>
        <div className="mt-2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn("flex-1 h-[4px] rounded-sm", i < Math.round(m.liquidity.vsAvg / 20 + 3) ? "bg-blue" : "bg-border")} />
          ))}
        </div>
      </Card>

      {/* اتساع السوق */}
      <Card label="اتساع السوق" sub={`${m.marketWidth.up} صاعد · ${m.marketWidth.down} هابط`} icon={<ArrowUpDown size={11} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--green)/0.10)] text-green">
        <div className="flex items-baseline gap-1.5">
          <span className="num text-[22px] font-medium text-green">{breadthPct}%</span>
          <span className="text-xs text-text-secondary">صاعدة</span>
        </div>
        <div className="mt-2 flex rounded-full overflow-hidden h-[5px] gap-px">
          <div className="bg-green rounded-l-full" style={{ width: `${(m.marketWidth.up / (m.marketWidth.up + m.marketWidth.down + m.marketWidth.unchanged)) * 100}%` }} />
          <div className="bg-border" style={{ width: `${(m.marketWidth.unchanged / (m.marketWidth.up + m.marketWidth.down + m.marketWidth.unchanged)) * 100}%` }} />
          <div className="bg-red rounded-r-full" style={{ width: `${(m.marketWidth.down / (m.marketWidth.up + m.marketWidth.down + m.marketWidth.unchanged)) * 100}%` }} />
        </div>
      </Card>

      {/* النفط */}
      <Card label="النفط (برنت)" sub="Brent Crude Oil" icon={<Droplet size={11} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--orange)/0.10)] text-orange">
        <Value>{m.oil.value}$</Value>
        <Meta tone="up">▲ +{m.oil.changePct}% · داعم قطاع الطاقة</Meta>
      </Card>

      {/* VIX السعودي */}
      <Card label="مؤشر الخوف" sub="Saudi VIX" icon={<AlertTriangle size={11} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--red)/0.10)] text-red">
        <Value>{m.vix.value}</Value>
        <Meta tone="down">{m.vix.changePct}% · مستوى الخوف منخفض</Meta>
      </Card>

      {/* تدفق الأجانب */}
      <Card label="صافي الأجانب" sub="تدفق مؤسسي اليوم" icon={<Globe size={11} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--green)/0.10)] text-green">
        <div className="flex items-baseline gap-1.5">
          <span className="num text-[22px] font-medium text-green">+{m.foreignFlow.value}</span>
          <span className="text-xs text-text-secondary">م.ر.س</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green pulse-dot" />
          <span className="text-[11px] text-green">صافي شراء مؤسسي</span>
        </div>
      </Card>

      {/* المدى المتوقع */}
      <Card label="المدى المتوقع اليوم" sub={`${m.expectedMove.low} — ${m.expectedMove.high}`} icon={<MoveHorizontal size={11} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--blue)/0.10)] text-blue">
        <Value>±{m.expectedMove.value}</Value>
        <div className="mt-2 relative h-[5px] bg-border rounded-full">
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gold-bright rounded-full" />
          <div className="h-full rounded-full bg-[rgb(var(--blue)/0.25)] border-x-2 border-blue" style={{ marginLeft: "15%", marginRight: "15%" }} />
        </div>
      </Card>
    </div>
  );
}

function Card({ label, sub, icon, iconBg, children }: { label: string; sub?: string; icon: React.ReactNode; iconBg: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <div className="text-[11px] text-text-secondary font-medium tracking-wide leading-tight">{label}</div>
          {sub && <div className="text-[9px] text-text-tertiary mt-0.5">{sub}</div>}
        </div>
        <div className={`w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
      </div>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <div className="num text-[22px] font-medium leading-tight">{children}</div>;
}

function Meta({ tone, children }: { tone: "up" | "down"; children: React.ReactNode }) {
  const cls = tone === "up" ? "text-green" : "text-red";
  return <div className={`text-[11px] mt-1 num ${cls}`}>{children}</div>;
}
