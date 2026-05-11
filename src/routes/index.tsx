import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, Boxes } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate({ to: user ? "/home" : "/login", replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="rounded-3xl bg-primary/10 p-5 ring-1 ring-primary/30">
        <Boxes className="h-12 w-12 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Stock Manager</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ระบบจัดการสต๊อกแบบ real-time
        </p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}
