// Module imports
import { database } from '@trezystudios/bsky-common'
import * as feeds from '@trezystudios/bsky-feeds'
import { Firehose } from '@trezystudios/bsky-lib'





// Local imports
import { createEventLogger } from './createEventLogger.js'
import { logger } from './logger.js'





// Constants
const firehose = new Firehose





// Variables
let cursor = 0
let cursorUpdateIntervalID = null
let timerID = null





/** @typedef {import('@trezystudios/bsky-lib').AppBskyFeedPostEvent} AppBskyFeedPostEvent */
/** @typedef {import('@trezystudios/bsky-lib').FirehoseMessage} FirehoseMessage */





/**
 * Binds events for each feed.
 *
 * @param {import('@trezystudios/bsky-common').Feed} feed
 */
function bindFeed(feed) {
	feed.bindFirehoseEvents(firehose)
}

/**
 * Attempts to establish a connection to the firehose.
 */
async function connectFirehose() {
	const createEventLog = createEventLogger('connect firehose')

	let dbCursor = null

	try {
		dbCursor = await database.getCursor()
		logger.error(createEventLog({ eventSubType: 'connection established' }))
	} catch (error) {
		logger.error(createEventLog({
			eventSubType: 'failed to retrieve cursor',
			error,
		}))
		setTimeout(connectFirehose, 10000)
		return
	}

	if (dbCursor) {
		cursor = dbCursor.seq
	}

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

	logger.info(createEventLog({ eventSubType: 'firehose open' }))

	resetTimer()

	cursorUpdateIntervalID = setInterval(() => database.updateCursor(cursor), 10000)
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

	const feedsArray = Object.values(feeds)
	const relevantFeeds = []

	let feedIndex = 0

	while (feedIndex < feedsArray.length) {
		const feed = feedsArray[feedIndex]
		const isRelevantSkeet = await feed.testSkeet(skeet)

		if (isRelevantSkeet) {
			relevantFeeds.push(feed.rkey)
		}

		feedIndex += 1
	}

	if (!relevantFeeds.length) {
		logger.verbose(createEventLog({ eventSubType: 'skeet is irrelevant' }))
	} else {
		logger.silly(createEventLog({ eventSubType: `skeet is relevant to feeds: ${relevantFeeds.join(', ')}` }))
	}

	await database.createSkeet({
		cid: skeet.cid.toString(),
		feeds: relevantFeeds,
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
	if (timerID) {
		clearTimeout(timerID)
	}

	timerID = setTimeout(() => {
		const createEventLog = createEventLogger('firehose connection')

		logger.info(createEventLog({ eventSubType: 'resetting connection' }))

		clearInterval(cursorUpdateIntervalID)
		connectFirehose()
	}, 60 * 1000)
}

firehose.on('connection::opened', handleFirehoseOpen)
firehose.on('connection::error', handleFirehoseError)
firehose.on('message::raw', resetTimer)
firehose.on('message::parsed', handleParsedMessage)
firehose.on('app.bsky.feed.post::create', handleSkeetCreate)
firehose.on('app.bsky.feed.post::delete', handleSkeetDelete)

Object.values(feeds).forEach(bindFeed)

connectFirehose()
