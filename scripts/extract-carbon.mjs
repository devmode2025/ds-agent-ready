// Regenerates data/carbon-tokens.json and data/carbon-components.json from the published
// Carbon packages. Optional: the data files are committed, so audit and check run without it.
//   npm install --no-save --legacy-peer-deps @carbon/themes @carbon/layout @carbon/react react react-dom
//   npm run extract
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const themes = require("@carbon/themes");
const layout = require("@carbon/layout");
const react = require("@carbon/react");
const version = (pkg) => require(`${pkg}/package.json`).version;

const kebab = (name) => name.replace(/([a-z])([A-Z0-9])/g, "$1-$2").replace(/([0-9])([A-Za-z])/g, "$1-$2").toLowerCase();

const white = themes.white;
const colorTokens = Object.fromEntries(
  Object.entries(white).filter(([, v]) => typeof v === "string").map(([k, v]) => [k, { css: `--cds-${kebab(k)}`, value: v }]),
);
const spacing = Object.fromEntries(
  layout.spacing.map((value, i) => {
    const n = String(i + 1).padStart(2, "0");
    return [`spacing${n}`, { css: `--cds-spacing-${n}`, scss: `$spacing-${n}`, value }];
  }),
);
writeFileSync("data/carbon-tokens.json", JSON.stringify({
  source: { "@carbon/themes": version("@carbon/themes"), "@carbon/layout": version("@carbon/layout"), theme: "white" },
  theme: colorTokens,
  spacing,
}, null, 2) + "\n");

const isComponent = (v) => typeof v === "function" || (v !== null && typeof v === "object" && "$$typeof" in v);
const components = Object.keys(react)
  .filter((k) => /^[A-Z]/i.test(k) && !k.startsWith("use"))
  .sort()
  .map((name) => ({ name, kind: isComponent(react[name]) ? "component" : "constant" }));
writeFileSync("data/carbon-components.json", JSON.stringify({
  source: { "@carbon/react": version("@carbon/react") },
  components,
}, null, 2) + "\n");
console.log(`tokens: ${Object.keys(colorTokens).length} theme + ${Object.keys(spacing).length} spacing; components: ${components.length}`);
