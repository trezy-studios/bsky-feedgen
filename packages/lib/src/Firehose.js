// Module imports
import { addExtension } from 'cbor-x'
import { CID } from 'multiformats'
import { WebSocket } from 'ws'





// Local imports
import {
	CONNECTION_ERROR,
	CONNECTION_OPENED,
	PARSED_MESSAGE,
	RAW_MESSAGE,
} from './helpers/eventNames.js'
import { API } from './API.js'
import { BSKY_SERVICE_URL } from './helpers/defaults.js'
import { EventEmitter } from './EventEmitter.js'
import { FirehoseMessage } from './FirehoseMessage.js'





/** @typedef {import('./types/FirehoseOptions.js').FirehoseOptions} FirehoseOptions */





/**
 * Manages a firehose connection.
 */
export class Firehose extends EventEmitter {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	/** @type {API} */
	#api

	/** @type {WebSocket} */
	#connection

	/** @type {FirehoseOptions} */
	#options





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates an instance of Firehose.
	 *
	 * @param {API} [api] The API to use for managing connections and retrieving hydration data.
	 * @param {FirehoseOptions} [options = {}] Options to configure the firehose.
	 */
	constructor(api, options = {}) {
		super()

		this.#options = options

		addExtension({
			Class: CID,
			tag: 42,
			// eslint-disable-next-line jsdoc/require-jsdoc
			encode: () => {
				throw new Error('cannot encode cids')
			},
			// eslint-disable-next-line jsdoc/require-jsdoc
			decode: bytes => {
				if (bytes[0] !== 0) {
					throw new Error('invalid cid for cbor tag 42')
				}
				return CID.decode(bytes.subarray(1)) // ignore leading 0x00
			},
		})

		this.#api = api || new API
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Handles errors in the firehose.
	 *
	 * @param {Error} error The error being thrown.
	 */
	#handleFirehoseError(error) {
		this.emit(CONNECTION_ERROR(), error)
	}

	/**
	 * Handles messages from the firehose.
	 *
	 * @param {import('ws').RawData} data The message data?
	 * @param {boolean} _isBinary Whether the data is in a binary format.
	 */
	async #handleFirehoseMessage(data, _isBinary) {
		this.emit(RAW_MESSAGE(), data)

		const message = new FirehoseMessage(data, this)

		try {
			await message.parse()

			this.emit(PARSED_MESSAGE(), message)
		} catch (error) {
			// console.log(error)
		}
	}

	/**
	 * Handles the firehose opening.
	 */
	#handleFirehoseOpen() {
		this.emit(CONNECTION_OPENED())
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Initialises the firehose connection.
	 *
	 * @param {string} [username] The username with which to authenticate. This is the same as the user's handle.
	 * @param {string} [password] The password with which to authenticate. For now, this should be an app password.
	*/
	connect(username, password) {
		if (this.#connection) {
			this.#connection.terminate()
		}

		if (username && password) {
			this.api.login(username, password)
		}

		this.#connection = new WebSocket(`wss://${BSKY_SERVICE_URL}/xrpc/com.atproto.sync.subscribeRepos`)
		this.#connection.on('message', (...args) => this.#handleFirehoseMessage(...args))
		this.#connection.on('error', (...args) => this.#handleFirehoseError(...args))
		this.#connection.on('open', (...args) => this.#handleFirehoseOpen(...args))
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {API} The API being used by this firehose instance. */
	get api() {
		return this.#api
	}

	/** @returns {FirehoseOptions} The options set when creating this firehose instance. */
	get options() {
		return this.#options
	}
}
