import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/count")({
  component: CountPage,
  head: () => ({ meta: [{ title: "นับสต๊อก — Stock Manager" }] }),
});

function CountPage() {
  return (
    <div>
      <PageHeader title="นับสต๊อก" subtitle="Stock Counting" />
      <div className="mx-auto max-w-md p-6">
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning ring-1 ring-warning/30">
            <ClipboardCheck className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold">โมดูลนับสต๊อก</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            กำลังพัฒนา — จะรองรับ Cycle / Full / Blind count, multi-user, approval
          </p>
        </div>
      </div>
    </div>
  );
}
