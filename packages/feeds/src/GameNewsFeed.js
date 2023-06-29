// Module imports
import { database } from '@trezystudios/bsky-common'
import { Feed } from '@trezystudios/bsky-common'





export const GameNewsFeed = new class extends Feed {
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





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	get rkey() {
		return 'game-news'
	}
}
