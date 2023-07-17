// Module imports
import {
	createEventLogger,
	database,
} from '@trezystudios/bsky-common'





// Local imports
import { logger } from './logger.js'





/**
 * Fired when a new skeet is deleted.
 *
 * @param {import('@trezystudios/bsky-lib').AppBskyFeedPostEvent} skeet The deleted skeet.
 * @returns {Promise<void>}
 */
export async function handleSkeetDeleteOperation(skeet) {
	const createEventLog = createEventLogger('skeet deleted')

	logger.debug(createEventLog({ uri: skeet.uri }))

	logger.silly(createEventLog({
		message: 'skeet text',
		text: skeet.text,
	}))

	try {
		await database.deleteSkeet(skeet.uri)
	} catch (error) {
		if (error.code === 'P2025') {
			logger.debug(createEventLog({
				message: 'failed to delete skeet; it may have already been deleted',
			}))
		} else {
			console.log('handleSkeetDeleteOperation', error)
		}
	}
}
