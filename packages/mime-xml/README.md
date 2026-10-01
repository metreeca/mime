# @metreeca/mime-xml

[![npm](https://img.shields.io/npm/v/@metreeca/mime-xml)](https://www.npmjs.com/package/@metreeca/mime-xml)

XML and HTML processing tasks for [@metreeca/mime](https://github.com/metreeca/mime).

# Installation

```shell
npm install @metreeca/gear      # the job executor
npm install @metreeca/mime-xml  # this package
```

> [!IMPORTANT]
>
> Node.js 22 or later is required.

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

| Task               | Description       |
|--------------------|-------------------|
| [`xml()`][xml]     | XML parser        |
| [`html()`][html]   | HTML parser       |
| [`xpath()`][xpath] | XPath selector    |
| [`focus()`][focus] | Content extractor |
| [`untag()`][untag] | Markdown renderer |

[xml]: https://metreeca.github.io/mime/functions/_metreeca_mime-xml.xml.html

[html]: https://metreeca.github.io/mime/functions/_metreeca_mime-xml.html.html

[xpath]: https://metreeca.github.io/mime/functions/_metreeca_mime-xml.xpath.html

[focus]: https://metreeca.github.io/mime/functions/_metreeca_mime-xml.focus.html

[untag]: https://metreeca.github.io/mime/functions/_metreeca_mime-xml.untag.html

# Support

- open an [issue](https://github.com/metreeca/mime/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/mime/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/mime?tab=Apache-2.0-1-ov-file) file for details.
