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

import type { Object, Value } from "@metreeca/core";
import type { Task } from "@metreeca/flow";
import { items } from "@metreeca/flow/feeds";
import { process } from "./json.core.js";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a JSON parser.
 *
 * The task converts a feed of JSON documents into a feed of values, one value per document, so that downstream tasks
 * work on structured data rather than on text.
 *
 * Each document is given either as text or as a response carrying it in its body. Empty or whitespace-only documents
 * produce no value, and neither do responses without a body.
 *
 * Response bodies are always decoded as UTF-8, the only encoding JSON is exchanged in. Invalid UTF-8 bytes are read as
 * replacement characters.
 *
 * A response is logged as a warning, and parsed anyway, if its content type is not a JSON one or its charset is not
 * UTF-8. JSON content types are `application/json` and `+json` formats such as `application/ld+json`.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each value is emitted as soon as its document is parsed, so endless sources are processed for
 * >   as long as the feed is consumed.
 * > - **Materialising**: each document is held in memory as a whole while it is parsed, so peak memory use is about
 * >   twice the size of the largest document, regardless of the length of the feed.
 * > - **Stateless**: each document is parsed independently, so the result doesn't depend on how the feed is split
 * >   across nested feeds or runs.
 *
 * > [!WARNING]
 * >
 * > Malformed documents are skipped and logged as warnings, and the feed runs to completion.
 *
 * @typeParam V The type of the values produced; parsed documents are emitted as is and are not validated against it;
 *              defaults to a JSON {@link Object}
 *
 * @returns A task converting a feed of JSON documents, given as text or as responses, into a feed of values
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails or a response body can't be
 *                              read
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8259 RFC 8259 JSON Data Interchange Format}
 * @see {@link https://www.rfc-editor.org/rfc/rfc9110#section-8.3 RFC 9110 § 8.3 - Content-Type}
 *
 * @group Factories
 */
export function json<V extends Value = Object>(): Task<string | Response, V> {

	return documents => items((async function* () {

		for await (const document of documents) {

			const value = await process<V>(document);

			if ( value !== undefined ) { // a document holding no parsable value contributes no value

				yield value;

			}

		}

	})());

}
