import { BarcodeScanner } from "@/features/search/components/barcode-scanner";

export default function ScanPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Scan a barcode</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Point the camera at a barcode symbol — EAN, UPC, GS1-128, DataMatrix or a GS1 QR /
        Digital Link. The scanner decodes the symbol, extracts the GTIN and any batch/serial
        data, then looks up the product. The raw payload is never treated as the product
        identifier.
      </p>
      <div className="mt-8">
        <BarcodeScanner />
      </div>
    </div>
  );
}
