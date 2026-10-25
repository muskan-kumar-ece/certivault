"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, QrCode, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ToastProvider, useToast } from "@/components/ui/toast";

export default function VerifyLookupPage() {
  return (
    <ToastProvider>
      <VerifyLookupContent />
    </ToastProvider>
  );
}

function VerifyLookupContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"id" | "camera">("id");
  const [publicIdInput, setPublicIdInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = publicIdInput.trim().toUpperCase();

    if (!cleanId) {
      showToast({ title: "ID Required", description: "Please enter a certificate ID.", variant: "warning" });
      return;
    }

    router.push(`/c/${cleanId}`);
  };

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const handleQrDetected = useCallback((urlOrId: string) => {
    stopCamera();
    showToast({ title: "QR Code Detected", description: "Verifying certificate...", variant: "success" });

    // Extract ID if URL format (e.g. https://certivault.in/c/CV-26-XXXXXXXX)
    const match = urlOrId.match(/CV-\d{2}-[0-9A-HJKMNP-Z]{8}/i);
    if (match) {
      router.push(`/c/${match[0].toUpperCase()}`);
    } else {
      router.push(`/c/${urlOrId.trim().toUpperCase()}`);
    }
  }, [router, showToast, stopCamera]);

  // Start Camera QR Scanner
  const startCamera = useCallback(async () => {
    setScanError(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported by your browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check if BarcodeDetector API exists
      type BarcodeDetectorCtor = new (opts: { formats: string[] }) => {
        detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
      };

      const winWithDetector = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
      if (winWithDetector.BarcodeDetector) {
        const barcodeDetector = new winWithDetector.BarcodeDetector({
          formats: ["qr_code"],
        });

        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                handleQrDetected(rawValue);
              }
            } catch {
              // Non-blocking frame scan error
            }
          }
        }, 300);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to access camera.";
      setScanError(msg);
      setIsScanning(false);
    }
  }, [handleQrDetected]);

  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, startCamera, stopCamera]);

  return (
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-surface rounded-card border border-hairline p-6 sm:p-8 shadow-sm text-center">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-ink mb-1.5">Verify a Certificate</h1>
        <p className="text-xs text-ink-secondary mb-6">
          Enter the unique public ID or scan the QR code printed on any CertiVault credential.
        </p>

        {/* Mode Selector */}
        <div className="mb-6">
          <SegmentedControl
            options={[
              { value: "id", label: "Enter ID" },
              { value: "camera", label: "Scan QR Code" },
            ]}
            value={mode}
            onChange={(val) => setMode(val as "id" | "camera")}
          />
        </div>

        {/* MODE: ENTER ID */}
        {mode === "id" && (
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={publicIdInput}
                  onChange={(e) => setPublicIdInput(e.target.value)}
                  placeholder="CV-26-7K3M9QXT"
                  className="w-full h-12 px-4 rounded-control bg-canvas border border-hairline text-ink font-mono uppercase text-center text-base tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <p className="text-[11px] text-ink-secondary mt-1.5 text-left">
                Format: <span className="font-mono">CV-{new Date().getFullYear().toString().slice(-2)}-XXXXXXXX</span>
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 flex items-center justify-center gap-2 font-semibold"
            >
              <Search className="w-4 h-4" />
              <span>Verify Authenticity</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* MODE: CAMERA SCANNER */}
        {mode === "camera" && (
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-control bg-black overflow-hidden flex items-center justify-center border border-hairline">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Target Box */}
              <div className="absolute inset-8 border-2 border-accent/80 rounded-lg pointer-events-none flex items-center justify-center animate-pulse">
                <QrCode className="w-12 h-12 text-accent/30" />
              </div>

              {isScanning && !scanError && (
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white pointer-events-none">
                  Scanning live...
                </div>
              )}

              {scanError && (
                <div className="absolute inset-0 bg-surface/95 p-4 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-8 h-8 text-danger mb-2" />
                  <p className="text-xs text-danger font-medium mb-3">{scanError}</p>
                  <Button variant="secondary" size="sm" onClick={startCamera}>
                    Retry Camera
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-ink-secondary">
              Center the QR code within the frame to verify automatically.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-ink-secondary flex items-center gap-1.5">
        <span>Powered by</span>
        <a href="https://certivault.in" className="font-semibold text-ink hover:underline">
          CertiVault Trust Engine
        </a>
      </div>
    </main>
  );
}
