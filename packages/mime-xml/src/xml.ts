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
import { isBase } from "./index.core.js";
import { process } from "./xml.core.js";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates an XML parser.
 *
 * The task converts a feed of XML documents into a feed of parsed trees, one tree per document, so that downstream
 * tasks work on document structure rather than on text.
 *
 * Each document is given either as text or as a response carrying it in its body. Empty or whitespace-only documents
 * produce no tree, and neither do responses without a body.
 *
 * Response bodies are decoded with the `charset` parameter of their content type. If no charset is stated, bodies are
 * decoded as UTF-8 rather than as the US-ASCII default of `text` media types. A leading byte order mark is stripped,
 * both from text and from bodies in a Unicode charset.
 *
 * A response with a content type that is not an XML one is logged as a warning and parsed anyway. XML content types
 * are `application/xml`, `text/xml` and `+xml` formats such as `application/rss+xml`. A response with a charset the
 * platform can't decode is also logged, and its body is decoded as UTF-8. Since parsing never fails, these warnings
 * are the only sign that a source is mis-declared.
 *
 * Trees carry the base URL needed to resolve the references they contain, recorded as an `xml:base` attribute on each
 * root element. A root element that already declares `xml:base` keeps it, resolved against the recorded base URL.
 *
 * The base URL is the `base` argument, if given, or else the final URL of the response, after any redirects. No base
 * URL is recorded for documents given as text or for responses without a URL.
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
 * > closed at the end of the input, but malformed input may be misrepresented rather than rejected: an unclosed element
 * > absorbs the content that follows it, an unterminated attribute value swallows the rest of the input, and a tree
 * > may have any number of root elements, including none. Consumers requiring well-formed input must validate the
 * > emitted trees themselves.
 *
 * > [!WARNING]
 * >
 * > The encoding declared in the XML prolog is ignored: response bodies are decoded with the charset stated by their
 * > content type, even if the document declares a different one.
 *
 * @param base The base URL for resolving references, overriding the URL of responses; must be a hierarchical
 *             identifier, that is a scheme followed by a root-relative path
 *
 * @returns A task converting a feed of XML documents, given as text or as responses, into a feed of parsed trees
 *
 * @throws {@link !RangeError RangeError} If `base` is not a hierarchical identifier, for instance a relative reference
 *                                        or an opaque identifier such as `urn:example:x`, which would leave references
 *                                        silently unresolved
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails or a response body can't be
 *                              read
 *
 * @see {@link https://www.w3.org/TR/xml/ Extensible Markup Language (XML) 1.0}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7303 RFC 7303 XML Media Types}
 * @see {@link https://www.w3.org/TR/xmlbase/ XML Base}
 *
 * @group Factories
 */
export function xml(base?: IRI): Task<string | Response, Document> {

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
