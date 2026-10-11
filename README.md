# ds-agent-ready

**Is this design system agent-ready?** A small kit for measuring how faithfully AI coding tools generate on-system UI code, using [IBM Carbon](https://carbondesignsystem.com) as the test case.

AI tools generate UI code from a design system only as well as the system explains itself. This project asks two questions:

1. **Audit:** where in the design system's tokens and components is an agent likely to choose wrong?
2. **Check:** given a piece of generated code, how much of it is actually on-system?

The plan is to measure the on-system score of AI-generated screens before and after giving the agent a guidelines file and an MCP server, and publish the difference.

## Status

| Step | What | Status |
| --- | --- | --- |
| 1 | Audit of Carbon's tokens and component catalog | Done: `npm run audit` |
| 2 | On-system checker for generated code | Done: `npm run check` |
| 3 | Agent guidelines file (preferred tokens, stable components, rules) | Next |
| 4 | MCP server: `list_components`, `get_component_usage`, `get_tokens` | Planned |
| 5 | Eval: 10 prompts, with and without steps 3–4, scored by the checker | Planned |
| 6 | Write-up with before-and-after results | Planned |

## Quick start

Requires Node.js 18 or later. No dependencies: the Carbon data is committed in `data/`.

```bash
npm test                 # 10 tests for the checker
npm run audit            # prints a summary and writes reports/audit.md
npm run check -- samples/off-system-login.jsx samples/on-system-login.jsx
```

## What the audit found (Carbon, October 2026)

From `@carbon/themes` 11.83.0, `@carbon/layout` 11.61.0 and `@carbon/react` 1.118.0:

- **Shared values:** 31 color values are each shared by two or more token names, 207 names in all. `#161616` alone answers to 25 names. Asked for "the primary text color", an agent has no signal for which one is meant.
- **Numbered tokens:** 48 tokens end in a two-digit number (`layer01`, `field02`). In some families the number tracks nesting depth, in others it marks a variant, and the name alone doesn't say which.
- **Catalog noise:** of 357 named exports from `@carbon/react`, 219 (61%) are stable, user-facing components. The rest are skeleton loaders, experimental or preview APIs, provider plumbing and constants, all presented to an agent as equally valid.

Full report: [`reports/audit.md`](reports/audit.md).

## What the checker flags

| Rule | Severity | Example |
| --- | --- | --- |
| `hardcoded-color` | violation | `#161616`, `rgb(15, 98, 254)` instead of `var(--cds-text-primary)` |
| `off-scale-spacing` | violation | `padding: 18px`, not on Carbon's spacing scale |
| `literal-spacing` | warning | `marginBottom: 16px`, on the scale but should be `$spacing-05` |
| `raw-element` | violation | `<button>` or `<input>` where Carbon has `Button` or `TextInput` |
| `unknown-component` | violation | `import { LoginForm } from "@carbon/react"`, which doesn't exist |

**Score** = on-system uses (real Carbon components imported, token references) ÷ (on-system uses + violations).

The two hand-written samples show the range: the same login screen scores **10%** with common off-system patterns (hardcoded colors, raw inputs, an invented component) and **100%** written against Carbon. Real agent output is measured in step 5.

## Refreshing the Carbon data

```bash
npm install --no-save --legacy-peer-deps @carbon/themes @carbon/layout @carbon/react react react-dom
npm run extract
```

## Limits

The checker uses regular expressions, not a parser. It is built to score many generated files quickly and consistently, not to lint production code. Its rules cover colors, spacing, a set of raw elements and component names; typography and layout tokens are not checked yet.

## License

MIT
