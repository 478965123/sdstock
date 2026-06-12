import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  Boxes,
  Check,
  ClipboardList,
  Download,
  FileBarChart,
  LogOut,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/_app/more")({
  component: MorePage,
  head: () => ({ meta: [{ title: "เพิ่มเติม — Stock Manager" }] }),
});

type ActionId =
  | "transfer"
  | "movement"
  | "report"
  | "items"
  | "categories"
  | "vendors"
  | "locations"
  | "users"
  | "settings";
type DemoActionId = Exclude<ActionId, "settings">;

const itemOtherUnitOptions = ["กรัม", "แพ็ค", "ชิ้น", "กล่อง", "ลัง", "ขวด", "ถุง"];

const actionDemos: Record<DemoActionId, { title: string; rows: string[]; primary: string }> = {
  transfer: {
    title: "ใบโอนล่าสุด",
    rows: ["TR-2026-001 · Main Store ไป Cold Room · Draft", "TR-2026-002 · Dry Store ไป Main Kitchen · Posted"],
    primary: "สร้างใบโอน Draft",
  },
  movement: {
    title: "รายการเคลื่อนไหวล่าสุด",
    rows: [
      "รับเข้า GR-2026-003 · Rice 5kg +40 · โดย Chef Team",
      "เบิก IS-2026-001 · Rice 5kg -6 · โดย Main Kitchen",
      "นับ CT-2026-001 · Mixed Vegetables -2 · โดย Auditor",
    ],
    primary: "ส่งออกประวัติ",
  },
  report: {
    title: "รายงานตัวอย่าง",
    rows: ["สินค้าทั้งหมด 128 รายการ", "สต็อกต่ำ 3 รายการ", "มูลค่าสต็อกประมาณ 248,500 บาท"],
    primary: "ดาวน์โหลดรายงาน",
  },
  items: {
    title: "สินค้าเด่น",
    rows: ["Rice 5kg · On hand 40", "Chicken Breast · On hand 24", "Mixed Vegetables · On hand 10"],
    primary: "เพิ่มสินค้า",
  },
  categories: {
    title: "หมวดหมู่ / หน่วย",
    rows: ["Dry Goods · kg, bag", "Fresh Food · kg, pack", "Frozen · pack, box"],
    primary: "เพิ่มหมวดหมู่",
  },
  vendors: {
    title: "ผู้ขาย",
    rows: ["Sodexo Main Kitchen", "Fresh Market Supplier", "Dry Goods Co."],
    primary: "เพิ่มผู้ขาย",
  },
  locations: {
    title: "Site / Location",
    rows: ["Bangkok Site · Main Store", "Bangkok Site · Cold Room", "Event Site · Temporary Store"],
    primary: "เพิ่ม Location",
  },
  users: {
    title: "ผู้ใช้งาน",
    rows: ["Demo User · Admin", "Chef Team · Issuer", "Auditor · Viewer"],
    primary: "เพิ่มผู้ใช้",
  },
};

function createInitialActionRows() {
  return Object.fromEntries(
    Object.entries(actionDemos).map(([id, content]) => [id, content.rows]),
  ) as Record<DemoActionId, string[]>;
}

function MorePage() {
  const { user, signOut } = useAuth();
  const [activeAction, setActiveAction] = useState<ActionItem | null>(null);
  const [actionRows, setActionRows] = useState(createInitialActionRows);
  const [transferForm, setTransferForm] = useState({
    from: "Main Store",
    to: "Main Kitchen",
    item: "Rice 5kg",
    qty: "1",
  });
  const [itemForm, setItemForm] = useState({
    name: "",
    category: "Dry Goods",
    unit: "กก.",
    otherUnits: ["กรัม", "แพ็ค", "ชิ้น"],
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    unit: "กก.",
    conversion: "1 กก. = 1000 กรัม",
  });
  const [vendorForm, setVendorForm] = useState({
    name: "",
    contact: "",
    phone: "",
  });
  const [locationForm, setLocationForm] = useState({
    site: "",
    location: "",
    type: "คลังหลัก",
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "Viewer",
  });
  const [settings, setSettings] = useState({
    lowStockAlert: true,
    thaiLanguage: true,
    compactMode: false,
  });

  const groups: { label: string; items: ActionItem[] }[] = [
    {
      label: "การจัดการคลัง",
      items: [
        {
          id: "transfer",
          icon: ArrowRightLeft,
          label: "โอนระหว่างคลัง",
          description: "สร้างใบโอนสินค้าแบบ Draft",
        },
        {
          id: "movement",
          icon: ClipboardList,
          label: "ประวัติการเคลื่อนไหว",
          description: "ดูรายการรับเข้า เบิกออก และปรับยอดล่าสุด",
        },
        {
          id: "report",
          icon: FileBarChart,
          label: "รายงาน",
          description: "สรุปสต็อกต่ำ มูลค่าสินค้า และการใช้งาน",
        },
      ],
    },
    {
      label: "ข้อมูลหลัก (Master)",
      items: [
        { id: "items", icon: Boxes, label: "สินค้า", description: "จัดการรายการสินค้าและหน่วยอื่นๆ" },
        { id: "categories", icon: Tags, label: "หมวดหมู่ / หน่วย", description: "ตั้งค่าหมวดหมู่ หน่วยนับ และ conversion" },
        { id: "vendors", icon: Truck, label: "ผู้ขาย (Vendors)", description: "เก็บรายชื่อผู้ขายสำหรับรับสินค้า" },
        { id: "locations", icon: Building2, label: "Site / Location", description: "ตั้งค่าไซต์ คลัง และจุดเก็บสินค้า" },
      ],
    },
    {
      label: "ระบบ",
      items: [
        { id: "users", icon: ShieldCheck, label: "ผู้ใช้งาน & สิทธิ์", description: "จัดการ role ตัวอย่างสำหรับ frontend" },
        { id: "settings", icon: Settings, label: "ตั้งค่า", description: "ปรับค่าการใช้งานในเครื่องนี้" },
      ],
    },
  ];

  const actionContent = useMemo(() => {
    if (!activeAction) return null;
    if (activeAction.id === "settings") return null;
    return {
      ...actionDemos[activeAction.id],
      rows: actionRows[activeAction.id],
    };
  }, [activeAction, actionRows]);

  function runAction(label: string) {
    toast.success(`${label} แล้ว`);
  }

  function createTransferDraft() {
    if (!transferForm.from.trim() || !transferForm.to.trim() || !transferForm.item.trim()) {
      toast.error("กรุณากรอกคลังต้นทาง ปลายทาง และสินค้า");
      return;
    }
    const qty = Number(transferForm.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("จำนวนต้องมากกว่า 0");
      return;
    }
    const nextNo = `TR-2026-${String(actionRows.transfer.length + 1).padStart(3, "0")}`;
    setActionRows((current) => ({
      ...current,
      transfer: [
        `${nextNo} · ${transferForm.from.trim()} ไป ${transferForm.to.trim()} · ${transferForm.item.trim()} x ${qty} · Draft`,
        ...current.transfer,
      ],
      movement: [
        `โอน ${nextNo} · ${transferForm.item.trim()} ${transferForm.from.trim()} → ${transferForm.to.trim()} · โดย ${user?.email ?? "user"}`,
        ...current.movement,
      ],
    }));
    setTransferForm((current) => ({ ...current, qty: "1" }));
    toast.success("สร้างใบโอน Draft แล้ว");
  }

  function addMasterRecord(id: "items" | "categories" | "vendors" | "locations") {
    if (id === "items") {
      if (!itemForm.name.trim() || !itemForm.category.trim() || !itemForm.unit.trim()) {
        toast.error("กรุณากรอกชื่อสินค้า หมวดหมู่ และหน่วย");
        return;
      }
      setActionRows((current) => ({
        ...current,
        items: [
          `${itemForm.name.trim()} · ${itemForm.category.trim()} · หน่วยหลัก ${itemForm.unit.trim()} · หน่วยอื่นๆ ${itemForm.otherUnits.join(", ") || "-"}`,
          ...current.items,
        ],
      }));
      setItemForm((current) => ({ ...current, name: "" }));
      toast.success("เพิ่มสินค้าแล้ว");
      return;
    }

    if (id === "categories") {
      if (!categoryForm.name.trim() || !categoryForm.unit.trim()) {
        toast.error("กรุณากรอกหมวดหมู่และหน่วย");
        return;
      }
      setActionRows((current) => ({
        ...current,
        categories: [
          `${categoryForm.name.trim()} · ${categoryForm.unit.trim()} · ${categoryForm.conversion.trim() || "ไม่มี conversion"}`,
          ...current.categories,
        ],
      }));
      setCategoryForm((current) => ({ ...current, name: "" }));
      toast.success("เพิ่มหมวดหมู่ / หน่วยแล้ว");
      return;
    }

    if (id === "vendors") {
      if (!vendorForm.name.trim()) {
        toast.error("กรุณากรอกชื่อผู้ขาย");
        return;
      }
      setActionRows((current) => ({
        ...current,
        vendors: [
          `${vendorForm.name.trim()} · ${vendorForm.contact.trim() || "ไม่ระบุผู้ติดต่อ"} · ${vendorForm.phone.trim() || "ไม่ระบุเบอร์"}`,
          ...current.vendors,
        ],
      }));
      setVendorForm((current) => ({ ...current, name: "" }));
      toast.success("เพิ่มผู้ขายแล้ว");
      return;
    }

    if (!locationForm.site.trim() || !locationForm.location.trim()) {
      toast.error("กรุณากรอก Site และ Location");
      return;
    }
    setActionRows((current) => ({
      ...current,
      locations: [
        `${locationForm.site.trim()} · ${locationForm.location.trim()} · ${locationForm.type.trim() || "Location"}`,
        ...current.locations,
      ],
    }));
    setLocationForm((current) => ({ ...current, location: "" }));
    toast.success("เพิ่ม Site / Location แล้ว");
  }

  function downloadReport() {
    toast.success("ดาวน์โหลดรายงานตัวอย่างแล้ว");
  }

  function addUserRole() {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error("กรุณากรอกชื่อและอีเมลผู้ใช้");
      return;
    }
    setActionRows((current) => ({
      ...current,
      users: [
        `${userForm.name.trim()} · ${userForm.role.trim()} · ${userForm.email.trim()}`,
        ...current.users,
      ],
    }));
    setUserForm((current) => ({ ...current, name: "", email: "" }));
    toast.success("เพิ่มผู้ใช้งานแล้ว");
  }

  function resetSettings() {
    setSettings({
      lowStockAlert: true,
      thaiLanguage: true,
      compactMode: false,
    });
    toast.success("รีเซ็ตตั้งค่าแล้ว");
  }

  function toggleItemOtherUnit(unit: string) {
    setItemForm((current) => {
      const selected = current.otherUnits.includes(unit);
      return {
        ...current,
        otherUnits: selected
          ? current.otherUnits.filter((item) => item !== unit)
          : [...current.otherUnits, unit],
      };
    });
  }

  function handlePrimaryAction(action: ActionItem) {
    if (action.id === "settings") return;
    if (action.id === "report") {
      toast.success("ดาวน์โหลดรายงานตัวอย่างแล้ว");
      return;
    }

    const newRows: Partial<Record<DemoActionId, string>> = {
      transfer: `TR-2026-${String(actionRows.transfer.length + 1).padStart(3, "0")} · Main Store ไป Main Kitchen · Draft`,
      items: `New Item ${actionRows.items.length + 1} · On hand 0`,
      categories: `หมวดใหม่ ${actionRows.categories.length + 1} · kg, pack`,
      vendors: `Vendor ใหม่ ${actionRows.vendors.length + 1}`,
      locations: `Site ใหม่ · Location ${actionRows.locations.length + 1}`,
      users: `User ใหม่ ${actionRows.users.length + 1} · Viewer`,
    };

    setActionRows((current) => ({
      ...current,
      [action.id]: [newRows[action.id] ?? `${action.label} ใหม่`, ...current[action.id]],
    }));
    toast.success(`${actionDemos[action.id].primary} แล้ว`);
  }

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
                  onClick={() => setActiveAction(it)}
                  className={`touch-target flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                    idx > 0 ? "border-t border-border" : ""
                  } transition active:bg-surface`}
                >
                  <span className="rounded-lg bg-surface p-2 text-muted-foreground">
                    <it.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{it.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {it.description}
                    </span>
                  </span>
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

      <Sheet open={!!activeAction} onOpenChange={(open) => !open && setActiveAction(null)}>
        <SheetContent side="bottom" className="mx-auto max-h-[88dvh] max-w-md overflow-y-auto rounded-t-3xl scrollbar-hide">
          {activeAction && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle>{activeAction.label}</SheetTitle>
                <SheetDescription>{activeAction.description}</SheetDescription>
              </SheetHeader>

              {activeAction.id === "settings" ? (
                <div className="mt-5 space-y-3">
                  <ToggleRow
                    label="แจ้งเตือนสต็อกต่ำ"
                    checked={settings.lowStockAlert}
                    onChange={() =>
                      setSettings((current) => ({
                        ...current,
                        lowStockAlert: !current.lowStockAlert,
                      }))
                    }
                  />
                  <ToggleRow
                    label="ภาษาไทย"
                    checked={settings.thaiLanguage}
                    onChange={() =>
                      setSettings((current) => ({
                        ...current,
                        thaiLanguage: !current.thaiLanguage,
                      }))
                    }
                  />
                  <ToggleRow
                    label="โหมด compact"
                    checked={settings.compactMode}
                    onChange={() =>
                      setSettings((current) => ({
                        ...current,
                        compactMode: !current.compactMode,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => runAction("บันทึกตั้งค่า")}
                    className="touch-target mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground"
                  >
                    <Save className="h-4 w-4" /> บันทึก
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={resetSettings}
                      className="touch-target rounded-2xl border border-border bg-card py-3 text-sm font-semibold"
                    >
                      รีเซ็ตค่า
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction("ล้างข้อมูลตัวอย่าง")}
                      className="touch-target rounded-2xl border border-destructive/30 bg-destructive/10 py-3 text-sm font-semibold text-destructive"
                    >
                      ล้างข้อมูล
                    </button>
                  </div>
                </div>
              ) : activeAction.id === "transfer" ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold">สร้างใบโอน Draft</h3>
                    <div className="mt-4 space-y-3">
                      <Field label="จากคลัง" value={transferForm.from} placeholder="เช่น Main Store" onChange={(from) => setTransferForm((current) => ({ ...current, from }))} />
                      <Field label="ไปคลัง / จุดใช้งาน" value={transferForm.to} placeholder="เช่น Main Kitchen" onChange={(to) => setTransferForm((current) => ({ ...current, to }))} />
                      <Field label="สินค้า" value={transferForm.item} placeholder="เช่น Rice 5kg" onChange={(item) => setTransferForm((current) => ({ ...current, item }))} />
                      <Field label="จำนวน" type="number" value={transferForm.qty} placeholder="1" onChange={(qty) => setTransferForm((current) => ({ ...current, qty }))} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={createTransferDraft}
                    className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground"
                  >
                    <Save className="h-4 w-4" /> บันทึกใบโอน Draft
                  </button>
                  <ActionList title={actionContent?.title ?? ""} rows={actionContent?.rows ?? []} />
                </div>
              ) : activeAction.id === "movement" ? (
                <div className="mt-5 space-y-4">
                  <ActionList title={actionContent?.title ?? ""} rows={actionContent?.rows ?? []} />
                  <button
                    type="button"
                    onClick={() => runAction("ส่งออกประวัติ")}
                    className="touch-target w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
                  >
                    ส่งออกประวัติ
                  </button>
                </div>
              ) : activeAction.id === "report" ? (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <ReportMetric label="ทั้งหมด" value="128" />
                    <ReportMetric label="สต็อกต่ำ" value="3" warning />
                    <ReportMetric label="มูลค่า" value="248k" />
                  </div>
                  <ActionList title={actionContent?.title ?? ""} rows={actionContent?.rows ?? []} />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={downloadReport}
                      className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
                    >
                      <Download className="h-4 w-4" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={downloadReport}
                      className="touch-target rounded-2xl border border-border bg-card py-3 text-sm font-semibold"
                    >
                      Excel
                    </button>
                  </div>
                </div>
              ) : activeAction.id === "items" ? (
                <div className="mt-5 space-y-4">
                  <CurrentDataList
                    title="สินค้าที่มีอยู่ในระบบปัจจุบัน"
                    rows={actionContent?.rows ?? []}
                  />
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold">เพิ่มสินค้า</h3>
                    <div className="mt-4 space-y-3">
                      <Field label="ชื่อสินค้า" value={itemForm.name} placeholder="เช่น Rice 5kg" onChange={(name) => setItemForm((current) => ({ ...current, name }))} />
                      <Field label="หมวดหมู่" value={itemForm.category} placeholder="เช่น Dry Goods" onChange={(category) => setItemForm((current) => ({ ...current, category }))} />
                      <Field label="หน่วยหลัก" value={itemForm.unit} placeholder="เช่น กก. / แพ็ค / ถุง" onChange={(unit) => setItemForm((current) => ({ ...current, unit }))} />
                      <div>
                        <span className="mb-2 block text-xs font-medium text-muted-foreground">
                          หน่วยอื่นๆ
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {itemOtherUnitOptions.map((unit) => {
                            const checked = itemForm.otherUnits.includes(unit);
                            return (
                              <button
                                key={unit}
                                type="button"
                                onClick={() => toggleItemOtherUnit(unit)}
                                className={`touch-target flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
                                  checked
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-surface text-muted-foreground"
                                }`}
                              >
                                <span
                                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                                    checked
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-card"
                                  }`}
                                >
                                  {checked && <Check className="h-3.5 w-3.5" />}
                                </span>
                                {unit}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => addMasterRecord("items")} className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground">
                    <Save className="h-4 w-4" /> บันทึกสินค้า
                  </button>
                </div>
              ) : activeAction.id === "categories" ? (
                <div className="mt-5 space-y-4">
                  <CurrentDataList
                    title="หมวดหมู่ / หน่วยที่มีอยู่ในระบบปัจจุบัน"
                    rows={actionContent?.rows ?? []}
                  />
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold">เพิ่มหมวดหมู่ / หน่วย</h3>
                    <div className="mt-4 space-y-3">
                      <Field label="หมวดหมู่" value={categoryForm.name} placeholder="เช่น ผัก / เนื้อสัตว์ / ของแห้ง" onChange={(name) => setCategoryForm((current) => ({ ...current, name }))} />
                      <Field label="หน่วยนับ" value={categoryForm.unit} placeholder="เช่น กก. / ชิ้น / แพ็ค" onChange={(unit) => setCategoryForm((current) => ({ ...current, unit }))} />
                      <Field label="Conversion" value={categoryForm.conversion} placeholder="เช่น 1 แพ็ค = 12 ชิ้น" onChange={(conversion) => setCategoryForm((current) => ({ ...current, conversion }))} />
                    </div>
                  </div>
                  <button type="button" onClick={() => addMasterRecord("categories")} className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground">
                    <Save className="h-4 w-4" /> บันทึกหมวดหมู่ / หน่วย
                  </button>
                </div>
              ) : activeAction.id === "vendors" ? (
                <div className="mt-5 space-y-4">
                  <CurrentDataList
                    title="ผู้ขายที่มีอยู่ในระบบปัจจุบัน"
                    rows={actionContent?.rows ?? []}
                  />
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold">เพิ่มผู้ขาย</h3>
                    <div className="mt-4 space-y-3">
                      <Field label="ชื่อผู้ขาย" value={vendorForm.name} placeholder="เช่น Fresh Market Supplier" onChange={(name) => setVendorForm((current) => ({ ...current, name }))} />
                      <Field label="ผู้ติดต่อ" value={vendorForm.contact} placeholder="เช่น คุณสมชาย" onChange={(contact) => setVendorForm((current) => ({ ...current, contact }))} />
                      <Field label="เบอร์โทร" value={vendorForm.phone} placeholder="เช่น 081-234-5678" onChange={(phone) => setVendorForm((current) => ({ ...current, phone }))} />
                    </div>
                  </div>
                  <button type="button" onClick={() => addMasterRecord("vendors")} className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground">
                    <Save className="h-4 w-4" /> บันทึกผู้ขาย
                  </button>
                </div>
              ) : activeAction.id === "locations" ? (
                <div className="mt-5 space-y-4">
                  <CurrentDataList
                    title="Site / Location ที่มีอยู่ในระบบปัจจุบัน"
                    rows={actionContent?.rows ?? []}
                  />
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold">เพิ่ม Site / Location</h3>
                    <div className="mt-4 space-y-3">
                      <Field label="Site" value={locationForm.site} placeholder="เช่น Bangkok Site" onChange={(site) => setLocationForm((current) => ({ ...current, site }))} />
                      <Field label="Location" value={locationForm.location} placeholder="เช่น Cold Room" onChange={(location) => setLocationForm((current) => ({ ...current, location }))} />
                      <Field label="ประเภท" value={locationForm.type} placeholder="เช่น คลังหลัก / จุดใช้งาน" onChange={(type) => setLocationForm((current) => ({ ...current, type }))} />
                    </div>
                  </div>
                  <button type="button" onClick={() => addMasterRecord("locations")} className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground">
                    <Save className="h-4 w-4" /> บันทึก Location
                  </button>
                </div>
              ) : activeAction.id === "users" ? (
                <div className="mt-5 space-y-4">
                  <CurrentDataList
                    title="ผู้ใช้งานที่มีอยู่ในระบบปัจจุบัน"
                    rows={actionContent?.rows ?? []}
                  />
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="text-sm font-semibold">เพิ่มผู้ใช้งาน & สิทธิ์</h3>
                    <div className="mt-4 space-y-3">
                      <Field label="ชื่อผู้ใช้" value={userForm.name} placeholder="เช่น Chef Team" onChange={(name) => setUserForm((current) => ({ ...current, name }))} />
                      <Field label="อีเมล" value={userForm.email} placeholder="เช่น chef@sodexo.local" onChange={(email) => setUserForm((current) => ({ ...current, email }))} />
                      <div>
                        <span className="mb-2 block text-xs font-medium text-muted-foreground">
                          สิทธิ์การใช้งาน
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {["Admin", "Issuer", "Viewer"].map((role) => {
                            const active = userForm.role === role;
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => setUserForm((current) => ({ ...current, role }))}
                                className={`touch-target rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-surface text-muted-foreground"
                                }`}
                              >
                                {role}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={addUserRole} className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground">
                    <Save className="h-4 w-4" /> บันทึกผู้ใช้งาน
                  </button>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <ActionList title={actionContent?.title ?? ""} rows={actionContent?.rows ?? []} />
                  <button
                    type="button"
                    onClick={() => handlePrimaryAction(activeAction)}
                    className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground"
                  >
                    {activeAction.id === "report" ? (
                      <Download className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {actionContent?.primary}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => runAction("ดูรายละเอียด")}
                      className="touch-target rounded-2xl border border-border bg-card py-3 text-sm font-semibold"
                    >
                      ดูรายละเอียด
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction("ส่งออกข้อมูล")}
                      className="touch-target rounded-2xl border border-border bg-card py-3 text-sm font-semibold"
                    >
                      ส่งออก
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

type ActionItem = {
  id: ActionId;
  icon: typeof ArrowRightLeft;
  label: string;
  description: string;
};

function ActionList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 text-success" />
            <span>{row}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CurrentDataList({ title, rows }: { title: string; rows: string[] }) {
  const [query, setQuery] = useState("");
  const filteredRows = rows.filter((row) =>
    row.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
          {filteredRows.length}/{rows.length} รายการ
        </span>
      </div>
      <label className="mt-3 flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          placeholder="ค้นหา"
          onChange={(event) => setQuery(event.target.value)}
          className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </label>
      <ul className="mt-3 divide-y divide-border/70 overflow-hidden rounded-xl border border-border bg-card">
        {filteredRows.map((row) => (
          <li key={row} className="flex items-start gap-2 px-3 py-3 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{row}</span>
          </li>
        ))}
      </ul>
      {filteredRows.length === 0 && (
        <p className="mt-3 rounded-xl border border-dashed border-border bg-card px-3 py-4 text-center text-sm text-muted-foreground">
          ไม่พบรายการที่ค้นหา
        </p>
      )}
    </div>
  );
}

function ReportMetric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold ${warning ? "text-warning" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        min={type === "number" ? "1" : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="touch-target block w-full rounded-xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="touch-target flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left"
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
          checked ? "justify-end bg-primary" : "justify-start bg-muted"
        }`}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}
