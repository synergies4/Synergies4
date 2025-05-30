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
    ignores: [
      "src/generated/**/*",
      "src/generated/prisma/**/*",
      "node_modules/**/*",
      ".next/**/*",
      "out/**/*"
    ]
  },
  {
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-assign-module-variable": "off",
      "@next/next/no-img-element": "warn"
    }
  }
];

export default eslintConfig;
