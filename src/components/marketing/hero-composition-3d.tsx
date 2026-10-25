import React from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Users,
  Upload,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function HeroComposition3D() {
  return (
    <div className="relative w-full max-w-[620px] mx-auto select-none py-6 lg:py-10">
      {/* Background Ambient Radial Light Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-accent/15 via-brand-cyan/20 to-brand-violet/15 blur-3xl pointer-events-none rounded-full" />

      {/* Luminous Curved Neon Light Trails (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
        viewBox="0 0 600 500"
        fill="none"
      >
        <defs>
          <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-cyan)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--brand-violet)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="neonViolet" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-violet)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Dynamic sweeping neon arc */}
        <path
          d="M 60,340 C 140,220 280,180 540,260"
          stroke="url(#neonCyan)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="opacity-80"
          style={{ filter: "drop-shadow(0 0 8px rgba(103, 232, 249, 0.6))" }}
        />
        <path
          d="M 120,380 C 220,290 380,240 560,320"
          stroke="url(#neonViolet)"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-70"
          style={{ filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))" }}
        />
      </svg>

      {/* 3D Tiered Illuminated Podium Base */}
      <div className="relative mx-auto w-full max-w-[540px]">
        {/* Podium Lower Tier */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[105%] h-24 rounded-[100%] bg-gradient-to-b from-surface via-canvas to-surface-raised border border-hairline/80 shadow-[0_30px_60px_-15px_rgba(54,92,255,0.18)]" />
        {/* Podium Upper Tier */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[92%] h-16 rounded-[100%] bg-gradient-to-b from-white to-canvas border border-hairline/60 shadow-[0_15px_30px_rgba(54,92,255,0.12)]" />

        {/* Central 3D Laptop Device */}
        <div className="relative z-20 mx-auto w-full max-w-[460px] sm:max-w-[500px]">
          {/* Laptop Screen Bezel & Lid */}
          <div className="rounded-2xl bg-brand-navy p-2 sm:p-2.5 shadow-2xl border border-hairline/40">
            {/* Screen Inner Display Frame */}
            <div className="rounded-xl bg-surface overflow-hidden border border-hairline shadow-inner">
              {/* Laptop Screen Top Header */}
              <div className="bg-canvas border-b border-hairline px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-accent flex items-center justify-center text-white text-[8px] font-black">
                    CV
                  </div>
                  <span className="text-[11px] font-bold text-ink">CertiVault Studio</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-verified/80" />
                  <span className="text-[10px] text-ink-secondary font-medium">Auto-save on</span>
                </div>
              </div>

              {/* Wizard Content Screen */}
              <div className="p-4 sm:p-5 space-y-4 bg-surface text-center">
                <div>
                  <h4 className="text-base font-extrabold text-ink tracking-tight">
                    Create Certificates
                  </h4>
                  <p className="text-[11px] text-ink-secondary mt-0.5">
                    Batch generation pipeline with zero manual copy-paste
                  </p>
                </div>

                {/* 4-Step Stepper Header */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] font-semibold">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-white shadow-xs">
                    <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
                      1
                    </span>
                    <span>Upload Template</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-ink-secondary/50" />
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-canvas text-ink-secondary border border-hairline">
                    <span>2. Add Student List</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-ink-secondary/50 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-canvas text-ink-secondary border border-hairline">
                    <span>3. Map Fields</span>
                  </div>
                </div>

                {/* Drag & Drop File Zone */}
                <div className="p-5 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 flex flex-col items-center justify-center space-y-2 hover:bg-accent/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-ink">Drag & drop your Excel or CSV file</p>
                    <p className="text-[10px] text-ink-secondary">Supports .xlsx, .csv (up to 10,000 rows)</p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-bold shadow-md shadow-accent/25 hover:bg-accent-hover transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Certificates</span>
                </button>
              </div>
            </div>
          </div>

          {/* Laptop Lower Base / Keyboard Chassis */}
          <div className="mx-auto w-[108%] -mt-1 h-3.5 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 rounded-b-xl shadow-lg relative flex items-center justify-center">
            <div className="w-16 h-1 rounded-b bg-slate-600/60" />
          </div>
        </div>

        {/* Floating 3D Element 1: Green XLSX File Badge (Top Left) */}
        <div className="absolute -top-4 -left-6 sm:-left-10 z-30 p-2.5 rounded-2xl bg-surface border border-hairline shadow-xl shadow-emerald-500/10 flex items-center gap-2.5 animate-bounce [animation-duration:5s]">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex flex-col items-center justify-center shadow-md">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="text-[8px] font-black tracking-tighter">XLSX</span>
          </div>
          <div className="pr-1 text-left">
            <p className="text-[11px] font-bold text-ink">Participants.xlsx</p>
            <p className="text-[9px] text-ink-secondary">2,450 verified rows</p>
          </div>
        </div>

        {/* Floating 3D Element 2: Dark Green CSV File Badge */}
        <div className="absolute top-24 -left-4 sm:-left-8 z-30 px-3 py-1.5 rounded-xl bg-surface border border-hairline shadow-lg flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
            CSV
          </span>
          <span className="text-[10px] font-bold text-ink">Auto-mapped</span>
        </div>

        {/* Floating 3D Element 3: Certificate Preview with Ornate Gold Border & QR (Right Side) */}
        <div className="absolute -top-6 -right-6 sm:-right-12 z-30 w-44 sm:w-52 rounded-xl bg-surface border-2 border-amber-300/80 p-3 shadow-2xl shadow-accent/15 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          {/* Inner Ornate Certificate Frame */}
          <div className="border border-amber-200/90 rounded-lg p-2.5 text-center space-y-1.5 bg-gradient-to-b from-amber-50/20 to-white">
            <div className="flex items-center justify-center gap-1 text-[8px] font-bold tracking-widest uppercase text-amber-800">
              <span>★</span>
              <span>Certificate of Participation</span>
              <span>★</span>
            </div>

            <p className="text-[10px] font-extrabold text-ink leading-tight">
              Aarav Sharma
            </p>

            <p className="text-[8px] text-ink-secondary line-clamp-1">
              National Hackathon 2026 · 1st Place
            </p>

            <div className="pt-1 border-t border-hairline/80 flex items-center justify-between">
              {/* Gold metallic seal emblem */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-500 shadow-xs flex items-center justify-center">
                <span className="text-[7px] text-amber-900 font-black">CV</span>
              </div>

              {/* Vector QR Code preview */}
              <div className="w-6 h-6 rounded bg-surface border border-hairline p-0.5 shadow-xs">
                <svg className="w-full h-full text-ink" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm2-2h2v4h-2v-4zm-4 4h4v2h-4v-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Floating 3D Element 4: Blue "10,000+ Certificates Generated" Pill Badge */}
        <div className="absolute top-28 -right-4 sm:-right-8 z-30 px-3.5 py-1.5 rounded-full bg-accent text-white shadow-xl shadow-accent/30 flex items-center gap-2 transform -rotate-1">
          <Users className="w-3.5 h-3.5" />
          <span className="text-[10px] font-extrabold tracking-tight">10,000+ Generated</span>
        </div>

        {/* Floating 3D Element 5: "100% Verified" Green Badge */}
        <div className="absolute bottom-8 -right-2 sm:-right-6 z-30 px-3 py-1.5 rounded-full bg-surface border border-hairline shadow-lg flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-verified" />
          <span className="text-[10px] font-bold text-ink">100% Verified</span>
        </div>

        {/* Floating 3D Element 6: "Zero Fraud" Violet Shield Pill */}
        <div className="absolute -bottom-2 right-16 sm:right-24 z-30 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-brand-violet shadow-sm flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">Zero Fraud</span>
        </div>
      </div>
    </div>
  );
}
