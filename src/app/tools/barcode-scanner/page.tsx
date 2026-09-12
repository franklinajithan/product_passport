import { ToolShell } from "@/components/tools/tool-shell";
import { BarcodeScanner } from "@/features/search/components/barcode-scanner";

export default function ToolScannerPage() {
  return (
    <ToolShell
      title="Barcode scanner"
      description="Decode a symbol, extract GTIN and Application Identifiers, then look up the product. The raw payload is not treated as the identifier."
    >
      <BarcodeScanner />
    </ToolShell>
  );
}
