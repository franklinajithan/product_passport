import type { ReactNode } from "react";
import { cn } from "@/utilities/cn";

export function PageContainer({
  className,
  children,
  width = "default",
}: {
  className?: string;
  children: ReactNode;
  width?: "default" | "narrow" | "wide";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        width === "narrow" && "max-w-3xl",
        width === "default" && "max-w-[1440px]",
        width === "wide" && "max-w-[1440px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  invert?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.18em]",
            invert ? "text-white/60" : "text-primary",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn("mt-3 text-3xl font-semibold tracking-tight sm:text-4xl", invert && "text-white")}>
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-4 text-base leading-7", invert ? "text-white/70" : "text-muted-foreground")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
