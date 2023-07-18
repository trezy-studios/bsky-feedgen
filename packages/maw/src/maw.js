// Module imports
import {
	createEventLogger,
	database,
	queue,
} from '@trezystudios/bsky-common'
import { collectDefaultMetrics } from 'prom-client'
import { Firehose } from '@trezystudios/bsky-lib'





// Local imports
import { logger } from './logger.js'





// Constants
const firehose = new Firehose





// Variables
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
