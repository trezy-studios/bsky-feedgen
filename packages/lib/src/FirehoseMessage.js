// Module imports
import { CarReader } from '@ipld/car'
import { decodeMultiple } from 'cbor-x'





// Local imports
import { FirehoseMessageOperation } from './FirehoseMessageOperation.js'





/** @typedef {import('./types/RawFirehoseMessage.js').RawFirehoseMessage} RawFirehoseMessage */
/** @typedef {import('./types/RawFirehoseMessageHeader.js').RawFirehoseMessageHeader} RawFirehoseMessageHeader */
/** @typedef {import('./types/RawFirehoseMessageOp.js').RawFirehoseMessageOp} RawFirehoseMessageOp */

/** @typedef {import('multiformats').CID} CID */
/** @typedef {[RawFirehoseMessageHeader, RawFirehoseMessage]} DecodedMessage */
/** @typedef {string[]} MessageNamespace */
/** @typedef {import('./Firehose.js').Firehose} Firehose */
/** @typedef {import('ws').RawData} RawData */

/**
 * A message from the firehose.
 */
export class FirehoseMessage {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	/** @type {import('@atproto/api').BskyAgent} */
	#agent

	/** @type {RawFirehoseMessage} */
	#body

	/** @type {CarReader} */
	#car

	/** @type {boolean} */
	#carIsParsed = false

	/** @type {DecodedMessage} */
	#decodedMessage

	/** @type {Firehose} */
	#firehose

	/** @type {RawFirehoseMessageHeader} */
	#header

	/** @type {MessageNamespace} */
	#namespace

	/** @type {FirehoseMessageOperation[]} */
	#operations = []

	/** @type {boolean} */
	#operationsAreParsed = false

	/** @type {RawData} */
	#rawMessage





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new instance of a firehose message.
	 *
	 * @param {RawData} data The message data.
	 * @param {object} config All config.
	 * @param {import('@atproto/api').BskyAgent} [config.agent] The agent to use for resolving PDs data.
	 * @param {Firehose} [config.firehose] The firehose instance that owns this message.
	 */
	constructor(data, config) {
		const {
			agent,
			firehose,
		} = config

		this.#agent = agent
		this.#firehose = firehose
		this.#rawMessage = data

		// @ts-ignore
		this.#decodedMessage = decodeMultiple(new Uint8Array(data))

		if (!this.#decodedMessage) {
			return
		}

		const [
			header,
			body,
		] = this.#decodedMessage

		this.#header = header
		this.#body = body
	}





	/****************************************************************************\
	 * Private instance methods
	\****************************************************************************/

	/**
	 * Parses the message as a commit.
	 */
	async #parseAsCommit() {
		await this.#parseCAR()

		for (const op of this.#rawOperations) {
			const operation = new FirehoseMessageOperation(op, this)

			await operation.parse()

			this.#operations.push(operation)
		}
	}

	/**
	 * Parses the message as a handle.
	 */
	async #parseAsHandle() {}

	/**
	 * Parses the message as an info.
	 */
	async #parseAsInfo() {}

	/**
	 * Parses the message as a migration.
	 */
	async #parseAsMigrate() {}

	/**
	 * Parses the message as a tombstone.
	 */
	async #parseAsTombstone() {}

	/**
	 * Parses the CAR file.
	 *
	 * @returns {Promise<CarReader>} The parsed CAR file.
	 */
	async #parseCAR() {
		if (this.#carIsParsed) {
			return
		}

		try {
			this.#car = await CarReader.fromBytes(this.#blocks)
		} catch (error) {
			console.log('#parseAsCommit', error, this.#body)
		}

		this.#carIsParsed = true
		return this.#car
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Parses the message's operations.
	 */
	async parseOperations() {
		if (this.#operationsAreParsed) {
			return
		}

		if (this.isCommit) {
			await this.#parseAsCommit()
		} else if (this.isHandle) {
			await this.#parseAsHandle()
		} else if (this.isInfo) {
			await this.#parseAsInfo()
		} else if (this.isMigrate) {
			await this.#parseAsMigrate()
		} else if (this.isTombstone) {
			await this.#parseAsTombstone()
		}

		this.#operationsAreParsed = true
	}





	/****************************************************************************\
	 * Private instance getters/setters
	\****************************************************************************/

	/** @returns {Uint8Array} All blocks tied to this message. */
	get #blocks() {
		return this.#body.blocks
	}

	/** @returns {RawFirehoseMessageOp[]} All operations tied to this message. */
	get #rawOperations() {
		return this.#body.ops
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {import('@atproto/api').BskyAgent} The agent to use for resolving PDS data. */
	get agent() {
		return this.#agent ?? this.#firehose?.api.agent
	}

	/** @returns {CarReader} The CAR file. */
	get car() {
		return this.#car
	}

	/** @returns {boolean} Whether the message's CAR file has been parsed. */
	get carIsParsed() {
		return this.#carIsParsed
	}

	/** @returns {CID} The cID of the message. */
	get cid() {
		return this.#body.commit
	}

	/** @returns {DecodedMessage} The raw message data. */
	get decodedMessage() {
		return this.#decodedMessage
	}

	/** @returns {string} The dID of the repo this message belongs to. */
	get did() {
		return this.#body.did ?? this.#body.repo
	}

	/** @returns {Firehose} The firehose instance that owns this message. */
	get firehose() {
		return this.#firehose
	}

	/** @returns {boolean} Whether this message is a commit operation. */
	get isCommit() {
		return this.#header.t === '#commit'
	}

	/** @returns {boolean} Whether this message is a handle operation. */
	get isHandle() {
		return this.#header.t === '#handle'
	}

	/** @returns {boolean} Whether this message is a info operation. */
	get isInfo() {
		return this.#header.t === '#info'
	}

	/** @returns {boolean} Whether this message is a migrate operation. */
	get isMigrate() {
		return this.#header.t === '#migrate'
	}

	/** @returns {boolean} Whether the message requires a rebase. */
	get isRebase() {
		return this.#body.rebase
	}

	/** @returns {boolean} Whether this message is a tombstone operation. */
	get isTombstone() {
		return this.#header.t === '#tombstone'
	}

	/** @returns {boolean} Whether the message is too big. */
	get isTooBig() {
		return this.#body.tooBig
	}

	/** @returns {MessageNamespace} The message's namespace. */
	get namespace() {
		return this.#namespace
	}

	/** @returns {FirehoseMessageOperation[]} All parsed operations. */
	get operations() {
		return this.#operations
	}

	/** @returns {boolean} Whether the message's operations have been parsed. */
	get operationsAreParsed() {
		return this.#operationsAreParsed
	}

	/** @returns {CID} The cID of the previous message. */
	get previousCID() {
		return this.#body.prev
	}

	/** @returns {RawData} The raw message data. */
	get rawMessage() {
		return this.#rawMessage
	}

	/** @returns {RawFirehoseMessageOp[]} The raw message operations. */
	get rawOperations() {
		return this.#rawOperations
	}

	/** @returns {number} The sequential ID of the message. */
	get sequentialID() {
		return this.#body.seq
	}

	/** @returns {Date} The timestamp of the message. */
	get timestamp() {
		if (this.#body.time) {
			return new Date(this.#body.time)
		}

		// eslint-disable-next-line no-undefined
		return undefined
	}
}
