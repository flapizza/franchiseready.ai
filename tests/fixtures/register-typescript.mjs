// Test-only loader for the repository's existing extensionless @/ imports and
// TypeScript parameter properties. Application bundling retains server-only checks.
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import ts from "typescript";
const root = fileURLToPath(new URL("../../", import.meta.url));
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "server-only") return { url: "data:text/javascript,export{}", shortCircuit: true };
    if (context.parentURL?.includes("/node_modules/")) return next(specifier, context);
    if (specifier.startsWith("@/") || (specifier.startsWith(".") && context.parentURL?.startsWith("file:"))) {
      const resolved = specifier.startsWith("@/") ? path.join(root, specifier.slice(2)) : fileURLToPath(new URL(specifier, context.parentURL));
      for (const candidate of [resolved, `${resolved}.ts`, `${resolved}.tsx`, `${resolved}.js`]) {
        if (existsSync(candidate) && /\.[cm]?[jt]sx?$/.test(candidate)) return next(pathToFileURL(candidate).href, context);
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith("file:") && /\.tsx?$/.test(url) && !url.includes("/node_modules/")) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        fileName: fileURLToPath(url),
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText };
    }
    return next(url, context);
  },
});
