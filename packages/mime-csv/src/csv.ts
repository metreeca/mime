/*
 * Copyright © 2020-2026 EC2U Alliance
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

import type { Task } from "@metreeca/flow";
import { items } from "@metreeca/flow/feeds";
import { process } from "./csv.core.js";
import type { Record } from "./index.js";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a CSV parser.
 *
 * The task converts a feed of CSV documents into a feed of records, one {@link Record} per data row, so that downstream
 * tasks work on structured data rather than on text.
 *
 * Each document is given either as text or as a response carrying it in its body. A response without a body produces
 * no records.
 *
 * Response bodies are decoded with the `charset` parameter of their content type. If no charset is stated, bodies are
 * decoded as UTF-8 rather than as the US-ASCII default of `text` media types, since UTF-8 is the encoding CSV sources
 * use in practice. A leading byte order mark is stripped, both from text and from bodies in a Unicode charset.
 *
 * Sources often serve CSV as `text/plain` or under vendor types. A response with a content type other than `text/csv`
 * or `application/csv` is therefore logged as a warning and parsed anyway. A response with a charset the platform
 * can't decode is also logged, and its body is decoded as UTF-8.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each record is emitted as soon as it is parsed, so endless sources are processed for as long as
 * >   the feed is consumed.
 * > - **Streaming**: documents are drawn one at a time and response bodies are read as records are requested, so
 * >   resources of any size are processed without being held in memory, and a consumer that stops early releases the
 * >   source. Documents given as text are parsed in one go, and part of a body may be read ahead of the records
 * >   actually consumed.
 * > - **Stateless**: each document is parsed independently, including its own header row, so the result doesn't
 * >   depend on how the feed is split across nested feeds or runs.
 *
 * > [!WARNING]
 * >
 * > Malformed records are skipped and logged as warnings, and the feed runs to completion.
 *
 * @typeParam R The type of the records produced; field values are emitted as parsed and are not validated against it
 *
 * @param options The parsing options
 * @param options.header Reads the first row of each document as column labels, keying records by label rather than by
 *                       positional index; defaults to `false`
 * @param options.skip Skips lines without content, either empty or containing delimiters only; a row with at least one
 *                     non-blank field is kept; defaults to `false`
 * @param options.trim Strips surrounding whitespace from field values and column labels, quoted values included; a
 *                     field left blank after trimming is `undefined` rather than an empty string; defaults to `false`
 * @param options.flex Emits records whose field count doesn't match the header rather than skipping them; missing
 *                     fields are left out and fields beyond the header are discarded; defaults to `false`
 * @param options.quote The character wrapping field values; defaults to `"` if unset or empty
 * @param options.delimiter The character separating fields; defaults to `,` if unset or empty
 *
 * @returns A task converting a feed of CSV documents, given as text or as responses, into a feed of records
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails or a response body can't be
 *                              read
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc4180 RFC 4180 Common Format and MIME Type for CSV Files}
 * @see {@link https://www.rfc-editor.org/rfc/rfc9110#section-8.3 RFC 9110 § 8.3 - Content-Type}
 *
 * @group Factories
 */
export function csv<R extends Record = Record>(options: {

	readonly header?: boolean

	readonly skip?: boolean
	readonly trim?: boolean
	readonly flex?: boolean

	readonly quote?: string
	readonly delimiter?: string

} = {}): Task<string | Response, R> {

	return documents => items((async function* () {

		for await (const document of documents) {

			yield* process<R>(document, options);

		}

	})());

}
