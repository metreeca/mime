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

import type { Task } from "@metreeca/flow";
import { items } from "@metreeca/flow/feeds";
import type { AnyNode, Document } from "domhandler";
import { process } from "./focus.core.js";


/**
 * Creates a content extractor.
 *
 * The task converts a feed of parsed X/HTML trees into a feed of documents holding their main content, one document per
 * tree, so that downstream tasks work on the content of a page without its navigation, headers, footers, sidebars and
 * controls.
 *
 * Trees without content produce no document, so the output feed is not aligned one to one with the input feed.
 *
 * The main content of a tree is the first of the following regions the tree contains:
 *
 * 1. the first `main` element or, if there is none, the first element with `role="main"`
 * 2. all `article` elements, taken together, so that listing pages are kept whole; articles inside page framing
 *    (navigation, headers, footers, sidebars and the like), articles nested inside other articles, and articles
 *    without any text are ignored
 * 3. the element with the densest text, as described below
 *
 * Regions are searched below the root of the tree, so a tree rooted at a `main` element is searched for a region
 * inside it. Element names are matched case-insensitively.
 *
 * Text density favours long runs of text over the same amount of text split into short fragments, and penalises
 * containers holding a large share of framing. Scripts, styles, navigation, headers, footers, sidebars, controls and
 * embedded objects contribute no text, so pages with long menus are scored on their prose alone. Elements without text
 * of their own, such as line breaks, rules, images and metadata, are neutral. If two elements are equally dense, the
 * first one in document order is selected, which is the outermost of a chain of single children.
 *
 * If the tree is a page, that is if it contains an `html` or `body` element or a title, the content is wrapped in the
 * `body` of a new `html` element. If the page has a title, the `html` element also includes a `head` with a copy of
 * it. The title is the first `title` element outside page framing, so that captions of embedded objects are not
 * mistaken for it. If the tree is a fragment, each content region becomes a document root of its own.
 *
 * Each content region records as `xml:base` the base URL in scope at its original position, if any, so that its
 * relative references keep resolving correctly. In page output, the `html` element also records as `xml:base` the base
 * URL of the source tree, so that the page URL travels with its content. Source trees are not modified.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each document is emitted as soon as its tree is drawn, so endless sources are processed for as
 * >   long as the feed is consumed.
 * > - **Streaming**: trees are processed one at a time and released once their content is copied, so memory use
 * >   doesn't grow with the length of the feed.
 * > - **Stateless**: each tree is processed independently, so the result doesn't depend on how the feed is split
 * >   across nested feeds or runs.
 *
 * @returns A task converting a feed of parsed X/HTML trees into a feed of documents holding their main content
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails
 *
 * @see {@link https://html.spec.whatwg.org/multipage/sections.html#the-main-element WHATWG HTML - The main element}
 * @see {@link https://html.spec.whatwg.org/multipage/sections.html#the-article-element WHATWG HTML - The article
 * element}
 * @see {@link https://www.w3.org/TR/wai-aria-1.2/#main WAI-ARIA - main role}
 *
 * @group Factories
 */
export function focus(): Task<AnyNode, Document> {

	return trees => items((async function* () {

		for await (const tree of trees) {

			const main = process(tree);

			if ( main !== undefined ) { // a tree holding no content contributes no value

				yield main;

			}

		}

	})());

}
