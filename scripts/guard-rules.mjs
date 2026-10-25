import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

let failures = 0;

function reportError(rule, msg) {
  console.error(`\x1b[31m[GUARD FAILED] ${rule}: ${msg}\x1b[0m`);
  failures++;
}

function reportPass(rule, msg) {
  console.log(`\x1b[32m[GUARD PASSED] ${rule}: ${msg}\x1b[0m`);
}

function walkFiles(dir, extensions, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        walkFiles(fullPath, extensions, fileList);
      }
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// -----------------------------------------------------------------------------
// Guard 1: Secrets & Service-Role Isolation
// Disallow importing SUPABASE_SERVICE_ROLE_KEY or @/server/admin in client directories
// -----------------------------------------------------------------------------
const clientFiles = [
  ...walkFiles(path.join(root, "src", "components", "ui"), [".ts", ".tsx"]),
  ...walkFiles(path.join(root, "src", "features"), [".ts", ".tsx"]).filter((f) =>
    f.includes(path.sep + "components" + path.sep)
  ),
];

let leakCount = 0;
for (const file of clientFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (
    content.includes("SUPABASE_SERVICE_ROLE_KEY") ||
    content.includes("@/server/admin") ||
    content.includes("from '@/server'") ||
    content.includes('from "@/server"')
  ) {
    reportError(
      "Service-Role Confinement",
      `Client component ${path.relative(root, file)} imports restricted server admin modules or keys.`
    );
    leakCount++;
  }
}
if (leakCount === 0) {
  reportPass("Service-Role Confinement", "No client files import service role admin modules.");
}

// -----------------------------------------------------------------------------
// Guard 2: RLS on Every Migration Table
// -----------------------------------------------------------------------------
const migrationFiles = walkFiles(path.join(root, "supabase", "migrations"), [".sql"]);
let rlsMissingCount = 0;

for (const file of migrationFiles) {
  const content = fs.readFileSync(file, "utf8");
  const createTableMatches = [
    ...content.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)/gi),
  ];

  for (const match of createTableMatches) {
    const tableName = match[1].toLowerCase();
    const rlsRegex = new RegExp(`alter\\s+table\\s+(?:public\\.)?${tableName}\\s+enable\\s+row\\s+level\\s+security`, "i");
    if (!rlsRegex.test(content)) {
      reportError("RLS Everywhere", `Table '${tableName}' in ${path.relative(root, file)} is missing RLS enable statement.`);
      rlsMissingCount++;
    }
  }
}
if (rlsMissingCount === 0) {
  reportPass("RLS Everywhere", `All ${migrationFiles.length} migrations strictly enable RLS on every created table.`);
}

// -----------------------------------------------------------------------------
// Guard 3: Design Tokens Only (No Raw Hex Colors outside tokens & globals.css)
// -----------------------------------------------------------------------------
const uiFiles = walkFiles(path.join(root, "src"), [".ts", ".tsx", ".css"]).filter((f) => {
  const rel = path.relative(root, f).replace(/\\/g, "/");
  return (
    rel !== "src/lib/tokens.ts" &&
    rel !== "src/app/globals.css" &&
    !rel.includes("test") &&
    !rel.includes("tailwind.config")
  );
});

let rawHexCount = 0;
const hexRegex = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;

for (const file of uiFiles) {
  const content = fs.readFileSync(file, "utf8");
  // Ignore SVG path data and comments
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("//") || line.includes("/*") || line.includes("fill=") || line.includes("fill:") || line.includes("d=")) {
      continue;
    }
    const matches = line.match(hexRegex);
    if (matches && !line.includes("default('#3355FF')") && !line.includes('default("#3355FF")')) {
      reportError(
        "Design Tokens Only",
        `Hardcoded hex color '${matches.join(", ")}' found in ${path.relative(root, file)}:${i + 1}. Use tokens from src/lib/tokens.ts or globals.css.`
      );
      rawHexCount++;
    }
  }
}
if (rawHexCount === 0) {
  reportPass("Design Tokens Only", "No hardcoded hex colors found outside tokens or globals.css.");
}

// -----------------------------------------------------------------------------
// Guard 4: Dependency Allowlist Validator (AGENT_PLAN.md §5)
// -----------------------------------------------------------------------------
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const allowedDeps = new Set([
  "next",
  "react",
  "react-dom",
  "typescript",
  "tailwindcss",
  "@supabase/supabase-js",
  "@supabase/ssr",
  "zod",
  "react-hook-form",
  "@hookform/resolvers",
  "framer-motion",
  "vaul",
  "cmdk",
  "lucide-react",
  "@tanstack/react-query",
  "papaparse",
  "xlsx",
  "fuse.js",
  "fflate",
  "pdf-lib",
  "@pdfme/generator",
  "@pdfme/schemas",
  "@pdfme/common",
  "@pdfme/ui",
  "razorpay",
  "resend",
  "@react-email/components",
  "date-fns",
  "nanoid",
  "server-only",
  "@upstash/redis",
  "@upstash/ratelimit",
  "@sentry/nextjs",
  // Radix primitives
  "@radix-ui/react-avatar",
  "@radix-ui/react-checkbox",
  "@radix-ui/react-dialog",
  "@radix-ui/react-dropdown-menu",
  "@radix-ui/react-label",
  "@radix-ui/react-popover",
  "@radix-ui/react-select",
  "@radix-ui/react-separator",
  "@radix-ui/react-slot",
  "@radix-ui/react-switch",
  "@radix-ui/react-tabs",
  "@radix-ui/react-tooltip",
  // Dev
  "vitest",
  "@playwright/test",
  "eslint",
  "eslint-config-next",
  "postcss",
  "prettier",
  "husky",
  "lint-staged",
  "supabase",
  "axe-core",
  "@axe-core/playwright",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "@types/papaparse",
]);

let unlistedDeps = 0;
const allInstalled = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

for (const dep of Object.keys(allInstalled)) {
  if (!allowedDeps.has(dep)) {
    reportError("Dependency Allowlist", `Package '${dep}' is not in the approved dependency allowlist (AGENT_PLAN.md §5).`);
    unlistedDeps++;
  }
}
if (unlistedDeps === 0) {
  reportPass("Dependency Allowlist", "All installed runtime and dev dependencies are strictly allowed.");
}

// -----------------------------------------------------------------------------
// Exit Code
// -----------------------------------------------------------------------------
if (failures > 0) {
  console.error(`\n\x1b[31m[FAILED] Architecture guard failed with ${failures} violations.\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(`\n\x1b[32m[PASSED] All 4 Architecture Guard checks passed successfully!\x1b[0m\n`);
  process.exit(0);
}
