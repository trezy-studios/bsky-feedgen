// Module imports
import {
	createEventLogger,
	database,
} from '@trezystudios/bsky-common'





// Local imports
import { allBlockLists } from '../data/blockLists.js'
import { logger } from './logger.js'





/**
	 * Checks if mute list updates are in a list we're watching, then updates the
	 * database accordingly.
 *
 * @param {import('@trezystudios/bsky-lib').AppBskyGraphListItemEvent} event The list item create event.
 * @returns {Promise<void>}
 */
export async function handleListItemCreateOperation(event) {
	const createEventLog = createEventLogger('list item created')

	if (allBlockLists.includes(event.list)) {
		logger.debug(createEventLog({
			message: 'blocking user from feeds',
			did: event.subject,
		}))

		try {
			await database.createBlock(event)
		} catch (error) {
			if (error.code === 'P2002') {
				logger.silly(createEventLog({
					message: 'failed to create block; block may already exist',
				}))
			} else {
				console.error(error)
			}
		}
	} else {
		logger.debug(createEventLog({ message: 'list item is irrelevant' }))
	}
}
