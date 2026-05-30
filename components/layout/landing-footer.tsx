import { Logo } from "@/components/ui/logo";

export function LandingFooter() {
  return (
    <footer className="relative z-5 mt-24 px-12 max-md:px-5 py-12 border-t border-border" style={{ background: "rgb(var(--bg-deepest))" }}>
      <div className="max-w-[1320px] mx-auto grid gap-9 mb-7 grid-cols-[2fr_1fr_1fr_1fr] max-lg:grid-cols-2 max-md:grid-cols-1">
        <div>
          <Logo variant="full" size="md" />
          <p className="text-sm text-text-secondary leading-relaxed max-w-sm mt-4">
            منصة عربية بالدعوة فقط مخصصة لتحليل سوق الأسهم السعودي بمنهج المكتب المؤسسي. ليست توصية، بل قرار محسوب.
          </p>
        </div>
        <FooterCol title="المنصة" links={[
          { label: "القدرات", href: "#features" },
          { label: "كيف تعمل", href: "#how" },
          { label: "الباقات", href: "#pricing" },
          { label: "سجل الأداء", href: "#" },
        ]} />
        <FooterCol title="الشركة" links={[
          { label: "من نحن", href: "#" },
          { label: "المدوّنة", href: "#" },
          { label: "الوظائف", href: "#" },
          { label: "تواصل", href: "#" },
        ]} />
        <FooterCol title="قانوني" links={[
          { label: "شروط الاستخدام", href: "#" },
          { label: "سياسة الخصوصية", href: "#" },
          { label: "إخلاء المسؤولية", href: "#" },
          { label: "سياسة الاسترداد", href: "#" },
        ]} />
      </div>
      <div className="max-w-[1320px] mx-auto pt-6 border-t border-border text-center text-xs text-text-tertiary leading-relaxed">
        © 2026 سهم 305. منصة تحليل، ليست توصية استثمارية. الأداء السابق لا يضمن نتائج مستقبلية. تداول الأسهم محفوف بالمخاطر، وقرارك النهائي مسؤوليتك.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-medium mb-3.5 tracking-wide">{title}</h4>
      {links.map((l) => (
        <a key={l.label} href={l.href} className="block text-sm text-text-secondary hover:text-gold-bright py-1">
          {l.label}
        </a>
      ))}
    </div>
  );
}
