import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronRight, Copy, PackageMinus, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/withdraw")({
  component: WithdrawPage,
  head: () => ({ meta: [{ title: "เบิกสินค้า — Stock Manager" }] }),
});

type IssueStatus = "DRAFT" | "ISSUED";
type ProductUnit = "กก." | "ชิ้น" | "แพ็ค" | "กล่อง" | "ลัง" | "ขวด" | "ถุง";
type ConvertedUnit = "กรัม" | "ชิ้น";

const productUnits: ProductUnit[] = ["กก.", "ชิ้น", "แพ็ค", "กล่อง", "ลัง", "ขวด", "ถุง"];

interface IssueRecord {
  id: string;
  issueNo: string;
  department: string;
  location: string;
  itemName: string;
  qty: number;
  unit: ProductUnit;
  convertedQty?: number;
  convertedUnit?: ConvertedUnit;
  unitFactor?: number;
  status: IssueStatus;
  requestedBy: string;
  note: string;
}

const initialIssues: IssueRecord[] = [
  {
    id: "is-001",
    issueNo: "IS-2026-001",
    department: "Main Kitchen",
    location: "Hot Kitchen",
    itemName: "Rice 5kg",
    qty: 6,
    unit: "ถุง",
    status: "ISSUED",
    requestedBy: "Chef Team",
    note: "รอบเช้า",
  },
  {
    id: "is-002",
    issueNo: "IS-2026-002",
    department: "Catering",
    location: "Banquet Hall A",
    itemName: "Chicken Breast",
    qty: 10,
    unit: "กก.",
    convertedQty: 10000,
    convertedUnit: "กรัม",
    unitFactor: 1000,
    status: "DRAFT",
    requestedBy: "Event Ops",
    note: "รออนุมัติจำนวน",
  },
];

const emptyForm = {
  department: "",
  location: "",
  itemName: "",
  qty: "1",
  unit: "กก." as ProductUnit,
  unitFactor: "1000",
  requestedBy: "",
  note: "",
};

const packUnits: ProductUnit[] = ["แพ็ค", "กล่อง", "ลัง"];
const convertibleUnits: ProductUnit[] = ["กก.", ...packUnits];

function defaultUnitFactor(unit: ProductUnit) {
  if (unit === "กก.") return "1000";
  if (packUnits.includes(unit)) return "1";
  return "1";
}

function formatQty(value: number) {
  return value.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function getConversion(unit: ProductUnit, qty: number, factor: number) {
  if (!Number.isFinite(qty) || qty <= 0) return null;
  if (unit === "กก.") {
    if (!Number.isFinite(factor) || factor <= 0) return null;
    return {
      convertedQty: qty * factor,
      convertedUnit: "กรัม" as ConvertedUnit,
      rateLabel: `1 กก. = ${formatQty(factor)} กรัม`,
    };
  }
  if (packUnits.includes(unit)) {
    if (!Number.isFinite(factor) || factor <= 0) return null;
    return {
      convertedQty: qty * factor,
      convertedUnit: "ชิ้น" as ConvertedUnit,
      rateLabel: `1 ${unit} = ${formatQty(factor)} ชิ้น`,
    };
  }
  return null;
}

function conversionSummary(record: IssueRecord) {
  if (!record.convertedQty || !record.convertedUnit) return null;
  return `เท่ากับ ${formatQty(record.convertedQty)} ${record.convertedUnit}`;
}

function WithdrawPage() {
  const [records, setRecords] = useState<IssueRecord[]>(initialIssues);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const selected = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId],
  );
  const formQty = Number(form.qty);
  const formFactor = Number(form.unitFactor);
  const formConversion = getConversion(form.unit, formQty, formFactor);

  function nextIssueNo() {
    return `IS-2026-${String(records.length + 1).padStart(3, "0")}`;
  }

  function saveIssue() {
    if (!form.department.trim() || !form.location.trim() || !form.itemName.trim() || !form.requestedBy.trim()) {
      toast.error("กรุณากรอกแผนก สถานที่เบิกไป สินค้า และผู้ขอเบิก");
      return;
    }
    const qty = Number(form.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("จำนวนต้องมากกว่า 0");
      return;
    }
    const factor = Number(form.unitFactor);
    if (convertibleUnits.includes(form.unit) && (!Number.isFinite(factor) || factor <= 0)) {
      toast.error("กรุณาระบุปริมาตรต่อหน่วยให้ถูกต้อง");
      return;
    }
    const conversion = getConversion(form.unit, qty, factor);
    const record: IssueRecord = {
      id: crypto.randomUUID(),
      issueNo: nextIssueNo(),
      department: form.department.trim(),
      location: form.location.trim(),
      itemName: form.itemName.trim(),
      qty,
      unit: form.unit,
      convertedQty: conversion?.convertedQty,
      convertedUnit: conversion?.convertedUnit,
      unitFactor: conversion ? factor : undefined,
      requestedBy: form.requestedBy.trim(),
      status: "DRAFT",
      note: form.note.trim(),
    };
    setRecords((current) => [record, ...current]);
    setForm(emptyForm);
    setIsCreateOpen(false);
    setSelectedId(record.id);
    toast.success("สร้างใบเบิกแล้ว");
  }

  function updateStatus(id: string, status: IssueStatus) {
    setRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, status } : record)),
    );
    toast.success(status === "ISSUED" ? "ตัดเบิกสินค้าแล้ว" : "เปลี่ยนกลับเป็น Draft แล้ว");
  }

  function duplicateIssue(record: IssueRecord) {
    const copyRecord = {
      ...record,
      id: crypto.randomUUID(),
      issueNo: nextIssueNo(),
      status: "DRAFT" as IssueStatus,
      note: record.note ? `${record.note} (copy)` : "copy",
    };
    setRecords((current) => [copyRecord, ...current]);
    setSelectedId(copyRecord.id);
    toast.success("ทำสำเนาใบเบิกแล้ว");
  }

  function deleteIssue(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
    setSelectedId(null);
    toast.success("ลบใบเบิกแล้ว");
  }

  return (
    <div>
      <PageHeader
        title="เบิกสินค้า"
        subtitle="Stock Issue"
        right={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="touch-target inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> ใหม่
          </button>
        }
      />

      <div className="mx-auto max-w-md p-4">
        <ul className="space-y-2">
          {records.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => setSelectedId(record.id)}
                className="touch-target flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition active:scale-[0.99]"
              >
                <span className="rounded-xl bg-accent/10 p-2 text-accent ring-1 ring-accent/30">
                  <PackageMinus className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{record.issueNo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {record.department} → {record.location} · {record.itemName} x {record.qty}{" "}
                    {record.unit}
                  </p>
                  {conversionSummary(record) && (
                    <p className="truncate text-[11px] font-medium text-primary">
                      {conversionSummary(record)}
                    </p>
                  )}
                </div>
                <StatusBadge status={record.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[88dvh] max-w-md overflow-y-auto rounded-t-3xl scrollbar-hide">
          <SheetHeader className="text-left">
            <SheetTitle>สร้างใบเบิก</SheetTitle>
            <SheetDescription>บันทึกรายการเบิกสินค้าแบบ Draft</SheetDescription>
          </SheetHeader>
          <div className="mt-5 space-y-4">
            <Field label="แผนก" value={form.department} placeholder="เช่น Main Kitchen" onChange={(department) => setForm((current) => ({ ...current, department }))} />
            <Field label="สถานที่เบิกไป" value={form.location} placeholder="เช่น Hot Kitchen / Banquet Hall A" onChange={(location) => setForm((current) => ({ ...current, location }))} />
            <Field label="สินค้า" value={form.itemName} placeholder="เช่น Rice 5kg" onChange={(itemName) => setForm((current) => ({ ...current, itemName }))} />
            <Field label="จำนวน" type="number" min="1" value={form.qty} onChange={(qty) => setForm((current) => ({ ...current, qty }))} />
            <div>
              <span className="mb-2 block text-xs font-medium text-muted-foreground">หน่วย</span>
              <div className="flex flex-wrap gap-2">
                {productUnits.map((unit) => {
                  const active = form.unit === unit;
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          unit,
                          unitFactor: defaultUnitFactor(unit),
                        }))
                      }
                      className={`touch-target rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                        active
                          ? "bg-primary text-primary-foreground ring-primary"
                          : "bg-card text-muted-foreground ring-border"
                      }`}
                    >
                      {unit}
                    </button>
                  );
                })}
              </div>
            </div>
            {convertibleUnits.includes(form.unit) ? (
              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">แปลงหน่วย</p>
                  </div>
                  {formConversion && (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {formatQty(formConversion.convertedQty)} {formConversion.convertedUnit}
                    </span>
                  )}
                </div>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {form.unit === "กก." ? "จำนวนกรัมต่อ กก." : `จำนวนชิ้นต่อ ${form.unit}`}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={form.unitFactor}
                    onChange={(event) => setForm((current) => ({ ...current, unitFactor: event.target.value }))}
                    className="touch-target block w-full rounded-xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>
            ) : null}
            <Field label="ผู้ขอเบิก" value={form.requestedBy} placeholder="เช่น Chef Team" onChange={(requestedBy) => setForm((current) => ({ ...current, requestedBy }))} />
            <Field label="หมายเหตุ" value={form.note} onChange={(note) => setForm((current) => ({ ...current, note }))} />
          </div>
          <SheetFooter className="mt-6">
            <button type="button" onClick={saveIssue} className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground">
              <Save className="h-4 w-4" /> บันทึก Draft
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="bottom" className="mx-auto max-h-[88dvh] max-w-md overflow-y-auto rounded-t-3xl scrollbar-hide">
          {selected && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center justify-between gap-3 pr-8">
                  <SheetTitle>{selected.issueNo}</SheetTitle>
                  <StatusBadge status={selected.status} />
                </div>
                <SheetDescription>
                  {selected.department} → {selected.location} · ขอโดย {selected.requestedBy}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-sm">
                <p className="font-semibold">{selected.itemName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  เบิกไปที่ {selected.location}
                </p>
                <p className="mt-1 text-muted-foreground">
                  จำนวน {selected.qty} {selected.unit}
                </p>
                {conversionSummary(selected) && (
                  <p className="mt-1 font-semibold text-primary">{conversionSummary(selected)}</p>
                )}
                {selected.unitFactor && convertibleUnits.includes(selected.unit) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    อัตราแปลง 1 {selected.unit} = {formatQty(selected.unitFactor)}{" "}
                    {selected.convertedUnit}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">{selected.note || "ไม่มีหมายเหตุ"}</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => updateStatus(selected.id, selected.status === "ISSUED" ? "DRAFT" : "ISSUED")} className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
                  <Check className="h-4 w-4" /> {selected.status === "ISSUED" ? "เป็น Draft" : "ตัดเบิก"}
                </button>
                <button type="button" onClick={() => duplicateIssue(selected)} className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold">
                  <Copy className="h-4 w-4" /> สำเนา
                </button>
              </div>
              <button type="button" onClick={() => deleteIssue(selected.id)} className="touch-target mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-3 text-sm font-semibold text-destructive">
                <Trash2 className="h-4 w-4" /> ลบใบเบิก
              </button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatusBadge({ status }: { status: IssueStatus }) {
  const cls =
    status === "ISSUED"
      ? "bg-success/15 text-success ring-success/30"
      : "bg-warning/15 text-warning ring-warning/30";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cls}`}>{status}</span>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="touch-target block w-full rounded-xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
