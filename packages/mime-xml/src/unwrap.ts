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

import { isValue, type Value } from "@metreeca/core";
import type { Task } from "@metreeca/flow";
import { map } from "@metreeca/flow/tasks";
import type { AnyNode } from "domhandler";
import { content } from "./xpath.core.js";
import { xpath } from "./xpath.js";


/**
 * Creates a structured data extractor.
 *
 * The task converts a feed of parsed X/HTML trees into a feed of the JSON-LD values each tree embeds, one list per
 * tree. Consumers can thus read the structured data a site publishes even if a page renders its content client-side
 * and carries no readable prose of its own, as single-page applications commonly do.
 *
 * Trees embedding no values produce an empty list, so that lists stay aligned with the input feed.
 *
 * Values are collected in document order from the `application/ld+json` scripts of each tree, wherever they are
 * placed in the page, `head` included. Each script contributes the value it states as a single item, with arrays and
 * `@graph` members left unexpanded, so that consumers pick the objects they need with plain array methods. Scripts
 * that fail to parse are skipped, so that one malformed block cannot hide the well-formed blocks beside it.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each list is emitted as soon as its tree is drawn, so endless sources are processed for as long
 * >   as the feed is consumed.
 * > - **Streaming**: trees are processed one at a time and released once read, so memory use doesn't grow with the
 * >   length of the feed.
 * > - **Stateless**: each tree is processed independently, so the result doesn't depend on how the feed is split
 * >   across nested feeds or runs.
 *
 * @returns A task converting a feed of parsed X/HTML trees into a feed of the JSON-LD values each tree embeds
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails
 *
 * @see {@link https://json-ld.org/ JSON-LD}
 * @see {@link https://html.spec.whatwg.org/multipage/scripting.html#data-block WHATWG HTML - Data blocks}
 *
 * @group Factories
 */
export function unwrap(): Task<AnyNode, readonly Value[]>;

/**
 * Extracts the structured data embedded in a tree.
 *
 * Works on a tree already at hand, outside a feed, and returns exactly the list the feed task emits for it. A caller
 * can thus fall back on the structured data of a single page, for instance if the page holds no main content.
 *
 * @param tree The parsed X/HTML tree
 *
 * @returns The JSON-LD values embedded in `tree`, in document order; an empty array if `tree` embeds none
 *
 * @group Factories
 */
export function unwrap(tree: AnyNode): readonly Value[];

/**
 * Extracts structured data.
 */
export function unwrap(tree?: AnyNode): Task<AnyNode, readonly Value[]> | readonly Value[] {

	return tree !== undefined ? extract(tree) : map(extract);


	function extract(tree: AnyNode): readonly Value[] {
		return xpath(tree)("//script[@type='application/ld+json']")
			.map(content)
			.map(parse)
			.filter(isValue);
	}

	function parse(text: string): unknown {
		try {

			return JSON.parse(text);

		} catch {

			return undefined; // not a value, so that the block is skipped

		}
	}

}
