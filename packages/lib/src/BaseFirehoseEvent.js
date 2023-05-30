// Local imports
import { UNIMPLEMENTED_METHOD } from './helpers/messageGenerators.js'





/** @typedef {import('./FirehoseMessageOperation.js').FirehoseMessageOperation} FirehoseMessageOperation */

/**
 * Represents an object in the app.bsky.feed.like namespace.
 */
export class BaseFirehoseEvent {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	/** @type {FirehoseMessageOperation} */
	#operation





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new bsky like.
	 *
	 * @param {FirehoseMessageOperation} operation The parent operation.
	 */
	constructor(operation) {
		this.#operation = operation
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * No-op: implement this method on subclasses.
	 */
	parse() {
		throw new Error(UNIMPLEMENTED_METHOD('parse'))
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {FirehoseMessageOperation} The parent operation. */
	get operation() {
		return this.#operation
	}

	/** @returns {string} The path of the operation. */
	get path() {
		return this.#operation.path
	}
}
