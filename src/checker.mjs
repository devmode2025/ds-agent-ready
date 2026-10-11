// On-system checker: scores a piece of AI-generated UI code against the Carbon design system.
// Usage: node src/checker.mjs <file> [more files]   (or: npm run check -- samples/*.jsx)
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const tokens = JSON.parse(readFileSync(new URL("../data/carbon-tokens.json", import.meta.url), "utf8"));
const catalog = JSON.parse(readFileSync(new URL("../data/carbon-components.json", import.meta.url), "utf8"));

const CARBON_COMPONENTS = new Set(catalog.components.filter((c) => c.kind === "component").map((c) => c.name));
const SPACING = Object.values(tokens.spacing);
const SPACING_BY_VALUE = new Map(SPACING.map((t) => [t.value, t]));

// Raw HTML elements that have a Carbon component an agent should use instead.
const RAW_ELEMENT_EQUIVALENTS = {
  button: "Button",
  input: "TextInput, Checkbox, RadioButton or NumberInput",
  select: "Select or Dropdown",
  textarea: "TextArea",
  table: "DataTable",
  progress: "ProgressBar",
};

const SPACING_PROPS = /\b(margin|padding|gap|rowGap|columnGap|row-gap|column-gap|margin(?:Top|Right|Bottom|Left|-top|-right|-bottom|-left)|padding(?:Top|Right|Bottom|Left|-top|-right|-bottom|-left))\b\s*[:=]\s*["'`]?([^;"'`,}\n]+)/g;

const lineOf = (source, index) => source.slice(0, index).split("\n").length;

/** Converts a CSS length to rem for comparison with the Carbon spacing scale (16px base). */
function toRem(raw) {
  const m = /^(-?\d*\.?\d+)(px|rem)$/.exec(raw.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === "px" ? `${n / 16}rem` : `${n}rem`;
}

/**
 * Returns { findings, onSystem, offSystem, score } for one source string.
 * score = on-system uses / (on-system uses + violations), as a percentage.
 */
export function checkCode(source) {
  const findings = [];
  let onSystem = 0;

  // 1. Hardcoded colors.
  for (const m of source.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\([^)]*\)/g)) {
    findings.push({ rule: "hardcoded-color", severity: "violation", line: lineOf(source, m.index), text: m[0],
      fix: "use a theme token, e.g. var(--cds-text-primary) or var(--cds-background)" });
  }

  // 2. Spacing values that bypass the spacing tokens.
  for (const m of source.matchAll(SPACING_PROPS)) {
    for (const part of m[2].trim().split(/\s+/)) {
      if (/^(0|auto|inherit|initial|unset)$/.test(part) || part.includes("var(--cds-") || part.startsWith("$spacing-")) continue;
      const rem = toRem(part);
      if (rem === null) continue;
      const token = SPACING_BY_VALUE.get(rem);
      findings.push(token
        ? { rule: "literal-spacing", severity: "warning", line: lineOf(source, m.index), text: `${m[1]}: ${part}`,
            fix: `on the scale; write var(${token.css}) or ${token.scss}` }
        : { rule: "off-scale-spacing", severity: "violation", line: lineOf(source, m.index), text: `${m[1]}: ${part}`,
            fix: "not on the Carbon spacing scale; pick the nearest $spacing-NN token" });
    }
  }

  // 3. Raw HTML elements where a Carbon component exists.
  for (const m of source.matchAll(/<([a-z]+)\b/g)) {
    const equivalent = RAW_ELEMENT_EQUIVALENTS[m[1]];
    if (equivalent) {
      findings.push({ rule: "raw-element", severity: "violation", line: lineOf(source, m.index), text: `<${m[1]}>`,
        fix: `use Carbon ${equivalent}` });
    }
  }

  // 4. Components that do not exist in Carbon but are imported from it (hallucinated APIs).
  for (const m of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']@carbon\/react["']/g)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().split(/\s+as\s+/)[0];
      if (!name) continue;
      if (CARBON_COMPONENTS.has(name)) onSystem += 1;
      else findings.push({ rule: "unknown-component", severity: "violation", line: lineOf(source, m.index), text: name,
        fix: "not exported by @carbon/react; check the component catalog" });
    }
  }

  // 5. Token references count as on-system use.
  onSystem += (source.match(/var\(--cds-[a-z0-9-]+\)|\$spacing-\d{2}/g) || []).length;

  findings.sort((a, b) => a.line - b.line);
  const offSystem = findings.filter((f) => f.severity === "violation").length;
  const total = onSystem + offSystem;
  const score = total === 0 ? null : Math.round((onSystem / total) * 100);
  return { findings, onSystem, offSystem, score };
}

function report(file) {
  const { findings, onSystem, offSystem, score } = checkCode(readFileSync(file, "utf8"));
  console.log(`\n${basename(file)}: ${score === null ? "n/a" : `${score}% on-system`} (${onSystem} on-system uses, ${offSystem} violations, ${findings.length - offSystem} warnings)`);
  for (const f of findings) console.log(`  line ${f.line}  ${f.severity.padEnd(9)} ${f.rule.padEnd(18)} ${f.text}  -> ${f.fix}`);
  return score;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("usage: node src/checker.mjs <file> [more files]");
    process.exit(2);
  }
  files.forEach(report);
}
