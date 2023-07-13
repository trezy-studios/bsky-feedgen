// Module imports
import {
	createEventLogger,
	database,
	queue,
} from '@trezystudios/bsky-common'
import { collectDefaultMetrics } from 'prom-client'
import { Firehose } from '@trezystudios/bsky-lib'
import fs from 'node:fs/promises'
import path from 'node:path'
import * as feedsMap from '@trezystudios/bsky-feeds'





// Local imports
import { logger } from './logger.js'





// Constants
const feeds = Object.values(feedsMap)
const firehose = new Firehose





// Variables
let hasPublishedFeeds = false
let isPublishingFeeds = false
let reconnectionTimerID = null





/**
 * Attempts to establish a connection to the firehose.
 */
async function connectFirehose() {
	const createEventLog = createEventLogger('connect firehose')

	let cursor = null

	try {
		cursor = await database.getOldestCursor()
		logger.info(createEventLog({ message: 'connection established' }))
	} catch (error) {
		logger.error(createEventLog({
			message: 'failed to retrieve cursor',
			error,
		}))
		setTimeout(connectFirehose, 10000)
		return
	}

	await firehose.connect({
		cursor,
		password: process.env.BSKY_APP_PASSWORD,
		username: process.env.BSKY_USERNAME,
	})
}

/**
 * Attempts to establish a connection to the message queue.
 */
async function connectMQ() {
	const createEventLog = createEventLogger('connect mq')

	logger.info(createEventLog({ message: 'attempting connection' }))

	const isConnected = await queue.assertMQ()

	if (isConnected) {
		logger.info(createEventLog({ message: 'connection established' }))
	} else {
		logger.error(createEventLog({ message: 'connection failed' }))
		process.exit(1)
	}
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

	if (!isPublishingFeeds && !hasPublishedFeeds) {
		isPublishingFeeds = true
		publishFeeds()
	}
}

/**
 * Fired when a raw message is received.
 *
 * @param {Buffer} event The raw message event.
 */
function handleMessageRaw(event) {
	queue.send(event)
	resetTimer()
}

/**
 * Loops over feeds and publishes them.
 */
async function publishFeeds() {
	const bskyAgent = firehose.api.agent

	let feedIndex = 0

	try {
		while (feedIndex < feeds.length) {
			const feed = feeds[feedIndex]
			const feedImagePath = path.resolve('../', 'feeds', 'images', feed.image)

			let encoding

			if (feedImagePath.endsWith('png')) {
				encoding = 'image/png'
			} else if (feedImagePath.endsWith('jpg') || feedImagePath.endsWith('jpeg')) {
				encoding = 'image/jpeg'
			} else {
				throw new Error('expected png or jpeg')
			}

			// eslint-disable-next-line security/detect-non-literal-fs-filename
			const image = await fs.readFile(feedImagePath)
			const blobRes = await bskyAgent.api.com.atproto.repo.uploadBlob(image, { encoding })
			const avatarRef = blobRes.data.blob

			await bskyAgent.api.com.atproto.repo.putRecord({
				repo: bskyAgent.session?.did ?? '',
				collection: 'app.bsky.feed.generator',
				rkey: feed.rkey,
				record: {
					avatar: avatarRef,
					createdAt: (new Date).toISOString(),
					description: feed.description,
					did: feed.ownerDID,
					displayName: feed.name,
				},
			})

			await database.saveFeed(feed)

			feedIndex += 1
		}

		hasPublishedFeeds = true
	} catch (error) {
		console.log(error)
	}

	isPublishingFeeds = false
}

/**
 * Resets the reconnection timer.
 */
function resetTimer() {
	if (reconnectionTimerID) {
		clearTimeout(reconnectionTimerID)
	}

	reconnectionTimerID = setTimeout(() => {
		const createEventLog = createEventLogger('firehose connection')

		logger.info(createEventLog({ message: 'resetting connection' }))

		connectFirehose()
	}, 10000)
}

/**
 * Starts the firehose consumer.
 */
export async function start() {
	firehose.on('connection::opened', handleFirehoseOpen)
	firehose.on('connection::error', handleFirehoseError)
	firehose.on('message::raw', handleMessageRaw)

	await connectMQ()

	connectFirehose()

	collectDefaultMetrics({
		labels: { job: 'maw' },
	})
}
