import { HomeHero } from "@/components/marketing/home/hero";
import { HomePlatformSections } from "@/components/marketing/home/platform-sections";
import { HomeDeveloperAndWorkflow } from "@/components/marketing/home/developer-workflow";
import { renderBarcodeSymbol } from "@/lib/barcodes/render";

export default async function HomePage() {
  const symbol = await renderBarcodeSymbol({
    value: "5901234567893",
    symbology: "EAN_13",
    format: "svg",
  });

  return (
    <div>
      <HomeHero barcodeSvg={symbol.ok ? symbol.body : null} />
      <HomePlatformSections />
      <HomeDeveloperAndWorkflow />
    </div>
  );
}
