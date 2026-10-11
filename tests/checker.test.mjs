import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkCode } from "../src/checker.mjs";

const rules = (src) => checkCode(src).findings.map((f) => f.rule);

test("flags hardcoded hex, rgb and hsl colors", () => {
  assert.deepEqual(rules('color: "#161616"; background: rgb(1, 2, 3); border: hsl(0, 0%, 0%)'),
    ["hardcoded-color", "hardcoded-color", "hardcoded-color"]);
});

test("accepts theme and spacing tokens as on-system", () => {
  const r = checkCode('style={{ color: "var(--cds-text-primary)", padding: "var(--cds-spacing-05)" }}');
  assert.equal(r.findings.length, 0);
  assert.equal(r.onSystem, 2);
  assert.equal(r.score, 100);
});

test("on-scale literal spacing is a warning that names the token", () => {
  const [f] = checkCode('style={{ marginBottom: "16px" }}').findings;
  assert.equal(f.rule, "literal-spacing");
  assert.equal(f.severity, "warning");
  assert.match(f.fix, /--cds-spacing-05/);
});

test("off-scale spacing is a violation", () => {
  assert.deepEqual(rules('style={{ padding: "18px" }}'), ["off-scale-spacing"]);
});

test("zero and auto are never spacing findings", () => {
  assert.deepEqual(rules('style={{ margin: "0 auto" }}'), []);
});

test("raw elements with Carbon equivalents are violations; others are not", () => {
  assert.deepEqual(rules("<button>Go</button><table></table><div><span>ok</span></div>"), ["raw-element", "raw-element"]);
});

test("components imported from @carbon/react must exist", () => {
  const r = checkCode('import { Button, LoginForm } from "@carbon/react";');
  assert.equal(r.onSystem, 1);
  assert.deepEqual(r.findings.map((f) => f.text), ["LoginForm"]);
});

test("aliased imports are checked by their real name", () => {
  assert.equal(checkCode('import { Button as CdsButton } from "@carbon/react";').onSystem, 1);
});

test("an empty file has no score rather than a fake 0% or 100%", () => {
  assert.equal(checkCode("").score, null);
});

test("samples: off-system scores low, on-system scores 100%", () => {
  const off = checkCode(readFileSync(new URL("../samples/off-system-login.jsx", import.meta.url), "utf8"));
  const on = checkCode(readFileSync(new URL("../samples/on-system-login.jsx", import.meta.url), "utf8"));
  assert.ok(off.score < 25, `off-system scored ${off.score}%`);
  assert.equal(on.score, 100);
});
