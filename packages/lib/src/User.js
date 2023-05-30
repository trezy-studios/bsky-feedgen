/**
 * A bsky user.
 */
export class User {
	/****************************************************************************\
	 * Public static properties
	\****************************************************************************/

	/** @type {Set<User>} */
	static collection = new Set

	/** @type {Map<string, User>} */
	static collectionByDID = new Map





	/****************************************************************************\
	 * Public static methods
	\****************************************************************************/

	/**
	 * Attempts to retrieve a user from the cache based on their dID.
	 *
	 * @param {string} did The dID of the user.
	 * @returns {User} The cached user.
	 */
	static getByDID(did) {
		return User.collectionByDID.get(did)
	}





	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	/** @type {Promise<User>} */
	#hydrationPromise

	/** @type {boolean} */
	#isHydrated = false

	/** @type {boolean} */
	#isHydrating = false

	/** @type {object} */
	#params

	/** @type {object} */
	#profile

	/** @type {object} */
	#repo





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new bsky user.
	 *
	 * @param {object} params Parameters for creating a user.
	 * @param {import('@atproto/api').BskyAgent} params.agent bsky agent.
	 * @param {string} params.did The dID of the user.
	 */
	constructor(params) {
		const {
			agent,
			did,
		} = params

		if (!agent) {
			throw new Error('agent is required')
		}

		if (!did) {
			throw new Error('did is required')
		}

		this.#params = params

		this.#addToCollections()
	}





	/****************************************************************************\
	 * Private instance methods
	\****************************************************************************/

	/**
	 * Adds this skeet to the appropriate collections.
	 */
	#addToCollections() {
		User.collection.add(this)
		User.collectionByDID.set(this.did, this)
	}

	/**
	 * Hydrates a user with their repo and profile data.
	 *
	 * @returns {Promise} A promise which resolves when the user has been hydrated.
	 */
	async #hydrate() {
		this.#repo = await this.agent.com.atproto.repo.describeRepo({ repo: this.did })
		this.#profile = await this.agent.getProfile({ actor: this.#repo.data.handle })
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Hydrates a user with their repo and profile data.
	 *
	 * @returns {Promise<User>} The user.
	 */
	async hydrate() {
		if (this.#isHydrated) {
			return this
		}

		if (this.#isHydrating) {
			return this.#hydrationPromise
		}

		this.#isHydrating = true
		this.#hydrationPromise = await this.#hydrate()
		this.#isHydrated = true
		this.#isHydrating = false

		return this
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {import('@atproto/api').BskyAgent} The bsky agent. */
	get agent() {
		return this.#params.agent
	}

	/** @returns {string} The URL to the user's avatar. */
	get avatar() {
		return this.#profile.data.avatar
	}

	/** @returns {string} The user's DID. */
	get did() {
		return this.#params.did
	}

	/** @returns {string} The user's display name. */
	get displayName() {
		return this.#profile.data.displayName
	}

	/** @returns {string} The user's handle. */
	get handle() {
		return this.#profile.data.handle
	}

	/** @returns {string} The user's profile URL. */
	get url() {
		return `https://bsky.app/profile/${this.handle}`
	}
}
