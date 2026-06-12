import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  ClipboardCheck,
  ListFilter,
  Plus,
  RotateCcw,
  Save,
  ScanLine,
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

export const Route = createFileRoute("/_app/count")({
  component: CountPage,
  head: () => ({ meta: [{ title: "นับสต๊อก — Stock Manager" }] }),
});

type CountStatus = "OPEN" | "COMPLETED";
type CountFilter = "ALL" | CountStatus;

const countFilterLabels: Record<CountFilter, string> = {
  ALL: "ทั้งหมด",
  OPEN: "กำลังนับ",
  COMPLETED: "เสร็จแล้ว",
};

const countStatusLabels: Record<CountStatus, string> = {
  OPEN: "กำลังนับ",
  COMPLETED: "เสร็จแล้ว",
};

interface CountLine {
  id: string;
  itemName: string;
  expectedQty: number;
  countedQty: number;
}

interface CountSession {
  id: string;
  countNo: string;
  location: string;
  status: CountStatus;
  lines: CountLine[];
}

const initialCounts: CountSession[] = [
  {
    id: "ct-001",
    countNo: "CT-2026-001",
    location: "Main Store",
    status: "OPEN",
    lines: [
      { id: "1", itemName: "Rice 5kg", expectedQty: 40, countedQty: 38 },
      { id: "2", itemName: "Chicken Breast", expectedQty: 24, countedQty: 24 },
      { id: "3", itemName: "Mixed Vegetables", expectedQty: 12, countedQty: 10 },
    ],
  },
  {
    id: "ct-002",
    countNo: "CT-2026-002",
    location: "Cold Room",
    status: "COMPLETED",
    lines: [
      { id: "1", itemName: "Salmon Portion", expectedQty: 16, countedQty: 16 },
      { id: "2", itemName: "Butter Block", expectedQty: 20, countedQty: 19 },
    ],
  },
];

function CountPage() {
  const [sessions, setSessions] = useState<CountSession[]>(initialCounts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [filter, setFilter] = useState<CountFilter>("ALL");

  const selected = useMemo(
    () => sessions.find((session) => session.id === selectedId) ?? null,
    [sessions, selectedId],
  );
  const filteredSessions = useMemo(
    () =>
      filter === "ALL"
        ? sessions
        : sessions.filter((session) => session.status === filter),
    [filter, sessions],
  );
  const openCount = sessions.filter((session) => session.status === "OPEN").length;
  const totalVariance = sessions.reduce(
    (sum, session) =>
      sum +
      session.lines.reduce(
        (lineSum, line) => lineSum + (line.countedQty - line.expectedQty),
        0,
      ),
    0,
  );

  function nextCountNo() {
    return `CT-2026-${String(sessions.length + 1).padStart(3, "0")}`;
  }

  function createCount() {
    if (!location.trim()) {
      toast.error("กรุณากรอก Location");
      return;
    }
    const session: CountSession = {
      id: crypto.randomUUID(),
      countNo: nextCountNo(),
      location: location.trim(),
      status: "OPEN",
      lines: [
        { id: crypto.randomUUID(), itemName: "Rice 5kg", expectedQty: 40, countedQty: 0 },
        { id: crypto.randomUUID(), itemName: "Chicken Breast", expectedQty: 24, countedQty: 0 },
        { id: crypto.randomUUID(), itemName: "Mixed Vegetables", expectedQty: 12, countedQty: 0 },
      ],
    };
    setSessions((current) => [session, ...current]);
    setLocation("");
    setIsCreateOpen(false);
    setSelectedId(session.id);
    toast.success("เปิดรอบนับสต๊อกแล้ว");
  }

  function updateLine(sessionId: string, lineId: string, countedQty: number) {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              lines: session.lines.map((line) =>
                line.id === lineId ? { ...line, countedQty } : line,
              ),
            }
          : session,
      ),
    );
  }

  function completeCount(sessionId: string) {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId ? { ...session, status: "COMPLETED" } : session,
      ),
    );
    toast.success("ปิดรอบนับสต๊อกแล้ว");
  }

  function reopenCount(sessionId: string) {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId ? { ...session, status: "OPEN" } : session,
      ),
    );
    toast.success("เปิดรอบนับอีกครั้งแล้ว");
  }

  function countAllExpected(sessionId: string) {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              lines: session.lines.map((line) => ({
                ...line,
                countedQty: line.expectedQty,
              })),
            }
          : session,
      ),
    );
    toast.success("ใส่จำนวนตามระบบครบแล้ว");
  }

  function clearCount(sessionId: string) {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              lines: session.lines.map((line) => ({ ...line, countedQty: 0 })),
            }
          : session,
      ),
    );
    toast.success("ล้างจำนวนที่นับแล้ว");
  }

  return (
    <div>
      <PageHeader
        title="นับสต๊อก"
        subtitle="Stock Counting"
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

      <div className="mx-auto max-w-md space-y-4 p-4">
        <section className="rounded-3xl bg-gradient-to-br from-warning/20 via-surface to-surface p-5 ring-1 ring-warning/25">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-warning/15 p-3 text-warning ring-1 ring-warning/30">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">ภาพรวมการนับ</p>
              <h2 className="mt-0.5 text-xl font-bold">Cycle Count วันนี้</h2>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric label="รอบทั้งหมด" value={sessions.length} />
            <Metric label="กำลังนับ" value={openCount} />
            <Metric
              label="Variance"
              value={`${totalVariance > 0 ? "+" : ""}${totalVariance}`}
              warn={totalVariance !== 0}
            />
          </div>
        </section>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground ring-1 ring-border">
            <ListFilter className="h-4 w-4" />
          </span>
          {(["ALL", "OPEN", "COMPLETED"] as CountFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`h-9 shrink-0 rounded-full px-4 text-xs font-semibold ring-1 transition ${
                filter === item
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-muted-foreground ring-border"
              }`}
            >
              {countFilterLabels[item]}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {filteredSessions.map((session) => {
            const variance = session.lines.reduce(
              (sum, line) => sum + (line.countedQty - line.expectedQty),
              0,
            );
            const doneLines = session.lines.filter((line) => line.countedQty > 0).length;
            const progress = Math.round((doneLines / session.lines.length) * 100);
            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(session.id)}
                  className="touch-target flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition active:scale-[0.99]"
                >
                  <span className="rounded-xl bg-warning/10 p-2 text-warning ring-1 ring-warning/30">
                    <ClipboardCheck className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{session.countNo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.location} · Variance {variance > 0 ? "+" : ""}
                      {variance}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <StatusBadge status={session.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            );
          })}
        </ul>

        {filteredSessions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning ring-1 ring-warning/30">
              <ClipboardCheck className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold">ไม่มีรอบนับในสถานะนี้</h3>
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className="touch-target mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              ดูทั้งหมด
            </button>
          </div>
        )}
      </div>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[88dvh] max-w-md overflow-y-auto rounded-t-3xl scrollbar-hide">
          <SheetHeader className="text-left">
            <SheetTitle>เปิดรอบนับสต๊อก</SheetTitle>
            <SheetDescription>เลือก Location แล้วระบบจะสร้างรายการนับตัวอย่าง</SheetDescription>
          </SheetHeader>
          <div className="mt-5">
            <Field label="Location" value={location} placeholder="เช่น Main Store" onChange={setLocation} />
          </div>
          <SheetFooter className="mt-6">
            <button type="button" onClick={createCount} className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground">
              <Save className="h-4 w-4" /> เริ่มนับ
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
                  <SheetTitle>{selected.countNo}</SheetTitle>
                  <StatusBadge status={selected.status} />
                </div>
                <SheetDescription>{selected.location}</SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-3">
                {selected.status === "OPEN" && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => countAllExpected(selected.id)}
                      className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold"
                    >
                      <ScanLine className="h-4 w-4" /> นับครบ
                    </button>
                    <button
                      type="button"
                      onClick={() => clearCount(selected.id)}
                      className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold"
                    >
                      <RotateCcw className="h-4 w-4" /> ล้าง
                    </button>
                  </div>
                )}

                {selected.lines.map((line) => {
                  const variance = line.countedQty - line.expectedQty;
                  return (
                    <div key={line.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{line.itemName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            ระบบ {line.expectedQty} · ต่าง {variance > 0 ? "+" : ""}
                            {variance}
                          </p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={line.countedQty}
                          disabled={selected.status === "COMPLETED"}
                          onChange={(event) =>
                            updateLine(selected.id, line.id, Number(event.target.value))
                          }
                          className="h-11 w-24 rounded-xl border border-input bg-surface px-3 text-right text-base font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {selected.status === "OPEN" ? (
                <button type="button" onClick={() => completeCount(selected.id)} className="touch-target mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-semibold text-primary-foreground">
                  <Check className="h-4 w-4" /> ปิดรอบนับ
                </button>
              ) : (
                <button type="button" onClick={() => reopenCount(selected.id)} className="touch-target mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4 text-sm font-semibold">
                  <RotateCcw className="h-4 w-4" /> เปิดแก้ไขอีกครั้ง
                </button>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Metric({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: number | string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-background/50 p-3 ring-1 ring-border">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 flex items-center gap-1 text-lg font-bold ${
          warn ? "text-warning" : ""
        }`}
      >
        {warn && <AlertTriangle className="h-4 w-4" />}
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: CountStatus }) {
  const cls =
    status === "COMPLETED"
      ? "bg-success/15 text-success ring-success/30"
      : "bg-warning/15 text-warning ring-warning/30";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cls}`}>{countStatusLabels[status]}</span>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="touch-target block w-full rounded-xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
