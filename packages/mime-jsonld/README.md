# @metreeca/mime-jsonld

[![npm](https://img.shields.io/npm/v/@metreeca/mime-jsonld)](https://www.npmjs.com/package/@metreeca/mime-jsonld)

JSON-LD processing tasks for [@metreeca/mime](https://github.com/metreeca/mime).

# Installation

```shell
npm install @metreeca/gear         # the job executor
npm install @metreeca/mime-jsonld  # this package
```

> [!IMPORTANT]
>
> Node.js 22 or later is required.

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Task                     | Description                      |
|--------------------------|----------------------------------|
| [`validate()`][validate] | JSON-LD resource shape validator |

[validate]: https://metreeca.github.io/mime/functions/_metreeca_mime-jsonld.validate.html

# Support

- open an [issue](https://github.com/metreeca/mime/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/mime/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/mime?tab=Apache-2.0-1-ov-file) file for details.
