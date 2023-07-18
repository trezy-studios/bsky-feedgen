// Module imports
import {
	database,
	queue,
} from '@trezystudios/bsky-common'
import { API as BskyAPI } from '@trezystudios/bsky-lib'
import { collectDefaultMetrics } from 'prom-client'





// Local imports
import { connectMQ } from './helpers/connectMQ.js'
import { consumeEvent } from './helpers/consumeEvent.js'
import { cursorUpdateTimer } from './helpers/cursorUpdateTimer.js'
import { state } from './data/state.js'
import { updateBlockLists } from './helpers/updateBlockLists.js'





/**
 * Starts the firehose consumer.
 */
export async function start() {
	state.api = new BskyAPI
	await state.api.login(process.env.BSKY_USERNAME, process.env.BSKY_APP_PASSWORD)

	await updateBlockLists()

	await connectMQ()
	queue.addConsumer(consumeEvent)

	await database.cleanupCursors()
	cursorUpdateTimer()

	collectDefaultMetrics({
		labels: { job: 'sieve' },
	})
}
