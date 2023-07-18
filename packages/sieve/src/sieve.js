// Module imports
import {
	database,
	queue,
} from '@trezystudios/bsky-common'





// Local imports
import { connectMQ } from './helpers/connectMQ.js'
import { consumeEvent } from './helpers/consumeEvent.js'
import { cursorUpdateTimer } from './helpers/cursorUpdateTimer.js'





/**
 * Starts the firehose consumer.
 */
export async function start() {
	await connectMQ()
	queue.addConsumer(consumeEvent)

	await database.cleanupCursors()
	cursorUpdateTimer()
}
