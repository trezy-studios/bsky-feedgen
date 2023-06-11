// Module imports
import { database } from '@trezystudios/bsky-common'
import { Firehose } from '@trezystudios/bsky-lib'





// Local imports
import { createEventLogger } from './createEventLogger.js'
import { isGameDevSkeet } from './isGameDevSkeet.js'
import { isGameNewsSkeet } from './isGameNewsSkeet.js'
import { isOptOutSkeet } from './isOptOutSkeet.js'
import { logger } from './logger.js'





// Constants
const firehose = new Firehose





// Variables
let cursor = 36068926
let timer = null





/** @typedef {import('@trezystudios/bsky-lib').AppBskyFeedPostEvent} AppBskyFeedPostEvent */
/** @typedef {import('@trezystudios/bsky-lib').FirehoseMessage} FirehoseMessage */





/**
 * Attempts to establish a connection to the firehose.
 */
function connectFirehose() {
	firehose.connect({ cursor })
}

/**
 * Fired when the firehose emits an error.
 *
 * @param {Error} error The error emitted by the firehose.
 */
function handleFirehoseError(error) {
	const createEventLog = createEventLogger('firehose error')

	logger.error(createEventLog({ error }))

	resetTimer()
	connectFirehose()
}

/**
 * Fired when the firehose connection is opened successfully.
 */
function handleFirehoseOpen() {
	const createEventLog = createEventLogger('firehose connection')

	logger.info(createEventLog({ eventSubType: 'connection established' }))

	resetTimer()
}

/**
 * Fired when a parsed message is emitted from the firehose.
 * @param {FirehoseMessage} message The parsed message.
 */
function handleParsedMessage(message) {
	cursor = message.sequentialID
}

/**
 * Fired when a new skeet is created.
 *
 * @param {AppBskyFeedPostEvent} skeet The newly created skeet.
 * @returns {Promise<void>}
 */
async function handleSkeetCreate(skeet) {
	const createEventLog = createEventLogger('skeet created')

	logger.debug(createEventLog({
		eventSubType: 'skeet received',
		uri: skeet.uri,
	}))

	logger.silly(createEventLog({
		eventSubType: 'skeet text',
		text: skeet.text,
	}))

	const feeds = []

	if (isGameDevSkeet(skeet) && !isOptOutSkeet(skeet, ['nogamedev', 'idontwantto(?:be|get)fired'])) {
		feeds.push('game-dev')
	}

	if (isGameNewsSkeet(skeet) && !isOptOutSkeet(skeet, ['nogamenews'])) {
		feeds.push('game-news')
	}

	if (!feeds.length) {
		logger.verbose(createEventLog({ eventSubType: 'skeet is irrelevant' }))
		return
	}

	logger.silly(createEventLog({ eventSubType: 'skeet is relevant' }))

	await database.createSkeet({
		cid: skeet.cid.toString(),
		feeds,
		replyParent: skeet.replyParent,
		replyRoot: skeet.replyRoot,
		uri: skeet.uri,
	})
}

/**
 * Fired when a skeet is deleted.
 * @param {AppBskyFeedPostEvent} skeet The skeet being deleted.
 */
function handleSkeetDelete(skeet) {
	const createEventLog = createEventLogger('skeet deleted')

	logger.debug(createEventLog({ uri: skeet.uri }))

	logger.silly(createEventLog({
		eventSubType: 'skeet text',
		text: skeet.text,
	}))

	database.deleteSkeet(skeet.uri)
}

/**
 * Resets the reconnection timer.
 */
function resetTimer() {
	if (timer) {
		clearTimeout(timer)
	}

	timer = setTimeout(() => {
		const createEventLog = createEventLogger('firehose connection')

		logger.info(createEventLog({ eventSubType: 'resetting connection' }))

		connectFirehose()
	}, 60 * 1000)
}

firehose.on('connection::opened', handleFirehoseOpen)
firehose.on('connection::error', handleFirehoseError)
firehose.on('message::raw', resetTimer)
firehose.on('message::parsed', handleParsedMessage)
firehose.on('app.bsky.feed.post::create', handleSkeetCreate)
firehose.on('app.bsky.feed.post::delete', handleSkeetDelete)

connectFirehose()
