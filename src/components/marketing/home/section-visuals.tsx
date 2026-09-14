import {
  Boxes,
  Factory,
  Fingerprint,
  Languages,
  Link2,
  Package,
  QrCode,
  ScanLine,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { DEMO_PASSPORT } from "@/data/demo-showcase";

const BAR_PATTERN = [1, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1];

function MiniBarcode({ className = "" }: { className?: string }) {
  return (
    <div className={`flex h-8 w-full max-w-full items-stretch gap-px overflow-hidden bg-white px-1 py-1 ${className}`} aria-hidden>
      {BAR_PATTERN.map((width, index) => (
        <span
          key={index}
          className="min-w-0 bg-slate-900"
          style={{ flex: width }}
        />
      ))}
    </div>
  );
}

function MiniQr({ className = "" }: { className?: string }) {
  const cells = [
    1, 1, 1, 1, 1, 0, 1, 1, 0,
    1, 0, 0, 0, 1, 0, 0, 1, 1,
    1, 0, 1, 0, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 1, 0, 1, 1, 0,
    1, 1, 1, 1, 1, 0, 0, 1, 1,
    0, 0, 0, 0, 0, 1, 1, 0, 1,
    1, 1, 0, 1, 0, 1, 0, 1, 0,
    0, 1, 1, 0, 1, 0, 1, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 1, 1,
  ];
  return (
    <div className={`grid grid-cols-9 gap-px bg-white p-1 ${className}`} aria-hidden>
      {cells.map((cell, index) => (
        <span key={index} className={cell ? "bg-slate-900" : "bg-white"} />
      ))}
    </div>
  );
}

const CAN_IMAGE = "/demo/coca-cola-original-taste-330ml.png";

const CAN_SIZE = {
  sm: "h-16 w-9",
  md: "h-28 w-16",
  lg: "h-56 w-32",
  hero: "h-64 w-36 sm:h-[20.5rem] sm:w-44",
} as const;

export function CokeCan({
  size = "md",
  className = "",
}: {
  size?: keyof typeof CAN_SIZE;
  className?: string;
}) {
  return (
    <div className={`relative ${CAN_SIZE[size]} ${className}`}>
      <img
        src={CAN_IMAGE}
        alt={`${DEMO_PASSPORT.name} ${DEMO_PASSPORT.netContent} can`}
        className="h-full w-full object-contain object-center drop-shadow-[0_18px_24px_rgba(6,21,43,0.28)]"
      />
    </div>
  );
}

export function ManufacturerFlow() {
  const nodes = [
    { icon: Factory, label: "Manufacturer" },
    { icon: ShieldCheck, label: "Verified product" },
    { icon: Languages, label: "Translations" },
    { icon: Package, label: "Packaging" },
    { icon: Truck, label: "Distribution" },
  ];
  return (
    <ol className="relative mt-3 flex flex-col items-start gap-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5" aria-hidden>
      {nodes.map((node, index) => {
        const Icon = node.icon;
        return (
          <li key={node.label} className="flex w-full flex-col items-start sm:w-auto sm:flex-row sm:items-center sm:gap-1.5">
            <div className="flex min-h-11 items-center gap-1.5 border border-cyan-300/25 bg-cyan-400/10 px-2 py-1.5 sm:min-h-9">
              <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
              <span className="text-xs font-medium text-cyan-50 sm:text-[11px]">{node.label}</span>
            </div>
            {index < nodes.length - 1 ? (
              <span className="ml-4 h-3 w-px bg-cyan-400/50 sm:ml-0 sm:h-px sm:w-4" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function RetailerPos() {
  return (
    <div className="mt-4 overflow-hidden bg-white text-slate-900 shadow-sm" aria-hidden>
      <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 text-[10px] text-slate-500">
        <ScanLine className="h-3 w-3" />
        POS lookup
      </div>
      <div className="px-3 py-2">
        <div className="flex h-7 items-center border border-slate-200 px-2 font-mono text-[10px] text-slate-500">
          {DEMO_PASSPORT.gtin}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="truncate text-xs font-semibold">{DEMO_PASSPORT.name}</p>
            <p className="text-[10px] text-slate-500">{DEMO_PASSPORT.netContent}</p>
          </div>
          <span className="bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-emerald-800">
            FOUND
          </span>
        </div>
      </div>
    </div>
  );
}

export function DeveloperSnippet() {
  return (
    <div className="mt-4 overflow-hidden bg-[#06152b] font-mono text-[10px] leading-5 text-cyan-100" aria-hidden>
      <div className="flex gap-1.5 border-b border-white/10 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </div>
      <pre className="overflow-x-auto px-3 py-2 whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">{`GET /api/v1/products/${DEMO_PASSPORT.gtin}
200  { "verification": "PUBLIC_DEMO_RECORD" }`}</pre>
    </div>
  );
}

export function SupplyDiagram() {
  return (
    <div className="mt-4 flex min-w-0 flex-wrap items-end gap-3" aria-hidden>
      <div className="flex h-10 w-8 items-end justify-center gap-0.5">
        <span className="h-6 w-2 bg-cyan-300/80" />
        <span className="h-8 w-2 bg-cyan-200" />
        <span className="h-5 w-2 bg-cyan-300/70" />
      </div>
      <span className="mb-3 h-px flex-1 bg-cyan-400/50" />
      <div>
        <div className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} className="h-4 w-5 border border-cyan-300/40 bg-cyan-400/15" />
          ))}
        </div>
        <div className="mt-0.5 h-1.5 w-full bg-amber-200/80" />
      </div>
      <p className="mb-1 text-[10px] tracking-wide text-cyan-200">CASE → PALLET</p>
    </div>
  );
}

export function ConsumerPhone() {
  return (
    <div className="mt-4 w-24 shrink-0 overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-sm sm:w-28" aria-hidden>
      <div className="bg-[#06152b] px-2 py-1.5 text-center">
        <p className="text-[8px] font-semibold tracking-[0.18em] text-cyan-200">PASSPORT</p>
      </div>
      <div className="px-2 py-2">
        <p className="truncate text-[10px] font-semibold">{DEMO_PASSPORT.name}</p>
        <p className="mt-0.5 font-mono text-[8px] text-slate-500">{DEMO_PASSPORT.gtin}</p>
        <MiniBarcode className="mt-2 h-6" />
      </div>
    </div>
  );
}

export function IntelligenceStack() {
  return (
    <div className="relative min-w-0 overflow-hidden bg-[#081b35] p-4 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_circle_at_80%_10%,rgba(56,189,248,0.22),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 bg-size-[24px_24px] bg-[linear-gradient(rgba(125,211,252,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.16)_1px,transparent_1px)]"
      />
      <div className="relative ml-3 min-w-0 border-l border-cyan-400/40 pl-4 sm:ml-4 sm:pl-5">
        <div className="absolute top-2 -left-1.25 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_6px_rgba(103,232,249,0.45)]" />
        <div className="border border-cyan-300/30 bg-[#06152b]/80 p-3 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
          <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-cyan-200">
            <Fingerprint className="h-3.5 w-3.5" /> GTIN IDENTITY RECORD
          </p>
          <p className="mt-2 break-all font-mono text-sm text-white">{DEMO_PASSPORT.gtin}</p>
          <p className="mt-1 text-[11px] text-slate-400">Stored once · independent of carrier</p>
        </div>

        <div className="my-3 h-6 w-px bg-cyan-400/50" />

        <div className="border border-white/10 bg-white p-3 text-slate-900">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500">EAN-13 LINEAR BARCODE</p>
          <MiniBarcode className="mt-2" />
          <p className="mt-2 text-[11px] text-slate-500">Carrier for the same identity</p>
        </div>

        <div className="my-3 h-6 w-px bg-cyan-400/50" />

        <div className="flex min-w-0 flex-col gap-3 border border-cyan-300/25 bg-cyan-400/10 p-3 sm:flex-row">
          <MiniQr className="h-16 w-16 shrink-0" />
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-cyan-200">
              <QrCode className="h-3.5 w-3.5" /> GS1 QR / DATAMATRIX
            </p>
            <p className="mt-2 text-[11px] leading-5 text-slate-300">
              2D carriers can add batch, expiry and Digital Link. Identity unchanged.
            </p>
          </div>
        </div>

        <div className="my-3 h-6 w-px bg-cyan-400/50" />

        <div className="border border-white/10 bg-[#06152b] p-3">
          <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-slate-400">
            <Link2 className="h-3.5 w-3.5 text-cyan-300" /> DIGITAL LINK RESOLUTION
          </p>
          <p className="mt-2 truncate font-mono text-[11px] text-cyan-100">
            /01/{DEMO_PASSPORT.canonicalGTIN14}
          </p>
        </div>

        <div className="my-3 h-6 w-px bg-cyan-400/50" />

        <div className="border border-cyan-300/40 bg-white p-3 text-slate-900 shadow-[0_12px_40px_rgba(6,21,43,0.35)]">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-500">PRODUCT PASSPORT</p>
          <p className="mt-1 text-sm font-semibold">{DEMO_PASSPORT.name}</p>
          <p className="text-[11px] text-slate-500">
            {DEMO_PASSPORT.productType} · {DEMO_PASSPORT.netContent}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PackConsumer() {
  return <CokeCan size="sm" />;
}

export function PackInner() {
  return (
    <div
      className="flex h-[5rem] w-[7.75rem] items-end justify-center gap-px rounded-sm bg-red-50 p-1.5 ring-1 ring-red-200"
      aria-hidden
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <span
          key={index}
          className="h-16 w-3.5 rounded-t-[8px] rounded-b-[3px] bg-linear-to-b from-[#ff3b3f] via-[#e31c23] to-[#9b0d16] ring-1 ring-red-900/20"
        />
      ))}
    </div>
  );
}

export function PackCase() {
  return (
    <div className="relative h-[5.25rem] w-32 overflow-hidden bg-[#c1121f] ring-1 ring-red-900/25" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-5 bg-white/15" />
      <div className="absolute inset-x-3 top-6 h-px bg-white/25" />
      <p className="absolute inset-x-0 bottom-1.5 text-center text-[8px] font-semibold tracking-[0.18em] text-white/85">
        CASE
      </p>
    </div>
  );
}

export function PackPallet() {
  return (
    <div className="flex w-36 max-w-full flex-col items-center" aria-hidden>
      <div className="grid w-full grid-cols-4 gap-0.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="h-7 bg-[#c1121f]" />
        ))}
      </div>
      <div className="mt-0.5 flex w-full gap-1">
        <span className="h-2 flex-1 bg-[#8b5a2b]" />
        <span className="h-2 flex-1 bg-[#8b5a2b]" />
        <span className="h-2 flex-1 bg-[#8b5a2b]" />
      </div>
    </div>
  );
}

const NETWORK = [
  { label: "Brand Owner", detail: DEMO_PASSPORT.brandOwner, icon: Factory, x: "50%", y: "10%" },
  { label: "Manufacturer", detail: DEMO_PASSPORT.manufacturer, icon: Factory, x: "82%", y: "32%" },
  { label: "Packaging", detail: "Each → case → pallet", icon: Boxes, x: "82%", y: "68%" },
  { label: "Importer / Distributor", detail: DEMO_PASSPORT.importer, icon: Truck, x: "50%", y: "90%" },
  { label: "Retailer", detail: "POS and ecommerce", icon: Store, x: "18%", y: "68%" },
  { label: "Consumer", detail: "Scan and lookup", icon: ScanLine, x: "18%", y: "32%" },
] as const;

export function IdentityNetwork() {
  return (
    <div className="mt-4">
      <div className="relative mx-auto hidden aspect-square max-w-3xl overflow-visible xl:block">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id="graph-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {[
            [50, 50, 50, 12],
            [50, 50, 82, 32],
            [50, 50, 82, 68],
            [50, 50, 50, 88],
            [50, 50, 18, 68],
            [50, 50, 18, 32],
          ].map(([x1, y1, x2, y2]) => (
            <line
              key={`${x2}-${y2}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#graph-line)"
              strokeWidth="0.4"
            />
          ))}
          <circle cx="50" cy="50" r="13" fill="#06152b" stroke="#67e8f9" strokeWidth="0.5" />
        </svg>
        <div className="absolute top-1/2 left-1/2 z-10 w-44 -translate-x-1/2 -translate-y-1/2 bg-[#081b35] px-4 py-3.5 text-center ring-1 ring-cyan-300/40">
          <Package className="mx-auto h-5 w-5 text-cyan-300" aria-hidden />
          <p className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-200">PRODUCT</p>
          <p className="mt-1 truncate text-sm text-white">{DEMO_PASSPORT.name}</p>
          <p className="font-mono text-xs text-slate-400">{DEMO_PASSPORT.gtin}</p>
        </div>
        {NETWORK.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.label}
              className="absolute w-48 -translate-x-1/2 -translate-y-1/2 bg-[#081b35]/90 px-3 py-2.5 ring-1 ring-white/10"
              style={{ left: node.x, top: node.y }}
            >
              <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-5.5 rounded-full bg-cyan-300 shadow-[0_0_10px_3px_rgba(103,232,249,0.5)]" />
              <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-cyan-200">
                <Icon className="h-3 w-3" />
                {node.label}
              </p>
              <p className="mt-1 truncate text-[11px] text-slate-300">{node.detail}</p>
            </div>
          );
        })}
      </div>

      <ol className="space-y-2 xl:hidden">
        <li className="bg-cyan-400/10 px-4 py-3 ring-1 ring-cyan-300/30">
          <p className="text-xs font-semibold tracking-[0.18em] text-cyan-200">PRODUCT</p>
          <p className="mt-1 text-sm text-white">{DEMO_PASSPORT.name}</p>
          <p className="break-all font-mono text-xs text-slate-400">{DEMO_PASSPORT.gtin}</p>
        </li>
        {NETWORK.map((node) => (
          <li key={node.label} className="border-l-2 border-cyan-400/40 px-4 py-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">{node.label}</p>
            <p className="mt-1 text-sm leading-5 text-slate-200">{node.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ScanPhone() {
  return (
    <div className="mx-auto w-[13.5rem]" aria-hidden>
      <div className="rounded-[1.8rem] bg-slate-900 p-2 shadow-[0_24px_50px_-24px_rgba(6,21,43,0.55)]">
        <div className="relative overflow-hidden rounded-[1.35rem] bg-white px-3 pb-4 pt-5">
          <span className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-200" />
          <p className="text-center text-[10px] font-semibold tracking-[0.18em] text-cyan-700">SCANNING…</p>
          <div className="relative mt-3">
            <MiniBarcode className="h-16" />
            <span className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 bg-cyan-500 shadow-[0_0_12px_2px_rgba(6,182,212,0.65)]" />
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-slate-500">{DEMO_PASSPORT.gtin}</p>
          <p className="mt-1 truncate text-center text-xs font-semibold text-slate-900">{DEMO_PASSPORT.name}</p>
        </div>
      </div>
    </div>
  );
}

export function CompactIdentityGraph() {
  const chips = [
    { label: "Brand", value: DEMO_PASSPORT.brand, pos: "left-0 top-2" },
    { label: "Manufacturer", value: DEMO_PASSPORT.manufacturer, pos: "right-0 top-2" },
    { label: "Category", value: "Soft drinks", pos: "left-0 bottom-2" },
    { label: "Market", value: DEMO_PASSPORT.targetMarket, pos: "right-0 bottom-2" },
  ];
  return (
    <div>
      <div className="relative mx-auto hidden min-h-[19rem] max-w-lg md:block">
        {chips.map((chip) => (
          <div
            key={chip.label}
            className={`absolute max-w-[10.5rem] rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm ${chip.pos}`}
          >
            <p className="text-[10px] font-semibold tracking-[0.14em] text-cyan-700">{chip.label}</p>
            <p className="mt-0.5 text-xs leading-4 text-slate-700">{chip.value}</p>
          </div>
        ))}
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <CokeCan size="md" />
          <p className="mt-2 font-mono text-[10px] text-slate-400">{DEMO_PASSPORT.gtin}</p>
        </div>
      </div>
      <div className="md:hidden">
        <div className="mb-4 flex justify-center">
          <CokeCan size="md" />
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {chips.map((chip) => (
            <li key={chip.label} className="rounded-md border border-slate-200 bg-white px-3 py-2">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-cyan-700">{chip.label}</p>
              <p className="mt-0.5 text-xs leading-4 text-slate-700">{chip.value}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PackScanMock() {
  return (
    <div className="relative overflow-hidden bg-slate-100 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(6,21,43,0.12)_43%,transparent_48%)]" />
      <div className="relative mx-auto flex flex-col items-center">
        <CokeCan size="lg" className="shadow-[0_18px_40px_-18px_rgba(6,21,43,0.55)]" />
        <MiniBarcode className="mt-5 w-36" />
      </div>
      <p className="relative mt-4 text-center text-[11px] tracking-wide text-slate-500">
        Packaging image · demonstration
      </p>
    </div>
  );
}
