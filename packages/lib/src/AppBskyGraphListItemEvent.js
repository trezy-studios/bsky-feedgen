// Local imports
import { BaseFirehoseEvent } from './BaseFirehoseEvent.js'





/** @typedef {import('./types/OperationAction.js').OperationAction} OperationAction */

/**
 * Represents an object in the app.bsky.feed.like namespace.
 */
export class AppBskyGraphListItemEvent extends BaseFirehoseEvent {
	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {OperationAction} The type of action represented by the parent operation. */
	get action() {
		return this.operation.action
	}

	/** @returns {import('multiformats').CID} The cID of the operation. */
	get cid() {
		return this.operation.cid
	}

	/** @returns {string} The AT URI of the list. */
	get list() {
		return this.operation.record?.list
	}

	/** @returns {string} The AT URI of the list. */
	get listOwner() {
		return this.operation.did
	}

	/** @returns {string} The rKey of the list item */
	get rkey() {
		return this.operation.rkey
	}

	/** @returns {string} The dID of the user. */
	get subject() {
		return this.operation.record?.subject
	}
}
