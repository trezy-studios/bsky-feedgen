// Module imports
import { CarReader } from '@ipld/car'
import { decode } from 'cbor-x'





// Local imports
import {
	UNIMPLEMENTED_NAMESPACE,
	UNRECOGNISED_NAMESPACE,
} from './helpers/messageGenerators.js'
import { AppBskyFeedLikeEvent } from './AppBskyFeedLikeEvent.js'
import { AppBskyFeedPostEvent } from './AppBskyFeedPostEvent.js'
import { AppBskyGraphListItemEvent } from './AppBskyGraphListItemEvent.js'
import { CID } from 'multiformats'
import { FIREHOSE_EVENT_ACTION } from './helpers/eventNames.js'





/** @typedef {import('./Firehose.js').Firehose} Firehose */
/** @typedef {import('./FirehoseMessage.js').FirehoseMessage} FirehoseMessage */
/** @typedef {import('./types/RawFirehoseMessageOp.js').RawFirehoseMessageOp} RawFirehoseMessageOp */
/** @typedef {string[]} MessageNamespace */
/** @typedef {import('./types/OperationAction.js').OperationAction} OperationAction */

/**
 * A message from the firehose.
 */
export class FirehoseMessageOperation {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	/** @type {object} */
	#entity

	/** @type {boolean} */
	#isParsed = false

	/** @type {FirehoseMessage} */
	#message

	/** @type {MessageNamespace} */
	#namespace

	/** @type {RawFirehoseMessageOp} */
	#operation

	/** @type {object} */
	#record

	/** @type {string} */
	#rkey





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new instance of a firehose message operation.
	 *
	 * @param {RawFirehoseMessageOp} operation The operation.
	 * @param {FirehoseMessage} message The message this operation belongs to.
	 */
	constructor(operation, message) {
		this.#operation = operation
		this.#message = message

		try {
			// eslint-disable-next-line security/detect-unsafe-regex
			const { groups } = /^(?<namespaceString>(?:\w+\.){3}\w+)\/(?<rkey>[-_~.%a-z\d]{1,512})$/giu.exec(operation.path)

			const {
				namespaceString,
				rkey,
			} = groups

			this.#namespace = namespaceString.split('.')
			this.#rkey = rkey
		} catch (error) {
			console.log('new FirehoseMessageOperation', error)
		}
	}





	/****************************************************************************\
	 * Private instance methods
	\****************************************************************************/

	/**
	 * Retrieves and decodes a record from the CAR file.
	 *
	 * @param {CID | string} cid The CID of he blocks to be retrieved.
	 * @returns {Promise<object>} The retrieved record.
	 */
	async #getRecord(cid) {
		if (!(cid instanceof CID)) {
			cid = CID.parse(cid)
		}

		const block = await this.car.get(cid)

		if (block) {
			return decode(block.bytes)
		}

		return null
	}

	/**
	 * Parses the message using the app.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseAppNamespace() {
		switch (this.namespace[1]) {
			case 'bsky':
				return this.#parseAppBskyNamespace()

			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseAppBskyNamespace() {
		switch (this.namespace[2]) {
			case 'actor':
				return this.#parseAppBskyActorNamespace()

			case 'embed':
				return this.#parseAppBskyEmbedNamespace()

			case 'feed':
				return this.#parseAppBskyFeedNamespace()

			case 'graph':
				return this.#parseAppBskyGraphNamespace()

			case 'notification':
				return this.#parseAppBskyNotificationNamespace()

			case 'richtext':
				return this.#parseAppBskyRichTextNamespace()

			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.actor.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseAppBskyActorNamespace() {
		switch (this.namespace[3]) {
			case 'profile':
				return this.#parseAppBskyActorProfileNamespace()

			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.actor.profile namespace.
	 */
	#parseAppBskyActorProfileNamespace() {
		// console.log(UNIMPLEMENTED_NAMESPACE(this.serialisedNamespace))
	}

	/**
	 * Parses the message using the app.bsky.embed.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseAppBskyEmbedNamespace() {
		switch (this.namespace[3]) {
			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.feed.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseAppBskyFeedNamespace() {
		switch (this.namespace[3]) {
			case 'follow':
				return this.#parseAppBskyFeedFollowNamespace()

			case 'like':
				return this.#parseAppBskyFeedLikeNamespace()

			case 'post':
				return this.#parseAppBskyFeedPostNamespace()

			case 'repost':
				return this.#parseAppBskyFeedRepostNamespace()

			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.feed.follow namespace.
	 */
	#parseAppBskyFeedFollowNamespace() {
		// console.log(UNIMPLEMENTED_NAMESPACE(this.serialisedNamespace))
	}

	/**
	 * Parses the message using the app.bsky.feed.like namespace.
	 *
	 * @returns {Promise<AppBskyFeedLikeEvent>} The like event.
	 */
	async #parseAppBskyFeedLikeNamespace() {
		this.#entity = new AppBskyFeedLikeEvent(this)

		if (this.firehose?.options.autoHydrate && ['create', 'update'].includes(this.action)) {
			await this.#entity.hydrate()
		}

		if (this.firehose) {
			this.firehose.emit(FIREHOSE_EVENT_ACTION(this.serialisedNamespace, this.action), this.#entity)
		}

		return this.#entity
	}

	/**
	 * Parses the message using the app.bsky.feed.post namespace.
	 *
	 * @returns {object} The event entity.
	 */
	#parseAppBskyFeedPostNamespace() {
		this.#entity = new AppBskyFeedPostEvent(this)

		if (this.firehose) {
			this.firehose.emit(FIREHOSE_EVENT_ACTION(this.serialisedNamespace, this.action), this.#entity)
		}

		return this.#entity
	}

	/**
	 * Parses the message using the app.bsky.feed.repost namespace.
	 */
	#parseAppBskyFeedRepostNamespace() {
		// console.log(UNIMPLEMENTED_NAMESPACE(this.serialisedNamespace))
	}

	/**
	 * Parses the message using the app.bsky.graph.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseAppBskyGraphNamespace() {
		switch (this.namespace[3]) {
			case 'block':
				return this.#parseAppBskyGraphBlockNamespace()

			case 'follow':
				return this.#parseAppBskyGraphFollowNamespace()

			case 'list':
				return this.#parseAppBskyGraphListNamespace()

			case 'listitem':
				return this.#parseAppBskyGraphListItemNamespace()

			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.graph.follow namespace.
	 */
	#parseAppBskyGraphBlockNamespace() {
		throw new Error(UNIMPLEMENTED_NAMESPACE(this.serialisedNamespace))
	}

	/**
	 * Parses the message using the app.bsky.graph.follow namespace.
	 */
	#parseAppBskyGraphFollowNamespace() {
		throw new Error(UNIMPLEMENTED_NAMESPACE(this.serialisedNamespace))
	}

	/**
	 * Parses the message using the app.bsky.graph.list namespace.
	 */
	#parseAppBskyGraphListNamespace() {
		throw new Error(UNIMPLEMENTED_NAMESPACE(this.serialisedNamespace))
	}

	/**
	 * Parses the message using the app.bsky.graph.listitem namespace.
	 *
	 * @returns {object} The event entity.
	 */
	#parseAppBskyGraphListItemNamespace() {
		this.#entity = new AppBskyGraphListItemEvent(this)

		if (this.firehose) {
			this.firehose.emit(FIREHOSE_EVENT_ACTION(this.serialisedNamespace, this.action), this.#entity)
		}

		return this.#entity
	}

	/**
	 * Parses the message using the app.bsky.notification.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseAppBskyNotificationNamespace() {
		switch (this.namespace[3]) {
			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.richtext.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseAppBskyRichTextNamespace() {
		switch (this.namespace[3]) {
			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the com.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComNamespace() {
		switch (this.namespace[1]) {
			case 'atproto':
				return this.#parseComATProtoNamespace()

			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComATProtoNamespace() {
		switch (this.namespace[2]) {
			case 'admin':
				return this.#parseComATProtoAdminNamespace()

			case 'identity':
				return this.#parseComATProtoIdentityNamespace()

			case 'label':
				return this.#parseComATProtoLabelNamespace()

			case 'moderation':
				return this.#parseComATProtoModerationNamespace()

			case 'repo':
				return this.#parseComATProtoRepoNamespace()

			case 'server':
				return this.#parseComATProtoServerNamespace()

			case 'sync':
				return this.#parseComATProtoSyncNamespace()

			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}
	}

	/**
	 * Parses the message using the app.bsky.admin.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComATProtoAdminNamespace() {}

	/**
	 * Parses the message using the app.bsky.identity.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComATProtoIdentityNamespace() {}

	/**
	 * Parses the message using the app.bsky.label.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComATProtoLabelNamespace() {}

	/**
	 * Parses the message using the app.bsky.moderation.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComATProtoModerationNamespace() {}

	/**
	 * Parses the message using the app.bsky.repo.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComATProtoRepoNamespace() {}

	/**
	 * Parses the message using the app.bsky.server.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComATProtoServerNamespace() {}

	/**
	 * Parses the message using the app.bsky.sync.* namespace.
	 *
	 * @returns {*} The result of the subparser.
	 */
	#parseComATProtoSyncNamespace() {}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Parses the operation data.
	 */
	async parse() {
		if (this.#isParsed) {
			return
		}

		if (this.cid) {
			this.#record = await this.#getRecord(this.cid)
		}

		switch (this.namespace[0]) {
			case 'app':
				this.#parseAppNamespace()
				break

			case 'com':
				this.#parseComNamespace()
				break

			default:
				throw new Error(UNRECOGNISED_NAMESPACE(this.serialisedNamespace))
		}

		this.#isParsed = true
	}

	/**
	 * Returns a plain object representing this operation.
	 *
	 * @returns {object} A plain object representing the deserialised operation.
	 */
	valueOf() {
		return { namespace: this.serialisedNamespace }
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {OperationAction} The type of action represented by this operation. */
	get action() {
		return this.#operation.action
	}

	/** @returns {import('@atproto/api').BskyAgent} The agent to be used for resolving PDS data. */
	get agent() {
		return this.#message.agent
	}

	/** @returns {string} The text of the skeet. */
	get body() {
		return this.#record.text
	}

	/** @returns {CarReader} The message archive. */
	get car() {
		return this.#message.car
	}

	/** @returns {CID} The cID of the operation. */
	get cid() {
		return this.#operation.cid
	}

	/** @returns {string} The date string representing when the operation was created. */
	get createdAt() {
		return this.#record.createdAt
	}

	/** @returns {string} The dID of the repo this operation belongs to. */
	get did() {
		return this.#message.did
	}

	/** @returns {*} The entity represented by this operation. */
	get entity() {
		return this.#entity
	}

	/** @returns {Firehose} The firehose instance that owns the parent message. */
	get firehose() {
		return this.#message.firehose
	}

	/** @returns {boolean} Whether the message has been parsed. */
	get isParsed() {
		return this.#isParsed
	}

	/** @returns {MessageNamespace} The message's namespace. */
	get namespace() {
		return this.#namespace
	}

	/** @returns {string} The operation's path. */
	get path() {
		return this.#operation.path
	}

	/** @returns {RawFirehoseMessageOp} The raw operation. */
	get raw() {
		return this.#operation
	}

	/** @returns {string} The namespace as a string. */
	get serialisedNamespace() {
		return this.namespace.join('.')
	}

	/** @returns {object} The operation's record. */
	get record() {
		return this.#record
	}

	/** @returns {string} The rKey of the operation. */
	get rkey() {
		return this.#rkey
	}

	/** @returns {Date} The timestamp of the operation. */
	get timestamp() {
		if (this.#record.createdAt) {
			return new Date(this.#record.createdAt)
		}

		// eslint-disable-next-line no-undefined
		return undefined
	}
}
