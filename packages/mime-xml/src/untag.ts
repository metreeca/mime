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

import type { Markdown } from "@metreeca/core/strings";
import type { Task } from "@metreeca/flow";
import { map } from "@metreeca/flow/tasks";
import type { AnyNode } from "domhandler";
import { process } from "./untag.core.js";


/**
 * Creates a Markdown renderer.
 *
 * The task converts a feed of parsed X/HTML trees into a feed of Markdown text, one rendering per tree, so that
 * consumers of prose, such as language models, work on text rather than on markup.
 *
 * Trees without content, title or base URL are rendered as an empty string, so that renderings stay aligned with the
 * input feed.
 *
 * If a tree has a title or a base URL, its rendering opens with a YAML frontmatter block holding them as `title` and
 * `url`. Values are written as quoted scalars, so that punctuation in headlines or query strings can't break the
 * block. Fields without a value are omitted.
 *
 * The title is the first `title` element outside page framing, so that captions of embedded objects are not mistaken
 * for it; a title without text is ignored. The base URL is the one recorded on the root element of the tree, or on the
 * first root element of a document; a base URL that doesn't resolve to an absolute URL is ignored.
 *
 * Elements are rendered as follows, with names matched case-insensitively:
 *
 * - `h1`, `h2`, `h3` — a heading of the matching level, set off by blank lines; omitted if it has no text
 * - `p`, `section`, `article` — the content, set off by blank lines
 * - `div` — the content, set off by blank lines if the element has text of its own or wraps a single element, and
 *   followed by a line break otherwise, so that fields read as paragraphs while layout wrappers don't split content
 *   into separate blocks
 * - `ul`, `ol` — a list, set off by blank lines; ordered lists are rendered as unordered ones
 * - `li` — an item marked with `-` and indented by two spaces for each enclosing list beyond the outermost; its content
 *   starts on the marker line; omitted if it has neither text nor images
 * - `br` — a line break; two or more consecutive breaks produce a single blank line, and breaks at the start of the
 *   text are dropped
 * - `hr` — a thematic break, set off by blank lines
 * - `a` — a link to the `href` target, labelled by the content; omitted if it has neither text nor images
 * - `img` — an image reference to the `src` target, labelled by the `alt` text
 * - `strong`, `b` — strong emphasis; surrounding whitespace is moved outside the markers, so that they are read as
 *   emphasis rather than as text; omitted if it has no text, though its whitespace is kept
 * - `em`, `i` — emphasis, rendered like strong emphasis
 * - `script` — a fenced `json` block set off by blank lines, if the type is `application/ld+json`; nothing otherwise
 * - `head`, `title`, `style`, `noscript` — nothing; the title is rendered in the frontmatter instead
 * - `nav`, `header`, `footer`, `aside`, `menu`, `menuitem`, `toolbar` — nothing, including all their content, so that
 *   page framing leaves no text behind
 * - `form`, `input`, `button`, `select`, `textarea`, `label`, `fieldset`, `legend` — nothing, including all their
 *   content, so that controls and their captions leave no text behind
 * - `iframe`, `embed`, `object`, `applet`, `canvas`, `svg`, `audio`, `video`, `track`, `source` — nothing, including
 *   all their content, so that embedded objects leave no text behind
 *
 * All other elements, including the `html` and `body` page wrappers, are rendered as their content. Content rendered
 * as nothing doesn't count when deciding whether links and items have text, so decorative links leave no empty labels
 * behind. It is also excluded from the text of headings, emphasis and the frontmatter title, so that captions of
 * controls and graphics don't leak into the surrounding prose.
 *
 * > [!IMPORTANT]
 * >
 * > Pages holding their content inside a form, such as filtered listings or pages wrapped in a server-side form, are
 * > rendered without that content, possibly as an empty string. For such pages, select the region to render with an
 * > {@link xpath} expression reaching inside the form; {@link focus} also treats forms as framing.
 *
 * In text, runs of spaces, control characters and typographic separators (including no-break spaces) are collapsed to
 * a single space. Whitespace at the edges of a text node is kept, so that emphasis misplaced with respect to the
 * surrounding spaces doesn't run words together. Comments are rendered as a space, so that words separated only by
 * framework markers or adjacent fields stay apart. Text directly adjacent to an element is joined to it without a
 * space, so that words split across element boundaries stay whole. Lines never start with a space, link labels never
 * end with one, and each rendering is trimmed.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each rendering is emitted as soon as its tree is drawn, so endless sources are processed for as
 * >   long as the feed is consumed.
 * > - **Streaming**: trees are processed one at a time and released once rendered, so memory use doesn't grow with the
 * >   length of the feed.
 * > - **Stateless**: each tree is rendered independently, so the result doesn't depend on how the feed is split across
 * >   nested feeds or runs.
 *
 * @returns A task converting a feed of parsed X/HTML trees into a feed of Markdown text
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails
 *
 * @see {@link https://spec.commonmark.org/ CommonMark Spec}
 * @see {@link https://json-ld.org/ JSON-LD}
 * @see {@link https://www.w3.org/TR/xmlbase/ XML Base}
 *
 * @group Factories
 */
export function untag(): Task<AnyNode, Markdown> {

	return map(process);

}
