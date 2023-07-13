// Module imports
import {
	database,
	Feed,
} from '@trezystudios/bsky-common'





/**
 * Handler for the Game Jobs feed.
 */
class GameJobsFeedClass extends Feed {
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
		if (/#(?:nofeed|private)/giu.test(skeet.text)) {
			return false
		}

		return /#games?(?:jobs?|careers?)/giu.test(skeet.text)
			|| (/games?dev/giu.test(skeet.text) && /#(?:(?:now)?hiring|lookingforwork|lfw)/giu.test(skeet.text))
	}
}

export const GameJobsFeed = new GameJobsFeedClass({
	description: 'Hiring and Looking For Work posts from the games industry! Opt in with...\n- #GameJobs\n- #GameCareers\n- #GameDev + #Hiring\n- #GameDev + #NowHiring\n- #GameDev + #LookingForWork\n- #GameDev + #LFW\n\nOpt out with #NoFeed or #Private.\nDiscuss at https://trezy.studio/discord.\nSupport the feed at https://ko-fi.com/trezycodes.',
	image: 'GameJobsFeed.png',
	name: 'Game Jobs & Careers',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'game-jobs',
})
