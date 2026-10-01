# Metreeca MIME

Ready-made tasks for parsing and serialising content by media type.

**Metreeca MIME** brings ready-made [@metreeca/flow](https://github.com/metreeca/flow) tasks for converting content
between the usual interchange formats and the values a pipeline works on: parsing documents into records and
serialising results back into documents. The tasks run under the [@metreeca/gear](https://github.com/metreeca/gear) job
executor, which supplies the shared services they draw on.

- **Ready-Made Tasks**: parsing and serialisation, chaining alongside any other task
- **Minimal Footprint**: one package per media type, each pulling in only the libraries that type needs

> [!IMPORTANT]
>
> Pipelines are server-side workloads targeting [Node.js](https://nodejs.org/) 22 or later, relying on facilities such
> as the filesystem, the process environment and `fetch`. The packages are not intended for the browser.

# Installation

```shell
npm install @metreeca/gear          # job executor and shared services
npm install @metreeca/mime          # content access contracts and shared services
npm install @metreeca/mime-<type>   # task package, one per media type
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Install a task package for each media type the pipeline handles. Task packages are self-contained leaves, each pulling
in only the libraries its own media type needs. The job executor comes from
[@metreeca/gear](https://github.com/metreeca/gear), which no package pulls in on its own: install it directly to set up
and run a job.

| Package               | Description                                  |
|-----------------------|----------------------------------------------|
| [@metreeca/mime]      | Content access contracts and shared services |
| [@metreeca/mime-csv]  | CSV processing tasks                         |
| [@metreeca/mime-json] | JSON processing tasks                        |
| [@metreeca/mime-xml]  | XML and HTML processing tasks                |

[@metreeca/mime]: https://metreeca.github.io/mime/modules/_metreeca_mime.html

[@metreeca/mime-csv]: https://metreeca.github.io/mime/modules/_metreeca_mime-csv.html

[@metreeca/mime-json]: https://metreeca.github.io/mime/modules/_metreeca_mime-json.html

[@metreeca/mime-xml]: https://metreeca.github.io/mime/modules/_metreeca_mime-xml.html

# Usage

> [!NOTE]
>
> Each package documents its own API in its README and API reference; for complete coverage, see the
> [API reference](https://metreeca.github.io/mime/).

# Support

- open an [issue](https://github.com/metreeca/mime/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/mime/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/mime?tab=Apache-2.0-1-ov-file) file for details.
