// Module imports
import {
	database,
	Feed,
} from '@trezystudios/bsky-common'
import path from 'node:path'





class GameNewsFeedClass extends Feed {
	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

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

	testSkeet(skeet) {
		if (/#nogamenews/giu.test(skeet.text)) {
			return false
		}

		return /#gamenews/giu.test(skeet.text)
	}
}

export const GameNewsFeed = new GameNewsFeedClass({
	description: 'Video game news and releases. Opt in with #GameNews, opt out with #NoFeed or #NoGameNews. Discuss at https://trezy.studio/discord.',
	image: 'GameNewsFeed.png',
	name: 'Game News',
	ownerDID: 'did:plc:4jrld6fwpnwqehtce56qshzv',
	rkey: 'game-news',
})
