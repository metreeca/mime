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

import { isFunction, type Value } from "@metreeca/core";
import { Task } from "@metreeca/flow";
import { map } from "@metreeca/flow/tasks";
import { select } from "./jpath.core.js";


/**
 * JSONPath-like selector over JSON values.
 *
 * Selects nested values from a set of target JSON values, using a JSONPath-like syntax. The target set is fixed when
 * the selector is created.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9535 RFC 9535 JSONPath Query Expressions for JSON}
 */
export type JPath = {

	/**
	 * Selects values.
	 *
	 * Each selection spans the whole target set: the values selected from each target are merged into a single list.
	 *
	 * A path is a sequence of steps, each selecting from the values selected by the previous one. Steps are written
	 * one after the other, separated only by the leading `.` of the steps that carry one:
	 *
	 * - `$` — the target value itself; allowed only as the leading step, where it may be omitted
	 * - `.property` / `property` — object property
	 * - `['property']` — object property, with lenient JSON string escapes: an unknown escape stands for the character
	 *   it introduces, so `\'` names an apostrophe
	 * - `[0]` — array element by index
	 * - `.*` / `[*]` — every element of an array or every property value of an object
	 *
	 * Property steps don't reach into arrays: selecting the properties of objects inside an array requires an explicit
	 * `[*]` or `.*` step.
	 *
	 * Only JSON values are selected: `null` is selected like any other value, while `undefined` (which can only occur
	 * in values built in code) is skipped like an absent property.
	 *
	 * @param path The selection path; an empty path or `$` selects the target values unchanged
	 *
	 * @returns An immutable list of the values selected by `path`, ordered by target and, within each target, in
	 *          document order; empty if `path` selects no value
	 *
	 * @throws {@link !SyntaxError SyntaxError} If `path` is malformed
	 */
	(path: string): readonly Value[];

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a JSON path selector task.
 *
 * The task converts a feed of values into a feed of {@link JPath} selectors, one selector per value, so that downstream
 * tasks select nested values by path rather than walking the structure.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each selector is emitted as soon as its value is drawn, so endless sources are processed for as
 * >   long as the feed is consumed.
 * > - **Streaming**: values are processed one at a time and none is retained, so memory use doesn't grow with the
 * >   length of the feed; each selector keeps its target value alive for as long as it is referenced.
 * > - **Stateless**: each value is processed independently, so the result doesn't depend on how the feed is split
 * >   across nested feeds or runs.
 *
 * @returns A task converting a feed of values into a feed of path selectors
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails
 *
 * @group Factories
 */
export function jpath(): Task<Value, JPath>; // without a mapper the selector is emitted as it is

/**
 * Creates a JSON path mapping task.
 *
 * The task converts a feed of values into a feed of mapped results, one result per value, so that downstream tasks
 * work on the shape they need rather than on the one stated by the source.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each result is emitted as soon as its value is drawn, so endless sources are processed for as
 * >   long as the feed is consumed.
 * > - **Streaming**: values are processed one at a time and released once mapped, so memory use doesn't grow with the
 * >   length of the feed.
 * > - **Stateless**: each value is mapped independently, so the result doesn't depend on how the feed is split across
 * >   nested feeds or runs.
 *
 * @typeParam V The type of the results mapped from incoming values
 *
 * @param mapper The mapping function, applied to a {@link JPath} selector targeting the value being processed
 *
 * @returns A task converting a feed of values into a feed of mapped results
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails or `mapper` throws, including a
 *                              {@link !SyntaxError SyntaxError} for a malformed path
 *
 * @example
 *
 * ```typescript
 * const events = jpath(path => ({
 *
 *     id: path("$.id"),
 *     tags: path("$.tags[*]")
 *
 * }));
 * ```
 *
 * @group Factories
 */
export function jpath<V>(mapper: (path: JPath) => V): Task<Value, V>;

/**
 * Creates a JSON path selector over given values.
 *
 * Targets values already at hand, outside a feed, with the same selection semantics as the selectors emitted by the
 * feed tasks.
 *
 * > [!IMPORTANT]
 * >
 * > A call without values, including one spreading an empty list, creates a selector task over a feed rather than a
 * > selector with an empty target set.
 *
 * @param values The target values, in selection order
 *
 * @returns An immutable selector targeting `values`
 *
 * @group Factories
 */
export function jpath(...values: readonly Value[]): JPath;

/**
 * Creates a JSON path selector.
 */
export function jpath(...args: readonly Value[] | readonly [mapper: (path: JPath) => unknown]): unknown {

	return isMapper(args) ? map<Value, unknown>(value => args[0](selector([value])))
		: args.length === 0 ? map<Value, JPath>(value => selector([value]))
			: selector(args);


	function isMapper(args: readonly unknown[]): args is readonly [mapper: (path: JPath) => unknown] {
		return isFunction(args[0]);
	}

	function selector(values: readonly Value[]): JPath {
		return Object.freeze((path: string) => values.flatMap(value => select(value, path)));
	}

}
