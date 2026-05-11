import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRightLeft,
  Building2,
  Boxes,
  ClipboardList,
  FileBarChart,
  LogOut,
  Settings,
  ShieldCheck,
  Tags,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/more")({
  component: MorePage,
  head: () => ({ meta: [{ title: "เพิ่มเติม — Stock Manager" }] }),
});

function MorePage() {
  const { user, signOut } = useAuth();

  const groups = [
    {
      label: "การจัดการคลัง",
      items: [
        { icon: ArrowRightLeft, label: "โอนระหว่างคลัง", soon: true },
        { icon: ClipboardList, label: "ประวัติการเคลื่อนไหว", soon: true },
        { icon: FileBarChart, label: "รายงาน", soon: true },
      ],
    },
    {
      label: "ข้อมูลหลัก (Master)",
      items: [
        { icon: Boxes, label: "สินค้า", soon: true },
        { icon: Tags, label: "หมวดหมู่ / หน่วย", soon: true },
        { icon: Truck, label: "ผู้ขาย (Vendors)", soon: true },
        { icon: Building2, label: "Site / Location", soon: true },
      ],
    },
    {
      label: "ระบบ",
      items: [
        { icon: ShieldCheck, label: "ผู้ใช้งาน & สิทธิ์ (Back Office)", soon: true },
        { icon: Settings, label: "ตั้งค่า", soon: true },
      ],
    },
  ];

  return (
    <div>
      <PageHeader title="เพิ่มเติม" subtitle={user?.email ?? ""} />
      <div className="mx-auto max-w-md space-y-6 p-4">
        {groups.map((g) => (
          <div key={g.label}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {g.label}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {g.items.map((it, idx) => (
                <button
                  key={it.label}
                  type="button"
                  disabled
                  className={`touch-target flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                    idx > 0 ? "border-t border-border" : ""
                  } disabled:opacity-60`}
                >
                  <span className="rounded-lg bg-surface p-2 text-muted-foreground">
                    <it.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{it.label}</span>
                  {it.soon && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      เร็วๆ นี้
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={signOut}
          className="touch-target flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-4 text-sm font-semibold text-destructive hover:bg-destructive/15"
        >
          <LogOut className="h-4 w-4" /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
