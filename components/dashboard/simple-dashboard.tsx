"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────
interface LiveStock {
  symbol: string; name: string; sector: string;
  price: number; change: number; changeAbs: number;
  high: number; low: number; volume: number;
  buyPressure: number; flow: "تجميع"|"تصريف"|"محايد"; flowLabel: string;
  techScore: number; techSignal: string; techSignalEn: string;
  rsi: number; macdBullish: boolean; macdHist: number;
  bbPct: number; stoch: number;
  ema20Above: boolean; ema50Above: boolean;
  adx: number; vwap: number; priceVsVwap: "above"|"below";
  bullishCount: number; bearishCount: number;
}

interface ApiData {
  status: "open"|"closed"|"pre";
  market: {
    tasi: { value: number; changePct: number; high: number; low: number };
    oil:  { value: number; changePct: number };
    breadth: { advancing: number; declining: number; total: number };
  };
  decision: { score: number; direction: string; verdict: string };
  stocks: LiveStock[];  // already sorted by techScore DESC from API
}

// ── Investment-grade symbols (blue chip + growth for long-term) ───────
const INVEST_SYMBOLS = new Set(["1140","7010","1120","2010","1211","2300","2050","4002","4190","4280"]);

// ── Dynamic stock selection ───────────────────────────────────────────
function selectSpeculation(stocks: LiveStock[]): LiveStock[] {
  // مضاربة: فقط إشارات دخول — مرتبة بالنتيجة الأعلى
  const buys = stocks.filter(
    s => s.techSignalEn === "strong_buy" || s.techSignalEn === "buy"
  );
  // إذا أقل من 4 أسهم بإشارة دخول — أكمّل بأعلى نتائج
  if (buys.length >= 4) return buys.slice(0, 10);
  const rest = stocks.filter(s => s.techSignalEn !== "strong_buy" && s.techSignalEn !== "buy");
  return [...buys, ...rest].slice(0, 10);
}

function selectInvestment(stocks: LiveStock[]): LiveStock[] {
  // استثمار: الأسهم القيادية والنمو — مرتبة بالنتيجة
  const inv = stocks.filter(s => INVEST_SYMBOLS.has(s.symbol));
  // أكمّل بالباقي إذا أقل من 5
  if (inv.length >= 5) return inv.slice(0, 10);
  const rest = stocks.filter(s => !INVEST_SYMBOLS.has(s.symbol));
  return [...inv, ...rest].slice(0, 10);
}

// ── Signal config ─────────────────────────────────────────────────────
function sigConfig(sigEn: string) {
  if (sigEn === "strong_buy") return { cls: "sig-strong-buy", icon: "🟢", label: "دخول قوي" };
  if (sigEn === "buy")        return { cls: "sig-buy",        icon: "🟢", label: "دخول" };
  if (sigEn === "sell")       return { cls: "sig-sell",       icon: "🔴", label: "خروج" };
  if (sigEn === "strong_sell")return { cls: "sig-strong-sell",icon: "🔴", label: "خروج قوي" };
  return                             { cls: "sig-neutral",    icon: "🟡", label: "انتظر" };
}

// ── Component ─────────────────────────────────────────────────────────
export function SimpleDashboard() {
  const [data, setData]   = useState<ApiData | null>(null);
  const [tab, setTab]     = useState<"spec"|"inv">("spec");
  const [ts,  setTs]      = useState("");
  const [pulse, setPulse] = useState(false);
  const [err, setErr]     = useState(false);

  const load = useCallback(() => {
    setErr(false);
    fetch("/api/market")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setErr(true); return; }
        setData(d);
        setTs(new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }));
        setPulse(p => !p);
      })
      .catch(() => setErr(true));
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const specStocks = data ? selectSpeculation(data.stocks) : [];
  const invStocks  = data ? selectInvestment(data.stocks)  : [];
  const buyCount   = data?.stocks.filter(s => s.techSignalEn === "strong_buy" || s.techSignalEn === "buy").length ?? 0;
  const sellCount  = data?.stocks.filter(s => s.techSignalEn === "sell" || s.techSignalEn === "strong_sell").length ?? 0;

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
          position: fixed; inset: 0;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,168,76,0.07) 0%, transparent 60%),
            linear-gradient(rgba(201,168,76,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.02) 1px, transparent 1px);
          background-size: 100% 100%, 60px 60px, 60px 60px;
          pointer-events: none; z-index: 0;
        }
        .s305-content { position: relative; z-index: 1; }

        /* ── Top Bar ── */
        .topbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(4,6,13,0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(201,168,76,0.1);
          padding: 0 20px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
        }
        .topbar-logo {
          font-size: 18px; font-weight: 800; letter-spacing: 1px; flex-shrink: 0;
          background: linear-gradient(135deg, #E8C570, #C9A84C, #8a6e30);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .topbar-tickers { display: flex; gap: 18px; align-items: center; flex: 1; justify-content: center; }
        .ticker-item { text-align: center; }
        .ticker-label { font-size: 9px; color: #3a4a5e; text-transform: uppercase; letter-spacing: 1px; }
        .ticker-val   { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #c8d0da; }
        .ticker-pct   { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
        .ticker-pct.up { color: #10b981; }
        .ticker-pct.dn { color: #ef4444; }
        .topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .status-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600; border: 1px solid;
        }
        .status-open   { color: #10b981; border-color: #10b98133; background: #10b98108; }
        .status-closed { color: #475569; border-color: #47556933; background: #47556908; }
        .status-pre    { color: #f59e0b; border-color: #f59e0b33; background: #f59e0b08; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-open .status-dot   { background: #10b981; box-shadow: 0 0 8px #10b981; animation: blink 1.5s ease-in-out infinite; }
        .status-closed .status-dot { background: #475569; }
        .status-pre .status-dot    { background: #f59e0b; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── Breadth bar ── */
        .breadth-bar {
          background: #080b14; border: 1px solid #0f1828;
          border-radius: 10px; padding: 8px 16px;
          margin: 10px 20px; display: flex; align-items: center; gap: 12px;
        }
        .breadth-label { font-size: 10px; color: #3a4a5e; flex-shrink: 0; }
        .breadth-track { flex: 1; height: 6px; background: #0d1422; border-radius: 3px; overflow: hidden; display: flex; }
        .breadth-buy  { background: linear-gradient(90deg, #10b98188, #10b981); border-radius: 3px 0 0 3px; transition: width .8s; }
        .breadth-sell { background: linear-gradient(90deg, #ef444488, #ef4444); border-radius: 0 3px 3px 0; transition: width .8s; }
        .breadth-stats { font-family: 'JetBrains Mono', monospace; font-size: 11px; flex-shrink: 0; }

        /* ── Mobile Tabs ── */
        .mob-tabs { display: none; background: #080b14; border-bottom: 1px solid #0f1828; padding: 0 16px; }
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
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 16px; padding: 16px 20px 100px;
          max-width: 1200px; margin: 0 auto;
        }

        /* ── Column Header ── */
        .col-header {
          padding: 14px 16px; border-radius: 16px; margin-bottom: 10px;
          border: 1px solid; position: relative; overflow: hidden;
        }
        .col-header::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, currentColor 0%, transparent 100%);
          opacity: 0.04;
        }
        .col-header.gold { border-color: rgba(201,168,76,0.25); color: #C9A84C; }
        .col-header.blue { border-color: rgba(59,130,246,0.25); color: #60a5fa; }
        .col-title { font-size: 15px; font-weight: 800; position: relative; }
        .col-sub   { font-size: 11px; color: #3a4a5e; margin-top: 2px; font-weight: 400; position: relative; }
        .col-badge {
          display: inline-block; font-size: 9px; padding: 1px 6px;
          border-radius: 4px; margin-right: 6px; font-weight: 700;
          position: relative;
        }

        /* ── Stock Card ── */
        .scard {
          background: #080b14; border: 1px solid #0f1828; border-radius: 16px;
          padding: 13px 14px; cursor: pointer; width: 100%;
          text-align: right; transition: border-color .25s, background .25s, transform .15s;
          position: relative; overflow: hidden; margin-bottom: 8px; display: block;
        }
        .scard::after {
          content: ''; position: absolute; top: 0; right: 0; left: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
          opacity: 0; transition: opacity .3s;
        }
        .scard:hover { border-color: rgba(201,168,76,0.35); background: #0c101c; transform: translateY(-1px); }
        .scard:hover::after { opacity: 1; }
        .scard:active { transform: translateY(0); }
        .scard-rank {
          position: absolute; top: 10px; left: 12px;
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          color: #1a2535; font-weight: 700;
        }

        .scard-row1 { display: flex; align-items: center; gap: 8px; }

        /* Signal badge */
        .sig-badge {
          padding: 4px 10px; border-radius: 8px;
          font-size: 12px; font-weight: 700;
          flex-shrink: 0; min-width: 88px; text-align: center;
          border: 1px solid;
        }
        .sig-strong-buy { color:#22c55e; background:#04180b; border-color:#22c55e44; }
        .sig-buy        { color:#86efac; background:#061509; border-color:#86efac33; }
        .sig-neutral    { color:#C9A84C; background:#130f04; border-color:#C9A84C33; }
        .sig-sell       { color:#fca5a5; background:#160606; border-color:#fca5a533; }
        .sig-strong-sell{ color:#ef4444; background:#1c0404; border-color:#ef444444; }

        .scard-info { flex: 1; min-width: 0; }
        .scard-name-row { display: flex; align-items: center; gap: 5px; justify-content: flex-end; flex-wrap: wrap; }
        .scard-name   { font-size: 13px; font-weight: 700; color: #d0d8e4; white-space: nowrap; }
        .scard-symbol { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #C9A84C; font-weight: 600; }
        .scard-sector { font-size: 9px; color: #2a3848; }

        .scard-price { text-align: left; flex-shrink: 0; min-width: 58px; }
        .scard-price-val { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #d0d8e4; }
        .scard-price-pct { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
        .scard-price-pct.up { color: #10b981; }
        .scard-price-pct.dn { color: #ef4444; }

        /* Score bar */
        .score-row { margin-top: 9px; display: flex; align-items: center; gap: 7px; }
        .score-label { font-size: 9px; color: #2a3848; flex-shrink: 0; }
        .score-track { flex: 1; height: 4px; background: #0d1422; border-radius: 2px; overflow: hidden; }
        .score-fill  { height: 100%; border-radius: 2px; transition: width .7s cubic-bezier(.34,1.56,.64,1); }
        .score-val   { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; flex-shrink: 0; }

        /* Indicator chips */
        .chips-row { display: flex; gap: 3px; flex-wrap: wrap; justify-content: flex-end; margin-top: 7px; }
        .chip {
          font-size: 9px; padding: 2px 5px; border-radius: 4px;
          font-weight: 600; border: 1px solid;
          font-family: 'JetBrains Mono', monospace;
        }
        .chip-bull { color: #10b981; background: #041408; border-color: #10b98120; }
        .chip-bear { color: #ef4444; background: #140404; border-color: #ef444420; }
        .chip-neut { color: #C9A84C; background: #100d04; border-color: #C9A84C20; }

        /* Flow bar */
        .flow-row   { margin-top: 7px; display: flex; align-items: center; gap: 7px; }
        .flow-label { font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .flow-track { flex: 1; height: 3px; background: #0d1422; border-radius: 2px; overflow: hidden; }
        .flow-fill  { height: 100%; border-radius: 2px; transition: width .6s; }
        .flow-pct   { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #2a3848; }

        /* Empty state */
        .empty-state {
          text-align: center; padding: 40px 20px;
          background: #080b14; border: 1px dashed #0f1828;
          border-radius: 16px; color: #2a3848;
        }

        /* ── Mobile Bottom Nav ── */
        .bottom-nav {
          display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
          background: rgba(4,6,13,0.97); backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(201,168,76,0.08); height: 64px;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .bottom-nav-inner { display: flex; height: 100%; }
        .bnav-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 2px;
          background: none; border: none; cursor: pointer;
          color: #2a3848; font-family: 'Cairo', sans-serif; font-size: 10px;
          transition: color .2s;
        }
        .bnav-item.active { color: #C9A84C; }
        .bnav-icon { font-size: 18px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .topbar { padding: 0 14px; }
          .topbar-tickers { display: none; }
          .mob-tabs { display: flex; }
          .main-grid { grid-template-columns: 1fr; padding: 10px 12px 80px; gap: 0; }
          .col-spec { display: ${tab === "spec" ? "block" : "none"}; }
          .col-inv  { display: ${tab === "inv"  ? "block" : "none"}; }
          .bottom-nav { display: block; }
          .scard { border-radius: 14px; }
          .breadth-bar { margin: 8px 14px; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a2535; border-radius: 2px; }
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
                  <div className="ticker-label">دخول ←</div>
                  <div className="ticker-val" style={{ color: "#10b981" }}>{buyCount}</div>
                  <div className="ticker-pct" style={{ color: "#3a4a5e", fontSize: 10 }}>من {data.market.breadth.total} سهم</div>
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

          {/* ── Breadth Bar ── */}
          {data && (
            <div className="breadth-bar">
              <span className="breadth-label">رادار السوق</span>
              <div className="breadth-track">
                <div className="breadth-buy"  style={{ width: `${(buyCount / data.market.breadth.total) * 100}%` }} />
                <div className="breadth-sell" style={{ width: `${(sellCount / data.market.breadth.total) * 100}%` }} />
              </div>
              <span className="breadth-stats">
                <span style={{ color: "#10b981" }}>{buyCount}↑</span>
                <span style={{ color: "#3a4a5e", margin: "0 4px" }}>/</span>
                <span style={{ color: "#ef4444" }}>{sellCount}↓</span>
              </span>
            </div>
          )}

          {/* Loading / Error */}
          {!data && !err && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#2a3848" }}>
              <div style={{ width: 32, height: 32, border: "2px solid #1a2535", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "blink 0.8s linear infinite", margin: "0 auto 12px" }} />
              جاري تحليل السوق السعودي…
            </div>
          )}
          {err && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 32 }}>📡</div>
              <div style={{ color: "#ef4444", margin: "8px 0" }}>تعذّر الاتصال بمصدر البيانات</div>
              <button onClick={load} style={{ padding: "8px 20px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, color: "#C9A84C", cursor: "pointer" }}>إعادة المحاولة</button>
            </div>
          )}

          {/* ── Mobile Tabs ── */}
          <div className="mob-tabs">
            <button className={`mob-tab ${tab === "spec" ? "active" : ""}`} onClick={() => setTab("spec")}>⚡ مضاربة</button>
            <button className={`mob-tab ${tab === "inv"  ? "active" : ""}`} onClick={() => setTab("inv")}>📈 استثمار</button>
          </div>

          {data && (
            <div className="main-grid">

              {/* RIGHT — مضاربة */}
              <div className="col-spec">
                <div className="col-header gold">
                  <div className="col-title">
                    ⚡ مضاربة يومية
                    <span className="col-badge" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                      {specStocks.filter(s => s.techSignalEn === "strong_buy" || s.techSignalEn === "buy").length} إشارة دخول
                    </span>
                  </div>
                  <div className="col-sub">مرتبة بقوة الإشارة — المؤشرات المتقاطعة الحالية</div>
                </div>
                {specStocks.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                    <div>لا توجد إشارات دخول حالياً — السوق في مرحلة انتظار</div>
                  </div>
                ) : (
                  specStocks.map((s, i) => <LiveCard key={s.symbol} stock={s} rank={i+1} />)
                )}
              </div>

              {/* LEFT — استثمار */}
              <div className="col-inv">
                <div className="col-header blue">
                  <div className="col-title">📈 استثمار</div>
                  <div className="col-sub">أسهم قيادية ونمو — مرتبة بقوة الإشارة الحالية</div>
                </div>
                {invStocks.map((s, i) => <LiveCard key={s.symbol} stock={s} rank={i+1} />)}
              </div>

            </div>
          )}

          <div className="disclaimer">⚠️ للاسترشاد فقط — ليست توصية استثمارية — السوق السعودي (تداول)</div>
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

// ── Live Stock Card ──────────────────────────────────────────────────
function LiveCard({ stock, rank }: { stock: LiveStock; rank: number }) {
  const router = useRouter();
  const sig     = sigConfig(stock.techSignalEn);
  const ts      = stock.techScore;
  const scoreC  = ts >= 65 ? "#10b981" : ts >= 48 ? "#C9A84C" : "#ef4444";
  const flowC   = stock.flow === "تجميع" ? "#10b981" : stock.flow === "تصريف" ? "#ef4444" : "#3a4a5e";

  // Chip direction — صحيح للسوق السعودي (spot equity market):
  // RSI > 50 = زخم صعودي
  // MACD bullish = صعودي
  // BB%b > 50 = السعر فوق المتوسط = صعودي
  // Stoch > 50 = زخم صعودي (لكن > 80 = تشبع شراء)
  // EMA20 / EMA50 = السعر فوق المتوسط = صعودي
  const rsiC   = stock.rsi > 50 && stock.rsi < 75 ? "chip-bull" : stock.rsi <= 50 ? "chip-bear" : "chip-neut";
  const bbC    = stock.bbPct > 50 ? "chip-bull" : "chip-bear";
  const stochC = stock.stoch > 50 && stock.stoch < 80 ? "chip-bull" : stock.stoch <= 50 ? "chip-bear" : "chip-neut";

  return (
    <button className="scard" onClick={() => router.push(`/dashboard/stock/${stock.symbol}`)}>
      <span className="scard-rank">#{rank}</span>

      {/* Row 1: signal | name | price */}
      <div className="scard-row1">
        <div className={`sig-badge ${sig.cls}`}>{sig.icon} {sig.label}</div>
        <div className="scard-info">
          <div className="scard-name-row">
            <span className="scard-name">{stock.name}</span>
            <span className="scard-symbol">{stock.symbol}</span>
          </div>
          <div className="scard-sector">{stock.sector}</div>
        </div>
        <div className="scard-price">
          <div className="scard-price-val">{stock.price.toFixed(2)}</div>
          <div className={`scard-price-pct ${stock.change >= 0 ? "up" : "dn"}`}>
            {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="score-row">
        <span className="score-label">تقاطع المؤشرات</span>
        <div className="score-track">
          <div className="score-fill" style={{ width: `${ts}%`, background: `linear-gradient(90deg, ${scoreC}66, ${scoreC})` }} />
        </div>
        <span className="score-val" style={{ color: scoreC }}>{ts}%</span>
      </div>

      {/* Indicator chips */}
      <div className="chips-row">
        <span className={`chip ${rsiC}`}>RSI {stock.rsi}</span>
        <span className={`chip ${stock.macdBullish ? "chip-bull" : "chip-bear"}`}>MACD {stock.macdBullish ? "↑" : "↓"}</span>
        <span className={`chip ${bbC}`}>BB {stock.bbPct}%</span>
        <span className={`chip ${stochC}`}>STOCH {stock.stoch}</span>
        <span className={`chip ${stock.ema20Above ? "chip-bull" : "chip-bear"}`}>EMA20 {stock.ema20Above ? "↑" : "↓"}</span>
        <span className={`chip ${stock.ema50Above ? "chip-bull" : "chip-bear"}`}>EMA50 {stock.ema50Above ? "↑" : "↓"}</span>
      </div>

      {/* Flow / Smart money */}
      <div className="flow-row">
        <span className="flow-label" style={{ color: flowC }}>
          {stock.flow === "تجميع" ? "🟢" : stock.flow === "تصريف" ? "🔴" : "🟡"} {stock.flow}
        </span>
        <div className="flow-track">
          <div className="flow-fill" style={{
            width: `${stock.buyPressure}%`,
            background: stock.buyPressure > 55 ? "#10b981" : stock.buyPressure < 45 ? "#ef4444" : "#C9A84C",
          }} />
        </div>
        <span className="flow-pct">{stock.bullishCount}↑ {stock.bearishCount}↓</span>
      </div>
    </button>
  );
}
