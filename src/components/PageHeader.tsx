import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  back?: string;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, back, right }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur safe-top">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        {back ? (
          <Link
            to={back}
            className="touch-target -ml-2 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
    </header>
  );
}
