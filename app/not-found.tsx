import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgb(var(--gold) / 0.08) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-7">
          <Logo variant="full" size="lg" href="/" />
        </div>
        <div className="num text-[120px] font-medium text-gold-bright leading-none mb-4">404</div>
        <h1 className="text-2xl font-medium mb-2">الصفحة غير موجودة</h1>
        <p className="text-text-secondary mb-7 max-w-sm mx-auto">
          الصفحة التي تبحث عنها قد تكون منقولة أو محذوفة. يمكنك العودة للرئيسية.
        </p>
        <Link href="/" className="btn btn-primary">
          العودة للرئيسية
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
