import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  LogOut,
  PackageMinus,
  PackagePlus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
  head: () => ({ meta: [{ title: "หน้าหลัก — Stock Manager" }] }),
});

const stats = {
  items: 128,
  locations: 8,
  lowStock: 3,
  todayIn: 18,
  todayOut: 11,
  accuracy: 96,
};

const lowStockItems = [
  { name: "Mixed Vegetables", location: "Cold Room", qty: 3, min: 8 },
  { name: "Butter Block", location: "Main Store", qty: 5, min: 12 },
  { name: "Salmon Portion", location: "Cold Room", qty: 2, min: 6 },
];

const activities = [
  { label: "รับเข้า GR-2026-003", meta: "Rice 5kg +40", tone: "in" },
  { label: "เบิก IS-2026-001", meta: "Main Kitchen -6", tone: "out" },
  { label: "นับ CT-2026-001", meta: "Variance -4", tone: "count" },
];

function HomePage() {
  const { signOut } = useAuth();
  const displayName = "user";
  const lowStockRef = useRef<HTMLElement | null>(null);

  function scrollToLowStock() {
    lowStockRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="bg-background">
      <header className="safe-top px-5 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">สวัสดี</p>
            <h1 className="mt-0.5 text-3xl font-bold leading-tight">{displayName}</h1>
          </div>
          <button
            onClick={signOut}
            className="touch-target -mr-2 rounded-full p-2 text-muted-foreground hover:bg-surface hover:text-destructive"
            aria-label="ออกจากระบบ"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-6 px-5 pb-6 pt-5">
        <section className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/18 via-surface to-warning/10 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">สถานะคลังวันนี้</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="num-display text-5xl font-bold leading-none">
                  {stats.items}
                </span>
                <span className="pb-1 text-sm font-medium text-muted-foreground">
                  รายการสินค้า
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-primary/15 p-4 text-primary ring-1 ring-primary/25">
              <Boxes className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <HeroMetric icon={PackagePlus} label="รับเข้า" value={stats.todayIn} tone="primary" />
            <HeroMetric icon={PackageMinus} label="เบิกออก" value={stats.todayOut} tone="accent" />
            <HeroMetric icon={CheckCircle2} label="แม่นยำ" value={`${stats.accuracy}%`} tone="success" />
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">ทำรายการด่วน</h2>
            <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">
              4 actions
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard
              to="/receive"
              label="รับสินค้า"
              description="เปิด GR ใหม่"
              value="+18 วันนี้"
              icon={PackagePlus}
              tint="primary"
            />
            <ActionCard
              to="/withdraw"
              label="เบิกสินค้า"
              description="ตัดออกจากคลัง"
              value="-11 วันนี้"
              icon={PackageMinus}
              tint="accent"
            />
            <ActionCard
              to="/count"
              label="นับสต๊อก"
              description="ตรวจ variance"
              value="2 รอบ"
              icon={ClipboardCheck}
              tint="warning"
            />
            <ActionCard
              to="/more"
              label="โอน / อื่นๆ"
              description="master & report"
              value="9 เมนู"
              icon={ArrowRightLeft}
              tint="muted"
            />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <InsightCard
            icon={AlertTriangle}
            label="สต๊อกต่ำ"
            value={stats.lowStock}
            caption="ต้องเติมวันนี้"
            tone="warn"
            onClick={scrollToLowStock}
          />
          <InsightCard
            icon={Boxes}
            label="คลัง / จุดเก็บ"
            value={stats.locations}
            caption="พร้อมใช้งาน"
            tone="default"
          />
        </section>

        <section ref={lowStockRef} id="low-stock-items" className="scroll-mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              สินค้าที่มี stock ต่ำ
            </h2>
            <span className="rounded-full bg-warning/10 px-3 py-1 text-[11px] font-semibold text-warning ring-1 ring-warning/25">
              {lowStockItems.length} รายการ
            </span>
          </div>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="rounded-xl bg-warning/10 p-2 text-warning ring-1 ring-warning/30">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.location}</p>
                </div>
                <div className="text-right">
                  <p className="num-display text-sm font-bold text-warning">{item.qty}</p>
                  <p className="text-[11px] text-muted-foreground">min {item.min}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">ความเคลื่อนไหวล่าสุด</h2>
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityRow key={activity.label} {...activity} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof PackagePlus;
  label: string;
  value: number | string;
  tone: "primary" | "accent" | "success";
}) {
  const toneClass = {
    primary: "text-primary bg-primary/10 ring-primary/20",
    accent: "text-accent bg-accent/10 ring-accent/20",
    success: "text-success bg-success/10 ring-success/20",
  }[tone];
  return (
    <div className={`rounded-2xl p-3 ring-1 ${toneClass}`}>
      <Icon className="h-4 w-4" />
      <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
      <p className="num-display mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
  caption,
  tone,
  onClick,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: number;
  caption: string;
  tone: "warn" | "default";
  onClick?: () => void;
}) {
  const toneClass =
    tone === "warn"
      ? "bg-warning/10 text-warning ring-warning/25"
      : "bg-primary/10 text-primary ring-primary/25";
  const content = (
    <>
      <div className={`inline-flex rounded-2xl p-2 ring-1 ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{label}</p>
      <p className="num-display mt-0.5 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="touch-target rounded-3xl border border-warning/30 bg-card p-4 text-left transition active:scale-[0.98]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      {content}
    </div>
  );
}

function ActionCard({
  to,
  label,
  description,
  value,
  icon: Icon,
  tint,
}: {
  to: "/receive" | "/withdraw" | "/count" | "/more";
  label: string;
  description: string;
  value: string;
  icon: typeof PackagePlus;
  tint: "primary" | "accent" | "warning" | "muted";
}) {
  const ring = {
    primary: "ring-primary/30 bg-primary/10 text-primary",
    accent: "ring-accent/30 bg-accent/10 text-accent",
    warning: "ring-warning/30 bg-warning/10 text-warning",
    muted: "ring-border bg-surface text-foreground",
  }[tint];

  return (
    <Link
      to={to}
      className="touch-target group flex min-h-40 flex-col justify-between rounded-3xl border border-border bg-card p-4 transition active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${ring}`}
        >
          <Icon className="h-6 w-6" />
        </span>
        <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-semibold text-muted-foreground ring-1 ring-border">
          {value}
        </span>
      </div>
      <div>
        <span className="block text-base font-semibold">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
      </div>
    </Link>
  );
}

function ActivityRow({
  label,
  meta,
  tone,
}: {
  label: string;
  meta: string;
  tone: string;
}) {
  const icon =
    tone === "in" ? PackagePlus : tone === "out" ? PackageMinus : ClipboardCheck;
  const Icon = icon;
  const toneClass =
    tone === "in"
      ? "bg-primary/10 text-primary ring-primary/25"
      : tone === "out"
        ? "bg-accent/10 text-accent ring-accent/25"
        : "bg-warning/10 text-warning ring-warning/25";
  return (
    <div className="flex items-center gap-3">
      <span className={`rounded-xl p-2 ring-1 ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <Clock3 className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
