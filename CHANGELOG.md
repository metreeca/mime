# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/metreeca/mime/compare/v0.2.0...HEAD)

### Added

- `@metreeca/mime-xml` — `focus(tree)` and `untag(tree)` overloads, processing a single tree outside a feed
- `@metreeca/mime-xml` — `unwrap()` task, extracting the JSON-LD values X/HTML trees embed in their scripts

## [0.2.0](https://github.com/metreeca/mime/compare/v0.1.1...v0.2.0) - 2026-10-19

### Added

- `@metreeca/mime-jsonld` — JSON-LD processing tasks, shaped by `@metreeca/blue` blueprints

### Changed

- Upgrade `@metreeca/blue` to `^0.13.0`
- Upgrade `@metreeca/core` to `^0.13.0`
- Upgrade `@metreeca/flow` to `^0.12.0`
- Upgrade `@metreeca/http` to `^0.5.0`
- Upgrade `@metreeca/tape` to `^0.12.0`

### Removed

- `@metreeca/mime` package, which exported no API: install the task packages directly, alongside `@metreeca/gear`

## [0.1.1](https://github.com/metreeca/mime/compare/v0.1.0...v0.1.1) - 2026-10-14

### Fixed

- Ship the hand-written `xpathway` declarations with the `@metreeca/mime-xml` sources, so projects type-checking the
  package from a linked checkout no longer report the parameters of its XPath callbacks as implicitly typed `any`

### Changed

- Upgrade `@metreeca/core` to `^0.12.1`
- Upgrade `@metreeca/flow` to `^0.11.1`
- Upgrade `@metreeca/http` to `^0.4.1`
- Upgrade `@metreeca/tape` to `^0.11.1`

## [0.1.0](https://github.com/metreeca/mime/releases/tag/v0.1.0) - 2026-10-01

Initial release of ready-made tasks for parsing content by media type, running under the
[@metreeca/gear](https://github.com/metreeca/gear) job executor, which is installed separately. Task packages are
self-contained leaves, each pulling in only the libraries its own media type needs. The parsing tasks are migrated from
the `@metreeca/gear-*` packages.

- `@metreeca/mime` — content access contracts and shared services
- `@metreeca/mime-csv` — CSV processing tasks, migrated from `@metreeca/gear-csv`; `skip` now also ignores rows made of
  delimiters alone, and `trim` now also strips quoted values, turning fields left blank into `undefined`
- `@metreeca/mime-json` — JSON processing tasks, migrated from `@metreeca/gear-json`
- `@metreeca/mime-xml` — XML and HTML processing tasks, migrated from `@metreeca/gear-xml`; `untag()` now leaves out
  page framing (navigation, headers, footers, sidebars, controls and embedded objects), and a title made only of framing
  text no longer produces an empty frontmatter `title` or `head`
