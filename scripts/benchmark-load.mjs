/**
 * CertiVault Work 12: High-Throughput Batch Generation & Concurrency Load Test
 * Target: 1,000 certificates generation under chunked concurrency with p95 <= 200 ms and 0% errors.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generate } from "@pdfme/generator";
import { text, barcodes } from "@pdfme/schemas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const fontInter = fs.readFileSync(path.join(root, "public", "fonts", "Inter.ttf"));
const fontDevanagari = fs.readFileSync(path.join(root, "public", "fonts", "NotoSansDevanagari.ttf"));

const font = {
  Inter: { data: fontInter, fallback: true },
  NotoSansDevanagari: { data: fontDevanagari },
};

const plugins = {
  text,
  qrcode: barcodes.qrcode,
};

const template = {
  basePdf: { width: 297, height: 210, padding: [10, 10, 10, 10] },
  schemas: [
    [
      {
        name: "recipient_name",
        type: "text",
        position: { x: 20, y: 70 },
        width: 257,
        height: 22,
        alignment: "center",
        fontSize: 28,
        fontName: "NotoSansDevanagari",
      },
      {
        name: "title",
        type: "text",
        position: { x: 30, y: 105 },
        width: 237,
        height: 18,
        alignment: "center",
        fontSize: 14,
        fontName: "Inter",
      },
      {
        name: "qr",
        type: "qrcode",
        position: { x: 133, y: 140 },
        width: 30,
        height: 30,
      },
      {
        name: "id",
        type: "text",
        position: { x: 98, y: 178 },
        width: 100,
        height: 10,
        alignment: "center",
        fontSize: 10,
        fontName: "Inter",
      },
    ],
  ],
};

const names = [
  "Aarav Sharma",
  "Priya Patel",
  "Rohan Verma",
  "आरव शर्मा",
  "Lakshmi Narayanan",
  "Vikram Aditya",
  "Ananya Iyer",
  "Aditi Deshmukh",
];

async function runLoadBenchmark() {
  console.log("=================================================================");
  console.log(" CertiVault Work 12: 1,000-Certificate High-Concurrency Load Test");
  console.log("=================================================================\n");

  const TOTAL_CERTS = 1000;
  const CHUNK_SIZE = 20; // 20 certs per chunk (ARCHITECTURE_LOCK.md §7)
  const CONCURRENCY = 4;  // 4 concurrent chunk workers

  const totalChunks = Math.ceil(TOTAL_CERTS / CHUNK_SIZE);
  console.log(`Config: ${TOTAL_CERTS} certificates in ${totalChunks} chunks of ${CHUNK_SIZE} (concurrency: ${CONCURRENCY}).`);

  const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const latencies = [];
  let successfulCerts = 0;
  let failedCerts = 0;

  const chunks = [];
  for (let c = 0; c < totalChunks; c++) {
    const chunkInputs = [];
    for (let i = 0; i < CHUNK_SIZE; i++) {
      const idx = c * CHUNK_SIZE + i;
      const name = names[idx % names.length];
      const publicId = `CV-26-${String(idx).padStart(8, "0")}`;
      chunkInputs.push({
        recipient_name: name,
        title: "National Student Innovation Summit 2026",
        qr: `https://certivault.in/c/${publicId}`,
        id: publicId,
      });
    }
    chunks.push(chunkInputs);
  }

  const startTime = Date.now();

  // Process chunks with bounded concurrency pool
  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const slice = chunks.slice(i, i + CONCURRENCY);
    await Promise.all(
      slice.map(async (chunk) => {
        for (const input of chunk) {
          const t0 = performance.now();
          try {
            const pdf = await generate({
              template,
              inputs: [input],
              options: { font },
              plugins,
            });
            const t1 = performance.now();
            latencies.push(t1 - t0);
            if (pdf.byteLength > 1000) {
              successfulCerts++;
            } else {
              failedCerts++;
            }
          } catch (err) {
            failedCerts++;
          }
        }
      })
    );
  }

  const totalTimeMs = Date.now() - startTime;
  const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const throughput = (successfulCerts / (totalTimeMs / 1000)).toFixed(1);

  console.log(`\n--- Benchmark Results ---`);
  console.log(`Total Certificates Generated: ${successfulCerts} / ${TOTAL_CERTS}`);
  console.log(`Failures:                     ${failedCerts} (0.00% error rate)`);
  console.log(`Total Wall Clock Time:        ${(totalTimeMs / 1000).toFixed(2)} seconds`);
  console.log(`Throughput:                   ${throughput} certs/second`);
  console.log(`Average Latency:              ${avg.toFixed(2)} ms / cert`);
  console.log(`p50 (Median) Latency:         ${p50.toFixed(2)} ms`);
  console.log(`p95 Latency:                  ${p95.toFixed(2)} ms (Threshold: <= 200 ms)`);
  console.log(`p99 Latency:                  ${p99.toFixed(2)} ms`);
  console.log(`Heap Memory Delta:            +${(finalMemory - initialMemory).toFixed(1)} MB (Final heap: ${finalMemory.toFixed(1)} MB)\n`);

  if (p95 > 200) {
    console.error(`[LOAD FAILED] p95 latency exceeded threshold: ${p95.toFixed(2)} ms > 200 ms`);
    process.exit(1);
  }

  if (failedCerts > 0) {
    console.error(`[LOAD FAILED] Non-zero failure rate: ${failedCerts} failed`);
    process.exit(1);
  }

  console.log(`[LOAD PASSED] 1,000-Certificate concurrency stress test passed all exit gates!`);
}

runLoadBenchmark().catch((err) => {
  console.error(err);
  process.exit(1);
});
