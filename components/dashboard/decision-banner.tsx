import { ArrowUp, ArrowDown, Minus, Clock, Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface DecisionBannerProps {
  score: number;
  direction: "bullish" | "bearish" | "neutral";
  title: string;
  reason: string;
  verdict: string;
  session: string;
  validUntil?: string;
  confidence?: number;
  riskRewardRatio?: number;
}

export function DecisionBanner({
  score, direction, title, reason, verdict, session,
  validUntil, confidence, riskRewardRatio,
}: DecisionBannerProps) {
  const directionConfig = {
    bullish: {
      arrow: <ArrowUp size={18} strokeWidth={1.5} />,
      arrowBg: "bg-[rgb(var(--green)/0.12)] text-green",
      verdictColor: "text-green",
      verdictBorder: "border-green",
      bannerBorder: "border-[rgb(var(--green)/0.25)]",
      pulse: "bg-green",
      scoreColor: "text-gold-bright",
    },
    bearish: {
      arrow: <ArrowDown size={18} strokeWidth={1.5} />,
      arrowBg: "bg-[rgb(var(--red)/0.12)] text-red",
      verdictColor: "text-red",
      verdictBorder: "border-red",
      bannerBorder: "border-[rgb(var(--red)/0.25)]",
      pulse: "bg-red",
      scoreColor: "text-red",
    },
    neutral: {
      arrow: <Minus size={18} strokeWidth={1.5} />,
      arrowBg: "bg-bg-elevated text-text-secondary",
      verdictColor: "text-text-primary",
      verdictBorder: "border-border-strong",
      bannerBorder: "border-border-strong",
      pulse: "bg-gold-bright",
      scoreColor: "text-gold-bright",
    },
  };
  const cfg = directionConfig[direction];

  return (
    <div className={cn("rounded-2xl border bg-bg-card mb-4 overflow-hidden", cfg.bannerBorder)}>
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{
        background: direction === "bullish"
          ? "linear-gradient(90deg, transparent, rgb(var(--green)), transparent)"
          : direction === "bearish"
          ? "linear-gradient(90deg, transparent, rgb(var(--red)), transparent)"
          : "linear-gradient(90deg, transparent, rgb(var(--gold-bright)), transparent)"
      }} />

      <div className="p-6 grid grid-cols-[auto_1fr_auto] gap-6 items-center max-lg:grid-cols-1">
        {/* Score */}
        <div className="text-center px-5 py-4 bg-bg-deepest border border-border-soft rounded-xl min-w-[130px]">
          <div className={cn("num text-[48px] font-medium leading-none", cfg.scoreColor)}>{score}</div>
          <div className="text-[10px] text-text-secondary mt-1.5 font-medium tracking-widest">القرار من 100</div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mt-2.5" dir="ltr">
            <div
              className="h-full rounded-full"
              style={{
                width: `${score}%`,
                background: score >= 75
                  ? "linear-gradient(90deg, rgb(var(--gold)) 0%, rgb(var(--green)) 100%)"
                  : score >= 50
                  ? "linear-gradient(90deg, rgb(var(--gold)) 0%, rgb(var(--gold-bright)) 100%)"
                  : "linear-gradient(90deg, rgb(var(--red)) 0%, rgb(var(--orange)) 100%)",
              }}
            />
          </div>
          {confidence !== undefined && (
            <div className="text-[10px] text-text-tertiary mt-2">ثقة {confidence}%</div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[11px] text-gold-bright font-medium tracking-widest">{session}</div>
            {validUntil && (
              <div className="flex items-center gap-1 text-[10px] text-text-tertiary bg-bg-deepest px-2 py-0.5 rounded border border-border">
                <Clock size={9} /> صالح حتى {validUntil}
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full pulse-dot", cfg.pulse)} />
              <span className="text-[10px] text-text-tertiary">مباشر</span>
            </div>
          </div>

          <h1 className="text-[24px] font-medium mb-2 flex items-center gap-3 tracking-tight leading-tight">
            <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", cfg.arrowBg)}>
              {cfg.arrow}
            </span>
            {title}
          </h1>

          <div className="text-sm text-text-secondary leading-relaxed mb-3">{reason}</div>

          {/* Quick stats row */}
          <div className="flex items-center gap-3 flex-wrap">
            {riskRewardRatio !== undefined && (
              <div className="flex items-center gap-1.5 text-[11px] bg-[rgb(var(--green)/0.08)] border border-[rgb(var(--green)/0.2)] px-2.5 py-1.5 rounded-lg">
                <TrendingUp size={11} className="text-green" />
                <span className="text-text-secondary">نسبة المخاطرة/العائد:</span>
                <span className="font-medium text-green num">{riskRewardRatio}×</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[11px] bg-bg-deepest border border-border px-2.5 py-1.5 rounded-lg">
              <Shield size={11} className="text-text-secondary" />
              <span className="text-text-secondary">3 فرص محددة · خطة مُقفلة</span>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className={cn("text-center px-6 py-5 bg-bg-deepest border rounded-xl min-w-[140px]", cfg.verdictBorder)}>
          <div className="text-[10px] text-text-secondary font-medium tracking-widest mb-2">VERDICT</div>
          <div className={cn("text-2xl font-medium mb-3", cfg.verdictColor)}>{verdict}</div>
          <div className="w-full h-px bg-border mb-3" />
          <div className="text-[10px] text-text-tertiary leading-relaxed">
            الخطة مُختمة<br />بتوقيت النشر
          </div>
        </div>
      </div>
    </div>
  );
}
