import { BarcodeScanner } from "@/features/search/components/barcode-scanner";

export default function ScanPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Scan a barcode</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Point the camera at an EAN, UPC, GTIN or QR code. If the product exists it will open
        immediately. If it does not, you can add it (manufacturers) or report it.
      </p>
      <div className="mt-8">
        <BarcodeScanner />
      </div>
    </div>
  );
}
