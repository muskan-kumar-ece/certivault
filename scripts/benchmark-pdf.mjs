/**
 * CertiVault PDF Engine Benchmark Script (Work 6 Exit Gate)
 * Target: ≤ 500 ms per certificate, PDF size ≤ 150 KB.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generate } from "@pdfme/generator";
import { text, image, barcodes } from "@pdfme/schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const template = {
  basePdf: { width: 297, height: 210, padding: [10, 10, 10, 10] },
  schemas: [
    [
      {
        name: "header",
        type: "text",
        position: { x: 20, y: 30 },
        width: 257,
        height: 18,
        alignment: "center",
        fontSize: 26,
        fontName: "PlayfairDisplay",
      },
      {
        name: "recipient_name",
        type: "text",
        position: { x: 20, y: 70 },
        width: 257,
        height: 22,
        alignment: "center",
        fontSize: 32,
        fontName: "NotoSansDevanagari",
      },
      {
        name: "title",
        type: "text",
        position: { x: 30, y: 100 },
        width: 237,
        height: 18,
        alignment: "center",
        fontSize: 14,
        fontName: "Inter",
      },
      {
        name: "qr",
        type: "qrcode",
        position: { x: 133, y: 150 },
        width: 30,
        height: 30,
      },
      {
        name: "id",
        type: "text",
        position: { x: 98, y: 185 },
        width: 100,
        height: 8,
        alignment: "center",
        fontSize: 9,
        fontName: "Inter",
      },
    ],
  ],
};

const fonts = {
  Inter: {
    data: fs.readFileSync(path.join(root, "public", "fonts", "Inter.ttf")),
    fallback: true,
  },
  PlayfairDisplay: {
    data: fs.readFileSync(path.join(root, "public", "fonts", "PlayfairDisplay.ttf")),
  },
  NotoSansDevanagari: {
    data: fs.readFileSync(path.join(root, "public", "fonts", "NotoSansDevanagari.ttf")),
  },
  NotoSansTelugu: {
    data: fs.readFileSync(path.join(root, "public", "fonts", "NotoSansTelugu.ttf")),
  },
};

async function runBenchmark(total = 500) {
  console.log(`\n============================================================`);
  console.log(`CertiVault PDF Engine Benchmark: ${total} Certificates`);
  console.log(`============================================================\n`);

  // Warmup run
  await generate({
    template,
    inputs: [
      {
        header: "WARMUP",
        recipient_name: "Warmup Test",
        title: "Warmup Course",
        qr: "https://certivault.in/c/CV-26-WARMUP01",
        id: "CV-26-WARMUP01",
      },
    ],
    plugins: { text, image, qrcode: barcodes.qrcode },
    options: { font: fonts },
  });

  const times = [];
  let lastPdfBytes = 0;
  const overallStart = performance.now();

  for (let i = 0; i < total; i++) {
    const isTelugu = i % 3 === 0;
    const isHindi = i % 3 === 1;

    const name = isTelugu
      ? `తెలుగు విద్యార్థి (${i + 1})`
      : isHindi
      ? `आरव शर्मा (${i + 1})`
      : `Priya Sharma (${i + 1})`;

    const publicId = `CV-26-X${String(i).padStart(7, "0")}`;

    const t0 = performance.now();
    const pdf = await generate({
      template,
      inputs: [
        {
          header: "CERTIFICATE OF EXCELLENCE",
          recipient_name: name,
          title: "Advanced Agentic Engineering 2026",
          qr: `https://certivault.in/c/${publicId}`,
          id: publicId,
        },
      ],
      plugins: { text, image, qrcode: barcodes.qrcode },
      options: { font: fonts },
    });
    times.push(performance.now() - t0);
    lastPdfBytes = pdf.byteLength;

    if ((i + 1) % 100 === 0 || i === 0) {
      console.log(`Rendered ${i + 1}/${total} certificates...`);
    }
  }

  const overallDuration = performance.now() - overallStart;
  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  times.sort((a, b) => a - b);
  const p50 = times[Math.floor(times.length * 0.5)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];
  const sizeKb = (lastPdfBytes / 1024).toFixed(1);

  console.log(`\n------------------------------------------------------------`);
  console.log(`BENCHMARK REPORT`);
  console.log(`Total Certificates:     ${total}`);
  console.log(`Overall Duration:       ${(overallDuration / 1000).toFixed(2)} s`);
  console.log(`Throughput:             ${(total / (overallDuration / 1000)).toFixed(1)} certs/sec`);
  console.log(`Average Latency:        ${avgMs.toFixed(1)} ms / certificate`);
  console.log(`Median (p50):           ${p50.toFixed(1)} ms`);
  console.log(`p95 Latency:            ${p95.toFixed(1)} ms`);
  console.log(`p99 Latency:            ${p99.toFixed(1)} ms`);
  console.log(`PDF File Size:          ${sizeKb} KB`);
  console.log(`------------------------------------------------------------`);

  const passedThreshold = avgMs <= 500 && lastPdfBytes <= 150 * 1024;
  if (passedThreshold) {
    console.log(`\n[PASSED] Exit Gate Satisfied: Latency ≤ 500ms and Size ≤ 150KB!\n`);
  } else {
    console.error(`\n[FAILED] Exit Gate Failed: Exceeded 500ms or 150KB limit.\n`);
    process.exit(1);
  }
}

runBenchmark().catch((err) => {
  console.error("Benchmark error:", err);
  process.exit(1);
});
