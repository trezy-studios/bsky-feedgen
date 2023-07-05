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

	/** @type {string} */
	#description

	/** @type {string} */
	#image

	/** @type {string} */
	#name

	/** @type {string} */
	#ownerDID

	/** @type {string} */
	#rkey





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new feed instance.
	 *
	 * @param {object} config All configuration options.
	 * @param {string} config.description The description of the feed.
	 * @param {string} config.image The filename of an image to be used as the thumbnail for this feed.
	 * @param {string} config.name The display name of the feed.
	 * @param {string} config.ownerDID The DID of the feed's owner.
	 * @param {string} config.rkey The record key of the feed.
	 */
	constructor(config) {
		const {
			description,
			image,
			name,
			ownerDID,
			rkey,
		} = config

		if (!('description' in config)) {
			throw new Error('`description` is required.')
		}

		if (!('image' in config)) {
			throw new Error('`image` is required.')
		}

		if (!('name' in config)) {
			throw new Error('`name` is required.')
		}

		if (!('ownerDID' in config)) {
			throw new Error('`ownerDID` is required.')
		}

		if (!('rkey' in config)) {
			throw new Error('`rkey` is required.')
		}

		if (!('generateFeed' in this)) {
			throw new Error('`generateFeed` is required.')
		}

		if (typeof this.generateFeed !== 'function') {
			throw new Error('`generateFeed` must be a function.')
		}

		this.#description = description
		this.#image = image
		this.#name = name
		this.#ownerDID = ownerDID
		this.#rkey = rkey
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
		return this.#description
	}

	/** @returns {string} The filename of an image to be used as the thumbnail for this feed. */
	get image() {
		return this.#image
	}

	/** @returns {string} The display name of the feed. */
	get name() {
		return this.#name
	}

	/** @returns {string} The DID of the feed's owner. */
	get ownerDID() {
		return this.#ownerDID
	}

	/** @returns {string} The record key of the feed. */
	get rkey() {
		return this.#rkey
	}
}
