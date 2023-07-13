// // Module imports
import {
	createEventLogger,
	queue,
} from '@trezystudios/bsky-common'
import { collectDefaultMetrics } from 'prom-client'





// // Local imports
import { logger } from './logger.js'





/**
 * Binds the event consumer to the queue.
 */
function bindEventConsumer() {
	const { channel } = queue.state

	queue.addConsumer(event => {
		if (event !== null) {
			console.log('Received:', event.content.toString())
			channel.ack(event)
		} else {
			console.log('Consumer cancelled by server')
		}
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
 * Starts the firehose consumer.
 */
export async function start() {
	await connectMQ()
	bindEventConsumer()

	collectDefaultMetrics({
		labels: { job: 'sieve' },
	})
}
