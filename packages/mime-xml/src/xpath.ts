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

import { isFunction } from "@metreeca/core";
import type { Task } from "@metreeca/flow";
import { map } from "@metreeca/flow/tasks";
import type { AnyNode } from "domhandler";
import { select, type Target } from "./xpath.core.js";

export type { Attribute, Target } from "./xpath.core.js";


/**
 * XPath selector over parsed X/HTML trees.
 *
 * Selects nodes and computed values from a set of {@link Target} nodes, using XPath 1.0 expressions. The target set is
 * fixed when the selector is created.
 *
 * @see {@link https://www.w3.org/TR/1999/REC-xpath-19991116/ XML Path Language (XPath) 1.0}
 */
export type XPath = {

	/**
	 * Selects values.
	 *
	 * Each selection spans the whole target set: the expression is evaluated with each target as context node, and the
	 * results are merged into a single list. All XPath 1.0 axes, node tests, predicates, operators and core functions
	 * are supported.
	 *
	 * Expressions computing a string, a number or a boolean, such as `count(//item)`, return the computed value for
	 * each target. Computed values have no tree, so selecting from them returns nothing.
	 *
	 * Names are matched case-sensitively, exactly as stored in the tree, and namespaces are not resolved. The same
	 * expressions therefore work on both XML and HTML trees, whose names are folded to lowercase while parsing:
	 *
	 * - an unprefixed name test matches unprefixed names only, so `item` matches `<item>` even under a default
	 *   namespace, but not `<d:item>`
	 * - a prefixed name test matches the prefix as written, so `d:b` matches `<d:b>` whatever namespace URI `d` is
	 *   bound to, but not the same element written with a different prefix
	 * - `local-name()` returns a name without its prefix and `name()` returns it in full, so `<d:b>` matches both
	 *   `local-name()='b'` and `name()='d:b'`
	 * - `namespace-uri()` returns the prefix of a name rather than a namespace URI; the `xml` prefix is the exception,
	 *   bound to its standard URI, so `@xml:base` and `lang()` work as specified
	 * - `xmlns` declarations are ordinary attributes, selected by attribute steps like any other
	 *
	 * XML declarations, document type declarations and processing instructions are not part of the tree, so
	 * `processing-instruction()` selects nothing. Namespace nodes are not supported either, so `namespace::` selects
	 * nothing. `CDATA` sections are read as text nodes.
	 *
	 * @param path The selection expression
	 *
	 * @returns An immutable list of the values selected by `path`, ordered by target and, within each target, in
	 *          document order, without duplicate nodes; empty if `path` selects no value
	 *
	 * @throws {@link !SyntaxError SyntaxError} If `path` is malformed
	 */
	(path: string): readonly Target[];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates an XPath selector task.
 *
 * The task converts a feed of parsed X/HTML trees into a feed of {@link XPath} selectors, one selector per tree, so
 * that downstream tasks select nodes by expression rather than walking the tree.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each selector is emitted as soon as its tree is drawn, so endless sources are processed for as
 * >   long as the feed is consumed.
 * > - **Streaming**: trees are processed one at a time and none is retained, so memory use doesn't grow with the
 * >   length of the feed; each selector keeps its target tree alive for as long as it is referenced.
 * > - **Stateless**: each tree is processed independently, so the result doesn't depend on how the feed is split
 * >   across nested feeds or runs.
 *
 * @returns A task converting a feed of parsed X/HTML trees into a feed of XPath selectors
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails
 *
 * @group Factories
 */
export function xpath(): Task<AnyNode, XPath>; // without a mapper the selector is emitted as it is

/**
 * Creates an XPath mapping task.
 *
 * The task converts a feed of parsed X/HTML trees into a feed of mapped results, one result per tree, so that
 * downstream tasks work on the shape they need rather than on the markup.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each result is emitted as soon as its tree is drawn, so endless sources are processed for as
 * >   long as the feed is consumed.
 * > - **Streaming**: trees are processed one at a time and released once mapped, so memory use doesn't grow with the
 * >   length of the feed.
 * > - **Stateless**: each tree is mapped independently, so the result doesn't depend on how the feed is split across
 * >   nested feeds or runs.
 *
 * @typeParam V The type of the results mapped from incoming trees
 *
 * @param mapper The mapping function, applied to an {@link XPath} selector targeting the tree being processed
 *
 * @returns A task converting a feed of parsed X/HTML trees into a feed of mapped results
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails or `mapper` throws, including a
 *                              {@link !SyntaxError SyntaxError} for a malformed expression
 *
 * @example
 *
 * ```typescript
 * const events = xpath(path => ({
 *
 *     title: path("//h1").map(string),
 *     links: path("//a/@href").map(link)
 *
 * }));
 * ```
 *
 * @group Factories
 */
export function xpath<V>(mapper: (path: XPath) => V): Task<AnyNode, V>;

/**
 * Creates an XPath selector over given nodes.
 *
 * Targets nodes already at hand, outside a feed, with the same selection semantics as the selectors emitted by the
 * feed tasks.
 *
 * > [!IMPORTANT]
 * >
 * > A call without nodes, including one spreading an empty list, creates a selector task over a feed rather than a
 * > selector with an empty target set.
 *
 * @param nodes The target nodes, in selection order
 *
 * @returns An immutable selector targeting `nodes`
 *
 * @group Factories
 */
export function xpath(...nodes: readonly Target[]): XPath;

/**
 * Creates an XPath selector.
 */
export function xpath(...args: readonly Target[] | readonly [mapper: (path: XPath) => unknown]): unknown {

	return isMapper(args) ? map<AnyNode, unknown>(node => args[0](selector([ node ])))
		: args.length === 0 ? map<AnyNode, XPath>(node => selector([ node ]))
			: selector(args);


	function isMapper(args: readonly unknown[]): args is readonly [mapper: (path: XPath) => unknown] {
		return isFunction(args[0]);
	}

	function selector(nodes: readonly Target[]): XPath {
		return Object.freeze((path: string) => nodes.flatMap(node => select(node, path)));
	}

}
