import { NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
const YF_HEADERS = { "User-Agent": UA, "Accept": "application/json", "Accept-Language": "en-US,en;q=0.9" };

type Interval = "15m" | "60m" | "1d" | "1wk";

const INTERVAL_CONFIG: Record<string, { range: string; interval: Interval; revalidate: number }> = {
  "15m":  { range: "5d",  interval: "15m",  revalidate: 60 },
  "1h":   { range: "1mo", interval: "60m",  revalidate: 60 },
  "1d":   { range: "3mo", interval: "1d",   revalidate: 300 },
  "1wk":  { range: "1y",  interval: "1wk",  revalidate: 3600 },
};

async function fetchOHLCV(yfSymbol: string, range: string, interval: Interval, revalidate: number) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?range=${range}&interval=${interval}`;
    const res = await fetch(url, { headers: YF_HEADERS, next: { revalidate } });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const timestamps = result.timestamp as number[];
    const q = result.indicators?.quote?.[0] ?? {};
    const opens   = q.open   as number[];
    const highs   = q.high   as number[];
    const lows    = q.low    as number[];
    const closes  = q.close  as number[];
    const volumes = q.volume as number[];

    const candles: { time: number; open: number; high: number; low: number; close: number; volume: number }[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] != null && highs[i] != null && lows[i] != null && opens[i] != null) {
        candles.push({
          time:   timestamps[i],
          open:   +opens[i].toFixed(2),
          high:   +highs[i].toFixed(2),
          low:    +lows[i].toFixed(2),
          close:  +closes[i].toFixed(2),
          volume: volumes[i] ?? 0,
        });
      }
    }

    const meta = result.meta;
    return {
      candles,
      name:  meta.shortName ?? meta.symbol,
      price: meta.regularMarketPrice ?? closes[closes.length - 1],
    };
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const url = new URL(request.url);
  const tf = url.searchParams.get("tf") ?? "1d";

  const cfg = INTERVAL_CONFIG[tf] ?? INTERVAL_CONFIG["1d"];
  const yfSymbol = `${symbol}.SR`;

  const data = await fetchOHLCV(yfSymbol, cfg.range, cfg.interval, cfg.revalidate);

  if (!data || data.candles.length === 0) {
    return NextResponse.json({ error: "لا توجد بيانات" }, { status: 404 });
  }

  return NextResponse.json(data);
}
