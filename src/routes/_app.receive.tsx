import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, ChevronRight, PackagePlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/receive")({
  component: ReceivePage,
  head: () => ({ meta: [{ title: "รับสินค้า — Stock Manager" }] }),
});

function ReceivePage() {
  const list = useQuery({
    queryKey: ["gr", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goods_receiving")
        .select("id, receive_no, invoice_no, status, received_at, vendors(name)")
        .order("received_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHeader
        title="รับสินค้า"
        subtitle="Goods Receiving"
        right={
          <Link
            to="/receive"
            className="touch-target inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> ใหม่
          </Link>
        }
      />

      <div className="mx-auto max-w-md p-4">
        {list.isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl border border-border bg-surface"
              />
            ))}
          </div>
        )}

        {list.data && list.data.length === 0 && (
          <EmptyState />
        )}

        {list.data && list.data.length > 0 && (
          <ul className="space-y-2">
            {list.data.map((r) => (
              <li key={r.id}>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <span className="rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/30">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.receive_no}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.vendors?.name ?? "—"} · INV {r.invoice_no}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "POSTED"
      ? "bg-success/15 text-success ring-success/30"
      : status === "DRAFT"
        ? "bg-warning/15 text-warning ring-warning/30"
        : "bg-muted text-muted-foreground ring-border";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cls}`}>
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
        <PackagePlus className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold">ยังไม่มีรายการรับสินค้า</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        เริ่มต้นรับสินค้าเข้าสต๊อกได้เลย
      </p>
      <button
        type="button"
        disabled
        className="touch-target mt-5 inline-flex items-center gap-2 rounded-xl bg-primary/40 px-5 py-3 text-sm font-semibold text-primary-foreground/70"
      >
        <Plus className="h-4 w-4" /> สร้างรายการรับ (เร็วๆ นี้)
      </button>
    </div>
  );
}
