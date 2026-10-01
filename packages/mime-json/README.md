# @metreeca/mime-json

[![npm](https://img.shields.io/npm/v/@metreeca/mime-json)](https://www.npmjs.com/package/@metreeca/mime-json)

JSON processing tasks for [@metreeca/mime](https://github.com/metreeca/mime).

# Installation

```shell
npm install @metreeca/gear       # the job executor
npm install @metreeca/mime-json  # this package
```

> [!IMPORTANT]
>
> Node.js 22 or later is required.

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Task                     | Description          |
|--------------------------|----------------------|
| [`json()`][json]         | JSON parser          |
| [`jpath()`][jpath]       | JSON path selector   |
| [`validate()`][validate] | JSON value validator |

[json]: https://metreeca.github.io/mime/functions/_metreeca_mime-json.json.html

[jpath]: https://metreeca.github.io/mime/functions/_metreeca_mime-json.jpath.html

[validate]: https://metreeca.github.io/mime/functions/_metreeca_mime-json.validate.html

# Support

- open an [issue](https://github.com/metreeca/mime/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/mime/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/mime?tab=Apache-2.0-1-ov-file) file for details.
