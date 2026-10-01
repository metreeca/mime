# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/metreeca/mime/compare/v0.1.0...HEAD)

## [0.1.0](https://github.com/metreeca/mime/releases/tag/v0.1.0) - 2026-10-01

Initial release of ready-made tasks for parsing content by media type, running under the
[@metreeca/gear](https://github.com/metreeca/gear) job executor, which is installed separately. Task packages are
self-contained leaves, each pulling in only the libraries its own media type needs. The parsing tasks are migrated from
the `@metreeca/gear-*` packages.

- `@metreeca/mime` — content access contracts and shared services
- `@metreeca/mime-csv` — CSV processing tasks, migrated from `@metreeca/gear-csv`; `skip` now also ignores rows made
  of delimiters alone, and `trim` now also strips quoted values, turning fields left blank into `undefined`
- `@metreeca/mime-json` — JSON processing tasks, migrated from `@metreeca/gear-json`
- `@metreeca/mime-xml` — XML and HTML processing tasks, migrated from `@metreeca/gear-xml`; `untag()` now leaves out
  page framing (navigation, headers, footers, sidebars, controls and embedded objects), and a title made only of
  framing text no longer produces an empty frontmatter `title` or `head`
