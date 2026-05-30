"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = login(email, password);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 50% 50%, rgb(var(--gold) / 0.08) 0%, transparent 70%),
            radial-gradient(circle at 20% 80%, rgb(var(--green) / 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Top bar */}
      <div className="absolute top-6 right-8 left-8 flex items-center justify-between z-10">
        <Link href="/" className="text-text-secondary hover:text-gold-bright text-[13px] font-medium flex items-center gap-1.5">
          <ArrowRight size={14} strokeWidth={1.5} />
          الرجوع للصفحة الرئيسية
        </Link>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="relative z-10 card w-full max-w-[440px] p-10 shadow-xl">
        <div className="flex justify-center mb-7">
          <Logo variant="full" size="md" href={null} />
        </div>

        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[rgb(var(--gold)/0.10)] border border-[rgb(var(--gold)/0.25)] rounded-full text-[11px] text-gold-bright font-medium tracking-wide">
            <span className="w-1 h-1 rounded-full bg-current" />
            منصة بالدعوة فقط
          </span>
        </div>

        <h2 className="text-[24px] font-medium text-center mb-1.5">تسجيل الدخول</h2>
        <p className="text-center text-text-secondary text-[13px] mb-7">أدخل بيانات الحساب الذي تم إرساله لك</p>

        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-lg text-[13px] font-medium" style={{ background: "rgb(var(--red)/0.10)", borderColor: "rgb(var(--red)/0.30)", border: "1px solid", color: "rgb(var(--red))" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[12px] font-medium mb-2 tracking-wide" htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="input"
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[12px] font-medium mb-2 tracking-wide" htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between mb-6 text-[13px]">
            <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
              <input type="checkbox" className="accent-gold" />
              تذكرني لمدة 30 يوماً
            </label>
            <a href="#" className="text-gold-bright hover:underline font-medium">نسيت كلمة المرور؟</a>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-sm">
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            {!loading && <ArrowLeft size={14} strokeWidth={1.5} />}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div
          className="mt-6 p-3.5 rounded-lg text-xs leading-relaxed"
          style={{ background: "rgb(var(--gold)/0.08)", borderColor: "rgb(var(--gold)/0.30)", border: "1px dashed" }}
        >
          <strong className="text-gold-bright font-medium">🔑 بيانات الدخول التجريبية (المدير):</strong>
          <div className="mt-1.5 text-text-secondary">
            البريد: <code className="num bg-bg-deepest px-1.5 py-0.5 rounded text-text-primary text-[11px]">nif305@gmail.com</code>
          </div>
          <div className="text-text-secondary">
            كلمة المرور: <code className="num bg-bg-deepest px-1.5 py-0.5 rounded text-text-primary text-[11px]">Zx.321321</code>
          </div>
        </div>
      </div>
    </div>
  );
}
