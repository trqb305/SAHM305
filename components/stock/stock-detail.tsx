"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TradingViewChart } from "./tradingview-chart";
import { getStockBySymbol, TIER_CONFIG, RISK_CONFIG } from "@/lib/stocks-data";

// PSAR + Supertrend added automatically in TradingViewChart for entry/exit arrows
const CHARTS = [
  { label: "15 دقيقة", interval: "15", studies: ["RSI@tv-basicstudies",   "Stochastic@tv-basicstudies"], tip: "RSI + Stoch + نقاط دخول/خروج" },
  { label: "ساعي",     interval: "60", studies: ["MACD@tv-basicstudies",  "MASimple@tv-basicstudies"],   tip: "MACD + MA + نقاط دخول/خروج" },
  { label: "يومي",     interval: "D",  studies: ["BB@tv-basicstudies",    "Volume@tv-basicstudies"],     tip: "BB + حجم + نقاط دخول/خروج" },
  { label: "أسبوعي",  interval: "W",  studies: ["MAExp@tv-basicstudies", "RSI@tv-basicstudies"],        tip: "EMA + RSI + نقاط دخول/خروج" },
];

// ── Signal Readiness System ──────────────────────────────────────
function getReadiness(score: number): {
  phase: "خروج قوي" | "تهيؤ للخروج" | "محايد" | "تهيؤ للدخول" | "دخول قوي";
  color: string; bg: string; border: string; icon: string; emoji: string;
  desc: string; action: string;
} {
  if (score >= 70) return {
    phase: "دخول قوي", color: "#22c55e", bg: "#03180a", border: "#22c55e44",
    icon: "🟢🟢", emoji: "🚀",
    desc: "جميع المؤشرات تتفق على الصعود — توقيت الدخول مثالي",
    action: "ادخل الآن بكامل المركز وضع وقف الخسارة فوراً",
  };
  if (score >= 58) return {
    phase: "تهيؤ للدخول", color: "#86efac", bg: "#051a0c", border: "#86efac33",
    icon: "🟢", emoji: "⚡",
    desc: "أغلب المؤشرات إيجابية — السهم يتهيأ للصعود",
    action: "ابدأ بـ 50% من المركز وانتظر تأكيد إضافي",
  };
  if (score >= 42) return {
    phase: "محايد", color: "#C9A84C", bg: "#140e04", border: "#C9A84C33",
    icon: "🟡", emoji: "⏳",
    desc: "المؤشرات متضاربة — لا يوجد اتجاه واضح",
    action: "انتظر على الهامش — لا تدخل ولا تخرج بعجلة",
  };
  if (score >= 30) return {
    phase: "تهيؤ للخروج", color: "#fca5a5", bg: "#180505", border: "#fca5a533",
    icon: "🔴", emoji: "⚠️",
    desc: "مؤشرات هبوط تتراكم — ابدأ بتقليل مركزك",
    action: "أغلق 50% من مركزك وضيّق وقف الخسارة",
  };
  return {
    phase: "خروج قوي", color: "#ef4444", bg: "#1a0303", border: "#ef444444",
    icon: "🔴🔴", emoji: "🚨",
    desc: "جميع المؤشرات تشير للهبوط — خطر حقيقي",
    action: "اخرج بالكامل الآن — لا تنتظر",
  };
}

interface LiveData {
  price: number; changePct: number; high: number; low: number; volume: number;
  buyPressure: number; flow: "تجميع"|"تصريف"|"محايد"; flowLabel: string;
  techScore: number; techSignal: string; techSignalEn: string;
  rsi: number; macdBullish: boolean; macdHist: number; bbPct: number;
  stoch: number; ema20Above: boolean; ema50Above: boolean; adx: number;
  vwap: number; priceVsVwap: "above"|"below";
  bullishCount: number; bearishCount: number;
}

const CAPITAL = 30000;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

.sd-root {
  background: #04060d;
  min-height: 100svh;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  position: relative;
}
.sd-root::before {
  content: '';
  position: fixed; inset: 0;
  background-image:
    radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 55%),
    linear-gradient(rgba(201,168,76,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201,168,76,0.018) 1px, transparent 1px);
  background-size: 100% 100%, 60px 60px, 60px 60px;
  pointer-events: none; z-index: 0;
}
.sd-content { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 14px 18px 60px; }

.sd-back { background:none; border:none; cursor:pointer; color:#2a3848; font-size:13px; font-family:'Cairo',sans-serif; display:flex; align-items:center; gap:5px; padding:0; margin-bottom:14px; transition:color .2s; }
.sd-back:hover { color:#C9A84C; }

/* Header card */
.sd-header {
  background: #080b14; border: 1px solid #111b2e;
  border-radius: 20px; padding: 18px 22px; margin-bottom: 12px;
  position: relative; overflow: hidden;
}
.sd-header::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
}
.sd-header-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; }
.sd-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.sd-symbol { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:700; color:#C9A84C; }
.sd-name { font-size:22px; font-weight:800; color:#dde4ef; }
.sd-tags { display:flex; gap:7px; flex-wrap:wrap; }
.sd-tag { font-size:11px; padding:2px 9px; border-radius:6px; font-weight:600; border:1px solid; }

.sd-sig {
  border-radius: 14px; padding: 14px 24px; text-align: center;
  border: 1px solid; min-width: 130px;
}
.sd-sig-icon { font-size: 30px; margin-bottom: 4px; }
.sd-sig-label { font-size: 18px; font-weight: 800; }
.sd-sig-reason { font-size: 10px; color: #2a3848; margin-top: 3px; max-width: 160px; }

.sd-price-row { margin-top: 14px; display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.sd-price { font-family:'JetBrains Mono',monospace; font-size: 36px; font-weight: 700; color: #edf1f7; }
.sd-unit { color: #2a3848; font-size: 14px; }
.sd-change { font-family:'JetBrains Mono',monospace; font-size: 20px; font-weight: 700; }
.sd-hl { font-family:'JetBrains Mono',monospace; font-size: 13px; color: #2a3848; }

/* Panels */
.sd-panel {
  background: #080b14; border: 1px solid #111b2e;
  border-radius: 18px; padding: 16px 18px; margin-bottom: 12px;
  position: relative; overflow: hidden;
}
.sd-panel-title { font-size: 13px; font-weight: 700; color: #8899aa; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }

/* Indicators grid */
.ind-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ind-card { background: #05080f; border: 1px solid; border-radius: 12px; padding: 10px 12px; text-align: center; }
.ind-card.bull { border-color: #10b98120; }
.ind-card.bear { border-color: #ef444420; }
.ind-name { font-size: 9px; color: #2a3848; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
.ind-val  { font-family:'JetBrains Mono',monospace; font-size: 14px; font-weight: 700; }
.ind-val.bull { color: #10b981; }
.ind-val.bear { color: #ef4444; }
.ind-note { font-size: 9.5px; color: #2a3848; margin-top: 3px; }

/* Confluence gauge */
.gauge-wrap { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; padding: 12px 16px; background: #05080f; border-radius: 12px; }
.gauge-score { font-family:'JetBrains Mono',monospace; font-size: 32px; font-weight: 800; min-width: 55px; }
.gauge-bar-wrap { flex: 1; }
.gauge-signal { font-size: 14px; font-weight: 700; margin-bottom: 5px; }
.gauge-track { height: 8px; background: #0d1422; border-radius: 4px; overflow: visible; position: relative; }
.gauge-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #ef4444, #f59e0b 40%, #10b981); }
.gauge-needle { position: absolute; top: -3px; width: 2px; height: 14px; background: #fff; border-radius: 1px; transform: translateX(-50%); }
.gauge-labels { display: flex; justify-content: space-between; font-family:'JetBrains Mono',monospace; font-size: 9px; color: #2a3848; margin-top: 4px; }
.gauge-counts { display: flex; flex-direction: column; gap: 2px; min-width: 70px; text-align: left; }
.gauge-bull { font-size: 12px; color: #10b981; }
.gauge-bear { font-size: 12px; color: #ef4444; }

/* Readiness */
.readiness-panel {
  border-radius: 18px; padding: 18px 20px; margin-bottom: 12px;
  border: 2px solid; position: relative; overflow: hidden;
}
.readiness-panel::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 80% at 50% 0%, currentColor, transparent);
  opacity: 0.06; pointer-events: none;
}
.readiness-top { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.readiness-emoji { font-size: 40px; }
.readiness-info { flex: 1; }
.readiness-phase { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.readiness-desc { font-size: 13px; color: #6a7a8a; line-height: 1.6; }
.readiness-action {
  background: rgba(0,0,0,0.3); border-radius: 10px;
  padding: 10px 16px; margin-top: 12px;
  font-size: 13px; font-weight: 600; line-height: 1.7;
  border: 1px solid rgba(255,255,255,0.06);
}
.readiness-stages { display: flex; gap: 0; margin-top: 14px; border-radius: 10px; overflow: hidden; }
.readiness-stage {
  flex: 1; padding: 7px 4px; text-align: center;
  font-size: 10px; font-weight: 700; border: none;
  transition: opacity .3s;
}
.readiness-stage.active { opacity: 1; }
.readiness-stage.inactive { opacity: 0.25; }

/* Flow */
.flow-big { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.flow-badge { border-radius: 12px; padding: 12px 18px; text-align: center; min-width: 100px; border: 1px solid; }
.flow-badge-icon { font-size: 26px; }
.flow-badge-label { font-size: 16px; font-weight: 800; margin-top: 4px; }
.flow-bar-wrap { flex: 1; min-width: 180px; }
.flow-bar-labels { display: flex; justify-content: space-between; font-size: 11px; color: #2a3848; margin-bottom: 5px; }
.flow-track { height: 10px; background: #0d1422; border-radius: 5px; overflow: hidden; }
.flow-fill  { height: 100%; border-radius: 5px; transition: width .6s; }
.flow-bar-pcts { display: flex; justify-content: space-between; font-family:'JetBrains Mono',monospace; font-size: 10px; color: #2a3848; margin-top: 4px; }
.flow-desc { font-size: 12px; color: #2a3848; max-width: 200px; line-height: 1.7; }

/* Calculator */
.calc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.calc-label { font-size: 12px; color: #2a3848; }
.calc-input {
  width: 130px; background: #05080f;
  border: 1px solid #111b2e; border-radius: 10px;
  padding: 7px 12px; color: #dde4ef;
  font-family: 'JetBrains Mono', monospace; font-size: 15px; text-align: center;
  outline: none; transition: border-color .2s;
}
.calc-input:focus { border-color: #C9A84C55; }
.calc-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.calc-box { border-radius: 12px; padding: 13px; text-align: center; border: 1px solid; }
.calc-box-label { font-size: 11px; margin-bottom: 6px; }
.calc-box-price { font-family:'JetBrains Mono',monospace; font-size: 17px; font-weight: 700; color: #dde4ef; }
.calc-box-pct   { font-size: 12px; margin-top: 2px; }
.calc-box-amt   { font-size: 13px; font-weight: 700; margin-top: 5px; }

/* Plan */
.plan-row { display: flex; gap: 10px; background: #05080f; border-radius: 12px; padding: 11px 14px; margin-bottom: 8px; }
.plan-icon { font-size: 16px; flex-shrink: 0; }
.plan-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
.plan-text  { font-size: 13px; color: #c0cad8; line-height: 1.6; }

/* Charts 2×2 */
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #0d1422; border-radius: 0 0 18px 18px; overflow: hidden; }
.chart-cell { background: #080b14; }
.chart-header { padding: 7px 12px; border-bottom: 1px solid #0d1422; display: flex; justify-content: space-between; align-items: center; }
.chart-label { font-size: 12px; font-weight: 700; color: #5a6a80; }
.chart-tip   { font-size: 9.5px; color: #2a3848; }

/* Responsive */
@media (max-width: 768px) {
  .sd-content { padding: 10px 12px 40px; }
  .ind-grid { grid-template-columns: repeat(2, 1fr); }
  .calc-grid { grid-template-columns: 1fr 1fr; }
  .charts-grid { grid-template-columns: 1fr; }
  .gauge-wrap { flex-wrap: wrap; }
  .sd-price { font-size: 28px; }
  .sd-name { font-size: 18px; }
}
`;

export function StockDetailPage({ symbol }: { symbol: string }) {
  const router  = useRouter();
  const stock   = getStockBySymbol(symbol);
  const [live, setLive]       = useState<LiveData | null>(null);
  const [capital, setCapital] = useState(CAPITAL);

  useEffect(() => {
    fetch("/api/market").then(r => r.json()).then(d => {
      const s = d.stocks?.find((x: any) => x.symbol === symbol);
      if (s) setLive(s as LiveData);
    }).catch(() => {});
  }, [symbol]);

  if (!stock) return (
    <div style={{ textAlign: "center", padding: 60, color: "#2a3848", fontFamily: "'Cairo',sans-serif" }}>
      <p>السهم غير موجود</p>
      <button onClick={() => router.back()} style={{ marginTop: 12, padding: "8px 20px", background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>رجوع</button>
    </div>
  );

  const price     = live?.price ?? 0;
  const changePct = live?.changePct ?? 0;
  const bp        = live?.buyPressure ?? 50;
  const flow      = live?.flow ?? "محايد";
  const ts        = live?.techScore ?? 50;
  const tier      = TIER_CONFIG[stock.tier] ?? { label: stock.tier, color: "text-gold-bright" };
  const risk      = RISK_CONFIG[stock.riskLevel];
  const tierColor = tier.color === "text-gold-bright" ? "#C9A84C" : tier.color === "text-blue" ? "#60a5fa" : tier.color === "text-green" ? "#10b981" : "#fb923c";
  const riskColor = risk.color === "text-green" ? "#10b981" : risk.color === "text-red" ? "#ef4444" : "#C9A84C";

  const sigEn  = live?.techSignalEn ?? "neutral";
  const sigTx  = live?.techSignal   ?? stock.lastSignal;
  const sigColor = sigEn === "strong_buy" ? "#22c55e" : sigEn === "buy" ? "#86efac" : sigEn === "sell" ? "#fca5a5" : sigEn === "strong_sell" ? "#ef4444" : "#C9A84C";
  const sigBg    = sigEn === "strong_buy" ? "#04180c" : sigEn === "buy" ? "#07150b" : sigEn === "sell" ? "#150707" : sigEn === "strong_sell" ? "#1a0404" : "#131006";
  const sigIcon  = (sigEn === "strong_buy" || sigEn === "buy") ? "🟢" : (sigEn === "sell" || sigEn === "strong_sell") ? "🔴" : "🟡";
  const scoreColor = ts >= 65 ? "#10b981" : ts >= 48 ? "#C9A84C" : "#ef4444";
  const flowColor  = flow === "تجميع" ? "#10b981" : flow === "تصريف" ? "#ef4444" : "#C9A84C";

  const entryPrice  = price > 0 ? price : 50;
  const targetPrice = +(entryPrice * (1 + stock.targetPct / 100)).toFixed(2);
  const stopPrice   = +(entryPrice * (1 - stock.stopPct / 100)).toFixed(2);
  const shares      = Math.floor(capital / entryPrice);
  const profit      = Math.round(shares * (targetPrice - entryPrice));
  const loss        = Math.round(shares * (entryPrice - stopPrice));
  const rr          = loss > 0 ? (profit / loss).toFixed(1) : "∞";

  return (
    <>
      <style>{CSS}</style>
      <div className="sd-root">
        <div className="sd-content">
          <button className="sd-back" onClick={() => router.back()}>← رجوع للقائمة</button>

          {/* ── Header ── */}
          <div className="sd-header">
            <div className="sd-header-top">
              <div>
                <div className="sd-name-row">
                  <span className="sd-symbol">{stock.symbol}</span>
                  <span className="sd-name">{stock.name}</span>
                </div>
                <div className="sd-tags">
                  <span className="sd-tag" style={{ color: tierColor, background: tierColor + "15", borderColor: tierColor + "33" }}>{tier.label}</span>
                  <span className="sd-tag" style={{ color: riskColor, background: riskColor + "15", borderColor: riskColor + "33" }}>{risk.label}</span>
                  <span className="sd-tag" style={{ color: "#3a4a5e", background: "#0a0f1a", borderColor: "#111b2e" }}>⏱ {stock.holdPeriod}</span>
                  <span className="sd-tag" style={{ color: "#3a4a5e", background: "#0a0f1a", borderColor: "#111b2e" }}>{stock.sector}</span>
                </div>
              </div>
              <div className="sd-sig" style={{ background: sigBg, borderColor: sigColor + "44" }}>
                <div className="sd-sig-icon">{sigIcon}</div>
                <div className="sd-sig-label" style={{ color: sigColor }}>{sigTx}</div>
                <div className="sd-sig-reason">{stock.signalReason}</div>
              </div>
            </div>
            {price > 0 && (
              <div className="sd-price-row">
                <span className="sd-price">{price.toFixed(2)}</span>
                <span className="sd-unit">ريال</span>
                <span className="sd-change" style={{ color: changePct >= 0 ? "#10b981" : "#ef4444" }}>
                  {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
                </span>
                <span className="sd-hl">أعلى {live?.high.toFixed(2)} · أدنى {live?.low.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* ── Readiness Panel — نقاط التهيؤ والدخول والخروج ── */}
          {(() => {
            const r = getReadiness(ts);
            const stages = [
              { label: "خروج قوي",      color: "#ef4444", bg: "#2a0505", score: [0,30]   },
              { label: "تهيؤ للخروج",   color: "#fca5a5", bg: "#200808", score: [30,42]  },
              { label: "محايد",          color: "#C9A84C", bg: "#1a140a", score: [42,58]  },
              { label: "تهيؤ للدخول",  color: "#86efac", bg: "#071a0c", score: [58,70]  },
              { label: "دخول قوي",     color: "#22c55e", bg: "#03180a", score: [70,100]  },
            ];
            const activeIdx = stages.findIndex(s => ts >= s.score[0] && ts < s.score[1]);
            return (
              <div className="readiness-panel" style={{ background: r.bg, borderColor: r.border, color: r.color, marginBottom: 12 }}>
                <div className="readiness-top">
                  <div className="readiness-emoji">{r.emoji}</div>
                  <div className="readiness-info">
                    <div className="readiness-phase" style={{ color: r.color }}>{r.icon} {r.phase}</div>
                    <div className="readiness-desc">{r.desc}</div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 42, fontWeight: 800, color: r.color, minWidth: 60, textAlign: "center" }}>{ts}<span style={{ fontSize: 14 }}>/100</span></div>
                </div>
                <div className="readiness-action" style={{ color: r.color }}>
                  📌 ماذا تفعل الآن: {r.action}
                </div>
                <div className="readiness-stages">
                  {stages.map((s, i) => (
                    <div key={i} className={`readiness-stage ${i === activeIdx ? "active" : "inactive"}`}
                      style={{ background: i === activeIdx ? s.color + "33" : s.bg, color: s.color, borderLeft: i > 0 ? "1px solid #050810" : "none" }}>
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── Technical Panel ── */}
          {live && (
            <div className="sd-panel" style={{ borderColor: scoreColor + "25" }}>
              <div className="sd-panel-title">🔬 تحليل تقني متعدد المؤشرات — {live.bullishCount + live.bearishCount} مؤشر</div>

              <div className="gauge-wrap">
                <div className="gauge-score" style={{ color: scoreColor }}>{ts}</div>
                <div className="gauge-bar-wrap">
                  <div className="gauge-signal" style={{ color: scoreColor }}>{sigTx}</div>
                  <div className="gauge-track">
                    <div className="gauge-fill" style={{ width: "100%", opacity: 0.25 }} />
                    <div className="gauge-needle" style={{ left: `${ts}%` }} />
                  </div>
                  <div className="gauge-labels">
                    <span style={{ color: "#ef4444" }}>خروج قوي</span>
                    <span>0—25—50—75—100</span>
                    <span style={{ color: "#10b981" }}>دخول قوي</span>
                  </div>
                </div>
                <div className="gauge-counts">
                  <span className="gauge-bull">▲ {live.bullishCount} صاعد</span>
                  <span className="gauge-bear">▼ {live.bearishCount} هابط</span>
                </div>
              </div>

              <div className="ind-grid">
                {[
                  { label: "RSI 14",      val: `${live.rsi}`,                 bull: live.rsi < 50,        note: live.rsi < 30 ? "ذروة بيع 🔥" : live.rsi > 70 ? "ذروة شراء ⚠" : live.rsi < 50 ? "منطقة شراء" : "منطقة بيع" },
                  { label: "MACD",        val: live.macdBullish ? "إيجابي ↑" : "سلبي ↓", bull: live.macdBullish, note: live.macdBullish ? "زخم صاعد" : "زخم هابط" },
                  { label: "Bollinger",   val: `${live.bbPct}%`,              bull: live.bbPct < 40,      note: live.bbPct < 10 ? "قرب الدعم 🔥" : live.bbPct > 90 ? "قرب المقاومة ⚠" : live.bbPct < 40 ? "منطقة جيدة" : "ضغط بيع" },
                  { label: "Stochastic",  val: `${live.stoch}`,               bull: live.stoch < 40,      note: live.stoch < 20 ? "ذروة بيع 🔥" : live.stoch > 80 ? "ذروة شراء ⚠" : live.stoch < 40 ? "شراء" : "بيع" },
                  { label: "EMA 20",      val: live.ema20Above ? "↑ فوقه" : "↓ تحته", bull: live.ema20Above,  note: live.ema20Above ? "اتجاه قصير صاعد" : "اتجاه قصير هابط" },
                  { label: "EMA 50",      val: live.ema50Above ? "↑ فوقه" : "↓ تحته", bull: live.ema50Above,  note: live.ema50Above ? "اتجاه متوسط صاعد" : "اتجاه متوسط هابط" },
                  { label: "ADX",         val: `${live.adx}`,                 bull: live.adx > 25,        note: live.adx > 40 ? "اتجاه قوي جداً" : live.adx > 25 ? "اتجاه واضح" : "لا اتجاه واضح" },
                  { label: "VWAP",        val: live.priceVsVwap === "above" ? "↑ فوقه" : "↓ تحته", bull: live.priceVsVwap === "above", note: live.priceVsVwap === "above" ? "المشترون مسيطرون" : "البائعون مسيطرون" },
                ].map((ind, i) => (
                  <div key={i} className={`ind-card ${ind.bull ? "bull" : "bear"}`}>
                    <div className="ind-name">{ind.label}</div>
                    <div className={`ind-val ${ind.bull ? "bull" : "bear"}`}>{ind.val}</div>
                    <div className="ind-note">{ind.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Supply/Demand ── */}
          <div className="sd-panel" style={{ borderColor: flowColor + "25" }}>
            <div className="sd-panel-title">📊 العرض والطلب — تجميع أم تصريف؟</div>
            <div className="flow-big">
              <div className="flow-badge" style={{ background: flow === "تجميع" ? "#04180c" : flow === "تصريف" ? "#1a0404" : "#0d0f14", borderColor: flowColor + "44" }}>
                <div className="flow-badge-icon">{flow === "تجميع" ? "🟢" : flow === "تصريف" ? "🔴" : "🟡"}</div>
                <div className="flow-badge-label" style={{ color: flowColor }}>{flow}</div>
              </div>
              <div className="flow-bar-wrap">
                <div className="flow-bar-labels"><span>🔴 بيع</span><span>🟢 شراء</span></div>
                <div className="flow-track">
                  <div className="flow-fill" style={{ width: `${bp}%`, background: bp > 55 ? "#10b981" : bp < 45 ? "#ef4444" : "#C9A84C" }} />
                </div>
                <div className="flow-bar-pcts"><span>{100 - bp}%</span><span>{bp}%</span></div>
              </div>
              <div className="flow-desc">
                {flow === "تجميع" && "الشراء أقوى — المؤسسات تجمع السهم. إشارة دخول إيجابية."}
                {flow === "تصريف" && "البيع أقوى — المؤسسات تفرّغ السهم. تجنب الدخول."}
                {flow === "محايد" && "الضغط متوازن — انتظر إشارة أوضح."}
              </div>
            </div>
          </div>

          {/* ── Calculator ── */}
          <div className="sd-panel" style={{ borderColor: "#C9A84C22" }}>
            <div className="sd-panel-title">💰 حاسبة الربح والخسارة</div>
            <div className="calc-row">
              <span className="calc-label">رأس المال:</span>
              <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value) || CAPITAL)} className="calc-input" step={5000} min={5000} />
              <span className="calc-label">ريال</span>
            </div>
            <div className="calc-grid">
              <div className="calc-box" style={{ background: "#04180c", borderColor: "#10b98133" }}>
                <div className="calc-box-label" style={{ color: "#10b981" }}>🎯 الهدف</div>
                <div className="calc-box-price">{targetPrice.toFixed(2)}</div>
                <div className="calc-box-pct" style={{ color: "#10b981" }}>+{stock.targetPct}%</div>
                <div className="calc-box-amt" style={{ color: "#10b981" }}>+{profit.toLocaleString()} ر.س</div>
              </div>
              <div className="calc-box" style={{ background: "#1a0404", borderColor: "#ef444433" }}>
                <div className="calc-box-label" style={{ color: "#ef4444" }}>🛑 وقف الخسارة</div>
                <div className="calc-box-price">{stopPrice.toFixed(2)}</div>
                <div className="calc-box-pct" style={{ color: "#ef4444" }}>-{stock.stopPct}%</div>
                <div className="calc-box-amt" style={{ color: "#ef4444" }}>-{loss.toLocaleString()} ر.س</div>
              </div>
              <div className="calc-box" style={{ background: "#0d0f14", borderColor: "#C9A84C33" }}>
                <div className="calc-box-label" style={{ color: "#C9A84C" }}>⚖️ ربح / خسارة</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 800, color: "#C9A84C", marginTop: 4 }}>{rr}:1</div>
                <div className="calc-box-pct" style={{ color: "#2a3848" }}>{shares.toLocaleString()} سهم</div>
              </div>
            </div>
          </div>

          {/* ── Trading Plan ── */}
          <div className="sd-panel">
            <div className="sd-panel-title">📋 خطة التداول — بالعربي البسيط</div>
            <div className="plan-row">
              <span className="plan-icon">🎯</span>
              <div><div className="plan-label" style={{ color: "#2a3848" }}>متى تدخل</div><div className="plan-text">{stock.analysis.entryNote}</div></div>
            </div>
            <div className="plan-row">
              <span className="plan-icon">🚪</span>
              <div><div className="plan-label" style={{ color: "#2a3848" }}>متى تخرج</div><div className="plan-text">{stock.analysis.exitNote}</div></div>
            </div>
            <div className="plan-row">
              <span className="plan-icon">⚠️</span>
              <div><div className="plan-label" style={{ color: "#f59e0b" }}>انتبه لـ</div><div className="plan-text">{stock.analysis.watchout}</div></div>
            </div>
            <div style={{ marginTop: 10, padding: "11px 14px", background: "#05080f", borderRadius: 12, fontSize: 12, color: "#3a4a5e", lineHeight: 1.8 }}>{stock.analysis.summary}</div>
          </div>

          {/* ── 2×2 Charts ── */}
          <div className="sd-panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #111b2e" }}>
              <div className="sd-panel-title" style={{ marginBottom: 0 }}>📊 شارتات {stock.symbol} — 4 إطارات زمنية · مؤشرين لكل شارت</div>
            </div>
            <div className="charts-grid">
              {CHARTS.map((c, i) => (
                <div key={i} className="chart-cell">
                  <div className="chart-header">
                    <span className="chart-label">{c.label}</span>
                    <span className="chart-tip">{c.tip}</span>
                  </div>
                  <TradingViewChart key={`${symbol}-${i}`} symbol={stock.symbol} interval={c.interval} studies={c.studies} height={285} />
                </div>
              ))}
            </div>
          </div>

          {/* Why */}
          <div className="sd-panel" style={{ marginTop: 0 }}>
            <div style={{ fontSize: 11, color: "#2a3848", marginBottom: 5 }}>لماذا اخترنا هذا السهم؟</div>
            <div style={{ fontSize: 13, color: "#5a6a80", lineHeight: 1.8 }}>{stock.whyPick}</div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#1a2535", padding: "14px 0" }}>⚠️ للاسترشاد فقط — ليست توصية استثمارية</p>
        </div>
      </div>
    </>
  );
}
