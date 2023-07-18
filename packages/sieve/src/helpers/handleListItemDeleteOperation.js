// Module imports
import {
	createEventLogger,
	database,
} from '@trezystudios/bsky-common'





// Local imports
import { logger } from './logger.js'





/**
 * Handles a user being removed from a list.
 *
 * @param {import('@trezystudios/bsky-lib').AppBskyGraphListItemEvent} event The list item delete event.
 * @returns {Promise<void>}
 */
export async function handleListItemDeleteOperation(event) {
	const createEventLog = createEventLogger('list item deleted')

	try {
		const { count } = await database.deleteBlock(event)

		if (count > 0) {
			logger.debug(createEventLog({
				message: 'block deleted',
				listOwner: event.listOwner,
				listItemRkey: event.rkey,
			}))
		}
	} catch (error) {
		if (error.code === 'P2025') {
			logger.debug(createEventLog({
				message: 'failed to delete block; it may have already been deleted',
			}))
		}
	}
}
