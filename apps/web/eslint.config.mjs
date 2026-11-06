import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Architecture boundaries (docs/blueprint/14 §3). Lower layers must not import upper layers.
const ban = (patterns, message) => ({ patterns: patterns.map((group) => ({ group: [group], message })) });

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/lib/**", "src/components/ui/**"],
    rules: { "no-restricted-imports": ["error", ban(["@/features/*", "@/app/*"], "lib and ui primitives must not depend on features or routes.")] },
  },
  {
    files: ["src/features/**"],
    rules: { "no-restricted-imports": ["error", ban(["@/app/*", "@/features/*/*"], "Features import routes never; other features only through their index.ts.")] },
  },
  globalIgnores(["public/pdfjs/**", "private-content/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
