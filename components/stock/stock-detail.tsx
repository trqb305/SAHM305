"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TradingViewChart } from "./tradingview-chart";
import { getStockBySymbol, TIER_CONFIG, RISK_CONFIG } from "@/lib/stocks-data";

const CHARTS = [
  { label: "📊 15 دقيقة", interval: "15", studies: ["RSI@tv-basicstudies",   "Stochastic@tv-basicstudies"], tip: "RSI + ستوكاستيك" },
  { label: "📈 ساعي",      interval: "60", studies: ["MACD@tv-basicstudies",  "MASimple@tv-basicstudies"],   tip: "MACD + MA" },
  { label: "📅 يومي",      interval: "D",  studies: ["BB@tv-basicstudies",    "Volume@tv-basicstudies"],     tip: "بولنجر + حجم" },
  { label: "📆 أسبوعي",   interval: "W",  studies: ["MAExp@tv-basicstudies", "RSI@tv-basicstudies"],        tip: "EMA + RSI" },
];

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
    <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
      <p>السهم غير موجود</p>
      <button onClick={() => router.back()} style={gBtn}>رجوع</button>
    </div>
  );

  const price     = live?.price ?? 0;
  const changePct = live?.changePct ?? 0;
  const bp        = live?.buyPressure ?? 50;
  const flow      = live?.flow ?? "محايد";
  const tier      = TIER_CONFIG[stock.tier] ?? { label: stock.tier, color: "text-gold-bright" };
  const risk      = RISK_CONFIG[stock.riskLevel];
  const tierColor = tier.color === "text-gold-bright" ? "#C9A84C" : tier.color === "text-blue" ? "#60a5fa" : tier.color === "text-green" ? "#4ade80" : "#fb923c";
  const riskColor = risk.color === "text-green" ? "#4ade80" : risk.color === "text-red" ? "#f87171" : "#C9A84C";

  const techScore = live?.techScore ?? 50;
  const techSignal = live?.techSignal ?? stock.lastSignal;
  const isStrongBuy = live?.techSignalEn === "strong_buy";
  const isBuy = live?.techSignalEn === "buy";
  const isSell = live?.techSignalEn === "sell";
  const isStrongSell = live?.techSignalEn === "strong_sell";
  const sigColor = isStrongBuy ? "#22c55e" : isBuy ? "#86efac" : isSell ? "#fca5a5" : isStrongSell ? "#ef4444" : "#888";
  const sigBg    = isStrongBuy ? "#052010" : isBuy ? "#0a1f10" : isSell ? "#1f0808" : isStrongSell ? "#2a0505" : "#111";
  const sigIcon  = (isStrongBuy || isBuy) ? "🟢" : (isSell || isStrongSell) ? "🔴" : "🟡";
  const scoreColor = techScore >= 65 ? "#22c55e" : techScore >= 50 ? "#C9A84C" : "#ef4444";
  const flowColor  = flow === "تجميع" ? "#4ade80" : flow === "تصريف" ? "#f87171" : "#888";

  const entryPrice  = price > 0 ? price : 50;
  const targetPrice = +(entryPrice * (1 + stock.targetPct / 100)).toFixed(2);
  const stopPrice   = +(entryPrice * (1 - stock.stopPct / 100)).toFixed(2);
  const shares      = Math.floor(capital / entryPrice);
  const profit      = Math.round(shares * (targetPrice - entryPrice));
  const loss        = Math.round(shares * (entryPrice - stopPrice));
  const rr          = loss > 0 ? (profit / loss).toFixed(1) : "∞";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 14, background: "#06080b", minHeight: "100vh" }}>

      <button onClick={() => router.back()} style={{ color: "#444", background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>← رجوع للقائمة</button>

      {/* ── Header ── */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: "#C9A84C", fontWeight: 800, fontSize: 20 }}>{stock.symbol}</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "#e8e8e8" }}>{stock.name}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag label={tier.label}  color={tierColor} />
              <Tag label={risk.label}  color={riskColor} />
              <Tag label={`⏱ ${stock.holdPeriod}`} color="#555" />
              <Tag label={stock.sector} color="#444" />
            </div>
          </div>
          {/* Signal badge */}
          <div style={{ background: sigBg, border: `1px solid ${sigColor}44`, borderRadius: 14, padding: "12px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 2 }}>{sigIcon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: sigColor }}>{techSignal}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{stock.signalReason}</div>
          </div>
        </div>
        {price > 0 && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 34, fontWeight: 800, color: "#eee" }}>{price.toFixed(2)}</span>
            <span style={{ color: "#444", fontSize: 14 }}>ريال</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: changePct >= 0 ? "#4ade80" : "#f87171" }}>{changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%</span>
            <span style={{ fontSize: 13, color: "#444" }}>أعلى {live?.high.toFixed(2)} · أدنى {live?.low.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* ── Technical Indicators Panel ── */}
      {live && (
        <div style={{ ...card, border: `1px solid ${scoreColor}33`, marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa", marginBottom: 12 }}>🔬 تحليل تقني — {live.bullishCount + live.bearishCount} مؤشر</div>

          {/* Overall score */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "10px 14px", background: "#0a0d10", borderRadius: 10 }}>
            <div style={{ textAlign: "center", minWidth: 60 }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: scoreColor }}>{techScore}</div>
              <div style={{ fontSize: 10, color: "#444" }}>من 100</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginBottom: 5 }}>
                <span>هابط</span><span style={{ color: scoreColor, fontWeight: 700 }}>{techSignal}</span><span>صاعد</span>
              </div>
              <div style={{ height: 10, background: "#111", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${techScore}%`, height: "100%", background: `linear-gradient(90deg, #ef4444, #C9A84C, #22c55e)`, opacity: 1 }} />
                <div style={{ position: "relative", top: -10, height: 10 }}>
                  <div style={{ position: "absolute", left: `${techScore}%`, top: 0, width: 3, height: 10, background: scoreColor, transform: "translateX(-50%)" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#333", marginTop: 4 }}>
                <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>
            <div style={{ textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 13, color: "#4ade80" }}>▲ {live.bullishCount} صاعد</div>
              <div style={{ fontSize: 13, color: "#f87171" }}>▼ {live.bearishCount} هابط</div>
            </div>
          </div>

          {/* Individual indicators grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            <IndicatorCard label="RSI (14)" value={`${live.rsi}`}
              bull={live.rsi < 50} note={live.rsi < 30 ? "ذروة بيع 🔥" : live.rsi > 70 ? "ذروة شراء ⚠" : live.rsi < 50 ? "منطقة شراء" : "منطقة بيع"} />
            <IndicatorCard label="MACD" value={live.macdBullish ? "إيجابي" : "سلبي"}
              bull={live.macdBullish} note={live.macdBullish ? "زخم صاعد" : "زخم هابط"} />
            <IndicatorCard label="بولنجر %B" value={`${live.bbPct}%`}
              bull={live.bbPct < 40} note={live.bbPct < 10 ? "قرب الدعم 🔥" : live.bbPct > 90 ? "قرب المقاومة ⚠" : live.bbPct < 40 ? "منطقة جيدة" : "منطقة ضغط"} />
            <IndicatorCard label="ستوكاستيك" value={`${live.stoch}`}
              bull={live.stoch < 40} note={live.stoch < 20 ? "ذروة بيع 🔥" : live.stoch > 80 ? "ذروة شراء ⚠" : live.stoch < 40 ? "منطقة شراء" : "منطقة بيع"} />
            <IndicatorCard label="EMA 20" value={live.ema20Above ? "السعر فوقه" : "السعر تحته"}
              bull={live.ema20Above} note={live.ema20Above ? "اتجاه قصير صاعد" : "اتجاه قصير هابط"} />
            <IndicatorCard label="EMA 50" value={live.ema50Above ? "السعر فوقه" : "السعر تحته"}
              bull={live.ema50Above} note={live.ema50Above ? "اتجاه متوسط صاعد" : "اتجاه متوسط هابط"} />
            <IndicatorCard label="ADX" value={`${live.adx}`}
              bull={live.adx > 25} note={live.adx > 40 ? "اتجاه قوي جداً" : live.adx > 25 ? "اتجاه واضح" : "لا اتجاه واضح"} />
            <IndicatorCard label="VWAP" value={live.priceVsVwap === "above" ? "فوق VWAP" : "تحت VWAP"}
              bull={live.priceVsVwap === "above"} note={live.priceVsVwap === "above" ? "المشترون مسيطرون" : "البائعون مسيطرون"} />
          </div>
        </div>
      )}

      {/* ── Supply/Demand ── */}
      <div style={{ ...card, border: `1px solid ${flowColor}33`, marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa", marginBottom: 10 }}>📊 العرض والطلب — تجميع أم تصريف؟</div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ background: flow === "تجميع" ? "#052010" : flow === "تصريف" ? "#2a0505" : "#111", border: `1px solid ${flowColor}44`, borderRadius: 10, padding: "12px 20px", textAlign: "center", minWidth: 110 }}>
            <div style={{ fontSize: 26 }}>{flow === "تجميع" ? "🟢" : flow === "تصريف" ? "🔴" : "🟡"}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: flowColor, marginTop: 4 }}>{flow}</div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginBottom: 5 }}>
              <span>🔴 بيع / تصريف</span><span>🟢 شراء / تجميع</span>
            </div>
            <div style={{ height: 12, background: "#111", borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: `${bp}%`, height: "100%", background: bp > 55 ? "#22c55e" : bp < 45 ? "#ef4444" : "#888", borderRadius: 6, transition: "width .6s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginTop: 4 }}>
              <span>{100 - bp}% ضغط بيع</span><span>{bp}% ضغط شراء</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#555", maxWidth: 200, lineHeight: 1.7 }}>
            {flow === "تجميع" && "الشراء أقوى — الكبار يجمعون. إشارة دخول إيجابية."}
            {flow === "تصريف" && "البيع أقوى — الكبار يفرّغون. تجنب الدخول."}
            {flow === "محايد" && "الضغط متوازن. انتظر إشارة أوضح."}
          </div>
        </div>
      </div>

      {/* ── Calculator ── */}
      <div style={{ ...card, border: "1px solid #2a1f0a", marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C", marginBottom: 10 }}>💰 حاسبة الربح والخسارة</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#555" }}>رأس المال:</label>
          <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value) || CAPITAL)}
            style={{ width: 120, background: "#0a0d10", border: "1px solid #1e2630", borderRadius: 8, padding: "6px 10px", color: "#e0e0e0", fontSize: 14, textAlign: "center" }}
            step={5000} min={5000} />
          <span style={{ fontSize: 12, color: "#444" }}>ريال</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <CalcBox label="🎯 الهدف" price={targetPrice} pct={`+${stock.targetPct}%`} amount={`+${profit.toLocaleString()} ر.س`} color="#22c55e" bg="#052010" />
          <CalcBox label="🛑 وقف الخسارة" price={stopPrice} pct={`-${stock.stopPct}%`} amount={`-${loss.toLocaleString()} ر.س`} color="#ef4444" bg="#2a0505" />
          <div style={{ background: "#0a0d10", border: "1px solid #1e2630", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 6 }}>ربح / خسارة</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#C9A84C" }}>{rr}:1</div>
            <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>{shares} سهم بـ {capital.toLocaleString()} ر.س</div>
          </div>
        </div>
      </div>

      {/* ── Trading Plan ── */}
      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa", marginBottom: 10 }}>📋 خطة التداول</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <PlanRow icon="🎯" label="متى تدخل"  text={stock.analysis.entryNote} />
          <PlanRow icon="🚪" label="متى تخرج"  text={stock.analysis.exitNote} />
          <PlanRow icon="⚠️" label="انتبه لـ"   text={stock.analysis.watchout} warn />
        </div>
        <div style={{ marginTop: 10, padding: "10px 14px", background: "#0a0d10", borderRadius: 10, fontSize: 12, color: "#555", lineHeight: 1.8 }}>{stock.analysis.summary}</div>
      </div>

      {/* ── 2×2 Chart Grid ── */}
      <div style={{ ...card, padding: 0, overflow: "hidden", marginTop: 12 }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #161d26" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa" }}>📊 شارتات {stock.symbol} — 4 إطارات زمنية</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#111" }}>
          {CHARTS.map((c, i) => (
            <div key={i} style={{ background: "#0b0f14" }}>
              <div style={{ padding: "6px 12px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{c.label}</span>
                <span style={{ fontSize: 10, color: "#333" }}>{c.tip}</span>
              </div>
              <TradingViewChart key={`${symbol}-${i}`} symbol={stock.symbol} interval={c.interval} studies={c.studies} height={290} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#333", marginBottom: 5 }}>لماذا اخترنا هذا السهم؟</div>
        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>{stock.whyPick}</div>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#222", padding: "14px 0" }}>⚠️ للاسترشاد فقط — ليست توصية استثمارية</p>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────
const card: React.CSSProperties = { background: "#0b0f14", border: "1px solid #161d26", borderRadius: 14, padding: "14px 18px" };
const gBtn: React.CSSProperties = { marginTop: 12, padding: "8px 20px", background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 };

function Tag({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: color + "18", color, border: `1px solid ${color}33` }}>{label}</span>;
}

function IndicatorCard({ label, value, bull, note }: { label: string; value: string; bull: boolean; note: string }) {
  const c = bull ? "#22c55e" : "#ef4444";
  return (
    <div style={{ background: "#0a0d10", border: `1px solid ${c}22`, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{bull ? "▲" : "▼"} {value}</div>
      <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{note}</div>
    </div>
  );
}

function CalcBox({ label, price, pct, amount, color, bg }: { label: string; price: number; pct: string; amount: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 10, padding: 12, textAlign: "center" }}>
      <div style={{ fontSize: 11, color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#e0e0e0" }}>{price.toFixed(2)}</div>
      <div style={{ fontSize: 12, color, marginTop: 2 }}>{pct}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 4 }}>{amount}</div>
    </div>
  );
}

function PlanRow({ icon, label, text, warn }: { icon: string; label: string; text: string; warn?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 10, background: "#0a0d10", borderRadius: 10, padding: "10px 14px" }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: warn ? "#fb923c" : "#444", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{text}</div>
      </div>
    </div>
  );
}
