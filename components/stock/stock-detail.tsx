"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, TrendingDown, AlertTriangle, Target, ShieldOff, DollarSign, Clock } from "lucide-react";
import { TradingViewChart } from "./tradingview-chart";
import { getStockBySymbol, SIGNAL_CONFIG, TIER_CONFIG, RISK_CONFIG, type StockDef } from "@/lib/stocks-data";
import { cn } from "@/lib/cn";

const CAPITAL = 30000; // Default capital for calculator

const CHARTS: { label: string; arabicLabel: string; interval: string; studies: string[]; tip: string }[] = [
  {
    label: "15 دقيقة",
    arabicLabel: "📊 شارت 15 دقيقة — للدخول الدقيق",
    interval: "15",
    studies: ["RSI@tv-basicstudies", "Stochastic@tv-basicstudies"],
    tip: "الخطوط الزرقاء = متى يكون السهم رخيصاً للشراء أو غالياً للبيع",
  },
  {
    label: "ساعي",
    arabicLabel: "📈 شارت ساعي — للاتجاه العام",
    interval: "60",
    studies: ["MASimple@tv-basicstudies", "MACD@tv-basicstudies"],
    tip: "المتوسط المتحرك (الخط الملون) يخبرك هل السهم في صعود أم هبوط",
  },
  {
    label: "يومي",
    arabicLabel: "📅 شارت يومي — للصورة الكاملة",
    interval: "D",
    studies: ["BB@tv-basicstudies", "Volume@tv-basicstudies"],
    tip: "البولنجر باند (القناة الزرقاء) يخبرك متى السهم بعيد عن طبيعته",
  },
  {
    label: "أسبوعي",
    arabicLabel: "📆 شارت أسبوعي — للاستثمار",
    interval: "W",
    studies: ["MAExp@tv-basicstudies", "RSI@tv-basicstudies"],
    tip: "هذا الشارت للصبورين — يخبرك هل الاتجاه العام للسهم صاعد أم هابط",
  },
];

interface LiveData {
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  prevClose: number;
}

export function StockDetailPage({ symbol }: { symbol: string }) {
  const router = useRouter();
  const stock = getStockBySymbol(symbol);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [activeChart, setActiveChart] = useState(0);
  const [capital, setCapital] = useState(CAPITAL);

  useEffect(() => {
    // Fetch live price for this stock from the market API
    fetch("/api/market")
      .then((r) => r.json())
      .then((data) => {
        const found = data.stocks?.find((s: any) => s.symbol === symbol);
        if (found) {
          setLiveData({
            price:     found.price,
            change:    found.changeAbs,
            changePct: found.change,
            high:      found.high,
            low:       found.low,
            prevClose: found.prevClose,
          });
        }
      })
      .catch(() => {});
  }, [symbol]);

  if (!stock) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">السهم غير موجود في القائمة</p>
        <button onClick={() => router.back()} className="btn btn-primary mt-4">رجوع</button>
      </div>
    );
  }

  const price      = liveData?.price ?? 0;
  const changePct  = liveData?.changePct ?? 0;
  const high       = liveData?.high ?? 0;
  const low        = liveData?.low  ?? 0;

  // Compute dynamic signal based on live change (override static when market open)
  const dynamicSignal = ((): "دخول" | "انتظر" | "خروج" => {
    if (price === 0) return stock.lastSignal;
    if (changePct > 0.5 && changePct < 4) return "دخول";
    if (changePct >= 4) return "خروج";
    if (changePct < -2) return "خروج";
    return stock.lastSignal;
  })();

  const signal   = SIGNAL_CONFIG[dynamicSignal];
  const tier     = TIER_CONFIG[stock.tier];
  const risk     = RISK_CONFIG[stock.riskLevel];

  // Profit calculations
  const entryPrice   = price > 0 ? price : 50;
  const targetPrice  = parseFloat((entryPrice * (1 + stock.targetPct / 100)).toFixed(2));
  const stopPrice    = parseFloat((entryPrice * (1 - stock.stopPct / 100)).toFixed(2));
  const sharesCount  = Math.floor(capital / entryPrice);
  const profitAmount = Math.round(sharesCount * (targetPrice - entryPrice));
  const lossAmount   = Math.round(sharesCount * (entryPrice - stopPrice));
  const rrRatio      = (profitAmount / lossAmount).toFixed(1);

  return (
    <div className="max-w-[900px] mx-auto px-4 py-5 space-y-4">

      {/* ── Back + Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowRight size={16} />
          رجوع
        </button>
        <div className="w-px h-4 bg-border" />
        <span className="text-text-tertiary text-sm">{stock.sector}</span>
      </div>

      {/* ── Stock Title + Signal ── */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="num text-gold-bright font-medium text-lg">{stock.symbol}</span>
              <h1 className="text-xl font-medium">{stock.name}</h1>
            </div>
            <div className="flex items-center gap-3 text-[12px]">
              <span className={tier.color}>{tier.label}</span>
              <span className="text-text-tertiary">·</span>
              <span className={risk.color}>{risk.label}</span>
              <span className="text-text-tertiary">·</span>
              <span className="text-text-secondary">⏱ {stock.holdPeriod}</span>
            </div>
          </div>

          {/* BIG SIGNAL BADGE */}
          <div className={cn(
            "flex items-center gap-2.5 px-5 py-3 rounded-xl border text-lg font-medium",
            signal.bg, signal.border, signal.color
          )}>
            <span className="text-2xl">{signal.icon}</span>
            <div>
              <div className="text-lg font-medium">{signal.label}</div>
              <div className="text-[11px] font-normal opacity-80">{stock.signalReason}</div>
            </div>
          </div>
        </div>

        {/* Price row */}
        {price > 0 && (
          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <span className="num text-3xl font-medium">{price.toFixed(2)}</span>
            <span className="text-text-secondary text-sm">ريال</span>
            <span className={cn("num text-lg font-medium", changePct >= 0 ? "text-green" : "text-red")}>
              {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
            </span>
            <span className="text-text-tertiary text-sm">أعلى <span className="num">{high.toFixed(2)}</span> · أدنى <span className="num">{low.toFixed(2)}</span></span>
          </div>
        )}
      </div>

      {/* ── Profit Calculator ── */}
      <div className="card p-5 bg-[rgb(var(--gold)/0.04)] border-[rgb(var(--gold)/0.2)]">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-gold-bright" />
          <span className="text-sm font-medium">حاسبة الربح والخسارة</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-[12px] text-text-secondary whitespace-nowrap">رأس المال:</label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value) || CAPITAL)}
            className="input w-36 text-center num"
            step={5000}
            min={5000}
          />
          <span className="text-[12px] text-text-secondary">ريال</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CalcCell icon={<Target size={14} />} label="الهدف" price={targetPrice} pct={`+${stock.targetPct}%`} amount={`+${profitAmount.toLocaleString()} ر.س`} color="green" />
          <CalcCell icon={<ShieldOff size={14} />} label="وقف الخسارة" price={stopPrice} pct={`-${stock.stopPct}%`} amount={`-${lossAmount.toLocaleString()} ر.س`} color="red" />
          <div className="p-3 bg-bg-deepest rounded-xl border border-border text-center">
            <div className="text-[11px] text-text-secondary mb-1.5">نسبة الربح/الخسارة</div>
            <div className="text-2xl font-medium text-gold-bright num">{rrRatio}:1</div>
            <div className="text-[11px] text-text-tertiary mt-1">
              {sharesCount} سهم بـ {capital.toLocaleString()} ر.س
            </div>
          </div>
        </div>
        {stock.type === "speculation" && (
          <div className="mt-3 p-3 rounded-lg bg-[rgb(var(--blue)/0.06)] border border-[rgb(var(--blue)/0.2)] text-[12px] text-blue text-center">
            💡 لتحقيق 4,000 ريال في اليوم تحتاج {Math.ceil(4000 / profitAmount)} صفقة ناجحة مثل هذه
          </div>
        )}
      </div>

      {/* ── Trading Plan ── */}
      <div className="card p-5">
        <div className="text-sm font-medium mb-3 flex items-center gap-2">
          <Clock size={15} className="text-gold-bright" />
          خطة التداول — بالعربي البسيط
        </div>
        <div className="space-y-2 text-[13px]">
          <PlanRow icon="🎯" label="متى تدخل" text={stock.analysis.entryNote} />
          <PlanRow icon="🚪" label="متى تخرج" text={stock.analysis.exitNote} />
          <PlanRow icon="⚠️" label="انتبه لـ" text={stock.analysis.watchout} color="orange" />
        </div>
        <div className="mt-3 p-3 rounded-lg bg-bg-deepest border border-border text-[12px] text-text-secondary leading-relaxed">
          {stock.analysis.summary}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="card overflow-hidden">
        {/* Tab switcher */}
        <div className="flex border-b border-border overflow-x-auto" style={{ background: "rgb(var(--bg-deepest))" }}>
          {CHARTS.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveChart(i)}
              className={cn(
                "px-4 py-3 text-[12px] font-medium whitespace-nowrap border-b-2 transition-colors",
                activeChart === i
                  ? "border-gold-bright text-gold-bright"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Chart header */}
        <div className="px-4 py-2 border-b border-border flex items-start justify-between gap-2 bg-bg-card">
          <div className="text-[12px] font-medium">{CHARTS[activeChart].arabicLabel}</div>
          <div className="text-[11px] text-text-tertiary text-left max-w-[280px]">{CHARTS[activeChart].tip}</div>
        </div>

        {/* TradingView Chart */}
        <div className="p-3">
          <TradingViewChart
            key={`${symbol}-${activeChart}`}
            symbol={stock.symbol}
            interval={CHARTS[activeChart].interval}
            studies={CHARTS[activeChart].studies}
            height={380}
          />
        </div>

        {/* Mini chart guide */}
        <div className="px-4 py-3 border-t border-border" style={{ background: "rgb(var(--bg-deepest))" }}>
          <div className="flex flex-wrap gap-4 text-[11px] text-text-secondary">
            <span><span className="inline-block w-3 h-1 bg-green rounded mr-1 align-middle" />شمعة خضراء = يوم ارتفع</span>
            <span><span className="inline-block w-3 h-1 bg-red rounded mr-1 align-middle" />شمعة حمراء = يوم انخفض</span>
            <span>الخطوط الملونة = متوسطات حركة السهم</span>
          </div>
        </div>
      </div>

      {/* ── Simple Description ── */}
      <div className="card p-4">
        <div className="text-[12px] font-medium text-text-secondary mb-2">لماذا اخترنا هذا السهم؟</div>
        <div className="text-[13px] leading-relaxed">{stock.whyPick}</div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[11px] text-text-tertiary leading-relaxed pb-2">
        ⚠️ هذا التحليل للاسترشاد فقط وليس توصية استثمارية — القرار النهائي للمستثمر وحده
      </p>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function CalcCell({ icon, label, price, pct, amount, color }: {
  icon: React.ReactNode; label: string; price: number; pct: string; amount: string; color: "green" | "red";
}) {
  const cls = color === "green" ? "text-green bg-[rgb(var(--green)/0.06)] border-[rgb(var(--green)/0.2)]"
                                : "text-red bg-[rgb(var(--red)/0.06)] border-[rgb(var(--red)/0.2)]";
  return (
    <div className={cn("p-3 rounded-xl border text-center", cls)}>
      <div className={cn("flex items-center justify-center gap-1 text-[11px] mb-2 opacity-80")}>{icon} {label}</div>
      <div className="num text-lg font-medium">{price.toFixed(2)}</div>
      <div className="num text-[12px] mt-0.5">{pct}</div>
      <div className="text-[12px] font-medium mt-1">{amount}</div>
    </div>
  );
}

function PlanRow({ icon, label, text, color }: { icon: string; label: string; text: string; color?: string }) {
  return (
    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-bg-deepest border border-border">
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <div className={cn("text-[11px] font-medium mb-0.5", color === "orange" ? "text-orange" : "text-text-secondary")}>{label}</div>
        <div className="text-[13px] leading-relaxed">{text}</div>
      </div>
    </div>
  );
}
