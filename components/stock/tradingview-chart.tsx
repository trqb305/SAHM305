"use client";

// ================================================================
// TradingView Chart — iframe approach (100% reliable, no JS race conditions)
// السهم دائماً من تداول السعودي: TADAWUL:XXXX
// ================================================================

interface Props {
  symbol: string;   // e.g. "2010" (رمز السهم السعودي)
  interval: string; // "15" | "60" | "D" | "W"
  studies: string[];
  height?: number;
}

// Studies that show entry/exit ARROWS directly on the chart
const ENTRY_EXIT_STUDIES = [
  "PSAR@tv-basicstudies",        // Parabolic SAR — نقاط الدخول والخروج
  "Supertrend@tv-basicstudies",  // Supertrend — سهام الشراء والبيع
];

export function TradingViewChart({ symbol, interval, studies, height = 340 }: Props) {
  // Build studies list: user studies + entry/exit arrow studies
  const allStudies = [...new Set([...studies, ...ENTRY_EXIT_STUDIES])];
  const encodedStudies = allStudies.map(s => encodeURIComponent(s)).join("%2C");

  // Force TADAWUL exchange for Saudi stocks
  const tvSymbol = encodeURIComponent(`TADAWUL:${symbol}`);

  const src = [
    `https://www.tradingview.com/widgetembed/`,
    `?symbol=${tvSymbol}`,
    `&interval=${interval}`,
    `&theme=dark`,
    `&style=1`,
    `&locale=ar_AE`,
    `&timezone=Asia%2FRiyadh`,
    `&toolbar_bg=%23080b14`,
    `&hide_side_toolbar=1`,
    `&allow_symbol_change=0`,
    `&save_image=0`,
    `&studies=${encodedStudies}`,
    `&withdateranges=0`,
    `&hide_volume=0`,
    `&no_referral_id=1`,
  ].join("");

  return (
    <iframe
      src={src}
      width="100%"
      height={height}
      frameBorder="0"
      allowTransparency
      scrolling="no"
      style={{ display: "block", background: "#080b14" }}
      title={`TADAWUL:${symbol} — ${interval}`}
    />
  );
}
