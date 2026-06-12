import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  FileText,
  ImagePlus,
  PackagePlus,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
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

export const Route = createFileRoute("/_app/receive")({
  component: ReceivePage,
  head: () => ({ meta: [{ title: "รับสินค้า — Stock Manager" }] }),
});

type ReceiveStatus = "DRAFT" | "POSTED";
type ProductCategory = "ผัก" | "เนื้อสัตว์" | "อาหารทะเล" | "ของแห้ง" | "เครื่องดื่ม";
type ProductUnit = "กก." | "ชิ้น" | "แพ็ค" | "กล่อง" | "ลัง" | "ขวด" | "ถุง";

const productCategories: ProductCategory[] = [
  "ผัก",
  "เนื้อสัตว์",
  "อาหารทะเล",
  "ของแห้ง",
  "เครื่องดื่ม",
];
const productUnits: ProductUnit[] = ["กก.", "ชิ้น", "แพ็ค", "กล่อง", "ลัง", "ขวด", "ถุง"];

interface LineItem {
  id: string;
  itemName: string;
  categories: ProductCategory[];
  qty: number;
  unit: ProductUnit;
}

interface LineItemForm {
  id: string;
  itemName: string;
  categories: ProductCategory[];
  qty: string;
  unit: ProductUnit;
}

interface ReceivingRecord {
  id: string;
  receive_no: string;
  invoice_no: string;
  status: ReceiveStatus;
  vendorName: string;
  items: LineItem[];
  note: string;
  imageUrl?: string;
  imageName?: string;
}

function emptyLineItem(): LineItemForm {
  return {
    id: crypto.randomUUID(),
    itemName: "",
    categories: ["ผัก"],
    qty: "1",
    unit: "กก.",
  };
}

const initialReceivingList: ReceivingRecord[] = [
  {
    id: "gr-001",
    receive_no: "GR-2026-001",
    invoice_no: "INV-1001",
    status: "POSTED",
    vendorName: "Sodexo Main Kitchen",
    items: [
      { id: "item-1a", itemName: "Chicken Breast", categories: ["เนื้อสัตว์"], qty: 24, unit: "กก." },
    ],
    note: "รับเข้าคลังหลัก",
  },
  {
    id: "gr-002",
    receive_no: "GR-2026-002",
    invoice_no: "INV-1002",
    status: "DRAFT",
    vendorName: "Fresh Market Supplier",
    items: [
      { id: "item-2a", itemName: "Mixed Vegetables", categories: ["ผัก"], qty: 12, unit: "แพ็ค" },
      { id: "item-2b", itemName: "Baby Spinach", categories: ["ผัก"], qty: 5, unit: "กก." },
    ],
    note: "รอตรวจจำนวนก่อนโพสต์",
  },
  {
    id: "gr-003",
    receive_no: "GR-2026-003",
    invoice_no: "INV-1003",
    status: "POSTED",
    vendorName: "Dry Goods Co.",
    items: [
      { id: "item-3a", itemName: "Rice 5kg", categories: ["ของแห้ง"], qty: 40, unit: "ถุง" },
      { id: "item-3b", itemName: "Soy Sauce", categories: ["เครื่องดื่ม"], qty: 24, unit: "ขวด" },
      { id: "item-3c", itemName: "Sugar", categories: ["ของแห้ง"], qty: 10, unit: "กก." },
    ],
    note: "เอกสารครบ",
  },
];

const emptyFormHeader = {
  vendorName: "",
  invoice_no: "",
  note: "",
  imageUrl: "",
  imageName: "",
};

function ReceivePage() {
  const [records, setRecords] = useState<ReceivingRecord[]>(initialReceivingList);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formHeader, setFormHeader] = useState(emptyFormHeader);
  const [lineItems, setLineItems] = useState<LineItemForm[]>([emptyLineItem()]);

  const selected = useMemo(
    () => records.find((record) => record.id === selectedId) ?? null,
    [records, selectedId],
  );

  function nextReceiveNo() {
    const nextNumber = records.length + 1;
    return `GR-2026-${String(nextNumber).padStart(3, "0")}`;
  }

  function addLineItem() {
    setLineItems((current) => [...current, emptyLineItem()]);
  }

  function removeLineItem(id: string) {
    setLineItems((current) => current.filter((item) => item.id !== id));
  }

  function updateLineItem(id: string, patch: Partial<Omit<LineItemForm, "id">>) {
    setLineItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function saveNewRecord() {
    if (!formHeader.vendorName.trim() || !formHeader.invoice_no.trim()) {
      toast.error("กรุณากรอกผู้ขายและเลข Invoice");
      return;
    }

    for (const item of lineItems) {
      if (!item.itemName.trim()) {
        toast.error("กรุณากรอกชื่อสินค้าให้ครบทุกรายการ");
        return;
      }
      const qty = Number(item.qty);
      if (!Number.isFinite(qty) || qty <= 0) {
        toast.error(`จำนวนสินค้า "${item.itemName}" ต้องมากกว่า 0`);
        return;
      }
    }

    const parsedItems: LineItem[] = lineItems.map((item) => ({
      id: crypto.randomUUID(),
      itemName: item.itemName.trim(),
      categories: item.categories,
      qty: Number(item.qty),
      unit: item.unit,
    }));

    const record: ReceivingRecord = {
      id: crypto.randomUUID(),
      receive_no: nextReceiveNo(),
      invoice_no: formHeader.invoice_no.trim(),
      status: "DRAFT",
      vendorName: formHeader.vendorName.trim(),
      items: parsedItems,
      note: formHeader.note.trim(),
      imageUrl: formHeader.imageUrl || undefined,
      imageName: formHeader.imageName || undefined,
    };

    setRecords((current) => [record, ...current]);
    setFormHeader(emptyFormHeader);
    setLineItems([emptyLineItem()]);
    setIsCreateOpen(false);
    setSelectedId(record.id);
    toast.success("สร้างรายการรับสินค้าแล้ว");
  }

  function updateStatus(id: string, status: ReceiveStatus) {
    setRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, status } : record)),
    );
    toast.success(status === "POSTED" ? "โพสต์รายการแล้ว" : "เปลี่ยนกลับเป็น Draft แล้ว");
  }

  function duplicateRecord(record: ReceivingRecord) {
    const copyRecord: ReceivingRecord = {
      ...record,
      id: crypto.randomUUID(),
      receive_no: nextReceiveNo(),
      status: "DRAFT",
      items: record.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
      note: record.note ? `${record.note} (copy)` : "copy",
    };
    setRecords((current) => [copyRecord, ...current]);
    setSelectedId(copyRecord.id);
    toast.success("ทำสำเนารายการแล้ว");
  }

  function deleteRecord(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
    setSelectedId(null);
    toast.success("ลบรายการแล้ว");
  }

  function attachImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormHeader((current) => ({
        ...current,
        imageUrl: String(reader.result),
        imageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  }

  function openCreate() {
    setFormHeader(emptyFormHeader);
    setLineItems([emptyLineItem()]);
    setIsCreateOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="รับสินค้า"
        subtitle="Goods Receiving"
        right={
          <button
            type="button"
            onClick={openCreate}
            className="touch-target inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> ใหม่
          </button>
        }
      />

      <div className="mx-auto max-w-md p-4">
        {records.length === 0 && <EmptyState onCreate={openCreate} />}

        {records.length > 0 && (
          <ul className="space-y-2">
            {records.map((r) => {
              const firstItem = r.items[0];
              const extraCount = r.items.length - 1;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className="touch-target flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition active:scale-[0.99]"
                  >
                    <span className="rounded-xl bg-primary/10 p-2 text-primary ring-1 ring-primary/30">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.receive_no}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.vendorName} · {firstItem?.itemName}
                        {extraCount > 0 && (
                          <span className="ml-1 font-medium text-primary">+{extraCount} รายการ</span>
                        )}
                      </p>
                    </div>
                    {r.imageUrl && (
                      <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
                        <img src={r.imageUrl} alt="" className="h-full w-full object-cover" />
                      </span>
                    )}
                    <StatusBadge status={r.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[92dvh] max-w-md overflow-y-auto rounded-t-3xl scrollbar-hide">
          <SheetHeader className="text-left">
            <SheetTitle>รับสินค้าใหม่</SheetTitle>
            <SheetDescription>สร้างรายการรับสินค้าแบบ Draft</SheetDescription>
          </SheetHeader>

          <div className="mt-5 space-y-4">
            {/* Header fields */}
            <Field
              label="ผู้ขาย"
              required
              value={formHeader.vendorName}
              placeholder="เช่น Fresh Market Supplier"
              onChange={(vendorName) => setFormHeader((c) => ({ ...c, vendorName }))}
            />
            <Field
              label="Invoice No."
              required
              value={formHeader.invoice_no}
              placeholder="เช่น INV-1004"
              onChange={(invoice_no) => setFormHeader((c) => ({ ...c, invoice_no }))}
            />

            {/* Line items */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  รายการสินค้า
                  <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {lineItems.length}
                  </span>
                </span>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        รายการที่ {index + 1}
                      </span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="touch-target inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive"
                        >
                          <X className="h-3 w-3" /> ลบ
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Field
                        label="สินค้า"
                        required
                        value={item.itemName}
                        placeholder="เช่น Rice 5kg"
                        onChange={(itemName) => updateLineItem(item.id, { itemName })}
                      />

                      <div>
                        <span className="mb-2 block text-xs font-medium text-muted-foreground">
                          ประเภทสินค้า <RequiredMark />
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {productCategories.map((cat) => {
                            const active = item.categories.includes(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  const next = active
                                    ? item.categories.filter((c) => c !== cat)
                                    : [...item.categories, cat];
                                  updateLineItem(item.id, {
                                    categories: next.length > 0 ? next : [cat],
                                  });
                                }}
                                className={`touch-target rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                                  active
                                    ? "bg-primary text-primary-foreground ring-primary"
                                    : "bg-background text-muted-foreground ring-border"
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="จำนวน"
                          required
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(qty) => updateLineItem(item.id, { qty })}
                        />
                        <div>
                          <span className="mb-2 block text-xs font-medium text-muted-foreground">
                            หน่วย <RequiredMark />
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {productUnits.map((unit) => {
                              const active = item.unit === unit;
                              return (
                                <button
                                  key={unit}
                                  type="button"
                                  onClick={() => updateLineItem(item.id, { unit })}
                                  className={`touch-target rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                                    active
                                      ? "bg-primary text-primary-foreground ring-primary"
                                      : "bg-background text-muted-foreground ring-border"
                                  }`}
                                >
                                  {unit}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add item button */}
              <button
                type="button"
                onClick={addLineItem}
                className="touch-target mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary transition active:scale-[0.99]"
              >
                <Plus className="h-4 w-4" /> เพิ่มสินค้า
              </button>
            </div>

            {/* Image */}
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                รูปภาพแนบ
              </span>
              {formHeader.imageUrl ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <img
                    src={formHeader.imageUrl}
                    alt="รูปภาพแนบ"
                    className="h-28 w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 p-2.5">
                    <p className="min-w-0 truncate text-xs font-medium text-muted-foreground">
                      {formHeader.imageName}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormHeader((c) => ({ ...c, imageUrl: "", imageName: "" }))}
                      className="touch-target inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
                    >
                      <X className="h-3.5 w-3.5" /> ลบรูป
                    </button>
                  </div>
                </div>
              ) : (
                <label className="touch-target flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-4 py-4 text-left transition active:scale-[0.99]">
                  <span className="rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/30">
                    <ImagePlus className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">แนบรูปสินค้า / Invoice</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      เลือกรูปจากเครื่องเพื่อแสดงในรายการนี้
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => attachImage(event.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            {/* Note */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                หมายเหตุ
              </span>
              <textarea
                value={formHeader.note}
                onChange={(event) =>
                  setFormHeader((c) => ({ ...c, note: event.target.value }))
                }
                rows={2}
                className="block min-h-20 w-full resize-none rounded-xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </div>

          <SheetFooter className="mt-6">
            <button
              type="button"
              onClick={saveNewRecord}
              className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground"
            >
              <Save className="h-4 w-4" /> บันทึก Draft ({lineItems.length} รายการ)
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="bottom" className="mx-auto max-h-[88dvh] max-w-md overflow-y-auto rounded-t-3xl scrollbar-hide">
          {selected && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center justify-between gap-3 pr-8">
                  <SheetTitle>{selected.receive_no}</SheetTitle>
                  <StatusBadge status={selected.status} />
                </div>
                <SheetDescription>
                  {selected.vendorName} · INV {selected.invoice_no}
                </SheetDescription>
              </SheetHeader>

              {/* Items list */}
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  รายการสินค้า ({selected.items.length} รายการ)
                </p>
                {selected.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.categories.join(", ")} · {item.qty} {item.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selected.note && (
                <div className="mt-3 rounded-xl border border-border bg-card px-4 py-3">
                  <p className="text-xs text-muted-foreground">หมายเหตุ</p>
                  <p className="mt-0.5 text-sm font-medium">{selected.note}</p>
                </div>
              )}

              {selected.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
                  <img
                    src={selected.imageUrl}
                    alt="รูปภาพแนบ"
                    className="h-56 w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="truncate text-xs font-medium text-muted-foreground">
                      {selected.imageName ?? "รูปภาพแนบ"}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(
                      selected.id,
                      selected.status === "POSTED" ? "DRAFT" : "POSTED",
                    )
                  }
                  className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Check className="h-4 w-4" />
                  {selected.status === "POSTED" ? "เป็น Draft" : "Post"}
                </button>
                <button
                  type="button"
                  onClick={() => duplicateRecord(selected)}
                  className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold"
                >
                  <Copy className="h-4 w-4" /> สำเนา
                </button>
              </div>

              <button
                type="button"
                onClick={() => deleteRecord(selected.id)}
                className="touch-target mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-3 text-sm font-semibold text-destructive"
              >
                <Trash2 className="h-4 w-4" /> ลบรายการ
              </button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatusBadge({ status }: { status: ReceiveStatus }) {
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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
        <PackagePlus className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold">ยังไม่มีรายการรับสินค้า</h3>
      <p className="mt-1 text-xs text-muted-foreground">เริ่มต้นรับสินค้าเข้าสต๊อกได้เลย</p>
      <button
        type="button"
        onClick={onCreate}
        className="touch-target mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> สร้างรายการรับ
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <RequiredMark />}
      </span>
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

function RequiredMark() {
  return (
    <span className="ml-1 align-baseline text-sm font-bold text-destructive" aria-label="required">
      *
    </span>
  );
}
