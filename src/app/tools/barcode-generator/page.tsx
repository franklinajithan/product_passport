import { ToolShell } from "@/components/tools/tool-shell";
import { BarcodeGeneratorTool } from "@/components/tools/barcode-generator-tool";

export default function BarcodeGeneratorPage() {
  return (
    <ToolShell
      title="Barcode symbol generator"
      description="Render a supported carrier from an existing identifier. This is not an official GTIN issuer."
    >
      <BarcodeGeneratorTool />
    </ToolShell>
  );
}
