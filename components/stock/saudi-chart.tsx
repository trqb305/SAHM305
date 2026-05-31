"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  symbol: string;  // e.g. "2010"
  tf: "15m" | "1h" | "1d" | "1wk";
  label: string;   // "15 دقيقة" | "ساعي" | "يومي" | "أسبوعي"
  height?: number;
}

const TF_LABELS: Record<string, string> = {
  "15m": "15 دقيقة",
  "1h":  "ساعي",
  "1d":  "يومي",
  "1wk": "أسبوعي",
};

export function SaudiChart({ symbol, tf, label, height = 280 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const candleRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef    = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [price,  setPrice]  = useState<number | null>(null);
  const [name,   setName]   = useState("");
  const [activeTf, setActiveTf] = useState(tf);

  function buildChart(container: HTMLDivElement) {
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(container, {
      width:  container.clientWidth,
      height: height - 40,
      layout: {
        background: { type: ColorType.Solid, color: "#080b14" },
        textColor:  "#7a8599",
        fontFamily: "JetBrains Mono, monospace",
        fontSize:   11,
      },
      grid: {
        vertLines:  { color: "rgba(255,255,255,0.04)" },
        horzLines:  { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.06)", scaleMargins: { top: 0.08, bottom: 0.22 } },
      timeScale: {
        borderColor: "rgba(255,255,255,0.06)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:          "#22c55e",
      downColor:        "#ef4444",
      borderUpColor:    "#22c55e",
      borderDownColor:  "#ef4444",
      wickUpColor:      "#22c55e",
      wickDownColor:    "#ef4444",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color:  "#3b82f6",
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current  = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
    });
    ro.observe(container);

    return () => { ro.disconnect(); };
  }

  async function loadData(currentTf: string) {
    if (!containerRef.current) return;
    setStatus("loading");

    try {
      const res  = await fetch(`/api/stock/${symbol}?tf=${currentTf}`);
      const data = await res.json();

      if (!res.ok || !data.candles?.length) {
        setStatus("error");
        return;
      }

      const candles: Candle[] = data.candles;
      setName(data.name ?? "");
      setPrice(data.price ?? null);

      // Convert Unix timestamps → lightweight-charts time format
      // For intraday: keep as UTC seconds (lightweight-charts handles it)
      // For daily/weekly: convert to YYYY-MM-DD string
      const isIntraday = currentTf === "15m" || currentTf === "1h";

      const candleData = candles.map(c => ({
        time: isIntraday
          ? c.time as any
          : new Date(c.time * 1000).toISOString().split("T")[0] as any,
        open:  c.open,
        high:  c.high,
        low:   c.low,
        close: c.close,
      }));

      const volumeData = candles.map(c => ({
        time:  isIntraday
          ? c.time as any
          : new Date(c.time * 1000).toISOString().split("T")[0] as any,
        value: c.volume,
        color: c.close >= c.open ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
      }));

      if (!chartRef.current && containerRef.current) {
        buildChart(containerRef.current);
      }

      candleRef.current?.setData(candleData);
      volumeRef.current?.setData(volumeData);
      chartRef.current?.timeScale().fitContent();

      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = buildChart(containerRef.current);
    loadData(activeTf);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  function switchTf(newTf: string) {
    setActiveTf(newTf as any);
    loadData(newTf);
  }

  return (
    <div style={{ background: "#080b14", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {Object.entries(TF_LABELS).map(([key, lbl]) => (
            <button
              key={key}
              onClick={() => switchTf(key)}
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                border: "1px solid",
                cursor: "pointer",
                background:     activeTf === key ? "rgba(201,168,76,0.18)" : "transparent",
                borderColor:    activeTf === key ? "rgba(201,168,76,0.5)"  : "rgba(255,255,255,0.1)",
                color:          activeTf === key ? "#C9A84C"                : "#6b7280",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "JetBrains Mono, monospace" }}>
          {status === "ok" && price ? (
            <span style={{ color: "#C9A84C" }}>{price.toFixed(2)} ﷼</span>
          ) : status === "loading" ? (
            <span style={{ color: "#6b7280" }}>جاري التحميل…</span>
          ) : (
            <span style={{ color: "#ef4444" }}>خطأ في البيانات</span>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div style={{ position: "relative", height: height - 40 }}>
        {status === "loading" && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", background: "#080b14", zIndex: 10,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 28, height: 28, border: "2px solid rgba(201,168,76,0.3)",
                borderTopColor: "#C9A84C", borderRadius: "50%",
                animation: "spin 0.8s linear infinite", margin: "0 auto 8px",
              }} />
              <div style={{ color: "#4b5563", fontSize: 12 }}>جاري تحميل بيانات السوق السعودي…</div>
            </div>
          </div>
        )}
        {status === "error" && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", background: "#080b14",
          }}>
            <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📡</div>
              <div>تعذّر تحميل البيانات</div>
              <button
                onClick={() => loadData(activeTf)}
                style={{ marginTop: 8, padding: "4px 12px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 4, color: "#C9A84C", cursor: "pointer", fontSize: 11 }}
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
