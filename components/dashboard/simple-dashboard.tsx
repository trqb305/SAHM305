"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SPECULATION_STOCKS, INVESTMENT_STOCKS, SIGNAL_CONFIG, TIER_CONFIG, type StockDef } from "@/lib/stocks-data";

interface LiveStock {
  symbol: string; price: number; change: number; high: number; low: number;
  volume: number; buyPressure: number; flow: "تجميع"|"تصريف"|"محايد"; flowLabel: string;
  techScore: number; techSignal: string; techSignalEn: string;
  rsi: number; macdBullish: boolean; bbPct: number; stoch: number;
  ema20Above: boolean; ema50Above: boolean; adx: number;
  bullishCount: number; bearishCount: number;
}

interface ApiData {
  status: "open"|"closed"|"pre";
  market: { tasi: { value: number; changePct: number }; oil: { value: number; changePct: number }; breadth: { advancing: number; declining: number } };
  decision: { score: number; direction: string; verdict: string };
  stocks: LiveStock[];
}

export function SimpleDashboard() {
  const [data, setData] = useState<ApiData | null>(null);
  const [ts, setTs]     = useState("");

  const load = useCallback(() => {
    fetch("/api/market").then(r => r.json()).then(d => {
      setData(d);
      setTs(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }));
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 60_000); return () => clearInterval(id); }, [load]);

  const liveMap = new Map<string, LiveStock>((data?.stocks ?? []).map(s => [s.symbol, s]));

  return (
    <div style={{ background: "#06080b", minHeight: "100vh" }}>

      {/* ── Top Bar ── */}
      <div style={{ background: "#0b0f14", borderBottom: "1px solid #161d26", padding: "10px 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#C9A84C", letterSpacing: 1 }}>سهم 305</span>
            <StatusDot status={data?.status} />
          </div>
          {data && (
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <Ticker label="تاسي"    val={data.market.tasi.value.toLocaleString()} pct={data.market.tasi.changePct} />
              <Ticker label="برنت $"  val={data.market.oil.value.toFixed(1)}        pct={data.market.oil.changePct} />
              <div style={{ fontSize: 12, color: "#555" }}>
                <span style={{ color: "#4ade80" }}>▲{data.market.breadth.advancing}</span>
                {" · "}
                <span style={{ color: "#f87171" }}>▼{data.market.breadth.declining}</span>
              </div>
              <span style={{ fontSize: 11, color: "#333" }}>{ts}</span>
              <button onClick={load} style={{ fontSize: 11, color: "#444", background: "none", border: "1px solid #1e2630", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>↻</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Columns ── */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "14px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        <div>
          <ColHeader icon="⚡" title="مضاربة يومية" sub="أسهم سريعة — دخول وخروج في نفس اليوم" color="#C9A84C" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SPECULATION_STOCKS.map(s => <StockCard key={"sp"+s.symbol} stock={s} live={liveMap.get(s.symbol)} />)}
          </div>
        </div>

        <div>
          <ColHeader icon="📈" title="استثمار" sub="أسهم نمو وعوائد — أشهر إلى سنوات" color="#60a5fa" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INVESTMENT_STOCKS.map(s => <StockCard key={"inv"+s.symbol} stock={s} live={liveMap.get(s.symbol)} />)}
          </div>
        </div>

      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#222", paddingBottom: 20 }}>⚠️ للاسترشاد فقط — ليست توصية استثمارية</p>
    </div>
  );
}

// ── Stock Card ─────────────────────────────────────────────────────
function StockCard({ stock, live }: { stock: StockDef; live?: LiveStock }) {
  const router = useRouter();
  const price  = live?.price ?? 0;
  const change = live?.change ?? 0;

  // Prefer live tech signal if available, else use static
  const techScore  = live?.techScore ?? 50;
  const techSignal = live?.techSignal ?? stock.lastSignal;
  const bull       = live?.bullishCount ?? 0;
  const bear       = live?.bearishCount ?? 0;
  const total      = bull + bear;

  // Resolve signal colors
  const isStrongBuy  = live?.techSignalEn === "strong_buy";
  const isBuy        = live?.techSignalEn === "buy";
  const isNeutral    = live?.techSignalEn === "neutral" || !live;
  const isSell       = live?.techSignalEn === "sell";
  const isStrongSell = live?.techSignalEn === "strong_sell";

  const sigColor = isStrongBuy ? "#22c55e" : isBuy ? "#86efac" : isSell ? "#fca5a5" : isStrongSell ? "#ef4444" : "#888";
  const sigBg    = isStrongBuy ? "#052010" : isBuy ? "#0a1f10" : isSell ? "#1f0808" : isStrongSell ? "#2a0505" : "#111";
  const sigIcon  = isStrongBuy ? "🟢" : isBuy ? "🟢" : isSell ? "🔴" : isStrongSell ? "🔴" : "🟡";

  const tier = TIER_CONFIG[stock.tier] ?? { label: stock.tier, color: "text-gold-bright" };
  const tierColor = tier.color === "text-gold-bright" ? "#C9A84C" : tier.color === "text-blue" ? "#60a5fa" : tier.color === "text-green" ? "#4ade80" : "#fb923c";

  const bp   = live?.buyPressure ?? 50;
  const flow = live?.flow ?? "محايد";
  const flowColor = flow === "تجميع" ? "#4ade80" : flow === "تصريف" ? "#f87171" : "#555";

  // Score bar color
  const scoreColor = techScore >= 65 ? "#22c55e" : techScore >= 50 ? "#C9A84C" : "#ef4444";

  return (
    <button
      onClick={() => router.push(`/dashboard/stock/${stock.symbol}`)}
      style={{ background: "#0b0f14", border: "1px solid #161d26", borderRadius: 12, padding: "12px 14px", cursor: "pointer", textAlign: "right", width: "100%", transition: "border-color .2s, background .2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A84C55"; e.currentTarget.style.background = "#0e1318"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#161d26";   e.currentTarget.style.background = "#0b0f14"; }}
    >
      {/* Row 1: Signal + Name + Price */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Signal */}
        <div style={{ background: sigBg, border: `1px solid ${sigColor}55`, borderRadius: 8, padding: "4px 10px", flexShrink: 0, textAlign: "center", minWidth: 88 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: sigColor }}>{sigIcon} {techSignal}</div>
        </div>

        {/* Name */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#ddd" }}>{stock.name}</span>
            <span style={{ fontSize: 11, color: "#C9A84C", fontWeight: 700 }}>{stock.symbol}</span>
            <span style={{ fontSize: 10, color: tierColor, background: tierColor + "18", padding: "1px 6px", borderRadius: 4 }}>{tier.label}</span>
          </div>
        </div>

        {/* Price */}
        <div style={{ textAlign: "left", flexShrink: 0, minWidth: 62 }}>
          {price > 0 ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e0e0" }}>{price.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: change >= 0 ? "#4ade80" : "#f87171" }}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</div>
            </>
          ) : <span style={{ color: "#333", fontSize: 13 }}>—</span>}
        </div>
      </div>

      {/* Row 2: Confluence score + indicators */}
      {live && (
        <div style={{ marginTop: 9 }}>
          {/* Score bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: "#444", flexShrink: 0 }}>قوة الإشارة</span>
            <div style={{ flex: 1, height: 5, background: "#111", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${techScore}%`, height: "100%", background: scoreColor, borderRadius: 3, transition: "width .5s" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor, flexShrink: 0 }}>{techScore}%</span>
          </div>

          {/* Mini indicators row */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <MiniTag label={`RSI ${live.rsi}`}    bull={live.rsi < 50} />
            <MiniTag label="MACD"                  bull={live.macdBullish} />
            <MiniTag label={`BB ${live.bbPct}%`}  bull={live.bbPct < 40} />
            <MiniTag label={`Stoch ${live.stoch}`} bull={live.stoch < 40} />
            <MiniTag label="EMA20"                 bull={live.ema20Above} />
            <MiniTag label="EMA50"                 bull={live.ema50Above} />
          </div>

          {/* Flow */}
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: flowColor, fontWeight: 600 }}>
              {flow === "تجميع" ? "🟢" : flow === "تصريف" ? "🔴" : "🟡"} {live.flowLabel}
            </span>
            <span style={{ fontSize: 10, color: "#333", marginRight: "auto" }}>
              {bull}↑ {bear}↓ من {total} مؤشر
            </span>
          </div>
        </div>
      )}
    </button>
  );
}

// ── Mini indicator tag ─────────────────────────────────────────────
function MiniTag({ label, bull }: { label: string; bull: boolean }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: bull ? "#052010" : "#1f0808", color: bull ? "#4ade80" : "#f87171", border: `1px solid ${bull ? "#4ade8033" : "#f8717133"}` }}>
      {bull ? "▲" : "▼"} {label}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────
function ColHeader({ icon, title, sub, color }: { icon: string; title: string; sub: string; color: string }) {
  return (
    <div style={{ marginBottom: 10, padding: "10px 14px", background: "#0b0f14", border: `1px solid ${color}22`, borderRadius: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{icon} {title}</div>
      <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Ticker({ label, val, pct }: { label: string; val: string; pct: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#444" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>{val}</div>
      <div style={{ fontSize: 11, color: pct >= 0 ? "#4ade80" : "#f87171" }}>{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</div>
    </div>
  );
}

function StatusDot({ status }: { status?: string }) {
  const c = status === "open" ? "#22c55e" : status === "pre" ? "#fbbf24" : "#555";
  const t = status === "open" ? "السوق مفتوح" : status === "pre" ? "قبل الجلسة" : "السوق مغلق";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block", boxShadow: status === "open" ? `0 0 8px ${c}` : "none" }} />
      {t}
    </div>
  );
}
