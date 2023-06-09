// Module imports
import { randomUUID } from 'node:crypto'





/**
 * Creates a function for generating unique log messages.
 *
 * @param {string} eventType The main type of the event.
 * @returns {Function} A unique log message generator.
 */
export function createEventLogger(eventType) {
	const eventID = randomUUID()

	/**
	 * @param {object} [data] Additional data to be logged.
	 */
	return (data = {}) => JSON.stringify({
		...data,
		eventID,
		eventType,
	})
}
