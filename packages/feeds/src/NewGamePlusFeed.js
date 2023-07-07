// Module imports
import {
	database,
	Feed,
} from '@trezystudios/bsky-common'





/**
 * Handler for the game dev feed.
 */
class NewGamePlusFeedClass extends Feed {
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
		if (/#(?:nofeed|nogamedev|idontwantto(?:be|get)fired)/giu.test(skeet.text)) {
			return false
		}

		// eslint-disable-next-line optimize-regex/optimize-regex, no-misleading-character-class
		return /🆕[🎮🕹️👾]/giu.test(skeet.text)
	}
}

export const NewGamePlusFeed = new NewGamePlusFeedClass({
	description: 'Video game release and pre-release announcements! Opt out with #NoFeed or #NoNewGamePlus. Discuss at https://trezy.studio/discord.',
	image: 'NewGamePlusFeed.png',
	name: 'New Game +',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'new-game-plus',
})
