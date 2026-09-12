"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type Detector = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string; format?: string }>>;
};

async function lookupScannedValue(value: string, symbology?: string) {
  const response = await fetch("/api/v1/barcodes/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value, symbology }),
  });
  if (!response.ok) {
    return { productFound: false, lookupGtin: value };
  }
  return (await response.json()) as {
    productFound: boolean;
    lookupGtin?: string;
    scan?: { gtin?: string | null };
  };
}

export function BarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;
    const BarcodeDetectorCtor = (
      window as Window & { BarcodeDetector?: new (options: { formats: string[] }) => Detector }
    ).BarcodeDetector;

    async function start() {
      if (!BarcodeDetectorCtor) {
        setSupported(false);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!videoRef.current || cancelled) {
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new BarcodeDetectorCtor({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code", "code_128", "data_matrix", "itf"],
        });

        const tick = async () => {
          if (cancelled || !videoRef.current) {
            return;
          }
          try {
            const codes = await detector.detect(videoRef.current);
            const hit = codes[0];
            if (hit?.rawValue) {
              const result = await lookupScannedValue(hit.rawValue, hit.format);
              const gtin = result.scan?.gtin ?? result.lookupGtin ?? hit.rawValue;
              router.push(
                result.productFound
                  ? `/product/${encodeURIComponent(gtin)}`
                  : `/validate?q=${encodeURIComponent(gtin)}`,
              );
              return;
            }
          } catch {
            // keep scanning
          }
          requestAnimationFrame(() => {
            void tick();
          });
        };

        void tick();
      } catch {
        setError("Camera permission was denied. You can still type a barcode below.");
        setSupported(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [router]);

  return (
    <div className="space-y-4">
      {supported ? (
        <video
          ref={videoRef}
          className="aspect-video w-full rounded-xl border border-border bg-black object-cover"
          playsInline
          muted
        />
      ) : (
        <Alert>
          Live camera scanning is not available in this browser. Enter the barcode manually.
        </Alert>
      )}
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!manual.trim()) {
            return;
          }
          void lookupScannedValue(manual.trim()).then((result) => {
            const gtin = result.scan?.gtin ?? result.lookupGtin ?? manual.trim();
            router.push(
              result.productFound
                ? `/product/${encodeURIComponent(gtin)}`
                : `/validate?q=${encodeURIComponent(gtin)}`,
            );
          });
        }}
      >
        <input
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          placeholder="Type a GTIN, GS1 element string or Digital Link URI"
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
        <Button type="submit">Look up</Button>
      </form>
    </div>
  );
}
