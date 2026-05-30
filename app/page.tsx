import Link from "next/link";
import { ArrowLeft, Zap, TrendingUp, Lock, Clock, Newspaper, CheckCircle2 } from "lucide-react";
import { LandingNav } from "@/components/layout/landing-nav";
import { LandingFooter } from "@/components/layout/landing-footer";
import { NewsBar } from "@/components/ui/news-bar";
import { newsBar } from "@/lib/mock-data";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Atmospheric backgrounds */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgb(var(--gold) / 0.10) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 30%, rgb(var(--green) / 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 15% 60%, rgb(var(--blue) / 0.03) 0%, transparent 60%)
          `,
        }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(rgb(var(--text-tertiary) / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgb(var(--text-tertiary) / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      <LandingNav />

      {/* News bar */}
      <div className="relative z-5 max-w-[1320px] mx-auto px-12 max-md:px-5">
        <NewsBar level={newsBar.level} score={newsBar.score} text={newsBar.text} eventsCount={newsBar.eventsCount} />
      </div>

      {/* Hero */}
      <section className="relative z-5 max-w-[1320px] mx-auto px-12 pt-14 pb-8 text-center max-md:px-5 max-md:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[rgb(var(--gold)/0.10)] border border-[rgb(var(--gold)/0.25)] rounded-full text-xs text-gold-bright font-medium mb-7 tracking-wide">
          <span className="w-1.5 h-1.5 bg-gold rounded-full" style={{ animation: "pulse-fade 2s infinite" }} />
          منصة بالدعوة فقط · 7 محركات تحليل آلية
        </div>
        <h1 className="text-[clamp(38px,5.5vw,64px)] font-medium leading-[1.1] tracking-tight mb-5">
          تداول سوق الأسهم السعودي<br />
          <span className="text-gold-bright">بقرار محسوب لا بحدس</span>
        </h1>
        <p className="text-[17px] text-text-secondary max-w-[620px] mx-auto leading-relaxed mb-9">
          منصة تحليلية احترافية مخصصة لسوق تداول السعودي. سبعة محركات مستقلة تحلل كل فرصة، وتعطيك قراراً بدرجة من 100 — لا توصية، بل قرار شفاف بأسبابه.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-12">
          <Link href="/login" className="btn btn-primary btn-large">
            طلب دعوة للوصول
            <ArrowLeft size={16} strokeWidth={1.5} />
          </Link>
          <a href="#features" className="btn btn-outline-gold btn-large">
            استكشف المنصة
          </a>
        </div>

        {/* Stats */}
        <div className="card flex max-w-[920px] mx-auto overflow-hidden max-lg:flex-wrap">
          <Stat num="7" label="محركات تحليل" />
          <Stat num="100" label="نقطة قرار" />
          <Stat num="30s" label="تحديث آلي" />
          <Stat num="305+" label="فرصة موثّقة" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-5 max-w-[1320px] mx-auto px-12 mt-28 max-md:px-5">
        <div className="text-center text-xs text-gold-bright font-medium tracking-[0.25em] mb-3.5">القدرات الأساسية</div>
        <h2 className="text-center text-[clamp(28px,4vw,40px)] font-medium tracking-tight mb-3.5 leading-[1.2]">كل أداة يحتاجها المتداول المحترف</h2>
        <p className="text-center text-text-secondary max-w-[560px] mx-auto mb-12 text-base">منصة بُنيت بمنطق مكتب التداول المؤسسي — لا تعطي رأياً بل تعرض الأدلة وتترك القرار لك.</p>

        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
          <Feature icon={<Zap size={20} strokeWidth={1.5} />} title="7 محركات تحليل آلية" desc="الاتجاه، الزخم، السيولة، الكبار، المناطق الحرجة، الأخبار، وضوح التنفيذ — كل محرك يعطي درجته منفصلاً، والقرار النهائي مجموع شفاف." />
          <Feature icon={<TrendingUp size={20} strokeWidth={1.5} />} title="قرار بدرجة من 100" desc="≥75 نفّذ · 55–74 مشروط · 40–54 راقب · أقل رُفض. قرار رقمي واضح — لا «قد يصعد» ولا «محتمل أن ينخفض»." />
          <Feature icon={<Lock size={20} strokeWidth={1.5} />} title="خطة مُقفلة (Frozen Plan)" desc="الفرصة تُختم بتوقيت النشر ولا تتغير لاحقاً. لا «تعديل» ولا «تنقيح» بعد الحدث — شفافية مطلقة في سجل الأداء." />
          <Feature icon={<Clock size={20} strokeWidth={1.5} />} title="تحديث كل 30 ثانية" desc="عداد تنازلي مرئي. البيانات تتحدّث آلياً من مصدر موثّق، والقرار يُعاد حسابه — أنت ترى الحركة لحظة بلحظة." />
          <Feature icon={<Newspaper size={20} strokeWidth={1.5} />} title="شريط الأخبار الذكي" desc="يقيّم مستوى المخاطرة من أحداث السوق (تاسي، أوبك، الفيدرالي، التضخم) بثلاث مستويات — هادئ، حذر، خطر — ويعرض السبب بالعربية." />
          <Feature icon={<CheckCircle2 size={20} strokeWidth={1.5} />} title="سجل أداء مختوم" desc="كل فرصة بتوقيع زمني (Hash) وتاريخ نشر لا يُعدّل. الفرص الفاشلة معروضة بنفس وضوح الناجحة — الشفافية الكاملة محرك الثقة." />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-5 max-w-[1320px] mx-auto px-12 mt-28 max-md:px-5">
        <div className="text-center text-xs text-gold-bright font-medium tracking-[0.25em] mb-3.5">كيف تعمل المنصة</div>
        <h2 className="text-center text-[clamp(28px,4vw,40px)] font-medium tracking-tight mb-3.5 leading-[1.2]">3 خطوات. لا أكثر.</h2>
        <p className="text-center text-text-secondary max-w-[560px] mx-auto mb-12 text-base">من جلب البيانات إلى القرار النهائي في ثوانٍ — كل خطوة شفافة ومرئية لك.</p>

        <div className="card grid grid-cols-3 max-lg:grid-cols-1 overflow-hidden">
          <Step num="01" title="جلب البيانات الحية" desc="المنصة تتصل بمصادر بيانات تداول الموثّقة وتسحب أسعار الأسهم، الأحجام، عمق السوق، وأخبار السوق فوراً وبدون وسيط." />
          <Step num="02" title="تشغيل المحركات السبعة" desc="سبع خوارزميات مستقلة تحلل البيانات في وقت واحد — كل محرك يعطي درجته من 100 على معايير محددة لا اجتهادية." />
          <Step num="03" title="قرار شفاف ومُقفل" desc="المنصة تعرض القرار، أسبابه، الأهداف، ووقف الخسارة — وتختمه بتوقيت لا يُعدّل. القرار النهائي للتنفيذ يبقى عليك." />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-5 max-w-[1320px] mx-auto px-12 mt-28 max-md:px-5">
        <div className="text-center text-xs text-gold-bright font-medium tracking-[0.25em] mb-3.5">الباقات</div>
        <h2 className="text-center text-[clamp(28px,4vw,40px)] font-medium tracking-tight mb-3.5 leading-[1.2]">من الرادار المجاني إلى الألفا الكامل</h2>
        <p className="text-center text-text-secondary max-w-[560px] mx-auto mb-11 text-base">ابدأ مجاناً برادار السوق، ثم رقّ متى ما احتجت طبقة تحليل أعمق.</p>

        <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-md:grid-cols-1">
          <PricingCard tier="رادار" tierEn="RADAR" price="0" period="مجاني للأبد" features={["لوحة السوق الحية", "حكم السوق اليومي", "تحليل أي سهم بمحرك واحد", "شريط الأخبار"]} cta="ابدأ الآن" ctaVariant="ghost" />
          <PricingCard tier="سيجنال" tierEn="SIGNAL" price="99" period="ريال شهرياً" features={["كل ما في رادار", "الفرص المرصودة كاملة", "سجل الأداء التاريخي", "كونسول الأسهم", "تنبيهات داخل التطبيق"]} cta="اشترك" ctaVariant="ghost" />
          <PricingCard tier="إيدج" tierEn="EDGE" price="249" period="ريال شهرياً" features={["كل ما في سيجنال", "الشارت المتقدم بـ 4 زوايا", "تنبيهات الكبار اللحظية", "تحليل قطاعات معمّق", "الفرص بلا حدود"]} cta="اشترك الآن" ctaVariant="primary" featured />
          <PricingCard tier="ألفا" tierEn="ALPHA" price="499" period="ريال شهرياً · 500 مقعد" features={["كل ما في إيدج", "محرك الصقر 305 الحصري", "تنبيهات ما قبل الجلسة", "تقرير PDF أسبوعي", "أولوية الدعم المباشر"]} cta="اطلب دعوة" ctaVariant="ghost" />
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex-1 px-4 py-5 text-center border-l border-border last:border-l-0 max-lg:flex-[1_0_50%] max-lg:border-b">
      <div className="num text-[28px] font-medium text-gold-bright leading-none mb-1.5">{num}</div>
      <div className="text-xs text-text-secondary font-medium">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-7 hover:border-border-strong transition-all hover:-translate-y-0.5">
      <div className="w-11 h-11 bg-[rgb(var(--gold)/0.10)] border border-[rgb(var(--gold)/0.30)] rounded-xl flex items-center justify-center text-gold-bright mb-4">
        {icon}
      </div>
      <h3 className="text-[17px] font-medium mb-2">{title}</h3>
      <p className="text-[13px] text-text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="p-8 border-l border-border last:border-l-0 max-lg:border-l-0 max-lg:border-b max-lg:last:border-b-0">
      <div className="num text-[13px] font-medium text-gold-bright mb-3.5 tracking-wide">/ STEP {num}</div>
      <h3 className="text-[18px] font-medium mb-2">{title}</h3>
      <p className="text-[13px] text-text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ tier, tierEn, price, period, features, cta, ctaVariant, featured }: { tier: string; tierEn: string; price: string; period: string; features: string[]; cta: string; ctaVariant: "primary" | "ghost"; featured?: boolean }) {
  return (
    <div className={`card p-7 relative ${featured ? "border-gold" : ""}`}
         style={featured ? { background: "linear-gradient(180deg, rgb(var(--gold)/0.08) 0%, rgb(var(--bg-card)) 60%)" } : undefined}>
      {featured && (
        <div className="absolute -top-2.5 right-1/2 translate-x-1/2 bg-gold text-[rgb(var(--bg-deepest))] px-3 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap">
          الأكثر طلباً
        </div>
      )}
      <div className="text-[11px] text-gold-bright font-medium tracking-[0.15em] mb-1">{tier}</div>
      <div className="text-[22px] font-medium mb-4">{tierEn}</div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="num text-[38px] font-medium leading-none">{price}</span>
      </div>
      <div className="text-[13px] text-text-secondary mb-5">{period}</div>
      <ul className="mb-6 space-y-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px] py-1">
            <span className="text-gold-bright font-medium leading-6 flex-shrink-0">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href="/login" className={`btn ${ctaVariant === "primary" ? "btn-primary" : "btn-ghost"} w-full justify-center`}>
        {cta}
      </Link>
    </div>
  );
}
