import { NextResponse } from "next/server";
import { computeConfluence } from "@/lib/indicators";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
const YF  = { "User-Agent": UA, "Accept": "application/json", "Accept-Language": "en-US,en;q=0.9" };

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

async function fetchStooq(sym: string) {
  const res = await fetch(`https://stooq.com/q/l/?s=${sym}&f=sd2t2ohlcv&h&e=csv`, {
    headers: { "User-Agent": UA }, next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const cols = (await res.text()).trim().split("\n")[1]?.split(",");
  if (!cols) return null;
  return { open: +cols[3]||0, high: +cols[4]||0, low: +cols[5]||0, close: +cols[6]||0, volume: +cols[7]||0, date: cols[1] };
}

// Fetch 3-month daily OHLCV — enough for RSI(14), MACD(26), EMA(50), BB(20), Stoch(14)
async function fetchYahooHistory(yfSymbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSymbol}?range=3mo&interval=1d`;
    const res = await fetch(url, { headers: YF, next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data  = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const meta   = result.meta;
    const q      = result.indicators?.quote?.[0] ?? {};
    const closes  = (q.close  as number[]) ?? [];
    const highs   = (q.high   as number[]) ?? [];
    const lows    = (q.low    as number[]) ?? [];
    const volumes = (q.volume as number[]) ?? [];

    // Filter out nulls
    const valid: { c: number; h: number; l: number; v: number }[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] != null && highs[i] != null && lows[i] != null) {
        valid.push({ c: closes[i], h: highs[i], l: lows[i], v: volumes[i] ?? 0 });
      }
    }
    if (valid.length < 20) return null;

    return {
      price:     meta.regularMarketPrice ?? valid[valid.length - 1].c,
      prevClose: meta.chartPreviousClose ?? meta.previousClose ?? 0,
      high:      meta.regularMarketDayHigh ?? 0,
      low:       meta.regularMarketDayLow  ?? 0,
      volume:    meta.regularMarketVolume  ?? 0,
      closes:    valid.map(v => v.c),
      highs:     valid.map(v => v.h),
      lows:      valid.map(v => v.l),
      volumes:   valid.map(v => v.v),
    };
  } catch { return null; }
}

export async function GET() {
  try {
    const [tasiStooq, oilStooq, ...stockResults] = await Promise.all([
      fetchStooq("^tasi"),
      fetchStooq("brent.uk"),
      ...SAUDI_STOCKS.map(s => fetchYahooHistory(s.symbol)),
    ]);

    if (!tasiStooq || tasiStooq.close === 0) throw new Error("تعذّر الاتصال بمصدر البيانات");

    const tasiPrice     = tasiStooq.close;
    const tasiChangePct = tasiStooq.open > 0 ? ((tasiPrice - tasiStooq.open) / tasiStooq.open) * 100 : 0;
    const oilPrice      = oilStooq?.close ?? 0;
    const oilOpen       = oilStooq?.open ?? 0;
    const oilChangePct  = oilOpen > 0 ? ((oilPrice - oilOpen) / oilOpen) * 100 : 0;

    const now        = new Date();
    const astHour    = (now.getUTCHours() + 3) % 24;
    const dayOfWeek  = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" })).getDay();
    const tradingDay = dayOfWeek >= 0 && dayOfWeek <= 4;
    const tradingHr  = astHour >= 10 && astHour < 15;
    const status: "open"|"closed"|"pre" = tradingDay && tradingHr ? "open" : tradingDay && astHour < 10 ? "pre" : "closed";

    const stocks = SAUDI_STOCKS.map((s, i) => {
      const yf = stockResults[i];
      if (!yf || yf.price === 0) return null;

      const prev      = yf.prevClose || yf.price;
      const changeAbs = +(yf.price - prev).toFixed(2);
      const changePct = prev > 0 ? +((yf.price - prev) / prev * 100).toFixed(2) : 0;

      // Real technical analysis
      const tech = computeConfluence(yf.closes, yf.highs, yf.lows, yf.volumes);

      // Buy pressure from volume-weighted candle direction (last 20 candles)
      const last20c = yf.closes.slice(-21);
      const last20v = yf.volumes.slice(-20);
      let bullVol = 0, bearVol = 0;
      for (let j = 0; j < 20; j++) {
        if (last20c[j + 1] > last20c[j]) bullVol += last20v[j];
        else bearVol += last20v[j];
      }
      const totalVol    = bullVol + bearVol;
      const buyPressure = totalVol > 0 ? Math.round((bullVol / totalVol) * 100) : 50;
      const flow: "تجميع"|"تصريف"|"محايد" =
        buyPressure > 57 ? "تجميع" : buyPressure < 43 ? "تصريف" : "محايد";

      return {
        symbol:      s.symbol.replace(".SR", ""),
        name:        s.name,
        sector:      s.sector,
        price:       +(yf.price.toFixed(2)),
        change:      changePct,
        changeAbs,
        high:        +(yf.high.toFixed(2)),
        low:         +(yf.low.toFixed(2)),
        prevClose:   +(prev.toFixed(2)),
        volume:      yf.volume,
        buyPressure,
        flow,
        flowLabel:   flow === "تجميع" ? "تجميع — شراء قوي" : flow === "تصريف" ? "تصريف — بيع قوي" : "محايد — انتظر",
        // Technical scores
        techScore:   tech.score,
        techSignal:  tech.signal,
        techSignalEn: tech.signalEn,
        rsi:         tech.rsi,
        macdBullish: tech.macd.bullish,
        macdHist:    tech.macd.hist,
        bbPct:       tech.bb.pct,
        stoch:       tech.stoch,
        ema20Above:  tech.ema20Above,
        ema50Above:  tech.ema50Above,
        adx:         tech.adx,
        vwap:        tech.vwap,
        priceVsVwap: tech.priceVsVwap,
        bullishCount: tech.bullishCount,
        bearishCount: tech.bearishCount,
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

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      isLive: true,
      status,
      market: {
        tasi: { value: +(tasiPrice.toFixed(2)), changePct: +(tasiChangePct.toFixed(2)), high: tasiStooq.high, low: tasiStooq.low },
        oil:  { value: +(oilPrice.toFixed(2)),  changePct: +(oilChangePct.toFixed(2)) },
        breadth: { advancing, declining, total: stocks.length, adRatio: +(adRatio.toFixed(2)) },
      },
      decision: { score, direction: score >= 62 ? "bullish" : score <= 40 ? "bearish" : "neutral", verdict: score >= 62 ? "نفّذ" : score <= 40 ? "تجنّب" : "انتظر" },
      stocks: stocks.sort((a: any, b: any) => b.techScore - a.techScore),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, isLive: false }, { status: 500 });
  }
}
