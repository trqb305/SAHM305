import { NextResponse } from "next/server";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
const YF_HEADERS = { "User-Agent": UA, "Accept": "application/json", "Accept-Language": "en-US,en;q=0.9" };

const SAUDI_STOCKS = [
  { symbol: "2010.SR", name: "سابك",                    sector: "البتروكيماويات" },
  { symbol: "1120.SR", name: "مصرف الراجحي",            sector: "البنوك" },
  { symbol: "2350.SR", name: "المصافي",                  sector: "الطاقة" },
  { symbol: "2380.SR", name: "بترو رابغ",               sector: "البتروكيماويات" },
  { symbol: "2160.SR", name: "ينساب",                   sector: "البتروكيماويات" },
  { symbol: "1020.SR", name: "بنك الرياض",              sector: "البنوك" },
  { symbol: "1810.SR", name: "سبكيم",                   sector: "البتروكيماويات" },
  { symbol: "2060.SR", name: "عجلان وإخوانه",           sector: "التجزئة" },
  { symbol: "1211.SR", name: "معادن",                   sector: "التعدين" },
  { symbol: "4261.SR", name: "أبو عرابي للإيجار",       sector: "الخدمات" },
  { symbol: "1140.SR", name: "البنك الأهلي التجاري",    sector: "البنوك" },
  { symbol: "7010.SR", name: "الاتصالات السعودية STC",  sector: "الاتصالات" },
  { symbol: "4190.SR", name: "دله الحكمة الطبية",       sector: "الرعاية الصحية" },
  { symbol: "2300.SR", name: "صافولا",                  sector: "الأغذية" },
  { symbol: "4280.SR", name: "الأنماء للخدمات المالية", sector: "الخدمات المالية" },
  { symbol: "2050.SR", name: "صدارة للكيماويات",        sector: "البتروكيماويات" },
  { symbol: "4002.SR", name: "هرفي للأغذية",            sector: "الأغذية" },
];

async function fetchStooq(symbol: string) {
  const url = `https://stooq.com/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=csv`;
  const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 30 } });
  if (!res.ok) return null;
  const text = await res.text();
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;
  const cols = lines[1].split(",");
  return {
    open: parseFloat(cols[3]) || 0,
    high: parseFloat(cols[4]) || 0,
    low:  parseFloat(cols[5]) || 0,
    close: parseFloat(cols[6]) || 0,
    volume: parseFloat(cols[7]) || 0,
    date: cols[1],
  };
}

// Fetch 1-day 1-minute interval for near-real-time prices + intraday volume
async function fetchYahooRealtime(yfSymbol: string) {
  try {
    // 1-minute data for today
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?range=1d&interval=1m`;
    const res = await fetch(url, { headers: YF_HEADERS, next: { revalidate: 30 } });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;

    // Calculate buy pressure from intraday candles
    const quotes = result.indicators?.quote?.[0];
    let buyPressure = 50; // default neutral
    if (quotes?.close && quotes?.open && quotes?.volume) {
      const closes = quotes.close as number[];
      const opens  = quotes.open  as number[];
      const vols   = quotes.volume as number[];
      let bullVol = 0, bearVol = 0;
      for (let i = 0; i < closes.length; i++) {
        if (closes[i] == null || opens[i] == null) continue;
        if (closes[i] > opens[i]) bullVol += (vols[i] || 0);
        else bearVol += (vols[i] || 0);
      }
      const totalVol = bullVol + bearVol;
      buyPressure = totalVol > 0 ? Math.round((bullVol / totalVol) * 100) : 50;
    }

    return {
      price:     meta.regularMarketPrice ?? 0,
      prevClose: meta.chartPreviousClose ?? meta.previousClose ?? 0,
      high:      meta.regularMarketDayHigh ?? 0,
      low:       meta.regularMarketDayLow ?? 0,
      volume:    meta.regularMarketVolume ?? 0,
      open:      meta.regularMarketOpen ?? meta.chartPreviousClose ?? 0,
      state:     meta.marketState ?? "CLOSED",
      buyPressure,
    };
  } catch { return null; }
}

function calcFlow(buyPressure: number, changePct: number, volRatio: number): {
  mode: "تجميع" | "تصريف" | "محايد";
  strength: number; // 0-100
  label: string;
} {
  const score = (buyPressure * 0.5) + (changePct > 0 ? 25 : changePct < 0 ? -25 : 0) + (volRatio > 1.2 ? 10 : 0);
  if (score >= 65) return { mode: "تجميع", strength: Math.min(100, score), label: "تجميع — شراء قوي" };
  if (score <= 38) return { mode: "تصريف", strength: Math.min(100, 100 - score), label: "تصريف — بيع قوي" };
  return { mode: "محايد", strength: 50, label: "محايد — انتظر" };
}

export async function GET() {
  try {
    const [tasiStooq, oilStooq, ...stockResults] = await Promise.all([
      fetchStooq("^tasi"),
      fetchStooq("brent.uk"),
      ...SAUDI_STOCKS.map((s) => fetchYahooRealtime(s.symbol)),
    ]);

    if (!tasiStooq || tasiStooq.close === 0) throw new Error("تعذّر الاتصال بمصدر البيانات");

    const tasiPrice     = tasiStooq.close;
    const tasiOpen      = tasiStooq.open;
    const tasiChange    = tasiPrice - tasiOpen;
    const tasiChangePct = tasiOpen > 0 ? (tasiChange / tasiOpen) * 100 : 0;

    const oilPrice     = oilStooq?.close ?? 0;
    const oilOpen      = oilStooq?.open  ?? oilPrice;
    const oilChangePct = oilOpen > 0 ? ((oilPrice - oilOpen) / oilOpen) * 100 : 0;

    const now = new Date();
    const astHour   = (now.getUTCHours() + 3) % 24;
    const dayOfWeek = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" })).getDay();
    const isTradingDay  = dayOfWeek >= 0 && dayOfWeek <= 4;
    const isTradingHour = astHour >= 10 && astHour < 15;
    const status: "open" | "closed" | "pre" = isTradingDay && isTradingHour ? "open"
      : isTradingDay && astHour < 10 ? "pre" : "closed";

    const stocks = SAUDI_STOCKS.map((s, i) => {
      const yf = stockResults[i];
      if (!yf || yf.price === 0) return null;
      const prev      = yf.prevClose || yf.price;
      const changeAbs = parseFloat((yf.price - prev).toFixed(2));
      const changePct = prev > 0 ? parseFloat(((yf.price - prev) / prev * 100).toFixed(2)) : 0;
      // Volume ratio: compare today's volume vs a rough average (if volume exists)
      const volRatio  = yf.volume > 0 ? Math.min(3, yf.volume / 1_000_000) : 1;
      const flow      = calcFlow(yf.buyPressure, changePct, volRatio);

      return {
        symbol:      s.symbol.replace(".SR", ""),
        name:        s.name,
        sector:      s.sector,
        price:       parseFloat(yf.price.toFixed(2)),
        change:      changePct,
        changeAbs,
        high:        parseFloat(yf.high.toFixed(2)),
        low:         parseFloat(yf.low.toFixed(2)),
        open:        parseFloat(yf.open.toFixed(2)),
        prevClose:   parseFloat(prev.toFixed(2)),
        volume:      yf.volume,
        buyPressure: yf.buyPressure,
        flow:        flow.mode,
        flowLabel:   flow.label,
        flowStrength: flow.strength,
      };
    }).filter(Boolean);

    const advancing = stocks.filter((s: any) => s.change > 0).length;
    const declining = stocks.filter((s: any) => s.change <= 0).length;
    const adRatio   = stocks.length > 0 ? advancing / stocks.length : 0.5;

    let score = 50;
    if (tasiChangePct > 1.5) score += 18; else if (tasiChangePct > 0.5) score += 10;
    else if (tasiChangePct < -1.5) score -= 18; else if (tasiChangePct < -0.5) score -= 10;
    if (oilChangePct > 1) score += 8; else if (oilChangePct < -1) score -= 8;
    if (adRatio > 0.65) score += 10; else if (adRatio < 0.35) score -= 10;
    score = Math.max(10, Math.min(95, Math.round(score)));

    const direction: "bullish" | "bearish" | "neutral" = score >= 62 ? "bullish" : score <= 40 ? "bearish" : "neutral";
    const verdict = score >= 62 ? "نفّذ" : score <= 40 ? "تجنّب" : "انتظر";

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      isLive: true,
      status,
      market: {
        tasi: { value: parseFloat(tasiPrice.toFixed(2)), change: parseFloat(tasiChange.toFixed(2)), changePct: parseFloat(tasiChangePct.toFixed(2)), high: tasiStooq.high, low: tasiStooq.low, date: tasiStooq.date },
        oil:  { value: parseFloat(oilPrice.toFixed(2)), changePct: parseFloat(oilChangePct.toFixed(2)) },
        breadth: { advancing, declining, total: stocks.length, adRatio: parseFloat(adRatio.toFixed(2)) },
      },
      decision: { score, direction, verdict },
      stocks: stocks.sort((a: any, b: any) => Math.abs(b.change) - Math.abs(a.change)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, isLive: false }, { status: 500 });
  }
}
