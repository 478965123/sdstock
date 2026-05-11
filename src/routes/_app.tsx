import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/lib/auth";

// Pathless layout route: provides MobileShell + auth gate to all child pages
// (/home, /receive, /withdraw, /count, /more)
export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login", replace: true });
  }, [user, loading, nav]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <MobileShell>
      <Outlet />
    </MobileShell>
  );
}
