"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";

export default function VerifyLookupPage() {
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
        throw new Error("Camera hardware access is not supported on this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // BarcodeDetector API if supported by modern browser
      if ("BarcodeDetector" in window) {
        // @ts-expect-error BarcodeDetector browser experimental
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              handleQrDetected(barcodes[0].rawValue);
            }
          } catch {
            // Ignore scan frame error
          }
        }, 200);
      } else {
        setScanError("Camera scanner active. Alternatively, enter the printed public ID manually above.");
      }
    } catch (err) {
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
    <main className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Top back navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-xs text-ink-secondary hover:text-ink flex items-center gap-1.5 font-medium transition-colors press-feedback"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CertiVault</span>
        </Link>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-verified bg-verified/10 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          Public Ledger
        </span>
      </div>

      <div className="w-full max-w-md bg-surface rounded-2xl border border-hairline p-6 sm:p-8 shadow-xl text-center space-y-6">
        {/* Header Icon */}
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-black text-ink tracking-tight">Verify a Credential</h1>
          <p className="text-xs text-ink-secondary max-w-xs mx-auto leading-relaxed">
            Enter the unique public ID or scan the QR code printed on any CertiVault credential.
          </p>
        </div>

        {/* Mode Selector */}
        <div>
          <SegmentedControl
            options={[
              { value: "id", label: "Enter Public ID" },
              { value: "camera", label: "Scan Camera QR" },
            ]}
            value={mode}
            onChange={(val) => setMode(val as "id" | "camera")}
          />
        </div>

        {/* MODE: ENTER ID */}
        {mode === "id" && (
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  id="public-id-input"
                  name="publicId"
                  aria-label="Certificate Public ID"
                  type="text"
                  value={publicIdInput}
                  onChange={(e) => setPublicIdInput(e.target.value)}
                  placeholder="CV-26-7K3M9QXT"
                  autoComplete="off"
                  className="w-full h-12 px-4 rounded-xl bg-canvas border border-hairline text-ink font-mono uppercase text-center text-base tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
              <p className="text-[11px] text-ink-secondary text-left flex items-center justify-between">
                <span>Format: <strong className="font-mono">CV-{new Date().getFullYear().toString().slice(-2)}-XXXXXXXX</strong></span>
                <span className="text-ink-secondary/70">Crockford Base32</span>
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 flex items-center justify-center gap-2 font-semibold rounded-xl shadow-xs"
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
            <div className="relative aspect-square w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-hairline shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Frame with Corner Targets */}
              <div className="absolute inset-8 rounded-xl pointer-events-none flex items-center justify-center">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent rounded-br-sm" />

                {/* Animated horizontal laser beam */}
                <div className="w-full h-0.5 bg-accent/80 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
              </div>

              {isScanning && !scanError && (
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-medium pointer-events-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-verified animate-ping" />
                  Scanner active...
                </div>
              )}

              {scanError && (
                <div className="absolute inset-0 bg-surface/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-danger" />
                  <p className="text-xs text-danger font-medium leading-relaxed">{scanError}</p>
                  <Button variant="secondary" size="sm" onClick={startCamera}>
                    Retry Camera
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-ink-secondary">
              Center the QR code within the frame to authenticate instantly.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-ink-secondary flex items-center gap-1.5">
        <span>Powered by</span>
        <Link href="/" className="font-semibold text-ink hover:underline">
          CertiVault Trust Engine
        </Link>
        <span>· Mumbai Region</span>
      </div>
    </main>
  );
}
