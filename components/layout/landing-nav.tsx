"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function LandingNav() {
  return (
    <nav className="relative z-10 max-w-[1320px] mx-auto flex items-center justify-between px-12 py-5 max-md:px-5 max-md:py-4">
      <Logo variant="full" size="md" href="/" />
      <div className="flex items-center gap-1 max-md:hidden">
        <a href="#features" className="text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg text-sm font-medium">
          المنصة
        </a>
        <a href="#how" className="text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg text-sm font-medium">
          كيف تعمل
        </a>
        <a href="#pricing" className="text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg text-sm font-medium">
          الباقات
        </a>
        <a href="#" className="text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg text-sm font-medium">
          سجل الأداء
        </a>
      </div>
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <Link href="/login" className="btn btn-ghost max-md:hidden">
          تسجيل الدخول
        </Link>
        <Link href="/login" className="btn btn-primary">
          طلب دعوة
        </Link>
      </div>
    </nav>
  );
}
