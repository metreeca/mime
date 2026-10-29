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

import { pipe } from "@metreeca/flow";
import { items } from "@metreeca/flow/feeds";
import { toArray } from "@metreeca/flow/sinks";
import type { AnyNode } from "domhandler";
import { describe, expect, it } from "vitest";
import { html } from "./html.js";
import { unwrap } from "./unwrap.js";


function page({ head = "", body = "" }: { head?: string, body?: string }): string {
	return `<html lang="en"><head><title>Page</title>${head}</head><body>${body}</body></html>`;
}

function ld(text: string): string {
	return `<script type="application/ld+json">${text}</script>`;
}

async function trees(...pages: readonly string[]): Promise<readonly AnyNode[]> {
	return pipe((items(pages))(html())(toArray()));
}

async function unwrapped(page: string): Promise<unknown> {

	const [values] = await pipe((items([page]))(html())(unwrap())(toArray()));

	return values;

}


describe("unwrap()", () => {

	describe("on a feed", () => {

		it("emits one list per tree in feed order, empty for a tree embedding nothing", async () => {

			const feed = items(await trees(page({ head: ld(`{ "@type": "Event" }`) }), page({})));

			expect(await pipe(feed(unwrap())(toArray()))).toEqual([[{ "@type": "Event" }], []]);

		});

		it("fails while consumed if the source feed fails", async () => {

			async function* failing(): AsyncGenerator<AnyNode> {
				throw new Error("failed source");
			}

			await expect(pipe((items(failing()))(unwrap())(toArray()))).rejects.toThrow("failed source");

		});

	});

	describe("extraction", () => {

		it("emits the blocks of head and body in document order", async () => {

			expect(await unwrapped(page({
				head: ld(`{ "@type": "Organization" }`),
				body: ld(`{ "@type": "Event" }`)
			}))).toEqual([{ "@type": "Organization" }, { "@type": "Event" }]);

		});

		it("emits blocks as stated, without expanding arrays or @graph members", async () => {

			expect(await unwrapped(page({
				head: ld(`[{ "@type": "Event" }, { "@type": "Place" }]`),
				body: ld(`{ "@graph": [{ "@type": "Event" }] }`)
			}))).toEqual([
				[{ "@type": "Event" }, { "@type": "Place" }],
				{ "@graph": [{ "@type": "Event" }] }
			]);

		});

		it("preserves whitespace inside string values", async () => {

			expect(await unwrapped(page({ head: ld(`{ "name": "  a  b  " }`) }))).toEqual([{ "name": "  a  b  " }]);

		});

		it("skips blocks failing to parse, keeping the ones beside them", async () => {

			expect(await unwrapped(page({ head: ld(`{ "@type": `) + ld(`{ "@type": "Event" }`) })))
				.toEqual([{ "@type": "Event" }]);

		});

		it("ignores scripts of other types", async () => {

			expect(await unwrapped(page({
				head: `<script>var SYM = {};</script><script type="application/json">{ "a": 1 }</script>`
			}))).toEqual([]);

		});

		it("emits an empty list for a tree embedding nothing", async () => {

			expect(await unwrapped(page({ body: "<p>Text</p>" }))).toEqual([]);

		});

	});

});
