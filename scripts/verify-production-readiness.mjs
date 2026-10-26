/**
 * CertiVault Production Readiness & Launch Verification Script (Work 13)
 * Validates complete system integrity before v1.0.0 release.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

console.log("=================================================================");
console.log(" CertiVault v1.0.0 Production Readiness Verification");
console.log("=================================================================\n");

let passed = true;

function check(title, fn) {
  process.stdout.write(`[CHECK] ${title}... `);
  try {
    fn();
    console.log("PASSED");
  } catch (err) {
    console.log("FAILED");
    console.error("  Error:", err.message);
    passed = false;
  }
}

// 1. Verify all 9 database migrations exist
check("Database Migrations 1-9 Inventory", () => {
  const migrationsDir = path.join(root, "supabase", "migrations");
  const expectedMigrations = [
    "20261025000001_foundation.sql",
    "20261025000002_branding_storage.sql",
    "20261025000003_templates.sql",
    "20261025000004_seed_templates.sql",
    "20261025000005_batches_certificates_jobs_ledger.sql",
    "20261025000006_verification_and_email.sql",
    "20261025000007_exports_and_revocation.sql",
    "20261025000008_payments_and_invoices.sql",
    "20261025000009_admin_and_verification.sql",
    "20261026000001_security_and_pipeline_fixes.sql",
  ];

  for (const m of expectedMigrations) {
    const file = path.join(migrationsDir, m);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing expected migration: ${m}`);
    }
  }
});

// 2. Verify Architecture Guards pass
check("Architecture Guards (RLS, Secrets, Tokens, Allowlist)", () => {
  execSync("npm run guard", { cwd: root, stdio: "pipe" });
});

// 3. Verify TypeScript type safety
check("TypeScript Compilation (tsc --noEmit)", () => {
  execSync("npm run typecheck", { cwd: root, stdio: "pipe" });
});

// 4. Verify ESLint compliance
check("ESLint Rules & Formatting (eslint src)", () => {
  execSync("npm run lint", { cwd: root, stdio: "pipe" });
});

// 5. Verify Unit & Integration test suite
check("Vitest Test Suite (All 11 Suites)", () => {
  execSync("npm test", { cwd: root, stdio: "pipe" });
});

// 6. Verify Production Documentation
check("Production Runbook & Deployment Guide", () => {
  const runbook = path.join(root, "docs", "runbook.md");
  const deployment = path.join(root, "docs", "DEPLOYMENT.md");
  const backlog = path.join(root, "docs", "v1.1-backlog.md");
  if (!fs.existsSync(runbook)) throw new Error("Missing docs/runbook.md");
  if (!fs.existsSync(deployment)) throw new Error("Missing docs/DEPLOYMENT.md");
  if (!fs.existsSync(backlog)) throw new Error("Missing docs/v1.1-backlog.md");
});

console.log("\n-----------------------------------------------------------------");
if (passed) {
  console.log("ALL PRODUCTION READINESS CHECKS PASSED!");
  console.log("CertiVault is fully verified, hardened, and ready for v1.0.0 launch.");
  console.log("-----------------------------------------------------------------\n");
  process.exit(0);
} else {
  console.error("ONE OR MORE CHECKS FAILED. Please resolve before releasing v1.0.0.");
  console.log("-----------------------------------------------------------------\n");
  process.exit(1);
}
