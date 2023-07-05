// Module imports
import {
	database,
	Feed,
} from '@trezystudios/bsky-common'





// Constants
const gameStudiosListURI = 'at://did:plc:pwsrgzcv426k7viyjl3ljdvb/app.bsky.graph.list/3jzcr5wp4fv26'
const gameJournalistsListURI = 'at://did:plc:pwsrgzcv426k7viyjl3ljdvb/app.bsky.graph.list/3jzcr5mdoxp2y'
const gamePublicationsListURI = 'at://did:plc:pwsrgzcv426k7viyjl3ljdvb/app.bsky.graph.list/3jzcr5gooza2n'





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
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'game-news',
})
