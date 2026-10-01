# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/metreeca/mime/commits/main)

### Added

- `@metreeca/mime-csv` — CSV processing tasks, migrated from `@metreeca/gear-csv`
- `@metreeca/mime-json` — JSON processing tasks, migrated from `@metreeca/gear-json`
- `@metreeca/mime-xml` — XML and HTML processing tasks, migrated from `@metreeca/gear-xml`

### Changed

- `@metreeca/mime-csv` ignores a row stating its delimiters alone under `skip`, as a spreadsheet serialises a separator
  row that way, while keeping a row carrying at least one field value
- `@metreeca/mime-csv` strips whitespace from quoted field values as well as unquoted ones under `trim`, keying a field
  left blank once trimmed to `undefined` rather than to an empty string
- `@metreeca/mime-xml` renders the navigation, headers, footers, sidebars, controls and embedded objects a page is
  framed by as nothing, leaving their text out of the rendering as well as out of headings, emphasis and the
  frontmatter title, so that a page converts to the prose a reader is shown

### Fixed

- `@metreeca/mime-xml` takes a title drawing all of its text from framing as no title, so that a page is no longer
  carried on with an empty frontmatter `title` or an empty `head`
