// Module imports
import bsky from '@atproto/api'





// Local imports
import { parseATURL } from './helpers/parseATURL.js'
import { User } from './User.js'





/**
 * A bsky post.
 */
export class Skeet {
	/****************************************************************************\
	 * Public static properties
	\****************************************************************************/

	/** @type {Set<Skeet>} */
	static collection = new Set

	/** @type {Map<string, Skeet>} */
	static collectionByCID = new Map

	/** @type {Map<string, Set<Skeet>>} */
	static collectionByDID = new Map

	/** @type {Map<string, Skeet>} */
	static collectionByRkey = new Map





	/****************************************************************************\
	 * Public static methods
	\****************************************************************************/

	/**
	 * Attempts to retrieve a skeet from the cache based on its CID.
	 *
	 * @param {string} cid The cID of the skeet.
	 * @returns {Skeet} The cached skeet.
	 */
	static getByCID(cid) {
		return Skeet.collectionByCID.get(cid)
	}

	/**
	 * Attempts to retrieve a user's skeets from the cache.
	 *
	 * @param {string} did The dID of the skeet's author.
	 * @returns {Set<Skeet>} All skeets cached by the user.
	 */
	static getByDID(did) {
		let didSet = Skeet.collectionByDID.get(did)

		if (!didSet) {
			didSet = new Set
			Skeet.collectionByDID.set(did, didSet)
		}

		return didSet
	}

	/**
	 * Attempts to retrieve a skeet from the cache based on its rkey.
	 *
	 * @param {string} rkey The rKey of the skeet.
	 * @returns {Skeet} The cached skeet.
	 */
	static getByRkey(rkey) {
		return Skeet.collectionByRkey.get(rkey)
	}





	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	/** @type {User} */
	#author

	/** @type {string} */
	#byLineMarkdown

	/** @type {string} */
	#byLineText

	/** @type {object} */
	#data = {
		value: {
			text: '',
		},
	}

	/** @type {Promise<Skeet>} */
	#hydrationPromise

	/** @type {boolean} */
	#isHydrated = false

	/** @type {boolean} */
	#isHydrating = false

	/** @type {boolean} */
	#isPublished = false

	/** @type {string} */
	#markdown = ''

	/** @type {object} */
	#params





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new skeet.
	 *
	 * @param {object} params Parameters required for creating a skeet.
	 * @param {import('@atproto/api').BskyAgent} params.agent bsky agent.
	 * @param {string} [params.body] The CID of the skeet.
	 * @param {string} [params.cid] The CID of the skeet.
	 * @param {string} [params.did] The DID of the author of the skeet.
	 * @param {string} [params.rkey] The rkey of the skeet.
	 */
	constructor(params) {
		const {
			agent,
			body,
			cid,
			did,
			rkey,
		} = params

		if (!agent) {
			throw new Error('agent is required')
		}

		this.#params = params

		if (body) {
			this.setBody(body)
		} else {
			if (!cid) {
				throw new Error('cid is required')
			}

			if (!did) {
				throw new Error('did is required')
			}

			if (!rkey) {
				throw new Error('rkey is required')
			}

			this.#addToCollections()
			this.#isPublished = true
		}
	}





	/****************************************************************************\
	 * Private instance methods
	\****************************************************************************/

	/**
	 * Adds this skeet to the appropriate collections.
	 */
	#addToCollections() {
		Skeet.collection.add(this)
		Skeet.collectionByCID.set(this.cid, this)
		Skeet.collectionByRkey.set(this.rkey, this)

		let didSet = Skeet.collectionByDID.get(this.did)

		if (!didSet) {
			didSet = new Set
			Skeet.collectionByDID.set(this.did, didSet)
		}

		didSet.add(this)
	}

	/**
	 * Hydrates a skeet with facets and other related data.
	 *
	 * @returns {Promise} A promise which resolves when the skeet has been hydrated.
	 */
	async #hydrate() {
		this.#author = new User({
			agent: this.agent,
			did: this.did,
		})

		this.#data = await this.agent.getPost({
			cid: this.cid,
			repo: this.did,
			rkey: this.rkey,
		})

		await this.#author.hydrate()
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Hydrates a skeet with facets and other related data.
	 *
	 * @returns {Promise<Skeet>} The hydrated skeet.
	 */
	async hydrate() {
		if (!this.#isPublished) {
			throw new Error('Can\'t hydrate an unpublished post!')
		}

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

	/**
	 * Publishes this skeet to the skyline.
	 *
	 * @returns {Promise<Skeet>} Returns itself for chaining.
	 */
	async publish() {
		const response = await this.agent.post({
			createdAt: (new Date).toISOString(),
			text: this.text,
		})

		this.#params.cid = response.cid

		const {
			did,
			rkey,
		} = parseATURL(response.uri)

		this.#params.did = did
		this.#params.rkey = rkey
		this.#isPublished = true

		await this.hydrate()

		return this
	}

	/**
	 * Updates the body ni all relevant fields.
	 *
	 * @param {string} body The body to be set.
	 */
	setBody(body) {
		this.#data.value.text = body

		const richText = new bsky.RichText({ text: body })
		richText.detectFacets(this.agent)

		this.#markdown = ''

		for (const segment of richText.segments()) {
			if (segment.isLink()) {
				this.#markdown += `[${segment.text}](${segment.link?.uri})`
			} else if (segment.isMention()) {
				this.#markdown += `[${segment.text}](https://staging.bsky.app/user/${segment.mention?.did})`
			} else {
				this.#markdown += segment.text
			}
		}
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {import('@atproto/api').BskyAgent} The bsky agent. */
	get agent() {
		return this.#params.agent
	}

	/** @returns {User} The author of this skeet. */
	get author() {
		return this.#author
	}

	/** @returns {string} The skeet's by line with markdown formatting. */
	get byLineMarkdown() {
		if (!this.#byLineMarkdown) {
			this.#byLineMarkdown = `[${this.#author.displayName} (@${this.#author.handle})](${this.#author.url}) at [<t:${Math.floor(this.createdAt.valueOf() / 1000)}:f>](${this.url})`
		}

		return this.#byLineMarkdown
	}

	/** @returns {string} The skeet's by line in plain text. */
	get byLineText() {
		if (!this.#byLineText) {
			const formatter = new Intl.DateTimeFormat('en-US', {
				dateStyle: 'short',
				timeStyle: 'short',
			})

			this.#byLineText = `${this.#author.displayName} (@${this.#author.handle}) at ${formatter.format(this.createdAt)}`
		}

		return this.#byLineText
	}

	/** @returns {string} The cid of this skeet. */
	get cid() {
		return this.#params.cid
	}

	/** @returns {Date} When this skeet was created. */
	get createdAt() {
		return new Date(this.#data.value.createdAt)
	}

	/** @returns {string} The DID of the author of this skeet. */
	get did() {
		return this.#params.did
	}

	/** @returns {string} The body of this skeet with markdown formatting. */
	get markdown() {
		return this.#markdown
	}

	/** @returns {string} The rkey of this skeet. */
	get rkey() {
		return this.#params.rkey
	}

	/** @returns {string} The body of this skeet as plain text. */
	get text() {
		return this.#data.value.text
	}

	/** @returns {string} The URL of this skeet. */
	get url() {
		return `https://bsky.app/profile/${this.#author.handle}/post/${this.rkey}`
	}
}
