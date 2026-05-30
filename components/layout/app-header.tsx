"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Bell, Crown, User, Settings, FileText, CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

interface AppHeaderProps {
  navItems: { label: string; href: string; active?: boolean; lockBadge?: string }[];
}

export function AppHeader({ navItems }: AppHeaderProps) {
  const { user, viewAs, setViewAs, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // 30s refresh counter
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => (c <= 0 ? 30 : c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-user-menu]")) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  if (!user) return null;

  const onLogout = () => {
    logout();
    router.push("/");
  };

  const onSwitchRole = (v: "admin" | "user") => {
    setViewAs(v);
    toast.show(v === "admin" ? "وضع المدير — صلاحيات كاملة" : "وضع المستخدم — معاينة المنصة");
  };

  const circumference = 2 * Math.PI * 8;
  const offset = circumference * (1 - countdown / 30);

  return (
    <header className="h-[60px] border-b border-border flex items-center px-7 gap-7 max-md:px-3.5 max-md:gap-3" style={{ background: "rgb(var(--bg-deepest))" }}>
      <Logo variant="full" size="sm" />

      <nav className="flex gap-0.5 flex-1 max-lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "px-3 py-2 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors",
              item.active
                ? "text-gold-bright bg-[rgb(var(--gold)/0.10)]"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
            )}
          >
            {item.label}
            {item.lockBadge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-tertiary font-medium">
                {item.lockBadge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {user.isAdmin && (
          <div className="flex bg-bg-card border border-border-soft rounded-lg p-0.5 gap-0.5 max-md:hidden">
            <button
              onClick={() => onSwitchRole("admin")}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors",
                viewAs === "admin"
                  ? "bg-gold text-[rgb(var(--bg-deepest))]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Crown size={12} strokeWidth={1.5} /> مدير
            </button>
            <button
              onClick={() => onSwitchRole("user")}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors",
                viewAs === "user"
                  ? "bg-gold text-[rgb(var(--bg-deepest))]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <User size={12} strokeWidth={1.5} /> مستخدم
            </button>
          </div>
        )}

        {/* Refresh counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-xs font-medium max-md:hidden">
          <div className="w-[18px] h-[18px] relative">
            <svg viewBox="0 0 18 18" className="w-full h-full -rotate-90">
              <circle cx="9" cy="9" r="8" fill="none" strokeWidth="2" stroke="rgb(var(--border-soft))" />
              <circle
                cx="9" cy="9" r="8"
                fill="none" strokeWidth="2"
                stroke="rgb(var(--green))"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[9px] num font-medium" style={{ color: "rgb(var(--green))" }}>
              {countdown}
            </div>
          </div>
          <span className="text-text-secondary text-[11px]">تحديث</span>
        </div>

        <ThemeToggle />

        <button
          onClick={() => toast.show("لا توجد إشعارات جديدة")}
          aria-label="الإشعارات"
          className="relative w-9 h-9 bg-bg-card border border-border-soft rounded-lg flex items-center justify-center text-text-secondary hover:text-gold-bright transition-colors"
        >
          <Bell size={15} strokeWidth={1.5} />
          <span
            className="absolute -top-1 -left-1 text-[9px] num font-medium px-1.5 py-0.5 rounded-full text-white"
            style={{ background: "rgb(var(--red))" }}
          >
            3
          </span>
        </button>

        <div className="relative" data-user-menu>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label="قائمة المستخدم"
            className="w-9 h-9 rounded-full bg-bg-elevated border border-border-soft flex items-center justify-center text-xs font-medium text-gold-bright"
          >
            {user.initials}
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 min-w-[240px] bg-bg-card border border-border-soft rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-4 border-b border-border">
                <div className="text-sm font-medium mb-0.5">{user.name}</div>
                <div className="text-xs text-text-secondary num text-right">{user.email}</div>
                <div className="flex gap-1.5 mt-2">
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-medium rounded",
                    user.isAdmin ? "text-gold-bright bg-[rgb(var(--gold)/0.10)]" : "text-blue bg-[rgb(var(--blue)/0.10)]"
                  )}>
                    {user.isAdmin ? "👑 مدير" : "👤 مستخدم"}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-bg-elevated text-text-secondary uppercase">
                    {user.tier}
                  </span>
                </div>
              </div>
              <DropdownItem icon={<Settings size={14} strokeWidth={1.5} />} label="الإعدادات" />
              <DropdownItem icon={<FileText size={14} strokeWidth={1.5} />} label="سجل النشاط" />
              <DropdownItem icon={<CreditCard size={14} strokeWidth={1.5} />} label="الفواتير والاشتراك" />
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red hover:bg-[rgb(var(--red)/0.08)] transition-colors"
              >
                <LogOut size={14} strokeWidth={1.5} /> تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-bg-elevated transition-colors">
      {icon}
      {label}
    </button>
  );
}
