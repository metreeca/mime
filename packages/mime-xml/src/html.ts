/*
 * Copyright © 2026 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IRI } from "@metreeca/core/resource";
import type { Task } from "@metreeca/flow";
import { items } from "@metreeca/flow/feeds";
import type { Document } from "domhandler";
import { process } from "./html.core.js";
import { isBase } from "./index.core.js";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates an HTML parser.
 *
 * The task converts a feed of HTML documents into a feed of parsed trees, one tree per document, so that downstream
 * tasks work on document structure rather than on text.
 *
 * Each document is given either as text or as a response carrying it in its body. Empty or whitespace-only documents
 * produce no tree, and neither do responses without a body.
 *
 * Trees have the same shape as the ones produced by {@link xml}, so the same path expressions work on both. Names are
 * kept as written in the source, `xmlns` declarations are not resolved, and missing `html`, `head` or `body` elements
 * are not added.
 *
 * Response bodies are decoded with the `charset` parameter of their content type. If no charset is stated, the `meta`
 * charset declared in the first kilobyte of the document is used. If neither is stated, bodies are decoded as UTF-8
 * rather than as the windows-1252 legacy default of HTML. A leading byte order mark is stripped, both from text and
 * from bodies in a Unicode charset.
 *
 * A response with a content type other than `text/html` or `application/xhtml+xml` is logged as a warning and parsed
 * anyway. A response with a charset the platform can't decode is also logged, and its body is decoded as UTF-8. Since
 * parsing never fails, these warnings are the only sign that a source is mis-declared.
 *
 * Trees carry the base URL needed to resolve the references they contain, recorded as an `xml:base` attribute on each
 * root element. A root element that already declares `xml:base` keeps it, resolved against the recorded base URL.
 *
 * The base URL is the one stated by the first `base` element of the document, resolved against the retrieval URL. The
 * retrieval URL is the `base` argument, if given, or else the final URL of the response, after any redirects. No base
 * URL is recorded if none of them yields an absolute URL, as for a document given as text with only a relative `base`
 * element. Unlike the `base` argument, `base` elements are read leniently, since they come from the source.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each tree is emitted as soon as its document is parsed, so endless sources are processed for as
 * >   long as the feed is consumed.
 * > - **Materialising**: each document is held in memory as a whole while it is parsed, so peak memory use is about
 * >   twice the size of the largest document, regardless of the length of the feed.
 * > - **Stateless**: each document is parsed independently, so the result doesn't depend on how the feed is split
 * >   across nested feeds or runs.
 *
 * > [!WARNING]
 * >
 * > Parsing is forgiving and never fails. Emitted trees are always structurally sound, since unclosed elements are
 * > closed at the end of the input, but malformed input may be misrepresented rather than rejected. Trees also reflect
 * > the markup as written rather than as a browser would repair it: misnested elements stay misnested, and content a
 * > browser would relocate stays in place. Expressions should target the tree the parser actually produces.
 *
 * > [!NOTE]
 * >
 * > Names are folded to lowercase, as HTML prescribes, except inside inline SVG and MathML, where the camelCase names
 * > defined by those languages are restored: `clipPath` and `@viewBox` are selected as written. HTML content inside
 * > `foreignObject` and MathML text elements is folded like the rest of the document.
 *
 * @param base The retrieval URL for resolving references, overriding the URL of responses and in turn overridden by
 *             `base` elements in the document; must be a hierarchical identifier, that is a scheme followed by a
 *             root-relative path
 *
 * @returns A task converting a feed of HTML documents, given as text or as responses, into a feed of parsed trees
 *
 * @throws {@link !RangeError RangeError} If `base` is not a hierarchical identifier, for instance a relative reference
 *                                        or an opaque identifier such as `urn:example:x`, which would leave references
 *                                        silently unresolved
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails or a response body can't be
 *                              read
 *
 * @see {@link https://html.spec.whatwg.org/multipage/ WHATWG HTML Living Standard}
 * @see {@link https://www.rfc-editor.org/rfc/rfc9110#section-8.3 RFC 9110 § 8.3 - Content-Type}
 * @see {@link https://www.w3.org/TR/xmlbase/ XML Base}
 *
 * @group Factories
 */
export function html(base?: IRI): Task<string | Response, Document> {

	if ( base !== undefined && !isBase(base) ) {
		throw new RangeError(`expected resolvable base URL <${base}>`);
	}

	return documents => items((async function* () {

		for await (const document of documents) {

			const tree = await process(document, base);

			if ( tree !== undefined ) { // a document holding no text contributes no value

				yield tree;

			}

		}

	})());

}
