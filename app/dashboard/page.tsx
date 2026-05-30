"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { NewsBar } from "@/components/ui/news-bar";
import { SimpleDashboard } from "@/components/dashboard/simple-dashboard";
import { AdminView } from "@/components/admin/admin-view";
import { useAuth } from "@/components/auth-provider";
import { newsBar } from "@/lib/mock-data";

export default function DashboardPage() {
  const { user, viewAs, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdminView = user.isAdmin && viewAs === "admin";

  const userNav = [
    { label: "📡 الرادار", href: "/dashboard", active: true },
    { label: "🔍 تحليل سهم", href: "#" },
    { label: "🎯 الفرص", href: "#", lockBadge: "SIGNAL" },
    { label: "📈 الأداء", href: "#", lockBadge: "SIGNAL" },
  ];

  const adminNav = [
    { label: "📊 نظرة عامة", href: "/dashboard", active: true },
    { label: "👥 المستخدمون", href: "#" },
    { label: "🎯 الفرص", href: "#" },
    { label: "💳 الاشتراكات", href: "#" },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-7 py-2.5 border-b border-border max-md:px-3.5" style={{ background: "rgb(var(--bg-deepest))" }}>
        <div className="max-w-[900px] mx-auto">
          <NewsBar level={newsBar.level} score={newsBar.score} text={newsBar.text} eventsCount={newsBar.eventsCount} />
        </div>
      </div>

      <AppHeader navItems={isAdminView ? adminNav : userNav} />

      {isAdminView ? <AdminView /> : <SimpleDashboard />}
    </div>
  );
}
