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
  const [data, setData]   = useState<ApiData | null>(null);
  const [tab, setTab]     = useState<"spec"|"inv">("spec");
  const [ts, setTs]       = useState("");
  const [pulse, setPulse] = useState(false);

  const load = useCallback(() => {
    fetch("/api/market").then(r => r.json()).then(d => {
      setData(d);
      setTs(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }));
      setPulse(p => !p);
    }).catch(() => {});
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 60_000); return () => clearInterval(id); }, [load]);

  const liveMap = new Map<string, LiveStock>((data?.stocks ?? []).map(s => [s.symbol, s]));
  const isOpen = data?.status === "open";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .s305-root {
          background: #04060d;
          min-height: 100svh;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          position: relative;
          overflow-x: hidden;
        }
        .s305-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.08) 0%, transparent 60%),
            linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px);
          background-size: 100% 100%, 60px 60px, 60px 60px;
          pointer-events: none;
          z-index: 0;
        }
        .s305-content { position: relative; z-index: 1; }

        /* ── Top Bar ── */
        .topbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(4,6,13,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(201,168,76,0.12);
          padding: 0 20px;
          height: 56px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .topbar-logo {
          font-size: 18px; font-weight: 800; letter-spacing: 1px;
          background: linear-gradient(135deg, #E8C570, #C9A84C, #8a6e30);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .topbar-tickers { display: flex; gap: 20px; align-items: center; }
        .ticker-item { text-align: center; }
        .ticker-label { font-size: 9px; color: #3a4a5e; text-transform: uppercase; letter-spacing: 1px; }
        .ticker-val { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #c8d0da; }
        .ticker-pct { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
        .ticker-pct.up { color: #10b981; }
        .ticker-pct.dn { color: #ef4444; }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .status-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
          border: 1px solid;
        }
        .status-open   { color: #10b981; border-color: #10b98133; background: #10b98108; }
        .status-closed { color: #475569; border-color: #47556933; background: #47556908; }
        .status-pre    { color: #f59e0b; border-color: #f59e0b33; background: #f59e0b08; }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          animation: none;
        }
        .status-open .status-dot { background: #10b981; box-shadow: 0 0 8px #10b981; animation: blink 1.5s ease-in-out infinite; }
        .status-closed .status-dot { background: #475569; }
        .status-pre    .status-dot { background: #f59e0b; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── Mobile Tabs ── */
        .mob-tabs {
          display: none;
          background: #080b14;
          border-bottom: 1px solid #0f1828;
          padding: 0 16px;
        }
        .mob-tab {
          flex: 1; padding: 12px 0;
          font-size: 13px; font-weight: 600;
          background: none; border: none; cursor: pointer;
          border-bottom: 2px solid transparent;
          color: #3a4a5e; transition: all .2s;
        }
        .mob-tab.active { color: #C9A84C; border-bottom-color: #C9A84C; }

        /* ── Main Grid ── */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 16px 20px 100px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Column Header ── */
        .col-header {
          padding: 14px 16px;
          border-radius: 16px;
          margin-bottom: 10px;
          border: 1px solid;
          position: relative;
          overflow: hidden;
        }
        .col-header::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, currentColor 0%, transparent 100%);
          opacity: 0.04;
        }
        .col-header.gold { border-color: rgba(201,168,76,0.25); color: #C9A84C; }
        .col-header.blue { border-color: rgba(59,130,246,0.25); color: #60a5fa; }
        .col-title { font-size: 15px; font-weight: 800; position: relative; }
        .col-sub { font-size: 11px; color: #3a4a5e; margin-top: 2px; font-weight: 400; position: relative; }

        /* ── Stock Card ── */
        .scard {
          background: #080b14;
          border: 1px solid #0f1828;
          border-radius: 16px;
          padding: 13px 14px;
          cursor: pointer;
          width: 100%;
          text-align: right;
          transition: border-color .25s, background .25s, transform .15s;
          position: relative;
          overflow: hidden;
          margin-bottom: 8px;
          display: block;
        }
        .scard::after {
          content: '';
          position: absolute;
          top: 0; right: 0; left: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
          opacity: 0;
          transition: opacity .3s;
        }
        .scard:hover { border-color: rgba(201,168,76,0.35); background: #0c101c; transform: translateY(-1px); }
        .scard:hover::after { opacity: 1; }
        .scard:active { transform: translateY(0); }

        .scard-row1 { display: flex; align-items: center; gap: 8px; }

        /* Signal badge */
        .sig-badge {
          padding: 4px 10px; border-radius: 8px;
          font-size: 12px; font-weight: 700;
          flex-shrink: 0; min-width: 90px; text-align: center;
          border: 1px solid;
        }
        .sig-strong-buy { color:#22c55e; background:#05200e; border-color:#22c55e33; }
        .sig-buy        { color:#86efac; background:#071a0c; border-color:#86efac33; }
        .sig-neutral    { color:#C9A84C; background:#1a140a; border-color:#C9A84C33; }
        .sig-sell       { color:#fca5a5; background:#1a0808; border-color:#fca5a533; }
        .sig-strong-sell{ color:#ef4444; background:#200505; border-color:#ef444433; }

        .scard-name { font-size: 14px; font-weight: 700; color: #d0d8e4; }
        .scard-symbol { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #C9A84C; font-weight: 600; }
        .scard-tier { font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600; }

        .scard-price { text-align: left; flex-shrink: 0; min-width: 60px; }
        .scard-price-val { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #d0d8e4; }
        .scard-price-pct { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
        .scard-price-pct.up { color: #10b981; }
        .scard-price-pct.dn { color: #ef4444; }

        /* Score bar */
        .score-row { margin-top: 9px; display: flex; align-items: center; gap: 8px; }
        .score-label { font-size: 10px; color: #2a3848; flex-shrink: 0; }
        .score-track { flex: 1; height: 4px; background: #0d1422; border-radius: 2px; overflow: hidden; }
        .score-fill { height: 100%; border-radius: 2px; transition: width .6s cubic-bezier(.34,1.56,.64,1); }
        .score-val { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; flex-shrink: 0; }

        /* Indicator chips */
        .chips-row { display: flex; gap: 3px; flex-wrap: wrap; justify-content: flex-end; margin-top: 7px; }
        .chip {
          font-size: 9.5px; padding: 2px 6px; border-radius: 4px;
          font-weight: 600; border: 1px solid;
          font-family: 'JetBrains Mono', monospace;
        }
        .chip-bull { color: #10b981; background: #052010; border-color: #10b98122; }
        .chip-bear { color: #ef4444; background: #200505; border-color: #ef444422; }

        /* Flow bar */
        .flow-row { margin-top: 7px; display: flex; align-items: center; gap: 7px; }
        .flow-label { font-size: 10px; font-weight: 700; }
        .flow-track { flex: 1; height: 3px; background: #0d1422; border-radius: 2px; overflow: hidden; }
        .flow-fill  { height: 100%; border-radius: 2px; transition: width .6s; }
        .flow-pct   { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2a3848; }

        /* ── Mobile Bottom Nav ── */
        .bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: rgba(4,6,13,0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(201,168,76,0.1);
          height: 64px;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .bottom-nav-inner { display: flex; height: 100%; }
        .bnav-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          background: none; border: none; cursor: pointer;
          color: #2a3848; font-family: 'Cairo', sans-serif;
          font-size: 10px; transition: color .2s;
        }
        .bnav-item.active { color: #C9A84C; }
        .bnav-icon { font-size: 18px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .topbar { padding: 0 14px; }
          .topbar-tickers { display: none; }
          .mob-tabs { display: flex; }
          .main-grid {
            grid-template-columns: 1fr;
            padding: 10px 12px 80px;
            gap: 0;
          }
          .col-spec { display: ${tab === "spec" ? "block" : "none"}; }
          .col-inv  { display: ${tab === "inv"  ? "block" : "none"}; }
          .bottom-nav { display: block; }
          .scard { border-radius: 14px; }
          .topbar-logo { font-size: 16px; }
        }

        /* ── Scroll ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a2535; border-radius: 2px; }

        /* ── Disclaimer ── */
        .disclaimer { text-align: center; font-size: 10px; color: #1a2535; padding: 20px 0 30px; }
      `}</style>

      <div className="s305-root">
        <div className="s305-content">

          {/* ── Top Bar ── */}
          <div className="topbar">
            <div className="topbar-logo">SAHM 305</div>

            {data && (
              <div className="topbar-tickers">
                <div className="ticker-item">
                  <div className="ticker-label">تاسي</div>
                  <div className="ticker-val">{data.market.tasi.value.toLocaleString()}</div>
                  <div className={`ticker-pct ${data.market.tasi.changePct >= 0 ? "up" : "dn"}`}>
                    {data.market.tasi.changePct >= 0 ? "+" : ""}{data.market.tasi.changePct.toFixed(2)}%
                  </div>
                </div>
                <div style={{ width: 1, height: 28, background: "#0f1828" }} />
                <div className="ticker-item">
                  <div className="ticker-label">برنت $</div>
                  <div className="ticker-val">{data.market.oil.value.toFixed(1)}</div>
                  <div className={`ticker-pct ${data.market.oil.changePct >= 0 ? "up" : "dn"}`}>
                    {data.market.oil.changePct >= 0 ? "+" : ""}{data.market.oil.changePct.toFixed(2)}%
                  </div>
                </div>
                <div style={{ width: 1, height: 28, background: "#0f1828" }} />
                <div className="ticker-item">
                  <div className="ticker-label">السوق</div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#10b981" }}>▲{data.market.breadth.advancing}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#ef4444" }}>▼{data.market.breadth.declining}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="topbar-right">
              {ts && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#2a3848" }}>{ts}</span>}
              <div className={`status-pill ${data?.status === "open" ? "status-open" : data?.status === "pre" ? "status-pre" : "status-closed"}`}>
                <span className="status-dot" />
                {data?.status === "open" ? "مفتوح" : data?.status === "pre" ? "ما قبل الجلسة" : "مغلق"}
              </div>
              <button onClick={load} style={{ background: "none", border: "1px solid #0f1828", borderRadius: 8, padding: "4px 10px", color: "#2a3848", cursor: "pointer", fontSize: 12 }}>↻</button>
            </div>
          </div>

          {/* ── Mobile Tabs ── */}
          <div className="mob-tabs">
            <button className={`mob-tab ${tab === "spec" ? "active" : ""}`} onClick={() => setTab("spec")}>⚡ مضاربة</button>
            <button className={`mob-tab ${tab === "inv"  ? "active" : ""}`} onClick={() => setTab("inv")}>📈 استثمار</button>
          </div>

          {/* ── Main Grid ── */}
          <div className="main-grid">

            {/* RIGHT — مضاربة */}
            <div className={`col-spec`} style={{ display: tab === "spec" || true ? undefined : "none" }}>
              <div className="col-header gold">
                <div className="col-title">⚡ مضاربة يومية</div>
                <div className="col-sub">دخول وخروج سريع · مستهدف 4,000+ ريال يومياً</div>
              </div>
              {SPECULATION_STOCKS.map(s => <StockCard key={"sp"+s.symbol} stock={s} live={liveMap.get(s.symbol)} />)}
            </div>

            {/* LEFT — استثمار */}
            <div className={`col-inv`} style={{ display: tab === "inv" || true ? undefined : "none" }}>
              <div className="col-header blue">
                <div className="col-title">📈 استثمار</div>
                <div className="col-sub">نمو وعوائد طويلة الأمد · أشهر إلى سنوات</div>
              </div>
              {INVESTMENT_STOCKS.map(s => <StockCard key={"inv"+s.symbol} stock={s} live={liveMap.get(s.symbol)} />)}
            </div>

          </div>

          <div className="disclaimer">⚠️ للاسترشاد فقط — ليست توصية استثمارية</div>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <button className="bnav-item active"><span className="bnav-icon">📊</span>الرادار</button>
          <button className="bnav-item" onClick={() => setTab("spec")}><span className="bnav-icon">⚡</span>مضاربة</button>
          <button className="bnav-item" onClick={() => setTab("inv")}><span className="bnav-icon">📈</span>استثمار</button>
          <button className="bnav-item"><span className="bnav-icon">👤</span>حسابي</button>
        </div>
      </div>
    </>
  );
}

// ── Stock Card Component ──────────────────────────────────────────
function StockCard({ stock, live }: { stock: StockDef; live?: LiveStock }) {
  const router = useRouter();
  const price   = live?.price  ?? 0;
  const change  = live?.change ?? 0;
  const bp      = live?.buyPressure ?? 50;
  const flow    = live?.flow ?? "محايد";
  const ts      = live?.techScore ?? 50;
  const bull    = live?.bullishCount ?? 0;
  const bear    = live?.bearishCount ?? 0;

  const sigEn = live?.techSignalEn ?? "neutral";
  const sigTx = live?.techSignal   ?? stock.lastSignal;
  const sigCls = sigEn === "strong_buy" ? "sig-strong-buy" : sigEn === "buy" ? "sig-buy"
    : sigEn === "sell" ? "sig-sell" : sigEn === "strong_sell" ? "sig-strong-sell" : "sig-neutral";
  const sigIcon = (sigEn === "strong_buy" || sigEn === "buy") ? "🟢" : (sigEn === "sell" || sigEn === "strong_sell") ? "🔴" : "🟡";

  const tier = TIER_CONFIG[stock.tier] ?? { label: stock.tier, color: "text-gold-bright" };
  const tierColor = tier.color === "text-gold-bright" ? "#C9A84C" : tier.color === "text-blue" ? "#60a5fa" : tier.color === "text-green" ? "#10b981" : "#fb923c";
  const scoreColor = ts >= 65 ? "#10b981" : ts >= 48 ? "#C9A84C" : "#ef4444";
  const flowColor  = flow === "تجميع" ? "#10b981" : flow === "تصريف" ? "#ef4444" : "#3a4a5e";

  return (
    <button className="scard" onClick={() => router.push(`/dashboard/stock/${stock.symbol}`)}>
      {/* Row 1 */}
      <div className="scard-row1">
        <div className={`sig-badge ${sigCls}`}>{sigIcon} {sigTx}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <span className="scard-name">{stock.name}</span>
            <span className="scard-symbol">{stock.symbol}</span>
            <span className="scard-tier" style={{ color: tierColor, background: tierColor + "15", border: `1px solid ${tierColor}33` }}>{tier.label}</span>
          </div>
        </div>
        <div className="scard-price">
          {price > 0 ? (
            <>
              <div className="scard-price-val">{price.toFixed(2)}</div>
              <div className={`scard-price-pct ${change >= 0 ? "up" : "dn"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</div>
            </>
          ) : <span style={{ color: "#1a2535", fontSize: 16 }}>—</span>}
        </div>
      </div>

      {/* Confluence score */}
      {live && (
        <>
          <div className="score-row">
            <span className="score-label">قوة الإشارة</span>
            <div className="score-track">
              <div className="score-fill" style={{ width: `${ts}%`, background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})` }} />
            </div>
            <span className="score-val" style={{ color: scoreColor }}>{ts}%</span>
          </div>

          {/* Indicator chips */}
          <div className="chips-row">
            <span className={`chip ${live.rsi < 50 ? "chip-bull" : "chip-bear"}`}>RSI {live.rsi}</span>
            <span className={`chip ${live.macdBullish ? "chip-bull" : "chip-bear"}`}>MACD {live.macdBullish ? "↑" : "↓"}</span>
            <span className={`chip ${live.bbPct < 40 ? "chip-bull" : "chip-bear"}`}>BB {live.bbPct}%</span>
            <span className={`chip ${live.stoch < 40 ? "chip-bull" : "chip-bear"}`}>STOCH {live.stoch}</span>
            <span className={`chip ${live.ema20Above ? "chip-bull" : "chip-bear"}`}>EMA20 {live.ema20Above ? "↑" : "↓"}</span>
            <span className={`chip ${live.ema50Above ? "chip-bull" : "chip-bear"}`}>EMA50 {live.ema50Above ? "↑" : "↓"}</span>
          </div>

          {/* Flow */}
          <div className="flow-row">
            <span className="flow-label" style={{ color: flowColor }}>
              {flow === "تجميع" ? "🟢" : flow === "تصريف" ? "🔴" : "🟡"} {flow}
            </span>
            <div className="flow-track">
              <div className="flow-fill" style={{ width: `${bp}%`, background: bp > 55 ? "#10b981" : bp < 45 ? "#ef4444" : "#C9A84C" }} />
            </div>
            <span className="flow-pct">{bull}↑ {bear}↓</span>
          </div>
        </>
      )}
    </button>
  );
}
