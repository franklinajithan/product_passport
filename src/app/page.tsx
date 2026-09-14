import { HomeHero } from "@/components/marketing/home/hero";
import { HomePlatformSections } from "@/components/marketing/home/platform-sections";
import { HomeDeveloperAndWorkflow } from "@/components/marketing/home/developer-workflow";
import { renderBarcodeSymbol } from "@/lib/barcodes/render";
import { DEMO_PASSPORT } from "@/data/demo-showcase";

export default async function HomePage() {
  const symbol = await renderBarcodeSymbol({
    value: DEMO_PASSPORT.gtin,
    symbology: "EAN_13",
    format: "svg",
  });

  return (
    <div className="overflow-x-hidden">
      <HomeHero barcodeSvg={symbol.ok ? symbol.body : null} />
      <HomePlatformSections />
      <HomeDeveloperAndWorkflow />
    </div>
  );
}
