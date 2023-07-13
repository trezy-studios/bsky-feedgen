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
	 * Logs the passed data with the associated event ID.
	 *
	 * @param {object} [data] Additional data to be logged.
	 * @returns {object} A JSON string.
	 */
	return (data = {}) => ({
		...data,
		eventID,
		eventType,
	})
}
