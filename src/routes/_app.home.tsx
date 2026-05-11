import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  PackagePlus,
  PackageMinus,
  ClipboardCheck,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  LogOut,
  Boxes,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
  head: () => ({ meta: [{ title: "หน้าหลัก — Stock Manager" }] }),
});

function HomePage() {
  const { user, signOut } = useAuth();

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const stats = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const [items, locations, lowStock] = await Promise.all([
        supabase.from("items").select("id", { count: "exact", head: true }),
        supabase.from("stock_locations").select("id", { count: "exact", head: true }),
        supabase
          .from("stock_balances")
          .select("id", { count: "exact", head: true })
          .lt("qty_on_hand", 10),
      ]);
      return {
        items: items.count ?? 0,
        locations: locations.count ?? 0,
        lowStock: lowStock.count ?? 0,
      };
    },
  });

  const displayName =
    profile.data?.full_name ?? user?.email?.split("@")[0] ?? "ผู้ใช้";

  return (
    <div>
      <header className="safe-top px-5 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">สวัสดี</p>
            <h1 className="mt-0.5 text-2xl font-bold leading-tight">{displayName}</h1>
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

      <section className="mx-5 mt-5 rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-surface p-5 ring-1 ring-primary/20">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/20 p-3">
            <Boxes className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">สินค้าทั้งหมด</p>
            <p className="num-display text-3xl font-bold">
              {stats.data?.items ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="คลัง / จุดเก็บ" value={stats.data?.locations} />
          <Stat
            label="สต๊อกต่ำ"
            value={stats.data?.lowStock}
            tone={stats.data && stats.data.lowStock > 0 ? "warn" : "default"}
          />
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          ทำรายการด่วน
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            to="/receive"
            label="รับสินค้า"
            icon={PackagePlus}
            tint="primary"
          />
          <ActionCard
            to="/withdraw"
            label="เบิกสินค้า"
            icon={PackageMinus}
            tint="accent"
          />
          <ActionCard
            to="/count"
            label="นับสต๊อก"
            icon={ClipboardCheck}
            tint="warning"
          />
          <ActionCard
            to="/more"
            label="โอน / อื่นๆ"
            icon={ArrowRightLeft}
            tint="muted"
          />
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">ภาพรวม</h2>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 text-sm">
            <TrendingUp className="h-5 w-5 text-success" />
            <p className="text-muted-foreground">ยังไม่มีการเคลื่อนไหววันนี้</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            เริ่มต้นโดยการตั้งค่า Site, Location และ Items ใน Back Office
            หรือเริ่มรับสินค้าเข้าสต๊อกทันทีเมื่อมีข้อมูลแล้ว
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value?: number;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-2xl bg-background/40 p-3 ring-1 ring-border">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`num-display mt-0.5 flex items-center gap-1 text-xl font-semibold ${
          tone === "warn" && (value ?? 0) > 0 ? "text-warning" : ""
        }`}
      >
        {tone === "warn" && (value ?? 0) > 0 && (
          <AlertTriangle className="h-4 w-4" />
        )}
        {value ?? "—"}
      </p>
    </div>
  );
}

function ActionCard({
  to,
  label,
  icon: Icon,
  tint,
}: {
  to: "/receive" | "/withdraw" | "/count" | "/more";
  label: string;
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
      className="touch-target group flex aspect-[4/3] flex-col items-start justify-between rounded-3xl border border-border bg-card p-4 transition active:scale-[0.98]"
    >
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${ring}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-base font-semibold">{label}</span>
    </Link>
  );
}
