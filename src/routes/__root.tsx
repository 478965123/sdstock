import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">ไม่พบหน้าที่ค้นหา</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          หน้านี้อาจถูกย้ายหรือไม่มีอยู่จริง
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="touch-target inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">โหลดหน้านี้ไม่สำเร็จ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          เกิดข้อผิดพลาดขึ้น กรุณาลองใหม่อีกครั้ง
        </p>
        <pre className="mt-3 max-h-32 overflow-auto rounded bg-surface p-2 text-left text-[11px] text-muted-foreground">
          {error.message}
        </pre>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="touch-target inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            ลองอีกครั้ง
          </button>
          <a
            href="/"
            className="touch-target inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-surface"
          >
            หน้าหลัก
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#1a2530" },
      { title: "Stock Manager — ระบบจัดการสต๊อก" },
      {
        name: "description",
        content:
          "ระบบจัดการสต๊อกสินค้าแบบ real-time รองรับการรับเข้า เบิกออก และนับสต๊อก สำหรับคลัง ร้านอาหาร โรงงาน และร้านค้า",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
