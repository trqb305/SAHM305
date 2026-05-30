"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TradingViewChart } from "./tradingview-chart";
import { getStockBySymbol, SIGNAL_CONFIG, TIER_CONFIG, RISK_CONFIG } from "@/lib/stocks-data";

const CHARTS = [
  { arabicLabel: "📊 15 دقيقة — الدخول الدقيق",   interval: "15", studies: ["RSI@tv-basicstudies",   "Stochastic@tv-basicstudies"], tip: "RSI + ستوكاستيك — متى السهم رخيص أو غالٍ" },
  { arabicLabel: "📈 ساعي — الاتجاه القصير",       interval: "60", studies: ["MACD@tv-basicstudies",  "MASimple@tv-basicstudies"],   tip: "MACD + متوسط متحرك — هل الزخم صاعد أم هابط" },
  { arabicLabel: "📅 يومي — الصورة الكاملة",       interval: "D",  studies: ["BB@tv-basicstudies",    "Volume@tv-basicstudies"],     tip: "بولنجر باند + حجم تداول — متى السهم بعيد عن طبيعته" },
  { arabicLabel: "📆 أسبوعي — الاتجاه الكبير",     interval: "W",  studies: ["MAExp@tv-basicstudies", "RSI@tv-basicstudies"],        tip: "EMA + RSI أسبوعي — هل الاتجاه الكبير صاعد أم هابط" },
];

interface LiveData {
  price: number; changePct: number; high: number; low: number;
  volume: number; buyPressure: number;
  flow: "تجميع" | "تصريف" | "محايد"; flowLabel: string;
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
      if (s) setLive({ price: s.price, changePct: s.change, high: s.high, low: s.low, volume: s.volume, buyPressure: s.buyPressure ?? 50, flow: s.flow ?? "محايد", flowLabel: s.flowLabel ?? "محايد" });
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
  const sig       = SIGNAL_CONFIG[stock.lastSignal];
  const tier      = TIER_CONFIG[stock.tier];
  const risk      = RISK_CONFIG[stock.riskLevel];

  const entryPrice  = price > 0 ? price : 50;
  const targetPrice = +(entryPrice * (1 + stock.targetPct / 100)).toFixed(2);
  const stopPrice   = +(entryPrice * (1 - stock.stopPct / 100)).toFixed(2);
  const shares      = Math.floor(capital / entryPrice);
  const profit      = Math.round(shares * (targetPrice - entryPrice));
  const loss        = Math.round(shares * (entryPrice - stopPrice));
  const rr          = (profit / loss).toFixed(1);

  const flowColor = flow === "تجميع" ? "#4ade80" : flow === "تصريف" ? "#f87171" : "#888";
  const sigBg     = sig.color === "text-green" ? "#0d2b1a" : sig.color === "text-red" ? "#2b0d0d" : "#2b2200";
  const sigClr    = sig.color === "text-green" ? "#4ade80" : sig.color === "text-red" ? "#f87171" : "#fbbf24";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "#080c10", minHeight: "100vh" }}>

      <button onClick={() => router.back()} style={{ color: "#555", background: "none", border: "none", cursor: "pointer", fontSize: 13, marginBottom: 12 }}>← رجوع</button>

      {/* ── Header ── */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: "#C9A84C", fontWeight: 700, fontSize: 18 }}>{stock.symbol}</span>
              <span style={{ fontSize: 20, fontWeight: 600, color: "#e8e8e8" }}>{stock.name}</span>
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#666" }}>
              <span style={{ color: "#C9A84C" }}>{tier.label}</span>·
              <span style={{ color: risk.color === "text-green" ? "#4ade80" : risk.color === "text-red" ? "#f87171" : "#fbbf24" }}>{risk.label}</span>·
              <span>⏱ {stock.holdPeriod}</span>
            </div>
          </div>
          <div style={{ background: sigBg, border: `1px solid ${sigClr}44`, borderRadius: 12, padding: "10px 22px", textAlign: "center" }}>
            <div style={{ fontSize: 24 }}>{sig.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: sigClr }}>{sig.label}</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{stock.signalReason}</div>
          </div>
        </div>
        {price > 0 && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#e8e8e8" }}>{price.toFixed(2)}</span>
            <span style={{ color: "#555" }}>ريال</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: changePct >= 0 ? "#4ade80" : "#f87171" }}>{changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%</span>
            <span style={{ fontSize: 13, color: "#555" }}>أعلى {live?.high.toFixed(2)} · أدنى {live?.low.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* ── Supply / Demand ── */}
      <div style={{ ...card, border: `1px solid ${flowColor}33`, marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa", marginBottom: 10 }}>📊 مؤشر العرض والطلب — تجميع أم تصريف؟</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ background: flow === "تجميع" ? "#0d2b1a" : flow === "تصريف" ? "#2b0d0d" : "#141414", border: `1px solid ${flowColor}44`, borderRadius: 10, padding: "12px 22px", textAlign: "center", minWidth: 120 }}>
            <div style={{ fontSize: 28 }}>{flow === "تجميع" ? "🟢" : flow === "تصريف" ? "🔴" : "🟡"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: flowColor, marginTop: 4 }}>{flow}</div>
            <div style={{ fontSize: 11, color: "#555" }}>{live?.flowLabel ?? "—"}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginBottom: 5 }}>
              <span>🔴 بيع</span><span>🟢 شراء</span>
            </div>
            <div style={{ height: 14, background: "#1a1a1a", borderRadius: 7, overflow: "hidden" }}>
              <div style={{ width: `${bp}%`, height: "100%", background: bp > 55 ? "#4ade80" : bp < 45 ? "#f87171" : "#888", borderRadius: 7, transition: "width .6s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginTop: 5 }}>
              <span>{100 - bp}% ضغط بيع</span><span>{bp}% ضغط شراء</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#555", maxWidth: 220, lineHeight: 1.7 }}>
            {flow === "تجميع" && "الشراء أقوى — الكبار يجمعون. إشارة دخول إيجابية."}
            {flow === "تصريف" && "البيع أقوى — الكبار يفرغون. انتظر أو تجنب الدخول."}
            {flow === "محايد" && "الضغط متوازن — انتظر إشارة أوضح قبل الدخول."}
          </div>
        </div>
      </div>

      {/* ── Profit Calculator ── */}
      <div style={{ ...card, border: "1px solid #2a1f0a", marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C", marginBottom: 10 }}>💰 حاسبة الربح والخسارة</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#555" }}>رأس المال:</label>
          <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value) || CAPITAL)}
            style={{ width: 120, background: "#0a0f14", border: "1px solid #222", borderRadius: 8, padding: "6px 10px", color: "#e8e8e8", fontSize: 14, textAlign: "center" }}
            step={5000} min={5000} />
          <span style={{ fontSize: 12, color: "#444" }}>ريال</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <CalcBox label="🎯 الهدف" price={targetPrice} pct={`+${stock.targetPct}%`} amount={`+${profit.toLocaleString()} ر.س`} color="#4ade80" bg="#0d2b1a" />
          <CalcBox label="🛑 وقف الخسارة" price={stopPrice} pct={`-${stock.stopPct}%`} amount={`-${loss.toLocaleString()} ر.س`} color="#f87171" bg="#2b0d0d" />
          <div style={{ background: "#0a0f14", border: "1px solid #1e2630", borderRadius: 10, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#444", marginBottom: 6 }}>نسبة ربح/خسارة</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#C9A84C" }}>{rr}:1</div>
            <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>{shares} سهم</div>
          </div>
        </div>
      </div>

      {/* ── Trading Plan ── */}
      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa", marginBottom: 10 }}>📋 خطة التداول</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <PlanRow icon="🎯" label="متى تدخل" text={stock.analysis.entryNote} />
          <PlanRow icon="🚪" label="متى تخرج" text={stock.analysis.exitNote} />
          <PlanRow icon="⚠️" label="انتبه لـ"  text={stock.analysis.watchout} warn />
        </div>
        <div style={{ marginTop: 10, padding: "10px 14px", background: "#0a0f14", borderRadius: 10, fontSize: 12, color: "#555", lineHeight: 1.8 }}>{stock.analysis.summary}</div>
      </div>

      {/* ── 2×2 Chart Grid ── */}
      <div style={{ ...card, padding: 0, overflow: "hidden", marginTop: 12 }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #1e2630" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#aaa" }}>📊 شارتات {stock.symbol} — 4 إطارات زمنية</div>
          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>كل شارت يحتوي على أقوى مؤشرين تقنيين</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#111" }}>
          {CHARTS.map((c, i) => (
            <div key={i} style={{ background: "#0d1117" }}>
              <div style={{ padding: "7px 12px", borderBottom: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>{c.arabicLabel}</span>
                <span style={{ fontSize: 10, color: "#444", maxWidth: 160, textAlign: "left" }}>{c.tip}</span>
              </div>
              <TradingViewChart key={`${symbol}-${i}`} symbol={stock.symbol} interval={c.interval} studies={c.studies} height={300} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>لماذا اخترنا هذا السهم؟</div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8 }}>{stock.whyPick}</div>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#333", padding: "16px 0" }}>⚠️ للاسترشاد فقط — ليست توصية استثمارية</p>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────
const card: React.CSSProperties = { background: "#0d1117", border: "1px solid #1e2630", borderRadius: 14, padding: "14px 18px" };
const gBtn: React.CSSProperties = { marginTop: 12, padding: "8px 20px", background: "#C9A84C", color: "#000", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 };

function CalcBox({ label, price, pct, amount, color, bg }: { label: string; price: number; pct: string; amount: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 10, padding: 12, textAlign: "center" }}>
      <div style={{ fontSize: 11, color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#e8e8e8" }}>{price.toFixed(2)}</div>
      <div style={{ fontSize: 12, color, marginTop: 2 }}>{pct}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color, marginTop: 4 }}>{amount}</div>
    </div>
  );
}

function PlanRow({ icon, label, text, warn }: { icon: string; label: string; text: string; warn?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 10, background: "#0a0f14", borderRadius: 10, padding: "10px 14px" }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: warn ? "#fb923c" : "#444", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{text}</div>
      </div>
    </div>
  );
}
