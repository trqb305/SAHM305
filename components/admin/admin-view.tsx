"use client";

import { Crown, Users, Gem, Target, Wallet, ScrollText, Hourglass, BarChart3 } from "lucide-react";
import { adminStats, adminUsers, auditLog, tierDistribution, pendingSignals } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

const tierBadge: Record<string, string> = {
  radar: "bg-[rgb(var(--text-tertiary)/0.15)] text-text-secondary",
  signal: "bg-[rgb(var(--blue)/0.10)] text-blue",
  edge: "bg-[rgb(var(--gold)/0.10)] text-gold-bright",
  alpha: "bg-[rgb(var(--gold)/0.18)] text-gold-bright border border-[rgb(var(--gold)/0.4)]",
};

const roleBadge: Record<string, string> = {
  admin: "bg-[rgb(var(--gold)/0.10)] text-gold-bright",
  moderator: "bg-[rgb(var(--purple)/0.10)] text-purple",
  user: "bg-bg-elevated text-text-secondary",
};

const roleLabel: Record<string, string> = {
  admin: "مدير",
  moderator: "مشرف",
  user: "مستخدم",
};

const auditDot: Record<string, string> = {
  green: "bg-green",
  gold: "bg-gold",
  blue: "bg-blue",
  red: "bg-red",
};

export function AdminView() {
  const toast = useToast();

  return (
    <div className="max-w-[1480px] mx-auto px-7 py-6 max-md:px-4">
      {/* Banner */}
      <div className="rounded-2xl border border-[rgb(var(--gold)/0.30)] p-5 mb-6 flex items-center gap-4"
           style={{ background: "linear-gradient(135deg, rgb(var(--gold)/0.12) 0%, rgb(var(--gold)/0.03) 100%)" }}>
        <div className="w-11 h-11 bg-gold rounded-xl flex items-center justify-center text-[rgb(var(--bg-deepest))] flex-shrink-0">
          <Crown size={20} strokeWidth={1.5} />
        </div>
        <div>
          <div className="font-medium text-base mb-0.5">لوحة تحكم مدير النظام</div>
          <div className="text-sm text-text-secondary">صلاحيات كاملة على المستخدمين، الدعوات، الفرص، والاشتراكات. استخدم زر &laquo;مستخدم&raquo; أعلاه لمعاينة المنصة كما يراها المشتركون.</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5 max-lg:grid-cols-2 max-md:grid-cols-1">
        <StatCard icon={<Users size={15} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--blue)/0.10)] text-blue" label="إجمالي المستخدمين" value={adminStats.totalUsers.toLocaleString()} change={`▲ +${adminStats.weeklyNew} هذا الأسبوع`} changeColor="text-green" />
        <StatCard icon={<Gem size={15} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--green)/0.10)] text-green" label="الاشتراكات النشطة" value={adminStats.activeSubs.toLocaleString()} change={`▲ +${adminStats.monthlyGrowth}% MoM`} changeColor="text-green" />
        <StatCard icon={<Target size={15} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--gold)/0.10)] text-gold-bright" label="فرص قيد المتابعة" value={adminStats.pendingSignals.toString()} change={`${adminStats.successRate}% نسبة النجاح`} changeColor="text-text-secondary" />
        <StatCard icon={<Wallet size={15} strokeWidth={1.5} />} iconBg="bg-[rgb(var(--orange)/0.10)] text-orange" label="إيرادات الشهر" value={adminStats.monthlyRevenue.toLocaleString()} change={`▲ +${adminStats.revenueGrowth}% ريال`} changeColor="text-green" />
      </div>

      {/* Users + Audit */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-5 max-lg:grid-cols-1">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2.5">
              <Users size={16} strokeWidth={1.5} className="text-gold-bright" />
              إدارة المستخدمين
            </div>
            <button onClick={() => toast.show("تم فتح نموذج إرسال دعوة")} className="text-[11px] text-gold-bright hover:underline">+ إرسال دعوة</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr style={{ background: "rgb(var(--bg-deepest))" }}>
                  <th className="text-right text-[10px] font-medium text-text-secondary px-3.5 py-2.5 tracking-wide">المستخدم</th>
                  <th className="text-right text-[10px] font-medium text-text-secondary px-3.5 py-2.5 tracking-wide">الدور</th>
                  <th className="text-right text-[10px] font-medium text-text-secondary px-3.5 py-2.5 tracking-wide">الباقة</th>
                  <th className="text-right text-[10px] font-medium text-text-secondary px-3.5 py-2.5 tracking-wide">الحالة</th>
                  <th className="text-right text-[10px] font-medium text-text-secondary px-3.5 py-2.5 tracking-wide">آخر نشاط</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u.email} className="border-b border-border last:border-b-0 hover:bg-bg-elevated transition-colors">
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-bg-elevated rounded-full flex items-center justify-center text-[11px] font-medium text-gold-bright">{u.initials}</div>
                        <div>
                          <div className="text-[13px] font-medium">{u.name}</div>
                          <div className="text-[11px] text-text-secondary num">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium", roleBadge[u.role])}>
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase", tierBadge[u.tier])}>{u.tier}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", u.active ? "text-green" : "text-text-tertiary")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", u.active ? "bg-green" : "bg-text-tertiary")} />
                        {u.active ? "نشط" : "خامل"}
                      </span>
                    </td>
                    <td className="px-3.5 py-3"><span className="num text-[11px] text-text-secondary">{u.lastSeen}</span></td>
                    <td className="px-3.5 py-3">
                      <button className="w-7 h-7 rounded-md border border-border-soft text-text-secondary hover:text-gold-bright hover:border-gold transition-colors text-xs">⚙</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2.5">
              <ScrollText size={16} strokeWidth={1.5} className="text-gold-bright" />
              سجل الأحداث (Audit Log)
            </div>
            <div className="text-[11px] text-text-secondary">آخر ساعة</div>
          </div>
          <div>
            {auditLog.map((item, i) => (
              <div key={i} className="flex gap-3 px-5 py-3 border-b border-border last:border-b-0 items-start">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", auditDot[item.dot])} />
                <div className="flex-1">
                  <div className="text-[13px] [&>strong]:text-gold-bright [&>strong]:font-medium" dangerouslySetInnerHTML={{ __html: item.text }} />
                  <div className="text-[10px] text-text-tertiary mt-0.5 num">{item.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2.5">
              <BarChart3 size={16} strokeWidth={1.5} className="text-gold-bright" />
              توزيع الباقات
            </div>
            <div className="text-[11px] text-text-secondary num">{adminStats.totalUsers} مستخدم</div>
          </div>
          <div>
            {tierDistribution.map((t) => (
              <div key={t.tier} className="px-5 py-3.5 border-b border-border last:border-b-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase", tierBadge[t.tier.toLowerCase()])}>{t.label}</span>
                  <span className="num text-[13px] font-medium">{t.count} ({t.pct}%)</span>
                </div>
                <div className="h-1.5 bg-bg-deepest rounded-full overflow-hidden" dir="ltr">
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2.5">
              <Hourglass size={16} strokeWidth={1.5} className="text-gold-bright" />
              فرص بانتظار الموافقة
            </div>
            <div className="text-[11px] text-text-secondary">{pendingSignals.length} معلّقة</div>
          </div>
          <div>
            {pendingSignals.map((s) => (
              <div key={s.symbol} className="px-5 py-3 border-b border-border last:border-b-0 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="num text-[13px] font-medium text-gold-bright">{s.symbol}</span>
                    <span className="text-[12px] font-medium">{s.name}</span>
                  </div>
                  <div className="text-[11px] text-text-secondary num">دخول {s.entry} · T1 {s.t1} · SL {s.sl} · قوة {s.strength}</div>
                </div>
                <button onClick={() => toast.show("تمت الموافقة وتم ختم الخطة")} className="px-3 py-1 rounded-md text-[11px] font-medium border border-[rgb(var(--green)/0.3)] text-green bg-[rgb(var(--green)/0.08)] hover:bg-[rgb(var(--green)/0.16)]">قبول</button>
                <button onClick={() => toast.show("تم رفض الفرصة")} className="px-3 py-1 rounded-md text-[11px] font-medium border border-[rgb(var(--red)/0.3)] text-red bg-[rgb(var(--red)/0.08)] hover:bg-[rgb(var(--red)/0.16)]">رفض</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, iconBg, label, value, change, changeColor }: { icon: React.ReactNode; iconBg: string; label: string; value: string; change: string; changeColor: string }) {
  return (
    <div className="card p-5 relative">
      <div className={cn("absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center", iconBg)}>{icon}</div>
      <div className="text-xs text-text-secondary font-medium mb-3">{label}</div>
      <div className="num text-[28px] font-medium leading-none mb-1.5">{value}</div>
      <div className={cn("text-[11px] num", changeColor)}>{change}</div>
    </div>
  );
}
