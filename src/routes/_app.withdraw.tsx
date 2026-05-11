import { createFileRoute } from "@tanstack/react-router";
import { PackageMinus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_app/withdraw")({
  component: WithdrawPage,
  head: () => ({ meta: [{ title: "เบิกสินค้า — Stock Manager" }] }),
});

function WithdrawPage() {
  return (
    <div>
      <PageHeader title="เบิกสินค้า" subtitle="Stock Issue" />
      <ComingSoon icon={<PackageMinus className="h-7 w-7" />} title="โมดูลเบิกสินค้า" />
    </div>
  );
}

function ComingSoon({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/30">
          {icon}
        </div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          กำลังพัฒนา — จะเปิดใช้งานในเวอร์ชันถัดไป
        </p>
      </div>
    </div>
  );
}
