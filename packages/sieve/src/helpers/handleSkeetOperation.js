// Local imports
import { handleSkeetCreateOperation } from './handleSkeetCreateOperation.js'
import { handleSkeetDeleteOperation } from './handleSkeetDeleteOperation.js'





/**
 * Fired when a skeet is created or deleted.
 *
 * @param {import('@trezystudios/bsky-lib').FirehoseMessageOperation} operation The operation.
 * @returns {Promise<void>}
 */
export function handleSkeetOperation(operation) {
	if (operation.action === 'delete') {
		return handleSkeetDeleteOperation(operation.entity)
	} else if (operation.action === 'create') {
		return handleSkeetCreateOperation(operation.entity)
	}

	return null
}
