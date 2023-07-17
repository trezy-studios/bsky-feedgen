// Module imports
import { database } from '@trezystudios/bsky-common'





// Local imports
import { handleSkeetOperation } from './handleSkeetOperation.js'
import { state } from '../data/state.js'





// Constants
const acceptableErrorCheckers = [
	error => error.message.startsWith('Namespace not yet implemented:'),
	error => error.message.startsWith('Unrecognised namespace:'),
]





/**
 * Fired when a parsed message is emitted from the firehose.
 *
 * @param {import('@trezystudios/bsky-lib').FirehoseMessage} message The parsed message.
 */
export async function handleMessage(message) {
	try {
		await message.parseOperations()
	} catch (error) {
		if (!acceptableErrorCheckers.some(check => check(error))) {
			console.log('handleMessage', error)
		}
	}

	let operationIndex = 0

	while (operationIndex < message.operations.length) {
		const operation = message.operations[operationIndex]
		let handler

		switch (operation.serialisedNamespace) {
			case 'app.bsky.feed.post':
				handler = handleSkeetOperation
				break

			default:
				// console.log('No handler for this event type.')
		}

		if (typeof handler === 'function') {
			await handler(operation)
		}

		operationIndex += 1
	}

	if (message.sequentialID) {
		state.sequentialID = message.sequentialID
	}
}
