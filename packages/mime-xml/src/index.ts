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

/**
 * XML and HTML processing tasks.
 *
 * Parses XML and HTML documents into a shared tree shape, selects nodes by XPath expression, extracts the main content
 * of web pages, renders it as Markdown, and reads selected values as the expected primitive types.
 *
 * @module index
 *
 * @see {@link https://www.w3.org/TR/xml/ Extensible Markup Language (XML) 1.0}
 * @see {@link https://html.spec.whatwg.org/multipage/ WHATWG HTML Living Standard}
 * @see {@link https://www.w3.org/TR/1999/REC-xpath-19991116/ XML Path Language (XPath) 1.0}
 */

import { assert, isBoolean, isNumber } from "@metreeca/core";
import { type IRI, isIRI } from "@metreeca/core/resource";
import { tidy } from "@metreeca/core/strings";
import { base, content, type Target } from "./xpath.core.js";

export * from "./xml.js";
export * from "./html.js";
export * from "./xpath.js";
export * from "./focus.js";
export * from "./untag.js";


/**
 * Reads a selected value as a boolean.
 *
 * Accepts only the `true` and `false` forms produced by XPath itself, so that computed booleans are read back unchanged
 * and any other text is rejected rather than guessed at.
 *
 * @param node The {@link Target} to read, either a selected node or a computed value
 *
 * @returns `true` if the text of `node` is `true`; `false` if it is `false`
 *
 * @throws {@link !TypeError TypeError} If the text of `node` is neither `true` nor `false`
 */
export function boolean(node: Target): boolean {

	const text = string(node);

	return assert(text === "true" ? true : text === "false" ? false : undefined, isBoolean);

}

/**
 * Reads a selected value as a number.
 *
 * Empty text is rejected rather than read as zero, so that a missing figure isn't passed downstream as a plausible one.
 *
 * @param node The {@link Target} to read, either a selected node or a computed value
 *
 * @returns The number written in the text of `node`
 *
 * @throws {@link !TypeError TypeError} If the text of `node` is not a finite number
 */
export function number(node: Target): number {

	const text = string(node);

	return assert(text ? Number(text) : NaN, isNumber); // empty text reads as 0, which a node holding none doesn't name

}

/**
 * Reads a selected value as text.
 *
 * Converts values as the XPath `string()` function does: attributes are read as their value, other nodes as the text
 * content of their subtree (comments excluded), and computed strings, numbers or booleans as their written form.
 *
 * @param node The {@link Target} to read, either a selected node or a computed value
 *
 * @returns The text of `node`, with whitespace runs collapsed to a single space and leading and trailing whitespace
 *          removed, so that content spread across several lines reads as evenly spaced text
 *
 * @see {@link https://www.w3.org/TR/1999/REC-xpath-19991116/#function-string XML Path Language (XPath) 1.0 - string()}
 */
export function string(node: Target): string {
	return tidy(content(node));
}

/**
 * Reads a selected value as a link.
 *
 * Resolves the reference against the base URL in scope at `node`, as recorded by the {@link xml} and {@link html}
 * parsers, so that consumers always work on absolute IRIs, wherever the reference appears in the document. References
 * are returned unresolved for computed values and for trees without a base URL, such as trees parsed from text
 * without a `base` argument.
 *
 * @param node The {@link Target} to read, either a selected node or a computed value
 *
 * @returns The IRI written in the text of `node`, resolved against the base URL in scope at `node`, if any
 *
 * @throws {@link !TypeError TypeError} If the text of `node` is neither an IRI nor a relative reference
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc3987 RFC 3987 Internationalized Resource Identifiers}
 * @see {@link https://www.w3.org/TR/xmlbase/ XML Base}
 */
export function link(node: Target): IRI {

	const reference = string(node);
	const url = base(node);

	return assert(url === undefined ? reference : resolved(url), isIRI);


	function resolved(url: URL): string {

		try {

			return new URL(reference, url).href;

		} catch { // a malformed reference is reported as it stands // !!! review leniency

			return reference;

		}

	}

}
