// Local imports
import { handleListItemCreateOperation } from './handleListItemCreateOperation.js'
import { handleListItemDeleteOperation } from './handleListItemDeleteOperation.js'





/**
 * Fired when a list item is created or deleted.
 *
 * @param {import('@trezystudios/bsky-lib').FirehoseMessageOperation} operation The operation.
 * @returns {Promise<void>}
 */
export function handleListItemOperation(operation) {
	if (operation.action === 'delete') {
		return handleListItemDeleteOperation(operation.entity)
	} else if (operation.action === 'create') {
		return handleListItemCreateOperation(operation.entity)
	}

	return null
}
