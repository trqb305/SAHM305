"use client";

import { useState } from "react";
import { Activity, BarChart3, Layers, Target, TrendingUp } from "lucide-react";
import { technicalIndicators as ti } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

type Tab = "oscillators" | "moving" | "pivots" | "fibonacci" | "ichimoku";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "oscillators", label: "المذبذبات", icon: <Activity size={12} strokeWidth={1.5} /> },
  { id: "moving", label: "المتوسطات", icon: <TrendingUp size={12} strokeWidth={1.5} /> },
  { id: "pivots", label: "محاور S/R", icon: <Layers size={12} strokeWidth={1.5} /> },
  { id: "fibonacci", label: "فيبوناتشي", icon: <Target size={12} strokeWidth={1.5} /> },
  { id: "ichimoku", label: "إيشيموكو", icon: <BarChart3 size={12} strokeWidth={1.5} /> },
];

export function TechnicalPanel() {
  const [active, setActive] = useState<Tab>("oscillators");

  return (
    <div className="card overflow-hidden mb-4">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="text-sm font-medium flex items-center gap-2.5">
          <Activity size={16} strokeWidth={1.5} className="text-blue" />
          المحللات التقنية المتقدمة · تاسي
        </div>
        <div className="text-[11px] text-text-secondary num">آخر تحديث: 09:14:32 ·
          <span className="text-green mr-1">● مباشر</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto" style={{ background: "rgb(var(--bg-deepest))" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 transition-colors",
              active === t.id
                ? "border-gold-bright text-gold-bright"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {active === "oscillators" && <OscillatorsTab />}
        {active === "moving" && <MovingAveragesTab />}
        {active === "pivots" && <PivotsTab />}
        {active === "fibonacci" && <FibonacciTab />}
        {active === "ichimoku" && <IchimokuTab />}
      </div>
    </div>
  );
}

// ─── RSI gauge ────────────────────────────────────────────────
function RsiGauge({ value, label }: { value: number; label: string }) {
  const zone =
    value >= 70 ? { color: "text-red bg-[rgb(var(--red)/0.08)] border-[rgb(var(--red)/0.2)]", label: "تشبع شراء" } :
    value <= 30 ? { color: "text-green bg-[rgb(var(--green)/0.08)] border-[rgb(var(--green)/0.2)]", label: "تشبع بيع" } :
    value >= 60 ? { color: "text-gold-bright bg-[rgb(var(--gold)/0.08)] border-[rgb(var(--gold)/0.2)]", label: "صاعد" } :
    { color: "text-blue bg-[rgb(var(--blue)/0.08)] border-[rgb(var(--blue)/0.2)]", label: "محايد" };

  const pct = value;
  return (
    <div className={cn("p-3 rounded-xl border", zone.color)}>
      <div className="text-[10px] font-medium mb-1.5 text-text-secondary">{label}</div>
      <div className="num text-2xl font-medium mb-1.5">{value}</div>
      <div className="relative h-[6px] bg-border rounded-full overflow-hidden mb-1.5" dir="ltr">
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: value >= 70 ? "rgb(var(--red))" : value <= 30 ? "rgb(var(--green))" : "rgb(var(--gold-bright))",
          }}
        />
        <div className="absolute top-0 h-full w-px bg-orange opacity-60" style={{ left: "70%" }} />
        <div className="absolute top-0 h-full w-px bg-green opacity-60" style={{ left: "30%" }} />
      </div>
      <div className="text-[10px] font-medium">{zone.label}</div>
    </div>
  );
}

// ─── Oscillators ──────────────────────────────────────────────
function OscillatorsTab() {
  const { rsi, rsi7, macd, stochastic, adx, cci, williamsR, atr, bollingerBands, vwap, obv } = ti;

  return (
    <div className="space-y-4">
      {/* RSI Row */}
      <div>
        <SectionTitle>RSI — مؤشر القوة النسبية</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <RsiGauge value={rsi.value} label="RSI(14) · المعياري" />
          <RsiGauge value={rsi7.value} label="RSI(7) · المضاربة" />
        </div>
      </div>

      {/* MACD */}
      <div>
        <SectionTitle>MACD — تقارب وتباعد المتوسطات</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          <IndicatorCell label="MACD" value={macd.value} color="green" note="خط MACD" />
          <IndicatorCell label="Signal" value={macd.signal} color="gold" note="خط الإشارة" />
          <IndicatorCell label="Hist" value={macd.histogram} color={macd.histogram >= 0 ? "green" : "red"} note={macd.histogram >= 0 ? "↑ تسارع" : "↓ تراجع"} />
        </div>
        <div className="mt-2 p-2.5 rounded-lg bg-[rgb(var(--green)/0.06)] border border-[rgb(var(--green)/0.2)] text-[11px] text-green font-medium">
          ✓ MACD فوق خط الإشارة · هيستوجرام إيجابي ومتوسع — زخم صاعد قوي
        </div>
      </div>

      {/* Stochastic + ADX */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SectionTitle>Stochastic(14,3,3)</SectionTitle>
          <div className="p-3 bg-bg-deepest rounded-xl border border-border">
            <div className="flex justify-between mb-2">
              <span className="text-[11px] text-text-secondary">%K</span>
              <span className="num text-sm font-medium text-gold-bright">{stochastic.k}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-[11px] text-text-secondary">%D</span>
              <span className="num text-sm font-medium text-text-primary">{stochastic.d}</span>
            </div>
            <div className="relative h-[6px] bg-border rounded-full" dir="ltr">
              <div className="h-full rounded-full bg-gold-bright" style={{ width: `${stochastic.k}%` }} />
            </div>
            <div className="text-[10px] text-text-secondary mt-1.5 text-center">{stochastic.signal}</div>
          </div>
        </div>

        <div>
          <SectionTitle>ADX — قوة الاتجاه</SectionTitle>
          <div className="p-3 bg-bg-deepest rounded-xl border border-border">
            <div className="flex justify-between mb-2">
              <span className="text-[11px] text-text-secondary">ADX</span>
              <span className={cn("num text-sm font-medium", ti.adx.value >= 25 ? "text-green" : "text-orange")}>{ti.adx.value}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-green">+DI</span>
              <span className="num text-sm font-medium text-green">{ti.adx.diPlus}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[11px] text-red">-DI</span>
              <span className="num text-sm font-medium text-red">{ti.adx.diMinus}</span>
            </div>
            <div className={cn("text-[10px] font-medium text-center px-2 py-1 rounded", ti.adx.value >= 25 ? "bg-[rgb(var(--green)/0.1)] text-green" : "bg-[rgb(var(--orange)/0.1)] text-orange")}>
              اتجاه {ti.adx.trend}
            </div>
          </div>
        </div>
      </div>

      {/* ATR + OBV + BB */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-bg-deepest rounded-xl border border-border">
          <div className="text-[10px] text-text-secondary mb-1">ATR(14)</div>
          <div className="num text-lg font-medium">{atr.value}</div>
          <div className="text-[10px] text-text-secondary mt-1">{atr.atrPct}% · {atr.volatility}</div>
        </div>
        <div className="p-3 bg-bg-deepest rounded-xl border border-border">
          <div className="text-[10px] text-text-secondary mb-1">OBV · الحجم-الزخم</div>
          <div className={cn("text-lg font-medium", obv.trend === "صاعد" ? "text-green" : "text-red")}>{obv.trend}</div>
          <div className="text-[10px] text-text-secondary mt-1">{obv.divergence ? "⚠ تباعد سلبي" : "✓ لا تباعد"}</div>
        </div>
        <div className="p-3 bg-bg-deepest rounded-xl border border-border">
          <div className="text-[10px] text-text-secondary mb-1">VWAP</div>
          <div className="num text-lg font-medium text-gold-bright">{vwap.value.toLocaleString()}</div>
          <div className={cn("text-[10px] font-medium mt-1", vwap.priceRelation === "above" ? "text-green" : "text-red")}>
            {vwap.priceRelation === "above" ? "↑ فوق VWAP · إيجابي" : "↓ تحت VWAP · سلبي"}
          </div>
        </div>
      </div>

      {/* Bollinger Bands */}
      <div>
        <SectionTitle>بولنجر باندز (20,2)</SectionTitle>
        <div className="p-3 bg-bg-deepest rounded-xl border border-border">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="text-[9px] text-red mb-1">الحد العلوي</div>
              <div className="num text-sm font-medium">{bollingerBands.upper.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gold-bright mb-1">الوسطى (SMA20)</div>
              <div className="num text-sm font-medium text-gold-bright">{bollingerBands.middle.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-green mb-1">الحد السفلي</div>
              <div className="num text-sm font-medium">{bollingerBands.lower.toLocaleString()}</div>
            </div>
          </div>
          <div className="relative h-3 bg-border rounded-full mx-2" dir="ltr">
            <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(90deg, rgb(var(--green)/0.2), rgb(var(--gold)/0.2), rgb(var(--red)/0.2))" }} />
            <div
              className="absolute top-0.5 bottom-0.5 w-2 bg-white rounded-full shadow"
              style={{
                left: `${((11847 - bollingerBands.lower) / (bollingerBands.upper - bollingerBands.lower)) * 100}%`,
                transform: "translateX(-50%)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] text-text-tertiary">
            <span>عرض النطاق: {bollingerBands.bandwidth}%</span>
            <span>{bollingerBands.squeeze ? "⚡ ضغط — اختراق قريب" : "نطاق طبيعي"}</span>
          </div>
        </div>
      </div>

      {/* CCI + Williams */}
      <div className="grid grid-cols-2 gap-3">
        <IndicatorBox label="CCI · مؤشر القناة" value={cci.value} note={cci.signal} color={cci.value > 100 ? "orange" : cci.value < -100 ? "green" : "blue"} />
        <IndicatorBox label="Williams %R" value={williamsR.value} note={williamsR.signal} color={williamsR.value > -20 ? "red" : williamsR.value < -80 ? "green" : "blue"} />
      </div>
    </div>
  );
}

// ─── Moving Averages ──────────────────────────────────────────
function MovingAveragesTab() {
  const { movingAverages: ma } = ti;
  const maData = [
    { label: "EMA 9", value: ma.ema9.value, signal: ma.ema9.signal, period: "قصير جداً" },
    { label: "EMA 20", value: ma.ema20.value, signal: ma.ema20.signal, period: "قصير" },
    { label: "EMA 50", value: ma.ema50.value, signal: ma.ema50.signal, period: "متوسط" },
    { label: "EMA 200", value: ma.ema200.value, signal: ma.ema200.signal, period: "طويل" },
    { label: "SMA 50", value: ma.sma50.value, signal: ma.sma50.signal, period: "متوسط بسيط" },
    { label: "SMA 200", value: ma.sma200.value, signal: ma.sma200.signal, period: "طويل بسيط" },
  ];

  const bullCount = maData.filter((m) => m.signal === "above").length;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-[rgb(var(--green)/0.06)] border border-[rgb(var(--green)/0.2)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-green">التاسي فوق {bullCount}/{maData.length} متوسطات</div>
            <div className="text-[11px] text-text-secondary mt-0.5">الاتجاه العام صاعد · الزخم الهيكلي إيجابي</div>
          </div>
          <div className="num text-2xl font-medium text-green">{Math.round((bullCount / maData.length) * 100)}%</div>
        </div>
        <div className="mt-3 flex gap-1">
          {maData.map((m, i) => (
            <div key={i} className={cn("flex-1 h-1.5 rounded-full", m.signal === "above" ? "bg-green" : "bg-red")} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {maData.map((m) => (
          <div key={m.label} className="flex items-center justify-between p-3 bg-bg-deepest rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", m.signal === "above" ? "bg-green" : "bg-red")} />
              <div>
                <div className="text-sm font-medium">{m.label}</div>
                <div className="text-[10px] text-text-tertiary">{m.period}</div>
              </div>
            </div>
            <div className="text-left">
              <div className="num text-sm font-medium">{m.value.toLocaleString()}</div>
              <div className={cn("text-[10px] font-medium", m.signal === "above" ? "text-green" : "text-red")}>
                {m.signal === "above" ? "↑ السعر فوق" : "↓ السعر تحت"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-[rgb(var(--gold)/0.06)] border border-[rgb(var(--gold)/0.2)] text-[11px] text-gold-bright">
        ✦ الخط الذهبي: EMA20 فوق EMA50 فوق EMA200 — تراص صاعد كامل · أفضل بيئة للشراء
      </div>
    </div>
  );
}

// ─── Pivot Points ─────────────────────────────────────────────
function PivotsTab() {
  const { pivotPoints: pp } = ti;
  const currentPrice = 11847;

  const levels = [
    { label: "R3", value: pp.r3, type: "resistance" },
    { label: "R2", value: pp.r2, type: "resistance" },
    { label: "R1", value: pp.r1, type: "resistance" },
    { label: "Pivot", value: pp.pivot, type: "pivot" },
    { label: "S1", value: pp.s1, type: "support" },
    { label: "S2", value: pp.s2, type: "support" },
    { label: "S3", value: pp.s3, type: "support" },
  ];

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-bg-deepest border border-border text-[11px] text-text-secondary">
        نقاط المحور اليومية (Camarilla/Classic) — مستويات الدعم والمقاومة المحسوبة من جلسة الأمس
      </div>
      <div className="space-y-1.5">
        {levels.map((l) => {
          const isCurrent = Math.abs(currentPrice - l.value) < 30;
          return (
            <div
              key={l.label}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors",
                isCurrent ? "bg-[rgb(var(--gold)/0.10)] border-[rgb(var(--gold)/0.3)]" :
                l.type === "resistance" ? "bg-[rgb(var(--red)/0.04)] border-[rgb(var(--red)/0.15)]" :
                l.type === "support" ? "bg-[rgb(var(--green)/0.04)] border-[rgb(var(--green)/0.15)]" :
                "bg-bg-deepest border-border"
              )}
            >
              <span className={cn("text-[10px] font-medium w-10 text-center",
                l.type === "resistance" ? "text-red" :
                l.type === "support" ? "text-green" :
                "text-gold-bright"
              )}>{l.label}</span>
              <div className="flex-1 h-px" style={{ background: l.type === "resistance" ? "rgb(var(--red)/0.2)" : l.type === "support" ? "rgb(var(--green)/0.2)" : "rgb(var(--gold)/0.3)" }} />
              <span className="num text-sm font-medium">{l.value.toLocaleString()}</span>
              {isCurrent && <span className="text-[9px] bg-[rgb(var(--gold)/0.15)] text-gold-bright px-1.5 py-0.5 rounded">السعر الحالي</span>}
              <span className={cn("text-[10px] num w-16 text-left",
                currentPrice > l.value ? "text-green" : "text-red"
              )}>
                {currentPrice > l.value ? `+${(currentPrice - l.value).toFixed(0)}` : `${(currentPrice - l.value).toFixed(0)}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Fibonacci ────────────────────────────────────────────────
function FibonacciTab() {
  const { fibonacci: fib } = ti;
  const range = fib.swingHigh - fib.swingLow;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-bg-deepest rounded-xl border border-border">
          <div className="text-[10px] text-text-secondary mb-1">نقطة الارتداد العليا</div>
          <div className="num text-lg font-medium text-red">{fib.swingHigh.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-bg-deepest rounded-xl border border-border">
          <div className="text-[10px] text-text-secondary mb-1">نقطة الارتداد السفلية</div>
          <div className="num text-lg font-medium text-green">{fib.swingLow.toLocaleString()}</div>
        </div>
      </div>

      <div className="relative p-4 bg-bg-deepest rounded-xl border border-border overflow-hidden">
        <div className="text-[11px] text-text-secondary mb-3 font-medium">مستويات ارتداد فيبوناتشي</div>
        <div className="space-y-2">
          {fib.levels.map((level) => {
            const pos = fib.trend === "uptrend"
              ? ((fib.swingHigh - level.value) / range) * 100
              : ((level.value - fib.swingLow) / range) * 100;
            return (
              <div key={level.label} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg",
                (level as any).active ? "bg-[rgb(var(--gold)/0.12)] border border-[rgb(var(--gold)/0.3)]" :
                level.hit ? "bg-bg-elevated" : ""
              )}>
                <span className="text-[10px] font-medium text-gold-bright w-12">{level.label}</span>
                <div className="flex-1 h-px bg-border relative">
                  <div className={cn("absolute top-0 left-0 h-full", level.hit ? "bg-gold-bright/40" : "bg-transparent")} style={{ width: `${100 - pos}%` }} />
                </div>
                <span className="num text-sm font-medium">{level.value.toLocaleString()}</span>
                {(level as any).active && <span className="text-[9px] bg-[rgb(var(--gold)/0.2)] text-gold-bright px-1.5 py-0.5 rounded">المنطقة الحالية</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[rgb(var(--gold)/0.06)] border border-[rgb(var(--gold)/0.2)] text-[11px] text-gold-bright">
        ✦ السعر يختبر مستوى 38.2% · منطقة دعم قوية تاريخياً في السوق السعودي · ابحث عن إشارة شراء تأكيدية
      </div>
    </div>
  );
}

// ─── Ichimoku ─────────────────────────────────────────────────
function IchimokuTab() {
  const ich = ti.ichimoku;
  const currentPrice = 11847;

  const lines = [
    { label: "Tenkan-Sen", arabic: "خط التحول (9)", value: ich.tenkan, color: "text-blue" },
    { label: "Kijun-Sen", arabic: "خط الأساس (26)", value: ich.kijun, color: "text-red" },
    { label: "Senkou A", arabic: "السحابة العلوية", value: ich.senkouA, color: "text-green" },
    { label: "Senkou B", arabic: "السحابة السفلية", value: ich.senkouB, color: "text-orange" },
    { label: "Chikou", arabic: "خط متأخر (26)", value: ich.chikou, color: "text-purple" },
  ];

  return (
    <div className="space-y-3">
      <div className={cn(
        "p-4 rounded-xl border",
        ich.cloudColor === "green" ? "bg-[rgb(var(--green)/0.06)] border-[rgb(var(--green)/0.25)]" : "bg-[rgb(var(--red)/0.06)] border-[rgb(var(--red)/0.25)]"
      )}>
        <div className={cn("text-sm font-medium mb-1", ich.cloudColor === "green" ? "text-green" : "text-red")}>
          {ich.cloudColor === "green" ? "☁ سحابة خضراء · بيئة صاعدة" : "☁ سحابة حمراء · بيئة هابطة"}
        </div>
        <div className="text-[11px] text-text-secondary">{ich.signal}</div>
      </div>

      <div className="space-y-2">
        {lines.map((l) => (
          <div key={l.label} className="flex items-center justify-between p-3 bg-bg-deepest rounded-xl border border-border">
            <div>
              <div className={cn("text-xs font-medium", l.color)}>{l.label}</div>
              <div className="text-[10px] text-text-tertiary">{l.arabic}</div>
            </div>
            <div className="text-left">
              <div className="num text-sm font-medium">{l.value.toLocaleString()}</div>
              <div className={cn("text-[10px] font-medium", currentPrice > l.value ? "text-green" : "text-red")}>
                {currentPrice > l.value ? `↑ فوق بـ ${(currentPrice - l.value).toFixed(0)}` : `↓ تحت بـ ${(l.value - currentPrice).toFixed(0)}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-[rgb(var(--blue)/0.06)] border border-[rgb(var(--blue)/0.2)] text-[11px] text-blue">
        ✦ قراءة إيشيموكو: السعر داخل السحابة الخضراء · Tenkan فوق Kijun · Chikou فوق السعر السابق · إشارة صاعدة بتأكيد متوسط
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium text-text-secondary mb-2">{children}</div>;
}

function IndicatorCell({ label, value, color, note }: { label: string; value: number; color: string; note: string }) {
  const colorMap: Record<string, string> = {
    green: "text-green", red: "text-red", gold: "text-gold-bright", blue: "text-blue", orange: "text-orange",
  };
  return (
    <div className="p-3 bg-bg-deepest rounded-xl border border-border text-center">
      <div className="text-[10px] text-text-secondary mb-1">{label}</div>
      <div className={cn("num text-lg font-medium", colorMap[color])}>{value}</div>
      <div className="text-[9px] text-text-tertiary mt-1">{note}</div>
    </div>
  );
}

function IndicatorBox({ label, value, note, color }: { label: string; value: number; note: string; color: string }) {
  const colorMap: Record<string, string> = {
    green: "text-green bg-[rgb(var(--green)/0.08)] border-[rgb(var(--green)/0.2)]",
    red: "text-red bg-[rgb(var(--red)/0.08)] border-[rgb(var(--red)/0.2)]",
    blue: "text-blue bg-[rgb(var(--blue)/0.08)] border-[rgb(var(--blue)/0.2)]",
    orange: "text-orange bg-[rgb(var(--orange)/0.08)] border-[rgb(var(--orange)/0.2)]",
  };
  return (
    <div className={cn("p-3 rounded-xl border", colorMap[color])}>
      <div className="text-[10px] font-medium text-text-secondary mb-1">{label}</div>
      <div className="num text-2xl font-medium">{value}</div>
      <div className="text-[10px] font-medium mt-1">{note}</div>
    </div>
  );
}
