import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Boxes, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "เข้าสู่ระบบ — Stock Manager" }] }),
});

function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/home", replace: true });
  }, [user, loading, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        toast.success("เข้าสู่ระบบสำเร็จ");
      } else {
        await signUp(email, password, name);
        toast.success("สมัครสมาชิกสำเร็จ");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 ring-1 ring-primary/30">
            <Boxes className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Stock Manager</h1>
            <p className="text-xs text-muted-foreground">
              {mode === "signin" ? "เข้าสู่ระบบเพื่อใช้งาน" : "สร้างบัญชีใหม่"}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <Field
              label="ชื่อ-นามสกุล"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
              required
            />
          )}
          <Field
            label="อีเมล"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            label="รหัสผ่าน"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="touch-target flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition active:scale-[0.99] disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin"
            ? "ยังไม่มีบัญชี? สมัครสมาชิก"
            : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}
        </button>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}
function Field({ label, type, value, onChange, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
        className="touch-target block w-full rounded-xl border border-input bg-surface px-4 py-3.5 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
