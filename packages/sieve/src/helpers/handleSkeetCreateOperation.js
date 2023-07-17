// Module imports
import {
	createEventLogger,
	database,
} from '@trezystudios/bsky-common'
import * as feedsMap from '@trezystudios/bsky-feeds'





// Local imports
import { logger } from './logger.js'





// Constants
const feeds = Object.values(feedsMap)





/**
 * Fired when a new skeet is created.
 *
 * @param {import('@trezystudios/bsky-lib').AppBskyFeedPostEvent} skeet The newly created skeet.
 * @returns {Promise<void>}
 */
export async function handleSkeetCreateOperation(skeet) {
	const createEventLog = createEventLogger('skeet created')

	logger.debug(createEventLog({
		message: 'skeet received',
		uri: skeet.uri,
	}))

	logger.silly(createEventLog({
		message: 'skeet text',
		text: skeet.text,
	}))

	const relevantFeeds = []

	let feedIndex = 0

	while (feedIndex < feeds.length) {
		const feed = feeds[feedIndex]
		const isRelevantSkeet = await feed.testSkeet(skeet)

		if (isRelevantSkeet) {
			relevantFeeds.push(feed.rkey)
		}

		feedIndex += 1
	}

	if (!relevantFeeds.length) {
		logger.debug(createEventLog({ message: 'skeet is irrelevant' }))
	} else {
		logger.debug(createEventLog({
			feeds: relevantFeeds,
			message: 'skeet is relevant',
		}))
	}

	try {
		await database.createSkeet({
			cid: skeet.cid.toString(),
			feeds: relevantFeeds,
			replyParent: skeet.replyParent,
			replyRoot: skeet.replyRoot,
			uri: skeet.uri,
		})
	} catch (error) {
		logger.debug(createEventLog({
			error,
			message: 'error saving skeet',
		}))
	}
}
