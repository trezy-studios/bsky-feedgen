// Local imports
import { BaseFirehoseEvent } from './BaseFirehoseEvent.js'
import { parseATURL } from './index.js'
import { Skeet } from './Skeet.js'
import { User } from './User.js'





/** @typedef {import('./types/OperationAction.js').OperationAction} OperationAction */

/**
 * Represents an object in the app.bsky.feed.like namespace.
 */
export class AppBskyFeedLikeEvent extends BaseFirehoseEvent {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	/** @type {User} */
	#author

	/** @type {Skeet} */
	#skeet





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Hydrates the event.
	 */
	async hydrate() {
		this.#skeet = this.operation.firehose.api.createSkeet({
			cid: this.operation.record.subject.cid,
			...parseATURL(this.operation.record.subject.uri),
		})

		this.#author = this.operation.firehose.api.createUser({ did: this.operation.did })

		await Promise.all([
			this.#skeet.hydrate(),
			this.#author.hydrate(),
		])
	}





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

	/** @returns {Skeet} The associated skeet. */
	get skeet() {
		return this.#skeet
	}
}
