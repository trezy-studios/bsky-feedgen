/** @typedef {import('../types/OperationAction.js').OperationAction} OperationAction */
/**
 * Generates the event name for a connection being closed.
 *
 * @returns {string} The generated event name.
 */
export function CONNECTION_CLOSED() {
	return 'connection::closed'
}

/**
 * Generates the event name for a connection error.
 *
 * @returns {string} The generated event name.
 */
export function CONNECTION_ERROR() {
	return 'connection::error'
}

/**
 * Generates the event name for a connection being opened.
 *
 * @returns {string} The generated event name.
 */
export function CONNECTION_OPENED() {
	return 'connection::opened'
}

/**
 * Generates the event name for a firehose event.
 *
 * @param {string} eventNamespace The event namespace.
 * @returns {string} The generated event name.
 */
export function FIREHOSE_EVENT(eventNamespace) {
	return eventNamespace
}

/**
 * Generates the event name for a firehose event.
 *
 * @param {string} eventNamespace The event namespace.
 * @param {OperationAction} action The action type of the event.
 * @returns {string} The generated event name.
 */
export function FIREHOSE_EVENT_ACTION(eventNamespace, action) {
	return `${FIREHOSE_EVENT(eventNamespace)}::${action}`
}

/**
 * Generates the event name for a message.
 *
 * @returns {string} The generated event name.
 */
export function MESSAGE() {
	return 'message'
}

/**
 * Generates the event name for a parsed message.
 *
 * @returns {string} The generated event name.
 */
export function PARSED_MESSAGE() {
	return `${MESSAGE()}::parsed`
}

/**
 * Generates the event name for a raw message.
 *
 * @returns {string} The generated event name.
 */
export function RAW_MESSAGE() {
	return `${MESSAGE()}::raw`
}
