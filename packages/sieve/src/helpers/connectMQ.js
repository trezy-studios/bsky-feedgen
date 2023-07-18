// Module imports
import {
	createEventLogger,
	queue,
} from '@trezystudios/bsky-common'





// Local imports
import { logger } from './logger.js'





/**
 * Attempts to establish a connection to the message queue.
 */
export async function connectMQ() {
	const createEventLog = createEventLogger('connect mq')

	logger.info(createEventLog({ message: 'attempting connection' }))

	const isConnected = await queue.assertMQ(1)

	if (isConnected) {
		logger.info(createEventLog({ message: 'connection established' }))
	} else {
		logger.error(createEventLog({ message: 'connection failed' }))
		process.exit(1)
	}
}
