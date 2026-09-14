import Link from "next/link";
import {
  Camera,
  Globe2,
  Languages,
  Leaf,
  Package2,
  QrCode,
  ScanLine,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_PASSPORT, DEMO_PRODUCT_DISCLAIMER } from "@/data/demo-showcase";
import { PageContainer } from "@/components/layout/page-container";
import { CokeCan } from "@/components/marketing/home/section-visuals";

export function HeroSearch() {
  return (
    <form action="/search" method="get" className="w-full min-w-0">
      <label htmlFor="hero-search" className="sr-only">
        Search GTIN, EAN, UPC, barcode or product name
      </label>
      <div className="flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-md bg-white p-1.5 shadow-[0_18px_50px_-24px_rgba(6,21,43,0.85)] ring-1 ring-white/60 sm:flex-row sm:items-stretch sm:gap-1.5">
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
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="submit"
            size="lg"
            className="h-12 min-h-12 min-w-0 flex-1 rounded-sm px-5 sm:flex-none"
          >
            Search
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 min-h-12 min-w-0 flex-1 rounded-sm border-slate-200 bg-white px-3 text-slate-900 hover:bg-slate-50 sm:flex-none"
          >
            <Link href="/scan" aria-label="Scan barcode">
              <Camera />
              <span className="sm:inline">Scan Barcode</span>
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
}

const GLOBE_CX = 400;
const GLOBE_CY = 400;
const GLOBE_R = 300;
type GlobePoint = {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  visible: boolean;
};

function buildNetworkGlobe() {
  const count = 280;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const lat0 = (8 * Math.PI) / 180;
  const lon0 = (28 * Math.PI) / 180;
  const points: GlobePoint[] = [];

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const x1 = x * Math.cos(lon0) + z * Math.sin(lon0);
    const z1 = -x * Math.sin(lon0) + z * Math.cos(lon0);
    const y2 = y * Math.cos(lat0) - z1 * Math.sin(lat0);
    const z2 = y * Math.sin(lat0) + z1 * Math.cos(lat0);

    points.push({
      x: x1,
      y: y2,
      z: z2,
      px: +(GLOBE_CX + x1 * GLOBE_R).toFixed(1),
      py: +(GLOBE_CY - y2 * GLOBE_R).toFixed(1),
      visible: z2 > -0.08,
    });
  }

  const links: Array<[number, number]> = [];
  const seen = new Set<string>();
  points.forEach((point, index) => {
    if (!point.visible) return;
    const neighbors = points
      .map((other, otherIndex) => {
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const dz = point.z - other.z;
        return { otherIndex, dist: dx * dx + dy * dy + dz * dz };
      })
      .filter((row) => row.otherIndex !== index && points[row.otherIndex]?.visible && row.dist < 0.085)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);

    for (const neighbor of neighbors) {
      const key =
        index < neighbor.otherIndex ? `${index}-${neighbor.otherIndex}` : `${neighbor.otherIndex}-${index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push([index, neighbor.otherIndex]);
    }
  });

  const halo: GlobePoint[] = [];
  for (let i = 0; i < 36; i += 1) {
    const angle = (i / 36) * Math.PI * 1.35 - 0.2;
    const lift = 0.12 + (i % 5) * 0.018;
    const x = Math.cos(angle) * (1.08 + lift);
    const y = Math.sin(angle) * (0.82 + lift * 0.4) + 0.18;
    halo.push({
      x,
      y,
      z: 0.55,
      px: +(GLOBE_CX + x * GLOBE_R).toFixed(1),
      py: +(GLOBE_CY - y * GLOBE_R).toFixed(1),
      visible: true,
    });
  }

  const strong = points
    .map((point, index) => ({ index, z: point.z, visible: point.visible }))
    .filter((row) => row.visible && row.z > 0.35)
    .sort((a, b) => b.z - a.z)
    .slice(0, 8)
    .map((row) => row.index);

  return { points, links, halo, strong: new Set(strong) };
}

const NETWORK_GLOBE = buildNetworkGlobe();

function DigitalEarth() {
  return (
    <svg viewBox="0 0 800 800" className="h-full w-full overflow-visible" fill="none">
      <defs>
        <radialGradient id="hero-earth-fill" cx="34%" cy="28%" r="74%">
          <stop offset="0%" stopColor="#082445" />
          <stop offset="48%" stopColor="#0b3f73" />
          <stop offset="78%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#67e8f9" />
        </radialGradient>
        <radialGradient id="hero-earth-atmosphere" cx="50%" cy="50%" r="50%">
          <stop offset="58%" stopColor="rgba(34,211,238,0)" />
          <stop offset="74%" stopColor="rgba(56,189,248,0.38)" />
          <stop offset="88%" stopColor="rgba(165,243,252,0.7)" />
          <stop offset="100%" stopColor="rgba(186,230,253,0)" />
        </radialGradient>
        <radialGradient id="hero-earth-glow" cx="50%" cy="50%" r="50%">
          <stop offset="38%" stopColor="rgba(34,211,238,0.4)" />
          <stop offset="68%" stopColor="rgba(56,189,248,0.18)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </radialGradient>
        <linearGradient id="hero-earth-shade" x1="18%" y1="12%" x2="86%" y2="90%">
          <stop offset="0%" stopColor="rgba(186,230,253,0.22)" />
          <stop offset="46%" stopColor="rgba(6,21,43,0)" />
          <stop offset="100%" stopColor="rgba(6,21,43,0.42)" />
        </linearGradient>
        <filter id="hero-earth-node" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="hero-earth-clip">
          <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R} />
        </clipPath>
      </defs>

      <circle cx={GLOBE_CX} cy={GLOBE_CY} r="455" fill="url(#hero-earth-glow)" />
      <circle cx={GLOBE_CX} cy={GLOBE_CY} r="356" fill="url(#hero-earth-atmosphere)" />

      {NETWORK_GLOBE.halo.map((point, index) => {
        const next = NETWORK_GLOBE.halo[(index + 1) % NETWORK_GLOBE.halo.length];
        if (!next || index > 28) return null;
        return (
          <path
            key={`halo-${index}`}
            d={`M${point.px},${point.py}L${next.px},${next.py}`}
            stroke="rgba(103,232,249,0.18)"
            strokeWidth="0.8"
          />
        );
      })}
      {NETWORK_GLOBE.halo.map((point, index) => (
        <circle
          key={`halo-n-${index}`}
          cx={point.px}
          cy={point.py}
          r={index % 4 === 0 ? 2.2 : 1.1}
          fill="rgba(165,243,252,0.55)"
        />
      ))}

      <g clipPath="url(#hero-earth-clip)">
        <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R} fill="url(#hero-earth-fill)" />
        <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R} fill="url(#hero-earth-shade)" />
        {NETWORK_GLOBE.links.map(([from, to]) => {
          const a = NETWORK_GLOBE.points[from];
          const b = NETWORK_GLOBE.points[to];
          if (!a || !b) return null;
          const depth = Math.min(a.z, b.z);
          const opacity = 0.22 + Math.max(0, depth) * 0.55;
          return (
            <path
              key={`${from}-${to}`}
              d={`M${a.px},${a.py}L${b.px},${b.py}`}
              stroke={`rgba(125,211,252,${opacity.toFixed(2)})`}
              strokeWidth={depth > 0.45 ? 1.35 : 0.85}
            />
          );
        })}
      </g>

      <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R} stroke="rgba(186,230,253,0.92)" strokeWidth="2.6" />
      <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R + 11} stroke="rgba(56,189,248,0.42)" strokeWidth="10" />

      <g filter="url(#hero-earth-node)" clipPath="url(#hero-earth-clip)">
        {NETWORK_GLOBE.points.map((point, index) => {
          if (!point.visible) return null;
          const strong = NETWORK_GLOBE.strong.has(index);
          const r = strong ? 5.4 : point.z > 0.2 ? 2.15 : 1.35;
          return (
            <circle
              key={`n-${index}`}
              cx={point.px}
              cy={point.py}
              r={r}
              fill={strong ? "#ecfeff" : point.z > 0.25 ? "#a5f3fc" : "#38bdf8"}
              opacity={0.55 + Math.max(0, point.z) * 0.45}
              className={strong ? "animate-pulse" : undefined}
            />
          );
        })}
      </g>
    </svg>
  );
}

function NetworkBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#06152b]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_8%_12%,rgba(56,189,248,0.12),transparent_42%),radial-gradient(700px_circle_at_18%_88%,rgba(37,99,235,0.14),transparent_48%)]" />
      <div className="absolute inset-0 opacity-[0.16] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_78%)] bg-[linear-gradient(rgba(125,211,252,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.22)_1px,transparent_1px)]" />

      <div className="absolute -right-16 -top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.32),transparent_68%)] lg:hidden" />

      <div className="absolute -top-[120px] -right-[140px] hidden h-[780px] w-[780px] lg:block xl:-top-[150px] xl:-right-[180px] xl:h-[840px] xl:w-[840px]">
        <DigitalEarth />
      </div>

      <div className="absolute left-[16%] top-[24%] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_18px_6px_rgba(103,232,249,0.55)]" />
      <div className="absolute bottom-[30%] left-[8%] h-1 w-1 rounded-full bg-sky-400 shadow-[0_0_14px_5px_rgba(56,189,248,0.45)]" />
      <div className="absolute top-[18%] right-[38%] hidden h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_16px_5px_rgba(165,243,252,0.5)] lg:block" />
      <div className="absolute top-[42%] right-[8%] hidden h-1 w-1 rounded-full bg-sky-300 shadow-[0_0_12px_4px_rgba(56,189,248,0.45)] lg:block" />
      <div className="absolute bottom-[22%] right-[28%] hidden h-1 w-1 rounded-full bg-cyan-300 shadow-[0_0_12px_4px_rgba(103,232,249,0.4)] lg:block" />
    </div>
  );
}

function TwoDReadinessMark() {
  const size = 21;
  const cells: boolean[] = [];
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        cells[(oy + y) * size + (ox + x)] = edge || inner;
      }
    }
  };
  for (let i = 0; i < size * size; i += 1) cells.push(((i * 7 + 3) % 11) > 5);
  finder(0, 0);
  finder(14, 0);
  finder(0, 14);
  for (let i = 8; i < 13; i += 1) {
    cells[i * size + 6] = i % 2 === 0;
    cells[6 * size + i] = i % 2 === 0;
  }

  return (
    <div
      className="grid h-[4.75rem] w-[4.75rem] shrink-0 bg-white p-1 ring-1 ring-slate-900"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {cells.map((on, index) => (
        <span key={index} className={on ? "bg-slate-900" : "bg-white"} />
      ))}
    </div>
  );
}

export function HeroPassportCard({ barcodeSvg }: { barcodeSvg?: string | null }) {
  const item = DEMO_PASSPORT;
  const nutrition = item.nutritionPer100ml;
  const digitalLink = `https://id.gs1.org/01/${item.gtin}`;

  return (
    <article className="min-w-0 overflow-hidden rounded-xl bg-white text-slate-900 shadow-[0_28px_80px_-28px_rgba(2,8,23,0.7)] ring-2 ring-sky-300/80">
      <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-1">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-500">PRODUCT PASSPORT</p>
          <p className="mt-0.5 text-sm text-slate-500">Verified product identity</p>
        </div>
        <Badge
          variant="outline"
          className="rounded-sm border-cyan-700/25 bg-cyan-50 text-cyan-800 dark:border-cyan-700/25 dark:bg-cyan-50 dark:text-cyan-800"
        >
          DEMO
        </Badge>
      </header>

      <div className="grid gap-5 px-5 py-4 sm:grid-cols-[minmax(9rem,11.5rem)_1fr] sm:items-start">
        <div className="flex justify-center sm:justify-start">
          <CokeCan size="hero" />
        </div>
        <div className="min-w-0 pt-1">
          <p className="text-[1.65rem] font-semibold leading-tight tracking-tight text-slate-900">{item.name}</p>
          <dl className="mt-3 space-y-1 text-sm text-slate-600">
            <div>
              <dt className="inline text-slate-500">Brand: </dt>
              <dd className="inline">{item.brand}</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">Net content: </dt>
              <dd className="inline">{item.netContent}</dd>
            </div>
            <div>
              <dt className="inline text-slate-500">Product type: </dt>
              <dd className="inline">{item.productType}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="rounded-sm border-0 bg-sky-100 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-sky-800 dark:bg-sky-100 dark:text-sky-800">
              PUBLIC DEMO RECORD
            </Badge>
            <Badge className="rounded-sm border-0 bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-emerald-800 dark:bg-emerald-100 dark:text-emerald-800">
              GTIN STRUCTURE VALID
            </Badge>
          </div>
          <p className="mt-3 max-w-md text-xs leading-5 text-slate-500">{DEMO_PRODUCT_DISCLAIMER}</p>
        </div>
      </div>

      <div className="grid gap-6 border-t border-slate-100 px-5 py-4 sm:grid-cols-2">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">GTIN (EAN-13)</dt>
            <dd className="mt-0.5 font-mono text-[15px] text-slate-900">{item.gtin}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">MANUFACTURER</dt>
            <dd className="mt-0.5 text-slate-900">{item.manufacturer}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">COUNTRY OF SALE</dt>
            <dd className="mt-0.5 text-slate-900">{item.targetMarket}</dd>
          </div>
        </dl>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">INGREDIENTS</p>
            <p className="mt-1 leading-6 text-slate-700">{item.ingredients}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">NUTRITION (per 100 ml)</p>
            <p className="mt-1 leading-6 text-slate-700">
              Energy: {nutrition.energy} | Fat: {nutrition.fat} | Saturates: {nutrition.saturates}
              <br />
              Carbohydrate: {nutrition.carbohydrate} | Sugars: {nutrition.sugars}
              <br />
              Protein: {nutrition.protein} | Salt: {nutrition.salt}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-100 px-5 py-4 sm:grid-cols-[1.05fr_1fr] sm:items-center">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">EAN-13 BARCODE</p>
          {barcodeSvg ? (
            <div
              className="mt-2 max-w-full overflow-x-auto bg-white [&_svg]:h-16 [&_svg]:w-auto [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />
          ) : (
            <p className="mt-3 font-mono text-sm text-slate-500">{item.gtin}</p>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-400">2D READY</p>
            <div className="mt-2">
              <TwoDReadinessMark />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">2D Ready</p>
            <p className="text-sm text-slate-600">GS1 Digital Link</p>
            <p className="mt-1 text-[11px] text-slate-400">Example URI (preview)</p>
            <p className="mt-0.5 break-all font-mono text-[11px] text-sky-700">{digitalLink}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

const TRUST_PILLS = [
  { icon: ShieldCheck, label: "Manufacturer-controlled data" },
  { icon: Languages, label: "Multilingual by design" },
  { icon: QrCode, label: "1D + 2D architecture" },
  { icon: Package2, label: "Flexible for any industry" },
] as const;

const INFRASTRUCTURE = [
  {
    icon: ShieldCheck,
    title: "Greater transparency",
    detail: "Trusted product data",
  },
  {
    icon: Users,
    title: "Stronger supply chains",
    detail: "Connected data flow",
  },
  {
    icon: Globe2,
    title: "Informed consumers",
    detail: "Clear and reliable information",
  },
  {
    icon: Leaf,
    title: "A more sustainable world",
    detail: "Data for a better tomorrow",
  },
] as const;

export function HomeHero({ barcodeSvg }: { barcodeSvg?: string | null }) {
  return (
    <section className="relative overflow-x-hidden border-b border-[#0b2344] text-white">
      <NetworkBackdrop />
      <PageContainer className="relative z-10 grid min-w-0 gap-10 py-10 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:py-24">
        <div className="min-w-0">
          <p className="inline-flex max-w-full items-center rounded-sm border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-cyan-200 sm:text-[11px] sm:tracking-[0.22em]">
            GLOBAL PRODUCT IDENTITY NETWORK
          </p>
          <h1 className="mt-5 max-w-3xl text-[2rem] font-semibold leading-[1.12] tracking-tight sm:mt-6 sm:text-5xl sm:leading-tight md:text-6xl lg:text-[4.75rem] lg:leading-[1.04]">
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

          <nav className="mt-5 flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
            <Link
              href="/dashboard/products/new"
              className="inline-flex min-h-11 items-center text-cyan-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Register a product →
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center text-cyan-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Register your company →
            </Link>
            <Link
              href="/developers"
              className="inline-flex min-h-11 items-center text-cyan-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
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

      <div className="relative z-10 border-t border-white/10 bg-[#081b35]/85">
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
