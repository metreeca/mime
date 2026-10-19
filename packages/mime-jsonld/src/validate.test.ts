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

import { id, required, resource } from "@metreeca/blue/resource";
import { string } from "@metreeca/blue/string";
import { items } from "@metreeca/flow/feeds";
import { toArray } from "@metreeca/flow/sinks";
import { describe, expect, it } from "vitest";
import { validate } from "./validate.js";


function Item() {
	return resource({
		id: id(),
		label: required(string())
	});
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

describe("validate", () => {

	it("emits the descriptions the shape accepts", async () => {

		const values: readonly unknown[] = [
			{ id: "https://example.com/1", label: "alpha" },
			{ id: "https://example.com/2", label: "beta" }
		];

		expect(await items(values)(validate(Item))(toArray())).toEqual([
			{ id: "https://example.com/1", label: "alpha" },
			{ id: "https://example.com/2", label: "beta" }
		]);

	});

	it("drops the descriptions the shape rejects", async () => {

		const values: readonly unknown[] = [
			{ id: "https://example.com/1", label: 1 },
			{ id: "https://example.com/2" },
			{ id: "https://example.com/3", label: "gamma", extra: "undeclared" },
			"https://example.com/4",
			{ id: "https://example.com/5", label: "epsilon" }
		];

		expect(await items(values)(validate(Item))(toArray())).toEqual([
			{ id: "https://example.com/5", label: "epsilon" }
		]);

	});

	it("propagates a source failure", async () => {

		const failing = items((async function* (): AsyncGenerator<unknown> {

			yield { id: "https://example.com/1", label: "alpha" };

			throw new Error("broken source"); // told apart from failures raised by the task by its message

		})());

		await expect(failing(validate(Item))(toArray())).rejects.toThrow("broken source");

	});

	it("emits a description as soon as it is drawn", async () => {

		const state = { pulled: 0 }; // records how far the task pulls the source

		async function* source(): AsyncIterable<unknown> {

			for (const index of Array.from({ length: 10 }, (_, i) => i)) { // generators have no functional equivalent

				state.pulled = index+1;

				yield { id: `https://example.com/${index}`, label: `label-${index}` };

			}

		}

		const values = validate(Item)(items(source()))[Symbol.asyncIterator]();

		expect((await values.next()).value).toEqual({ id: "https://example.com/0", label: "label-0" });
		expect(state.pulled).toBe(1);

		await values.return?.();

	});

});
