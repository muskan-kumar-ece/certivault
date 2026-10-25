import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Client UI components must be completely decoupled
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/server/*", "@/app/*"],
              message:
                "src/components/ui primitives must be self-contained and cannot import from features, server, or app.",
            },
          ],
        },
      ],
    },
  },
  {
    // Utilities and schemas cannot import domain features or server logic
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/server/*", "@/app/*"],
              message:
                "src/lib utilities cannot import from features, server, or app.",
            },
          ],
        },
      ],
    },
  },
  {
    // Disallow server-only imports in client feature components
    files: ["src/features/**/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*"],
              message:
                "src/server is server-only. Do not import directly into client components.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
