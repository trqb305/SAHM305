// ================================================================
// مكتبة المؤشرات التقنية — حسابات حقيقية من بيانات السوق
// ================================================================

export function calcEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

export function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  const changes = closes.slice(1).map((c, i) => c - closes[i]);
  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round(100 - 100 / (1 + rs));
}

export function calcMACD(closes: number[]): { macd: number; signal: number; hist: number; bullish: boolean } {
  if (closes.length < 26) return { macd: 0, signal: 0, hist: 0, bullish: false };
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = calcEMA(macdLine.slice(-9), 9);
  const macd   = macdLine[macdLine.length - 1];
  const signal = signalLine[signalLine.length - 1];
  const hist   = macd - signal;
  return { macd: +macd.toFixed(4), signal: +signal.toFixed(4), hist: +hist.toFixed(4), bullish: hist > 0 };
}

export function calcBB(closes: number[], period = 20): { upper: number; mid: number; lower: number; pct: number } {
  if (closes.length < period) return { upper: 0, mid: 0, lower: 0, pct: 50 };
  const slice = closes.slice(-period);
  const mid   = slice.reduce((a, b) => a + b, 0) / period;
  const std   = Math.sqrt(slice.reduce((a, b) => a + (b - mid) ** 2, 0) / period);
  const upper = mid + 2 * std;
  const lower = mid - 2 * std;
  const price = closes[closes.length - 1];
  const pct   = std > 0 ? Math.round(((price - lower) / (upper - lower)) * 100) : 50;
  return { upper: +upper.toFixed(2), mid: +mid.toFixed(2), lower: +lower.toFixed(2), pct };
}

export function calcStochastic(highs: number[], lows: number[], closes: number[], k = 14): { k: number; bullish: boolean } {
  if (closes.length < k) return { k: 50, bullish: false };
  const recentH = Math.max(...highs.slice(-k));
  const recentL = Math.min(...lows.slice(-k));
  const kVal    = recentH === recentL ? 50 : Math.round(((closes[closes.length - 1] - recentL) / (recentH - recentL)) * 100);
  return { k: kVal, bullish: kVal < 30 };
}

export function calcADX(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (closes.length < period + 1) return 25;
  const trs: number[] = [], plusDMs: number[] = [], minusDMs: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const h = highs[i], l = lows[i], ph = highs[i - 1], pl = lows[i - 1], pc = closes[i - 1];
    trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
    plusDMs.push(h - ph > pl - l && h - ph > 0 ? h - ph : 0);
    minusDMs.push(pl - l > h - ph && pl - l > 0 ? pl - l : 0);
  }
  const smoothTR  = trs.slice(-period).reduce((a, b) => a + b, 0);
  const smoothPDM = plusDMs.slice(-period).reduce((a, b) => a + b, 0);
  const smoothMDM = minusDMs.slice(-period).reduce((a, b) => a + b, 0);
  const plusDI  = smoothTR > 0 ? (smoothPDM / smoothTR) * 100 : 0;
  const minusDI = smoothTR > 0 ? (smoothMDM / smoothTR) * 100 : 0;
  const dx      = plusDI + minusDI > 0 ? Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100 : 0;
  return Math.round(Math.min(100, dx));
}

export function calcVWAP(highs: number[], lows: number[], closes: number[], volumes: number[]): number {
  let pvSum = 0, vSum = 0;
  for (let i = 0; i < closes.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
    pvSum += typicalPrice * volumes[i];
    vSum  += volumes[i];
  }
  return vSum > 0 ? +(pvSum / vSum).toFixed(2) : closes[closes.length - 1];
}

// ================================================================
// نظام تقاطع المؤشرات — الدرجة 0-100
// ================================================================
export interface TechnicalScore {
  score: number;           // 0-100
  signal: "دخول قوي" | "دخول" | "انتظر" | "خروج" | "خروج قوي";
  signalEn: "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";
  rsi: number;
  macd: { bullish: boolean; hist: number };
  bb: { pct: number };
  stoch: number;
  ema20Above: boolean;
  ema50Above: boolean;
  adx: number;
  vwap: number;
  priceVsVwap: "above" | "below";
  bullishCount: number;    // عدد المؤشرات الصاعدة
  bearishCount: number;    // عدد المؤشرات الهابطة
}

export function computeConfluence(
  closes: number[], highs: number[], lows: number[], volumes: number[]
): TechnicalScore {
  const price = closes[closes.length - 1];
  const rsi   = calcRSI(closes);
  const macd  = calcMACD(closes);
  const bb    = calcBB(closes);
  const stoch = calcStochastic(highs, lows, closes);
  const adx   = calcADX(highs, lows, closes);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const vwap  = calcVWAP(highs, lows, closes, volumes);

  const ema20Above = price > ema20[ema20.length - 1];
  const ema50Above = price > ema50[ema50.length - 1];
  const priceVsVwap: "above" | "below" = price >= vwap ? "above" : "below";

  let score = 50;
  let bull = 0, bear = 0;

  // RSI
  if (rsi < 25)      { score += 22; bull++; }
  else if (rsi < 35) { score += 14; bull++; }
  else if (rsi < 45) { score +=  6; }
  else if (rsi > 75) { score -= 22; bear++; }
  else if (rsi > 65) { score -= 14; bear++; }
  else if (rsi > 55) { score -=  6; }

  // MACD
  if (macd.bullish)  { score += 18; bull++; }
  else               { score -= 18; bear++; }

  // Bollinger %B
  if (bb.pct < 10)       { score += 18; bull++; }
  else if (bb.pct < 25)  { score += 10; bull++; }
  else if (bb.pct > 90)  { score -= 18; bear++; }
  else if (bb.pct > 75)  { score -= 10; bear++; }

  // Stochastic
  if (stoch.k < 20)      { score += 15; bull++; }
  else if (stoch.k < 35) { score +=  8; }
  else if (stoch.k > 80) { score -= 15; bear++; }
  else if (stoch.k > 65) { score -=  8; }

  // EMA 20
  if (ema20Above)   { score += 10; bull++; }
  else              { score -= 10; bear++; }

  // EMA 50
  if (ema50Above)   { score += 12; bull++; }
  else              { score -= 12; bear++; }

  // VWAP
  if (priceVsVwap === "above") { score += 8; bull++; }
  else                          { score -= 8; bear++; }

  // ADX (trend strength — boosts signal)
  if (adx > 25) score += macd.bullish ? 8 : -8;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let signal: TechnicalScore["signal"];
  let signalEn: TechnicalScore["signalEn"];
  if      (score >= 72) { signal = "دخول قوي";  signalEn = "strong_buy";   }
  else if (score >= 58) { signal = "دخول";       signalEn = "buy";          }
  else if (score >= 42) { signal = "انتظر";      signalEn = "neutral";      }
  else if (score >= 28) { signal = "خروج";       signalEn = "sell";         }
  else                  { signal = "خروج قوي";   signalEn = "strong_sell";  }

  return { score, signal, signalEn, rsi, macd, bb, stoch: stoch.k, ema20Above, ema50Above, adx, vwap, priceVsVwap, bullishCount: bull, bearishCount: bear };
}
