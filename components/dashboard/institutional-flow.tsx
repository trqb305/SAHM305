import { Users, ArrowRightLeft, Building2 } from "lucide-react";
import { institutionalFlow as flow } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

export function InstitutionalFlow() {
  const totalActivity = Math.abs(flow.foreignNet) + Math.abs(flow.institutionalNet) + Math.abs(flow.retailNet);
  const foreignPct = Math.abs(flow.foreignNet) / totalActivity * 100;
  const instPct = Math.abs(flow.institutionalNet) / totalActivity * 100;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2.5">
          <Building2 size={16} strokeWidth={1.5} className="text-gold-bright" />
          تدفق المؤسسيين والأجانب
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-green pulse-dot" />
          <span className="text-green font-medium">تراكم</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Smart Money Score */}
        <div className="p-3 bg-bg-deepest rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] text-text-secondary font-medium">نقاط المال الذكي</div>
            <div className={cn("text-xs font-medium px-2 py-0.5 rounded", flow.smartMoneyScore >= 65 ? "bg-[rgb(var(--green)/0.1)] text-green" : "bg-[rgb(var(--orange)/0.1)] text-orange")}>
              {flow.accDistSignal}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="num text-3xl font-medium text-gold-bright">{flow.smartMoneyScore}</span>
            <span className="text-text-secondary text-sm">/100</span>
          </div>
          <div className="mt-2 h-[6px] bg-border rounded-full overflow-hidden" dir="ltr">
            <div
              className="h-full rounded-full"
              style={{
                width: `${flow.smartMoneyScore}%`,
                background: "linear-gradient(90deg, rgb(var(--gold)) 0%, rgb(var(--gold-bright)) 100%)",
              }}
            />
          </div>
        </div>

        {/* Flow Grid */}
        <div className="grid grid-cols-3 gap-2">
          <FlowCell
            label="الأجانب"
            buy={flow.foreignBuy}
            sell={flow.foreignSell}
            net={flow.foreignNet}
          />
          <FlowCell
            label="المؤسسيون"
            buy={flow.institutionalBuy}
            sell={flow.institutionalSell}
            net={flow.institutionalNet}
          />
          <FlowCell
            label="الأفراد"
            buy={Math.abs(flow.retailNet) * 0.6}
            sell={Math.abs(flow.retailNet) * 1.6}
            net={flow.retailNet}
          />
        </div>

        {/* Net flow bar */}
        <div>
          <div className="flex justify-between text-[10px] text-text-secondary mb-1.5">
            <span>الأجانب</span><span>مؤسسيون</span><span>أفراد</span>
          </div>
          <div className="flex rounded-full overflow-hidden h-2.5 gap-px bg-border">
            <div className="bg-green rounded-l-full" style={{ width: `${foreignPct}%` }} />
            <div className="bg-blue" style={{ width: `${instPct}%` }} />
            <div className="bg-red rounded-r-full" style={{ flex: 1 }} />
          </div>
        </div>

        {/* Block Trades */}
        <div>
          <div className="text-[11px] font-medium text-text-secondary mb-2 flex items-center gap-2">
            <ArrowRightLeft size={11} /> صفقات الكبار (Block Trades)
          </div>
          <div className="space-y-1.5">
            {flow.blockTrades.map((trade, i) => (
              <div key={i} className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg border text-[11px]",
                trade.type === "شراء"
                  ? "bg-[rgb(var(--green)/0.05)] border-[rgb(var(--green)/0.2)]"
                  : "bg-[rgb(var(--red)/0.05)] border-[rgb(var(--red)/0.2)]"
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn("w-1.5 h-1.5 rounded-full", trade.type === "شراء" ? "bg-green" : "bg-red")} />
                  <span className="num font-medium text-gold-bright">{trade.symbol}</span>
                  <span className="text-text-secondary">{trade.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="num text-text-secondary">{trade.value}م</span>
                  <span className={cn("font-medium px-2 py-0.5 rounded text-[10px]",
                    trade.type === "شراء" ? "bg-[rgb(var(--green)/0.1)] text-green" : "bg-[rgb(var(--red)/0.1)] text-red"
                  )}>{trade.type}</span>
                  <span className="num text-text-tertiary">{trade.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowCell({ label, buy, sell, net }: { label: string; buy: number; sell: number; net: number }) {
  const isPositive = net >= 0;
  return (
    <div className="p-2.5 bg-bg-deepest rounded-xl border border-border">
      <div className="text-[10px] text-text-secondary mb-2 font-medium text-center">{label}</div>
      <div className="space-y-1 mb-2">
        <div className="flex justify-between text-[10px]">
          <span className="text-green">شراء</span>
          <span className="num text-green">{buy.toFixed(0)}م</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-red">بيع</span>
          <span className="num text-red">{sell.toFixed(0)}م</span>
        </div>
      </div>
      <div className={cn(
        "text-center text-xs font-medium py-1 rounded num",
        isPositive ? "bg-[rgb(var(--green)/0.1)] text-green" : "bg-[rgb(var(--red)/0.1)] text-red"
      )}>
        {isPositive ? "+" : ""}{net}م
      </div>
    </div>
  );
}
