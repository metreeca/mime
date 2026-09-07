# @metreeca/mime

[![npm](https://img.shields.io/npm/v/@metreeca/mime)](https://www.npmjs.com/package/@metreeca/mime)

Content access contracts and shared services for [@metreeca/mime](https://github.com/metreeca/mime).

A consumer sets up a [@metreeca/gear](https://github.com/metreeca/gear) executor, binding the content facilities a job
relies on to the implementations chosen for the run. The job's tasks then resolve each facility through the locator,
handing content on by its media type rather than by the format it happens to carry.

Binding a different implementation leaves the job unchanged: the same job runs against live sources, against recorded
content, or against any custom implementation honouring the same contracts.

# Installation

```shell
npm install @metreeca/gear  # the job executor
npm install @metreeca/mime  # this package
```

> [!IMPORTANT]
>
> Node.js 22 or later is required.

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Module                 | Description                                  |
|------------------------|----------------------------------------------|
| [@metreeca/mime][mime] | Content access contracts and shared services |

[mime]: https://metreeca.github.io/mime/modules/_metreeca_mime.index.html

# Support

- open an [issue](https://github.com/metreeca/mime/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/mime/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/mime?tab=Apache-2.0-1-ov-file) file for details.
