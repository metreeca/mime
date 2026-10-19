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
 * JSON-LD processing tasks.
 *
 * Provides ready-made {@link https://github.com/metreeca/flow @metreeca/flow} tasks for processing JSON-LD content in
 * pipelines run by the {@link https://github.com/metreeca/gear @metreeca/gear} executor, shaped by the
 * {@link https://github.com/metreeca/blue @metreeca/blue} blueprints that describe the linked data at hand.
 *
 * @module index
 *
 * @see {@link https://www.w3.org/TR/json-ld11/ JSON-LD 1.1}
 */

export * from "./validate.js";
