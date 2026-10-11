// Agent-readiness audit of the Carbon design system's tokens and component catalog.
// Asks: if an AI agent picks from these lists, where is it likely to choose wrong?
// Usage: npm run audit   (writes reports/audit.md and prints a summary)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const tokens = JSON.parse(readFileSync(new URL("../data/carbon-tokens.json", import.meta.url), "utf8"));
const catalog = JSON.parse(readFileSync(new URL("../data/carbon-components.json", import.meta.url), "utf8"));

// --- Tokens -------------------------------------------------------------------------------
const theme = Object.entries(tokens.theme);
const colorLike = theme.filter(([, t]) => /^(#|rgb|hsl)/i.test(t.value));

// Same value, several names: an agent has no signal for which one is meant.
const byValue = new Map();
for (const [name, t] of colorLike) {
  const key = t.value.toLowerCase();
  byValue.set(key, [...(byValue.get(key) || []), name]);
}
const sharedValues = [...byValue.entries()].filter(([, names]) => names.length > 1).sort((a, b) => b[1].length - a[1].length);

// Name families: prefix before the first capital (text, background, layer, border, ...).
const families = new Map();
for (const [name] of theme) {
  const family = name.match(/^[a-z]+/)[0];
  families.set(family, (families.get(family) || 0) + 1);
}

// Numbered tokens (layer01, field02): the number encodes nesting depth, not intent.
const numbered = theme.filter(([name]) => /\d{2}$/.test(name)).map(([name]) => name);

// --- Components ---------------------------------------------------------------------------
const all = catalog.components;
const isExperimental = (n) => /^(unstable|preview)_/i.test(n);
const groups = {
  stable: all.filter((c) => c.kind === "component" && !isExperimental(c.name) && !/Skeleton$/.test(c.name) && !/(Context|Provider|Presence)$/.test(c.name)),
  skeleton: all.filter((c) => /Skeleton$/.test(c.name)),
  experimental: all.filter((c) => isExperimental(c.name)),
  plumbing: all.filter((c) => c.kind === "component" && /(Context|Provider|Presence)$/.test(c.name)),
  constants: all.filter((c) => c.kind === "constant" && !isExperimental(c.name)),
};
const noise = all.length - groups.stable.length;

// --- Report -------------------------------------------------------------------------------
const pct = (n, d) => `${Math.round((n / d) * 100)}%`;
const lines = [
  "# Agent-readiness audit: IBM Carbon",
  "",
  `Source: @carbon/themes ${tokens.source["@carbon/themes"]} (${tokens.source.theme} theme), @carbon/layout ${tokens.source["@carbon/layout"]}, @carbon/react ${catalog.source["@carbon/react"]}.`,
  "",
  "## Tokens",
  "",
  `- ${theme.length} theme tokens and ${Object.keys(tokens.spacing).length} spacing tokens.`,
  `- ${colorLike.length} theme tokens resolve to a color; ${sharedValues.length} color values are shared by two or more token names (${sharedValues.reduce((n, [, v]) => n + v.length, 0)} names in all).`,
  `- ${numbered.length} tokens end in a two-digit number (e.g. ${numbered.filter((n) => /^(layer|field)/.test(n)).slice(0, 4).join(", ")}). In the layer and field families the number tracks nesting depth; elsewhere it marks a variant. Either way, an agent cannot tell from the name which one to use.`,
  "",
  "Largest shared-value groups (an agent asked for \"the primary text color\" could pick any of these):",
  "",
  "| Value | Token names |",
  "| --- | --- |",
  ...sharedValues.slice(0, 8).map(([value, names]) => `| \`${value}\` | ${names.slice(0, 8).join(", ")}${names.length > 8 ? ` (+${names.length - 8} more)` : ""} |`),
  "",
  "Token families by name prefix:",
  "",
  "| Family | Count |",
  "| --- | --- |",
  ...[...families.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([f, n]) => `| ${f} | ${n} |`),
  "",
  "## Components",
  "",
  `- ${all.length} named exports from @carbon/react; ${groups.stable.length} (${pct(groups.stable.length, all.length)}) are stable, user-facing components.`,
  `- The other ${noise} are skeleton loaders (${groups.skeleton.length}), experimental or preview APIs (${groups.experimental.length}), context and provider plumbing (${groups.plumbing.length}), and constants (${groups.constants.length}).`,
  "- An agent choosing from the flat export list sees all of them as equally valid. Experimental APIs are the riskiest: they can change or disappear between releases.",
  "",
  "Experimental exports:",
  "",
  groups.experimental.map((c) => `\`${c.name}\``).join(", "),
  "",
  "## What this suggests for an agent guidelines file",
  "",
  "1. Name one preferred token per intent (primary text, page background, interactive border) and mark the aliases as \"do not pick\".",
  "2. Explain the numbered layer tokens with a rule: which number to use at which nesting depth.",
  "3. Give the agent the stable component list only, with skeletons, experimental APIs and plumbing excluded unless asked for.",
  "4. Check generated code with the on-system checker (npm run check) and track the score before and after the guidelines exist.",
  "",
];
mkdirSync(new URL("../reports/", import.meta.url), { recursive: true });
writeFileSync(new URL("../reports/audit.md", import.meta.url), lines.join("\n"));

console.log(`Tokens: ${theme.length} theme + ${Object.keys(tokens.spacing).length} spacing; ${sharedValues.length} color values shared by 2+ names; ${numbered.length} numbered tokens.`);
console.log(`Components: ${all.length} exports, ${groups.stable.length} stable (${pct(groups.stable.length, all.length)}); ${groups.skeleton.length} skeleton, ${groups.experimental.length} experimental, ${groups.plumbing.length} plumbing, ${groups.constants.length} constants.`);
console.log("Full report: reports/audit.md");
