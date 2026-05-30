"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SPECULATION_STOCKS, INVESTMENT_STOCKS, SIGNAL_CONFIG, TIER_CONFIG, type StockDef } from "@/lib/stocks-data";
import { cn } from "@/lib/cn";

interface LiveStock {
  symbol: string;
  price: number;
  change: number;
  changeAbs: number;
  high: number;
  low: number;
  volume: number;
  buyPressure: number;
  flow: "تجميع" | "تصريف" | "محايد";
  flowLabel: string;
}

interface ApiData {
  status: "open" | "closed" | "pre";
  market: {
    tasi: { value: number; changePct: number };
    oil: { value: number; changePct: number };
    breadth: { advancing: number; declining: number };
  };
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

  useEffect(() => { load(); const id = setInterval(load, 30_000); return () => clearInterval(id); }, [load]);

  const liveMap = new Map<string, LiveStock>((data?.stocks ?? []).map(s => [s.symbol, s]));

  return (
    <div className="min-h-screen" style={{ background: "#080c10" }}>

      {/* ── Top Bar ── */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #1e2630", padding: "12px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#C9A84C" }}>سهم 305</span>
            <StatusDot status={data?.status} />
          </div>

          {data && (
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Ticker label="تاسي" value={data.market.tasi.value.toLocaleString()} pct={data.market.tasi.changePct} />
              <Ticker label="برنت" value={`$${data.market.oil.value.toFixed(1)}`} pct={data.market.oil.changePct} />
              <div style={{ fontSize: 12, color: "#666" }}>
                <span style={{ color: "#4ade80" }}>▲{data.market.breadth.advancing}</span>
                {" / "}
                <span style={{ color: "#f87171" }}>▼{data.market.breadth.declining}</span>
              </div>
              <span style={{ fontSize: 11, color: "#444" }}>{ts}</span>
              <button onClick={load} style={{ fontSize: 11, color: "#555", background: "none", border: "1px solid #222", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>↻ تحديث</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Two Columns ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* RIGHT — مضاربة */}
        <div>
          <ColHeader emoji="⚡" title="أسهم المضاربة اليومية" sub="دخول وخروج سريع · ربح 4000+ ريال" color="#C9A84C" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SPECULATION_STOCKS.map(s => <StockCard key={s.symbol + "sp"} stock={s} live={liveMap.get(s.symbol)} />)}
          </div>
        </div>

        {/* LEFT — استثمار */}
        <div>
          <ColHeader emoji="📈" title="أسهم الاستثمار" sub="نمو طويل الأمد · عوائد مضمونة" color="#60a5fa" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {INVESTMENT_STOCKS.map(s => <StockCard key={s.symbol + "inv"} stock={s} live={liveMap.get(s.symbol)} />)}
          </div>
        </div>

      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#333", paddingBottom: 20 }}>
        ⚠️ للاسترشاد فقط — ليست توصية استثمارية
      </p>
    </div>
  );
}

// ── Stock Card ────────────────────────────────────────────────────

function StockCard({ stock, live }: { stock: StockDef; live?: LiveStock }) {
  const router  = useRouter();
  const price   = live?.price   ?? 0;
  const change  = live?.change  ?? 0;
  const flow    = live?.flow    ?? "محايد";
  const bp      = live?.buyPressure ?? 50;
  const sig     = SIGNAL_CONFIG[stock.lastSignal];
  const tier    = TIER_CONFIG[stock.tier];

  const flowColor = flow === "تجميع" ? "#4ade80" : flow === "تصريف" ? "#f87171" : "#888";
  const sigBg     = sig.color === "text-green" ? "#0d2b1a" : sig.color === "text-red" ? "#2b0d0d" : "#2b2200";
  const sigClr    = sig.color === "text-green" ? "#4ade80" : sig.color === "text-red" ? "#f87171" : "#fbbf24";

  return (
    <button
      onClick={() => router.push(`/dashboard/stock/${stock.symbol}`)}
      style={{
        background: "#0d1117",
        border: "1px solid #1e2630",
        borderRadius: 12,
        padding: "12px 14px",
        cursor: "pointer",
        textAlign: "right",
        width: "100%",
        transition: "border-color .2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#C9A84C44")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e2630")}
    >
      {/* Row 1: signal + name + price */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: sigBg, color: sigClr, flexShrink: 0 }}>
          {sig.icon} {sig.label}
        </span>
        <div style={{ flex: 1, textAlign: "right" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e8e8" }}>{stock.name}</span>
          <span style={{ fontSize: 11, color: "#C9A84C", marginRight: 6 }}>{stock.symbol}</span>
          <span style={{ fontSize: 10, color: tier.color === "text-gold-bright" ? "#C9A84C" : tier.color === "text-blue" ? "#60a5fa" : tier.color === "text-green" ? "#4ade80" : "#fb923c", marginRight: 4 }}>{tier.label}</span>
        </div>
        <div style={{ textAlign: "left", flexShrink: 0 }}>
          {price > 0 ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e8e8" }}>{price.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: change >= 0 ? "#4ade80" : "#f87171", textAlign: "center" }}>
                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
              </div>
            </>
          ) : <span style={{ color: "#333", fontSize: 12 }}>—</span>}
        </div>
      </div>

      {/* Row 2: flow indicator */}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: flowColor, fontWeight: 600 }}>
          {flow === "تجميع" ? "🟢" : flow === "تصريف" ? "🔴" : "🟡"} {live?.flowLabel ?? "لا توجد بيانات"}
        </span>
        {live && (
          <div style={{ flex: 1, height: 4, background: "#1e2630", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${bp}%`, height: "100%", background: bp > 55 ? "#4ade80" : bp < 45 ? "#f87171" : "#888", borderRadius: 4, transition: "width .5s" }} />
          </div>
        )}
        {live && <span style={{ fontSize: 10, color: "#555" }}>{bp}% شراء</span>}
      </div>
    </button>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function ColHeader({ emoji, title, sub, color }: { emoji: string; title: string; sub: string; color: string }) {
  return (
    <div style={{ marginBottom: 12, padding: "10px 14px", background: "#0d1117", border: `1px solid ${color}33`, borderRadius: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{emoji} {title}</div>
      <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function Ticker({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#555" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd" }}>{value}</div>
      <div style={{ fontSize: 11, color: pct >= 0 ? "#4ade80" : "#f87171" }}>{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</div>
    </div>
  );
}

function StatusDot({ status }: { status?: string }) {
  const color = status === "open" ? "#4ade80" : status === "pre" ? "#fbbf24" : "#666";
  const label = status === "open" ? "مفتوح" : status === "pre" ? "ما قبل الجلسة" : "مغلق";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", boxShadow: status === "open" ? `0 0 6px ${color}` : "none" }} />
      {label}
    </div>
  );
}
