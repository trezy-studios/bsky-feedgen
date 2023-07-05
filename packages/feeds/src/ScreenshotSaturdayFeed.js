// Module imports
import {
	database,
	Feed,
} from '@trezystudios/bsky-common'





/**
 * Handler for the game dev feed.
 */
class ScreenshotSaturdayFeedClass extends Feed {
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

		const { skeets } = await database.getFeed(this.rkey, {
			cursor,
			limit,
		})

		result.feed = skeets.map(skeet => ({ post: skeet.uri }))

		if (skeets.length) {
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
		if (/#nofeed/giu.test(skeet.text)) {
			return false
		}

		return /screenshot\s?saturday/giu.test(skeet.text)
	}
}

export const ScreenshotSaturdayFeed = new ScreenshotSaturdayFeedClass({
	description: 'Every Saturday, game devs the world over post screenshots of their games! Give feedback and let them know how excited you are about them!',
	image: 'ScreenshotSaturdayFeed.png',
	name: 'Screenshot Saturday',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'screenshot-sat',
})
