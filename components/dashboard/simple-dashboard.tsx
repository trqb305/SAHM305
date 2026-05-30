"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SPECULATION_STOCKS, INVESTMENT_STOCKS, SIGNAL_CONFIG, type StockDef } from "@/lib/stocks-data";

interface LiveStock {
  symbol: string;
  price: number;
  change: number;
}

export function SimpleDashboard() {
  const [live, setLive] = useState<Map<string, LiveStock>>(new Map());
  const [tab, setTab] = useState<"speculation" | "investment">("speculation");

  useEffect(() => {
    fetch("/api/market")
      .then((r) => r.json())
      .then((d) => {
        const map = new Map<string, LiveStock>();
        (d.stocks ?? []).forEach((s: any) => map.set(s.symbol, s));
        setLive(map);
      })
      .catch(() => {});
  }, []);

  const stocks = tab === "speculation" ? SPECULATION_STOCKS : INVESTMENT_STOCKS;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px", fontFamily: "inherit" }}>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>سهم <span style={{ color: "#C9A84C" }}>305</span></div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>أفضل أسهم اليوم — السوق السعودي</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", marginBottom: 20, border: "1px solid #2a2a2a" }}>
        <TabBtn active={tab === "speculation"} onClick={() => setTab("speculation")} label="⚡ مضاربة" />
        <TabBtn active={tab === "investment"} onClick={() => setTab("investment")} label="📈 استثمار" />
      </div>

      {/* Stock List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stocks.map((s) => (
          <StockRow key={s.symbol + s.type} stock={s} liveData={live.get(s.symbol)} />
        ))}
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 24 }}>
        ⚠️ للاسترشاد فقط — ليست توصية استثمارية
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 0",
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        background: active ? "#C9A84C" : "transparent",
        color: active ? "#000" : "#888",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}

function StockRow({ stock, liveData }: { stock: StockDef; liveData?: LiveStock }) {
  const router = useRouter();
  const sig = SIGNAL_CONFIG[stock.lastSignal];
  const price = liveData?.price ?? 0;
  const change = liveData?.change ?? 0;

  return (
    <button
      onClick={() => router.push(`/dashboard/stock/${stock.symbol}`)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderRadius: 14,
        background: "#0f0f0f",
        border: "1px solid #1e1e1e",
        cursor: "pointer",
        textAlign: "right",
        width: "100%",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C9A84C55")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1e1e1e")}
    >
      {/* Signal */}
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        padding: "5px 12px",
        borderRadius: 8,
        background: sig.color === "text-green" ? "#0a2a0a" : sig.color === "text-red" ? "#2a0a0a" : "#2a240a",
        color: sig.color === "text-green" ? "#4ade80" : sig.color === "text-red" ? "#f87171" : "#fbbf24",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {sig.icon} {sig.label}
      </div>

      {/* Name */}
      <div style={{ flex: 1, padding: "0 14px" }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: "#f0f0f0" }}>{stock.name}</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{stock.signalReason}</div>
      </div>

      {/* Price */}
      <div style={{ textAlign: "left", flexShrink: 0 }}>
        {price > 0 ? (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0" }}>{price.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: change >= 0 ? "#4ade80" : "#f87171" }}>
              {change >= 0 ? "+" : ""}{change.toFixed(2)}%
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: "#444" }}>—</div>
        )}
      </div>
    </button>
  );
}
