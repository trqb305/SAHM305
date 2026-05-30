// ====================================================================
// بيانات تجريبية للمنصة — تُستبدل بـ APIs حقيقية في الإنتاج
// ====================================================================

export const marketSnapshot = {
  tasi: { value: 11847.32, change: 145.2, changePct: 1.24, open: 11702, prevClose: 11702 },
  nomu: { value: 28341.5, change: 212.3, changePct: 0.75 },
  vix: { value: 14.8, changePct: -3.2 },
  expectedMove: { value: 84, low: 11763, high: 11931 },
  oil: { value: 78.42, changePct: 2.1 },
  liquidity: { value: 8.4, vsAvg: 18, unit: "مليار ر.س" },
  marketWidth: { up: 142, down: 58, unchanged: 12 },
  foreignFlow: { value: 420, direction: "buy" as "buy" | "sell" },
  dominantSector: "البنوك",
};

export const decision = {
  score: 78,
  direction: "bullish" as const,
  title: "اتجاه صاعد — التنفيذ مفعّل",
  reason:
    "٦ من ٧ محركات وافقت على الاتجاه الصاعد · الزخم قوي والسيولة استثنائية · النفط يدعم القطاع · حذر من قرار الفيدرالي بعد 35 دقيقة.",
  verdict: "نفّذ",
  session: "جلسة 09:00",
  validUntil: "11:30",
  confidence: 82,
  riskRewardRatio: 2.8,
};

export const engines = [
  { id: 1, name: "اتجاه السوق", score: 82, status: "صاعد قوي", color: "green", detail: "TASI فوق EMA200 · ADX 31" },
  { id: 2, name: "الزخم وVWAP", score: 87, status: "يدعم الصعود", color: "green", detail: "MACD صاعد · السعر فوق VWAP" },
  { id: 3, name: "المدى والمواقع", score: 73, status: "داخل النطاق", color: "gold", detail: "BB متوسطة · RSI 58" },
  { id: 4, name: "جودة السهم", score: 82, status: "عالية", color: "green", detail: "تدفق مؤسسي إيجابي" },
  { id: 5, name: "السيولة والكبار", score: 94, status: "استثنائية", color: "green", detail: "OBV صاعد · كبار يجمعون" },
  { id: 6, name: "الأخبار والمخاطر", score: 58, status: "حذر — حدث قريب", color: "orange", detail: "قرار فيدرالي · نتائج الراجحي" },
  { id: 7, name: "وضوح التنفيذ", score: 76, status: "واضح", color: "green", detail: "سبريد منخفض · فجوة غائبة" },
];

// ====== TECHNICAL INDICATORS ======
export const technicalIndicators = {
  rsi: { value: 58.4, signal: "محايد" as const, zone: "neutral" as const },
  rsi7: { value: 62.1, signal: "صاعد" as const, zone: "bullish" as const },
  macd: { value: 34.2, signal: 28.7, histogram: 5.5, trend: "bullish" as const },
  stochastic: { k: 67.3, d: 61.8, signal: "محايد" as const },
  adx: { value: 31.2, diPlus: 28.4, diMinus: 18.6, trend: "قوي" as const },
  cci: { value: 112.4, signal: "تشبع شراء محتمل" as const },
  williamsR: { value: -28.3, signal: "محايد" as const },
  atr: { value: 84.2, atrPct: 0.71, volatility: "متوسطة" as const },
  obv: { trend: "صاعد" as const, divergence: false },
  bollingerBands: { upper: 11931, middle: 11789, lower: 11647, bandwidth: 2.41, squeeze: false },
  vwap: { value: 11802.4, priceRelation: "above" as const },
  ichimoku: {
    tenkan: 11821,
    kijun: 11745,
    senkouA: 11876,
    senkouB: 11698,
    chikou: 11847,
    cloudColor: "green" as const,
    signal: "صاعد داخل السحابة" as const,
  },
  fibonacci: {
    trend: "uptrend" as const,
    swingHigh: 12100,
    swingLow: 11300,
    levels: [
      { label: "0%", value: 12100, hit: false },
      { label: "23.6%", value: 11911, hit: false },
      { label: "38.2%", value: 11794, hit: true, active: true },
      { label: "50%", value: 11700, hit: true },
      { label: "61.8%", value: 11606, hit: true },
      { label: "100%", value: 11300, hit: true },
    ],
  },
  pivotPoints: {
    r3: 12021, r2: 11940, r1: 11893,
    pivot: 11812,
    s1: 11765, s2: 11684, s3: 11603,
  },
  movingAverages: {
    ema9: { value: 11831, signal: "above" as const },
    ema20: { value: 11789, signal: "above" as const },
    ema50: { value: 11624, signal: "above" as const },
    ema200: { value: 11142, signal: "above" as const },
    sma50: { value: 11641, signal: "above" as const },
    sma200: { value: 11089, signal: "above" as const },
  },
};

// ====== SECTOR PERFORMANCE ======
export const sectors = [
  { id: "banks", name: "البنوك", weight: 28.4, change: 1.82, volume: 2.1, momentum: 87, trend: "bullish" as const, stocks: 11 },
  { id: "petrochem", name: "البتروكيماويات", weight: 18.2, change: 0.94, volume: 1.4, momentum: 72, trend: "bullish" as const, stocks: 14 },
  { id: "telecom", name: "الاتصالات", weight: 8.6, change: -0.21, volume: 0.6, momentum: 48, trend: "neutral" as const, stocks: 4 },
  { id: "realestate", name: "العقارات", weight: 6.1, change: 2.41, volume: 0.8, momentum: 79, trend: "bullish" as const, stocks: 18 },
  { id: "insurance", name: "التأمين", weight: 4.8, change: -0.87, volume: 0.4, momentum: 38, trend: "bearish" as const, stocks: 28 },
  { id: "retail", name: "التجزئة", weight: 5.2, change: 0.63, volume: 0.5, momentum: 61, trend: "neutral" as const, stocks: 12 },
  { id: "healthcare", name: "الرعاية الصحية", weight: 4.4, change: 1.14, volume: 0.3, momentum: 68, trend: "bullish" as const, stocks: 9 },
  { id: "energy", name: "الطاقة", weight: 12.8, change: 1.93, volume: 1.8, momentum: 84, trend: "bullish" as const, stocks: 5 },
  { id: "utilities", name: "المرافق", weight: 3.1, change: 0.32, volume: 0.2, momentum: 54, trend: "neutral" as const, stocks: 5 },
  { id: "capital", name: "رأس المال", weight: 4.2, change: -1.12, volume: 0.3, momentum: 31, trend: "bearish" as const, stocks: 8 },
  { id: "materials", name: "المواد الخام", weight: 2.8, change: 0.87, volume: 0.2, momentum: 63, trend: "neutral" as const, stocks: 6 },
  { id: "consumer", name: "الاستهلاكي", weight: 1.4, change: -0.44, volume: 0.1, momentum: 42, trend: "neutral" as const, stocks: 7 },
];

// ====== INSTITUTIONAL FLOW ======
export const institutionalFlow = {
  foreignBuy: 1842,
  foreignSell: 1422,
  foreignNet: 420,
  institutionalBuy: 3240,
  institutionalSell: 2890,
  institutionalNet: 350,
  retailNet: -770,
  pifActivity: "شراء" as const,
  blockTrades: [
    { symbol: "2222", name: "أرامكو", volume: 4200000, value: 119.3, type: "شراء" as const, time: "09:42" },
    { symbol: "1120", name: "الراجحي", volume: 820000, value: 77.2, type: "شراء" as const, time: "09:58" },
    { symbol: "2010", name: "سابك", volume: 640000, value: 48.8, type: "بيع" as const, time: "10:15" },
    { symbol: "2350", name: "الرياض مول", volume: 1100000, value: 18.4, type: "شراء" as const, time: "10:31" },
  ],
  smartMoneyScore: 74,
  accDistSignal: "تراكم" as const,
};

// ====== MARKET BREADTH ======
export const marketBreadth = {
  advancing: 142,
  declining: 58,
  unchanged: 12,
  newHighs52w: 18,
  newLows52w: 4,
  aboveEma20: 61,
  aboveEma50: 73,
  aboveEma200: 68,
  breadthOscillator: 38.2,
  mcclellanOscillator: 42.8,
  armIndex: 0.74,
  upVolumePct: 72.4,
  hilo: { high: 18, low: 4, ratio: 4.5 },
};

export type StockTier = "best" | "alt" | "safe";

export interface StockOpportunity {
  symbol: string;
  name: string;
  tier: StockTier;
  strategy: string;
  strength: number;
  bid: number;
  mid: number;
  ask: number;
  targets: { price: number; pct: number }[];
  stopLoss: { price: number; pct: number };
  warnings: { type: "green" | "amber" | "blue" | "red"; text: string }[];
  frozenAt: string;
  sector: string;
  marketCap: string;
  volume: number;
  avgVolume: number;
  rsi: number;
  vwapRelation: "above" | "below";
  ema20Relation: "above" | "below";
  adx: number;
  atr: number;
  riskReward: number;
  positionSize: { conservative: number; moderate: number };
  technicalSignals: string[];
}

export const opportunities: StockOpportunity[] = [
  {
    symbol: "2222",
    name: "أرامكو السعودية",
    tier: "best",
    strategy: "إستراتيجية: استثمار متوسط · قوة 91 · القطاع رائد",
    strength: 91,
    bid: 28.4,
    mid: 28.45,
    ask: 28.5,
    targets: [
      { price: 29.1, pct: 2.3 },
      { price: 29.85, pct: 4.9 },
      { price: 30.6, pct: 7.6 },
    ],
    stopLoss: { price: 27.85, pct: -2.1 },
    warnings: [
      { type: "green", text: "✓ سيولة عالية" },
      { type: "green", text: "✓ كبار يجمعون" },
      { type: "amber", text: "⚠ خبر قريب" },
    ],
    frozenAt: "09:00",
    sector: "الطاقة",
    marketCap: "6.74 تريليون",
    volume: 42800000,
    avgVolume: 28400000,
    rsi: 62.4,
    vwapRelation: "above",
    ema20Relation: "above",
    adx: 34.2,
    atr: 0.42,
    riskReward: 3.6,
    positionSize: { conservative: 5, moderate: 8 },
    technicalSignals: ["MACD صاعد", "فوق EMA50", "OBV تراكمي", "بولنجر متوسطة"],
  },
  {
    symbol: "1120",
    name: "الراجحي",
    tier: "alt",
    strategy: "إستراتيجية: استثمار قصير · قوة 87 · زخم متسارع",
    strength: 87,
    bid: 94.05,
    mid: 94.1,
    ask: 94.15,
    targets: [
      { price: 95.5, pct: 1.5 },
      { price: 97.2, pct: 3.3 },
      { price: 99.0, pct: 5.2 },
    ],
    stopLoss: { price: 92.3, pct: -1.9 },
    warnings: [
      { type: "green", text: "✓ زخم قوي" },
      { type: "amber", text: "⚠ نتائج 14:00" },
    ],
    frozenAt: "09:00",
    sector: "البنوك",
    marketCap: "234 مليار",
    volume: 8200000,
    avgVolume: 5600000,
    rsi: 58.1,
    vwapRelation: "above",
    ema20Relation: "above",
    adx: 28.7,
    atr: 1.21,
    riskReward: 2.7,
    positionSize: { conservative: 3, moderate: 6 },
    technicalSignals: ["RSI محايد صاعد", "فوق VWAP", "Stoch صاعد", "دعم EMA20"],
  },
  {
    symbol: "7010",
    name: "الاتصالات السعودية",
    tier: "safe",
    strategy: "إستراتيجية: استثمار طويل · قوة 79 · سهم دفاعي",
    strength: 79,
    bid: 42.75,
    mid: 42.8,
    ask: 42.85,
    targets: [
      { price: 43.5, pct: 1.6 },
      { price: 44.4, pct: 3.7 },
      { price: 45.3, pct: 5.8 },
    ],
    stopLoss: { price: 41.8, pct: -2.3 },
    warnings: [
      { type: "blue", text: "✓ توزيعات دورية" },
      { type: "green", text: "✓ مستقر" },
    ],
    frozenAt: "09:00",
    sector: "الاتصالات",
    marketCap: "86 مليار",
    volume: 3400000,
    avgVolume: 2800000,
    rsi: 51.2,
    vwapRelation: "above",
    ema20Relation: "above",
    adx: 22.1,
    atr: 0.68,
    riskReward: 2.3,
    positionSize: { conservative: 4, moderate: 7 },
    technicalSignals: ["ADX ضعيف", "بولنجر منخفضة", "RSI محايد", "فوق EMA200"],
  },
];

export const shortlist = [
  { symbol: "2222", name: "أرامكو", price: 28.45, change: 2.34, strength: 91, type: "متوسط", sector: "الطاقة", rsi: 62, vol: "151%", vwap: "↑" },
  { symbol: "2010", name: "سابك", price: 76.3, change: 3.12, strength: 84, type: "مضاربة", sector: "البتروكيم", rsi: 68, vol: "142%", vwap: "↑" },
  { symbol: "2030", name: "المصافي", price: 112.4, change: 1.98, strength: 81, type: "قصير", sector: "الطاقة", rsi: 59, vol: "118%", vwap: "↑" },
  { symbol: "2381", name: "الحفر العربية", price: 58.1, change: 1.45, strength: 78, type: "متوسط", sector: "الطاقة", rsi: 54, vol: "109%", vwap: "↑" },
  { symbol: "2380", name: "بترو رابغ", price: 12.84, change: 0.87, strength: 72, type: "طويل", sector: "البتروكيم", rsi: 48, vol: "97%", vwap: "↓" },
  { symbol: "2382", name: "أديس", price: 14.92, change: -0.42, strength: 64, type: "قصير", sector: "البتروكيم", rsi: 41, vol: "83%", vwap: "↓" },
];

export const todayEvents = [
  { time: "10:30", title: "أرامكو السعودية — اجتماع مجلس الإدارة", impact: "high" },
  { time: "14:00", title: "الراجحي — إعلان النتائج المالية", impact: "med" },
  { time: "16:00", title: "قرار الفيدرالي الأمريكي", impact: "high" },
  { time: "غداً", title: "سابك — الجمعية العمومية", impact: "low" },
];

export const previousSession = {
  high: 11732,
  low: 11612,
  close: 11702,
  open: 11651,
  volume: 7.2,
  support: 11650,
  resistance: 11820,
  avgVolume5d: 7.8,
};

export const newsBar = {
  level: "caution" as "calm" | "caution" | "danger",
  score: 42,
  text: "قرار الفيدرالي خلال 35 دقيقة · إعلان نتائج الراجحي 14:00 · النفط +2.1% · صافي أجانب +420م",
  eventsCount: 3,
};

// ============ ADMIN MOCK DATA ============
export const adminStats = {
  totalUsers: 487,
  weeklyNew: 24,
  activeSubs: 312,
  monthlyGrowth: 8.2,
  pendingSignals: 23,
  successRate: 68,
  monthlyRevenue: 87420,
  revenueGrowth: 12.4,
};

export type UserRole = "admin" | "moderator" | "user";
export type UserTier = "radar" | "signal" | "edge" | "alpha";

export interface AdminUser {
  initials: string;
  name: string;
  email: string;
  role: UserRole;
  tier: UserTier;
  active: boolean;
  lastSeen: string;
}

export const adminUsers: AdminUser[] = [
  { initials: "أ.خ", name: "أحمد الخالد", email: "ahmed.k@gmail.com", role: "user", tier: "alpha", active: true, lastSeen: "منذ 4د" },
  { initials: "ف.س", name: "فاطمة السبيعي", email: "fatima.s@gmail.com", role: "moderator", tier: "edge", active: true, lastSeen: "منذ 12د" },
  { initials: "م.ع", name: "محمد العتيبي", email: "m.otaibi@gmail.com", role: "user", tier: "signal", active: true, lastSeen: "منذ 23د" },
  { initials: "س.ق", name: "سارة القحطاني", email: "sara.q@hotmail.com", role: "user", tier: "edge", active: true, lastSeen: "منذ ساعة" },
  { initials: "خ.ز", name: "خالد الزهراني", email: "k.zahrani@gmail.com", role: "user", tier: "radar", active: false, lastSeen: "منذ يومين" },
  { initials: "ن.ر", name: "نورة الراشد", email: "n.alrashed@gmail.com", role: "user", tier: "alpha", active: true, lastSeen: "منذ 8د" },
];

export const auditLog = [
  { dot: "gold", text: "<strong>أحمد الخالد</strong> رقّى اشتراكه إلى <strong>ALPHA</strong>", meta: "منذ 4 دقائق · Stripe webhook" },
  { dot: "green", text: "دعوة جديدة أُرسلت إلى <strong>fatima.s@gmail.com</strong>", meta: "منذ 12 دقيقة · Resend API" },
  { dot: "blue", text: "فرصة جديدة على سهم <strong>2222</strong> نُشرت بقوة 91/100", meta: "منذ 18 دقيقة · Frozen Plan" },
  { dot: "green", text: "3 مستخدمين جدد سجلوا في الباقة <strong>RADAR</strong>", meta: "منذ 25 دقيقة" },
  { dot: "blue", text: "فرصة سهم <strong>1120</strong> حققت الهدف الأول (T1)", meta: "منذ 38 دقيقة" },
  { dot: "red", text: "طلب استرداد جديد من <strong>عبدالله الأحمد</strong>", meta: "منذ ساعة · بانتظار المراجعة" },
];

export const tierDistribution = [
  { tier: "RADAR", label: "RADAR", count: 175, pct: 35.9, color: "rgb(var(--text-tertiary))" },
  { tier: "SIGNAL", label: "SIGNAL", count: 142, pct: 29.2, color: "rgb(var(--blue))" },
  { tier: "EDGE", label: "EDGE", count: 112, pct: 23.0, color: "rgb(var(--gold))" },
  { tier: "ALPHA", label: "ALPHA", count: 58, pct: 11.9, color: "rgb(var(--gold-soft))" },
];

export const pendingSignals = [
  { symbol: "2222", name: "أرامكو", entry: 28.45, t1: 29.1, sl: 27.85, strength: 91 },
  { symbol: "1120", name: "الراجحي", entry: 94.1, t1: 95.5, sl: 92.3, strength: 87 },
  { symbol: "2010", name: "سابك", entry: 76.3, t1: 78.5, sl: 74.8, strength: 84 },
];
