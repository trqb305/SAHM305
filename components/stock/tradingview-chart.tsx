"use client";

import { useEffect, useRef } from "react";

interface Props {
  symbol: string;   // e.g. "2010"
  interval: string; // "15", "60", "D", "W"
  studies: string[];
  height?: number;
}

export function TradingViewChart({ symbol, interval, studies, height = 340 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const containerId = `tv_${symbol}_${interval}_${Math.random().toString(36).slice(2, 7)}`;
    const container = containerRef.current;
    if (!container) return;

    container.id = containerId;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/tv.js";

    script.onload = () => {
      if (typeof (window as any).TradingView === "undefined") return;
      widgetRef.current = new (window as any).TradingView.widget({
        autosize: true,
        symbol: `TADAWUL:${symbol}`,
        interval,
        timezone: "Asia/Riyadh",
        theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
        style: "1",
        locale: "ar_AE",
        toolbar_bg: "transparent",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: true,
        allow_symbol_change: false,
        save_image: false,
        studies,
        container_id: containerId,
        withdateranges: false,
        hide_volume: false,
        no_referral_id: true,
      });
    };

    document.head.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
      if (widgetRef.current) {
        try { widgetRef.current.remove?.(); } catch {}
      }
      // Remove the script to allow re-loading
      document.querySelectorAll('script[src*="tradingview"]').forEach((s) => {
        if (!document.querySelector('[id^="tv_"]')) s.remove();
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, width: "100%" }}
      className="rounded-xl overflow-hidden"
    />
  );
}
