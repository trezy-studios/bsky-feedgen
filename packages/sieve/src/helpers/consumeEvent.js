// Module imports
import {
	createEventLogger,
	queue,
} from '@trezystudios/bsky-common'
import { FirehoseMessage } from '@trezystudios/bsky-lib'





// Local imports
import { handleMessage } from './handleMessage.js'
import { logger } from './logger.js'
import { state } from '../data/state.js'





/**
 * Handles an event from the message queue.
 *
 * @param {object} event The event from the message queue.
 * @param {Buffer} event.content The unparsed event data.
 */
export async function consumeEvent(event) {
	const createEventLog = createEventLogger('consume message')
	const { channel } = queue.state

	logger.debug(createEventLog({ message: 'received message' }))

	if (event !== null) {
		const message = new FirehoseMessage(event.content, { agent: state.agent })

		try {
			logger.info(createEventLog({
				message: 'received message',
				namespace: message.namespace,
			}))

			await handleMessage(message)
		} catch (error) {
			console.log('consumeEvent', error)
		}

		channel.ack(event)
	} else {
		console.log('Consumer cancelled by server')
	}
}
