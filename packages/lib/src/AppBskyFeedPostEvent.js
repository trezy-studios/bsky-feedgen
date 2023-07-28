// Local imports
import { BaseFirehoseEvent } from './BaseFirehoseEvent.js'
import { Skeet } from './Skeet.js'
import { User } from './User.js'





/** @typedef {import('./types/OperationAction.js').OperationAction} OperationAction */

/**
 * Represents an object in the app.bsky.feed.like namespace.
 */
export class AppBskyFeedPostEvent extends BaseFirehoseEvent {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	/** @type {User} */
	#author

	/** @type {Skeet} */
	#skeet

	/** @type {string} */
	#uri





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new skeet event.
	 *
	 * @param {import('./FirehoseMessageOperation.js').FirehoseMessageOperation} operation The parent operation.
	 */
	constructor(operation) {
		super(operation)

		if (operation.action !== 'delete') {
			this.#skeet = new Skeet({
				agent: operation.agent,
				cid: operation.cid.toString(),
				did: operation.did,
				rkey: operation.rkey,
			})
		}
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Hydrates the event.
	 */
	async hydrate() {}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {OperationAction} The type of action represented by the parent operation. */
	get action() {
		return this.operation.action
	}

	/** @returns {User} The user who liked the associated skeet. */
	get author() {
		return this.#author
	}

	/** @returns {import('multiformats').CID} The cID of the operation. */
	get cid() {
		return this.operation.cid
	}

	/** @returns {string} The URI of the parent skeet. */
	get replyParent() {
		return this.operation.record?.reply?.parent.uri
	}

	/** @returns {string} The URI of the root skeet. */
	get replyRoot() {
		return this.operation.record?.root?.uri
	}

	/** @returns {*} Rich text facets. */
	get richText() {
		return this.#skeet.richText
	}

	/** @returns {Skeet} The associated skeet. */
	get skeet() {
		return this.#skeet
	}

	/** @returns {string} The body of the skeet. */
	get text() {
		return this.operation.record?.text
	}

	/** @returns {string} The AT URI of the skeet. */
	get uri() {
		if (!this.#uri) {
			this.#uri = `at://${this.operation.did}/${this.operation.path}`
		}

		return this.#uri
	}
}
