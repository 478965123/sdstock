import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PackagePlus, PackageMinus, ClipboardCheck, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "หน้าหลัก", icon: Home },
  { to: "/receive", label: "รับเข้า", icon: PackagePlus },
  { to: "/withdraw", label: "เบิก", icon: PackageMinus },
  { to: "/count", label: "นับสต๊อก", icon: ClipboardCheck },
  { to: "/more", label: "เพิ่มเติม", icon: MoreHorizontal },
] as const;

export function MobileShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <main className="flex-1 pb-24">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur safe-bottom"
        aria-label="Primary"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = path === to || path.startsWith(`${to}/`);
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors touch-target",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn("h-6 w-6", active && "drop-shadow-[0_0_8px_var(--primary-glow)]")}
                    strokeWidth={active ? 2.4 : 2}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
