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

import type { Validator } from "@metreeca/core/trace";
import type { Task } from "@metreeca/flow";
import { filter } from "@metreeca/flow/tasks";
import { log } from "@metreeca/tape";


const logger = log(import.meta.url);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a value validation task.
 *
 * The task keeps the values a validator accepts and drops the ones it rejects, so that downstream tasks work only on
 * values known to meet the expected constraints.
 *
 * > [!NOTE]
 * >
 * > - **Incremental**: each accepted value is emitted as soon as it is drawn, so endless sources are processed for as
 * >   long as the feed is consumed.
 * > - **Streaming**: values are validated one at a time and none is retained, so memory use doesn't grow with the
 * >   length of the feed.
 * > - **Stateless**: each value is validated independently, so the result doesn't depend on how the feed is split
 * >   across nested feeds or runs.
 *
 * > [!WARNING]
 * >
 * > Rejected values are dropped and logged as warnings, together with the trace of their violations, and the feed runs
 * > to completion.
 *
 * @typeParam V The type of the validated values
 *
 * @param validator The validator applied to each value, reporting the trace of the violations it finds, or nothing if
 *                  the value meets every constraint
 *
 * @returns A task keeping the values accepted by `validator`
 *
 * @throws {@link !Error Error} While the feed is consumed, if the source feed fails or `validator` throws
 *
 * @group Factories
 */
export function validate<V>(validator: Validator<V>): Task<V> {

	return filter(value => {

		const trace = validator(value);

		if ( trace === undefined ) {

			return true;

		} else {

			logger.warn`invalid value (${JSON.stringify(trace)})`;

			return false;

		}

	});

}
