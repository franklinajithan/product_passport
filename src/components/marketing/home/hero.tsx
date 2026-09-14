import Link from "next/link";
import {
  Camera,
  Globe2,
  Languages,
  Package2,
  QrCode,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_LABEL, DEMO_PASSPORT } from "@/data/demo-showcase";
import { PageContainer } from "@/components/layout/page-container";

export function HeroSearch() {
  return (
    <form action="/search" method="get" className="w-full">
      <label htmlFor="hero-search" className="sr-only">
        Search GTIN, EAN, UPC, barcode or product name
      </label>
      <div className="flex flex-col gap-2 rounded-md bg-white p-1.5 shadow-[0_18px_50px_-24px_rgba(6,21,43,0.85)] ring-1 ring-white/60 sm:flex-row sm:items-stretch">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
          <ScanLine className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <input
            id="hero-search"
            name="q"
            placeholder="Search GTIN, EAN, UPC, barcode or product name..."
            className="h-12 w-full min-w-0 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
            autoComplete="off"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            size="lg"
            className="h-12 flex-1 rounded-sm px-6 sm:flex-none"
          >
            Search
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 flex-1 rounded-sm border-slate-200 bg-white text-slate-900 hover:bg-slate-50 sm:flex-none"
          >
            <Link href="/scan">
              <Camera />
              Scan Barcode
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
}

function NetworkBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#06152b]" />
      <div className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_12%_-10%,rgba(56,189,248,0.18),transparent_42%),radial-gradient(900px_circle_at_92%_8%,rgba(14,165,233,0.16),transparent_36%),radial-gradient(700px_circle_at_70%_100%,rgba(37,99,235,0.2),transparent_45%)]" />
      <div className="absolute inset-0 opacity-[0.18] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_center,black_35%,transparent_78%)] bg-[linear-gradient(rgba(125,211,252,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.22)_1px,transparent_1px)]" />
      <svg
        className="absolute -right-24 -top-20 h-155 w-155 text-cyan-300/25"
        viewBox="0 0 620 620"
        fill="none"
      >
        <circle cx="310" cy="310" r="118" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="310" cy="310" r="186" stroke="currentColor" strokeWidth="0.7" />
        <circle cx="310" cy="310" r="258" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="310" cy="310" r="310" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="310" cy="124" r="3.2" fill="#7dd3fc" className="animate-pulse" />
        <circle cx="478" cy="248" r="2.6" fill="#38bdf8" />
        <circle cx="452" cy="412" r="3" fill="#67e8f9" className="animate-pulse" />
        <circle cx="286" cy="496" r="2.4" fill="#7dd3fc" />
        <circle cx="148" cy="372" r="3.1" fill="#38bdf8" className="animate-pulse" />
        <circle cx="176" cy="196" r="2.5" fill="#67e8f9" />
        <path
          d="M310 124 L478 248 L452 412 L286 496 L148 372 L176 196 Z"
          stroke="rgba(125,211,252,0.28)"
          strokeWidth="0.8"
        />
      </svg>
      <div className="absolute left-[18%] top-[22%] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_18px_6px_rgba(103,232,249,0.55)]" />
      <div className="absolute bottom-[28%] left-[8%] h-1 w-1 rounded-full bg-sky-400 shadow-[0_0_14px_5px_rgba(56,189,248,0.45)]" />
      <div className="absolute right-[42%] top-[16%] h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_12px_4px_rgba(165,243,252,0.4)]" />
    </div>
  );
}

function DemoProductPack() {
  return (
    <div
      className="relative mx-auto flex h-37 w-29.5 items-center justify-center"
      aria-hidden
    >
      <div className="absolute inset-x-3 top-3 h-30.5 rounded-sm bg-linear-to-b from-amber-50 to-yellow-100 shadow-inner" />
      <div className="relative z-10 flex h-32 w-25.5 flex-col overflow-hidden rounded-[3px] bg-linear-to-b from-[#f6edd8] via-[#efe0bb] to-[#e2c98a] shadow-[0_12px_24px_-10px_rgba(6,21,43,0.45)] ring-1 ring-black/10">
        <div className="bg-[#081b35] px-2 py-2 text-center">
          <p className="text-[8px] font-semibold tracking-[0.22em] text-cyan-200">EXAMPLE</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-2">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#081b35]">EXTRA</p>
          <p className="mt-0.5 text-[10px] font-medium tracking-[0.2em] text-[#081b35]/70">
            BUTTER
          </p>
          <div className="mt-3 h-px w-10 bg-[#081b35]/15" />
          <p className="mt-2 text-[9px] tracking-wide text-[#081b35]/55">200 g</p>
        </div>
      </div>
    </div>
  );
}

function TwoDReadinessMark() {
  return (
    <div className="grid h-12 w-12 grid-cols-5 gap-px bg-white p-1.25 ring-1 ring-slate-900" aria-hidden>
      {[
        1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1,
      ].map((cell, index) => (
        <span key={index} className={cell ? "bg-slate-900" : "bg-white"} />
      ))}
    </div>
  );
}

export function HeroPassportCard({ barcodeSvg }: { barcodeSvg?: string | null }) {
  const item = DEMO_PASSPORT;

  return (
    <article className="overflow-hidden rounded-md bg-white text-slate-900 shadow-[0_28px_80px_-28px_rgba(2,8,23,0.7)] ring-1 ring-white/20">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">
            PRODUCT PASSPORT
          </p>
          <p className="mt-1 text-sm text-slate-600">Verified product identity</p>
        </div>
        <Badge
          variant="outline"
          className="rounded-sm border-cyan-700/20 bg-cyan-50 text-cyan-800 dark:border-cyan-700/20 dark:bg-cyan-50 dark:text-cyan-800"
        >
          DEMO
        </Badge>
      </header>

      <div className="grid gap-5 px-5 py-5 sm:grid-cols-[118px_1fr] sm:items-center">
        <DemoProductPack />
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tight">{item.name}</p>
          <p className="mt-1 text-sm text-slate-500">English: {item.englishName}</p>
          <p className="mt-1 text-sm text-slate-500">Net content: {item.netContent}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge
              variant="success"
              className="rounded-sm dark:bg-emerald-50 dark:text-emerald-800"
            >
              Manufacturer Verified
            </Badge>
            <Badge
              variant="success"
              className="rounded-sm dark:bg-emerald-50 dark:text-emerald-800"
            >
              GTIN Valid
            </Badge>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-200 bg-slate-50/80 px-5 py-4 text-sm">
        {[
          ["GTIN", item.gtin],
          ["Brand", item.brand],
          ["Manufacturer", item.manufacturer],
          ["Country of origin", item.origin],
          ["Net content", item.netContent],
          ["Status", item.status],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {label}
            </dt>
            <dd className={`mt-1 truncate text-slate-900 ${label === "GTIN" ? "font-mono text-[13px]" : ""}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-[1.15fr_0.85fr] sm:items-center">
        <div className="min-w-0 overflow-hidden rounded-sm border border-slate-200 bg-white px-3 py-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">EAN-13</p>
          {barcodeSvg ? (
            <div
              className="mt-2 flex max-w-full items-center justify-center overflow-hidden bg-white [&_svg]:h-16 [&_svg]:w-auto [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />
          ) : (
            <p className="mt-3 text-xs text-slate-500">EAN-13 symbol for GTIN {item.gtin}</p>
          )}
        </div>
        <div className="flex items-center gap-3 rounded-sm border border-slate-200 bg-slate-50 px-3 py-3">
          <div className="relative shrink-0">
            <TwoDReadinessMark />
            <QrCode className="absolute -bottom-1 -right-1 h-4 w-4 text-cyan-700" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">2D Ready</p>
            <p className="text-xs text-slate-500">Digital Link</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Architecture preview. Not a live GS1 verification.
            </p>
          </div>
        </div>
      </div>

      <p className="border-t border-slate-200 px-5 py-3 text-[11px] text-slate-400">{DEMO_LABEL}</p>
    </article>
  );
}

const TRUST_PILLS = [
  { icon: ShieldCheck, label: "Manufacturer-controlled data" },
  { icon: Languages, label: "Multilingual by design" },
  { icon: QrCode, label: "1D + 2D architecture" },
] as const;

const INFRASTRUCTURE = [
  {
    icon: ShieldCheck,
    title: "Verified identity",
    detail: "Manufacturer controlled",
  },
  {
    icon: Globe2,
    title: "Global data",
    detail: "Multilingual by design",
  },
  {
    icon: Package2,
    title: "Packaging",
    detail: "Each → case → pallet",
  },
  {
    icon: QrCode,
    title: "Future ready",
    detail: "1D + 2D architecture",
  },
] as const;

export function HomeHero({ barcodeSvg }: { barcodeSvg?: string | null }) {
  return (
    <section className="relative overflow-x-hidden border-b border-[#0b2344] text-white">
      <NetworkBackdrop />
      <PageContainer className="relative grid gap-12 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:py-24">
        <div className="min-w-0">
          <p className="inline-flex items-center rounded-sm border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-cyan-200">
            GLOBAL PRODUCT IDENTITY NETWORK
          </p>
          <h1 className="mt-6 max-w-3xl text-[2.55rem] font-semibold tracking-tight sm:text-6xl lg:text-[4.75rem] lg:leading-[1.04]">
            One product.
            <br />
            One trusted identity.
            <br />
            <span className="bg-linear-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              Everywhere.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Manufacturers publish verified product information once and make it available to
            retailers, developers, supply chains and consumers worldwide.
          </p>

          <div className="mt-8">
            <HeroSearch />
          </div>

          <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              href="/dashboard/products/new"
              className="text-cyan-300 transition-colors hover:text-white"
            >
              Register a product →
            </Link>
            <Link href="/register" className="text-cyan-300 transition-colors hover:text-white">
              Register your company →
            </Link>
            <Link href="/developers" className="text-cyan-300 transition-colors hover:text-white">
              Explore developer API →
            </Link>
          </nav>

          <ul className="mt-8 flex flex-wrap gap-2">
            {TRUST_PILLS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
              >
                <Icon className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <HeroPassportCard barcodeSvg={barcodeSvg} />
      </PageContainer>

      <div className="relative border-t border-white/10 bg-[#081b35]/85">
        <PageContainer className="grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {INFRASTRUCTURE.map(({ icon: Icon, title, detail }, index) => (
            <div
              key={title}
              className={`flex items-start gap-3 px-0 lg:px-6 ${index > 0 ? "lg:border-l lg:border-white/10" : ""}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" aria-hidden />
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{detail}</p>
              </div>
            </div>
          ))}
        </PageContainer>
      </div>
    </section>
  );
}
