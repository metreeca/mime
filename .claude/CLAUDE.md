> [!CAUTION]
>
> - **ONLY** modify code when explicitly requested or clearly required.
> - **NEVER** make unsolicited changes or revert **unrelated** user edits.
> - **ALWAYS** monitor IDE diagnostics when working on a file

> [!CAUTION]
> Activating and following skill guidance is **MANDATORY** for every task. Before starting any work, identify and
> activate all relevant skills. Skill instructions are binding and override default behaviours. When in doubt about
> whether skill guidance is current, relevant skills MUST be reloaded.

# Overview

`@metreeca/mime` is a standalone, general-purpose monorepo collecting task packages, one for each media type it handles.

Jobs run under the `@metreeca/gear` executor: this repository contributes content processing tasks, **NEVER** an
execution runtime of its own. Reach for `executor`, `bind` and `service` from `@metreeca/gear` rather than
reimplementing them, and keep the service contracts compatible with the ones `@metreeca/gear` already resolves.

# References

- [@metreeca/core](https://github.com/metreeca/core) - Core utilities and shared types
- [@metreeca/flow](https://github.com/metreeca/flow) - Composable async iterable processing
- [@metreeca/tape](https://github.com/metreeca/tape) - Simplified facade for the LogTape logging framework
- [@metreeca/gear](https://github.com/metreeca/gear) - Job executor and shared services for data pipelines, which this
	repository builds on

# NPM Scripts

- **`npm run clean`** - Remove dependencies and build artefacts
- **`npm run prime`** - Install dependencies from the lockfile
- **`npm run setup`** - Install dependencies and link sibling `@metreeca/*` repositories
- **`npm run build`** - Compile sources and generate docs
- **`npm run check`** - Run the test suite
- **`npm run proof`** - Build and serve docs

> [!CAUTION]
> **`prime` and `setup` are not interchangeable.** Run `prime` when finalising a public release: `@metreeca/*` imports
> resolve to the published releases recorded in the lockfile. Run `setup` for local development against unpublished
> sibling branches: imports resolve to the working copies in the neighbouring repositories.

# Package Layout

The root `package.json` `workspaces` glob (`packages/*`) covers the task packages, each in its own directory
immediately under `packages/` (for example `packages/mime-csv`), with no shared core package above them.

Task packages are self-contained leaves named after the media type they handle, not after the library they parse it
with: `mime-xml`, not `mime-htmlparser`. Each pulls in only the libraries its own media type needs, declaring no
dependency it doesn't import.

The split follows the media type axis, never the kind of processing: each package carries every task for its own
type, whether it parses, selects or validates content, so a new task joins the package of the type it handles.

# Shared Utilities

Reach for `@metreeca/core` before writing a helper: its `strings`, `numbers`, `arrays` and `structures` entry points
already cover text tidying, escaping, splitting and templating alongside the common collection and value operations. A
hand-rolled equivalent duplicates tested code and drifts from it, missing the edge cases the shared one handles.

Keep a local helper only where the shared one genuinely doesn't fit, and record in its doc comment what the difference
is, so the next reader doesn't take it for an oversight.

# Service Resolution

Calls to `service()` are **NEVER** inlined into a larger expression: always bind the resolved instance to a `const` on a
line of its own, then use it. This keeps the resolution point visible, since it depends on the enclosing execution
rather than on the surrounding expression.

```typescript
const space = service(getSpace); // ✅
const report = lazy(async () => space(await path(source)));

const report = lazy(async () => service(getSpace)(await path(source))); // ❌
```

# Testing

The root `vitest.config.ts` resolves imports of symlinked `@metreeca/*` packages, both workspace packages and siblings
linked by `npm run setup`, to the TypeScript source their `@metreeca/source` export entries declare, so tests run
against `src/` without a prior build. Packages installed from the registry keep resolving to their published `dist`.
An export entry lacking the condition falls back to `dist` as well, and tests then see that package as last built.

> [!CAUTION]
> **NEVER** enable `@metreeca/source` through vitest `resolve.conditions`. Published manifests carry the condition
> while their packages ship no `src/`, and Vite does not fall back to `default` on a missing target, so a global
> condition breaks every package installed from the registry that declares it, as happens under `npm ci` in CI.

# Version Management

All workspace packages share the root `package.json` version. Beyond the `version` fields the release flow already
cascades, update the internal `@metreeca/mime*` dependency ranges in every `packages/**/package.json` to match.

When adding, removing, or renaming packages, update the package table in the root `README.md` Usage section to match.
