/**
 * @typedef {object} FeedObject
 * @property {string} [cursor] Pagination cursor.
 * @property {FeedObjectSkeet[]} feed Pagination cursor.
 */

/**
 * @typedef {object} FeedObjectSkeet
 * @property {string} post The URI of the skeet.
 */

/**
 * Base Feed class.
 */
export class Feed {
	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/** Creates a new feed instance. */
	constructor() {
		if (!('generateFeed' in this)) {
			throw new Error('`generateFeed` is required.')
		}

		if (typeof this.generateFeed !== 'function') {
			throw new Error('`generateFeed` must be a function.')
		}

		if (!('rkey' in this)) {
			throw new Error('`rkey` is required.')
		}

		if (typeof this.rkey !== 'string') {
			throw new Error('`rkey` must be a string.')
		}
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Generate the feed.
	 *
	 * @param {string} [cursor] Pagination cursor.
	 * @param {number} [limit] The maximum number of feed items to return.
	 * @returns {Promise<FeedObject> | FeedObject} The feed.
	 */
	generateFeed(cursor, limit = 30) {
		return { feed: [] }
	}

	/**
	 * Determines whether a skeet is relevant or not.
	 *
	 * @param {{
	 * 	text: string,
	 * 	replyParent: string,
	 * }} skeet The skeet to test.
	 * @returns {Promise<boolean> | boolean} Whether the skeet is relevant to the feed.
	 */
	testSkeet(skeet) {
		return false
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {string} The description of the feed. */
	get description() {
		return ''
	}

	/** @returns {string} The display name of the feed. */
	get name() {
		return ''
	}

	/** @returns {string} The DID of the feed's owner. */
	get ownerDID() {
		return ''
	}

	/** @returns {string} The record key of the feed. */
	get rkey() {
		return ''
	}
}
