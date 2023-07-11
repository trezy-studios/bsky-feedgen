// Module imports
import {
	database,
	Feed,
} from '@trezystudios/bsky-common'
import { Histogram } from 'prom-client'





// Constants
const metricsPrefix = 'game_dev_feed_'
const feedRetrievalTimer = new Histogram({
	help: 'The length of time it takes for the database to return the feed response.',
	name: `${metricsPrefix}feed_retrieval_timer`,
})
const rootSkeets = [
	// Trezy's intros thread
	'at://did:plc:4jrld6fwpnwqehtce56qshzv/app.bsky.feed.post/3ju2fo5erfr2a',

	// Rami's intros thread
	'at://did:plc:jye22xkea3jqsabskhfec347/app.bsky.feed.post/3jufcwqil7q2t',
]





/**
 * Handler for the game dev feed.
 */
class GameDevFeedClass extends Feed {
	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Generates the feed response for the API.
	 *
	 * @param {string} [cursor] A cursor for pagination.
	 * @param {number} [limit] The number of skeets per page. Min 1, max 100.
	 * @returns {Promise<{
	 * 	cursor: string,
	 * 	feed: object[],
	 * }>} The generated feed.
	 */
	async generateFeed(cursor, limit = 30) {
		const result = {}

		const endFeedRetrievalTimer = feedRetrievalTimer.startTimer()

		const { skeets } = await database.getFeed(this.rkey, {
			cursor,
			limit,
		})

		endFeedRetrievalTimer()

		result.feed = skeets.map(skeet => ({ post: skeet.uri }))

		if (skeets.length === limit) {
			const lastSkeet = skeets.at(-1)

			if (lastSkeet) {
				result.cursor = Buffer.from(lastSkeet.uri).toString('base64')
			}
		}

		return result
	}

	/**
	 * Tests a skeet to verify whether it's relevant for this feed.
	 *
	 * @param {{
	 * 	text: string,
	 * 	replyParent: string,
	 * }} skeet The skeet to test.
	 * @returns {boolean} Whether the skeet is relevant.
	 */
	testSkeet(skeet) {
		if (/#(?:nofeed|nogamedev|idontwantto(?:be|get)fired)/giu.test(skeet.text)) {
			return false
		}

		if (/games?\s?(?:animation|art|audio|design|dev|jam|lighting|music|narr?ative|writing)|indie\s?dev\s?hour|screenshot\s?saturday|trailer\s?tuesday|unity\s?1\s?week|wishlist\s?wednesday/giu.test(skeet.text)) {
			return true
		}

		return rootSkeets.includes(skeet.replyParent)
	}
}

export const GameDevFeed = new GameDevFeedClass({
	description: 'Skeets about game development and design. Opt out with #nofeed or #nogamedev. Discuss at https://trezy.studio/discord.',
	image: 'GameDevFeed.png',
	name: 'Game Dev',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'game-dev',
})
