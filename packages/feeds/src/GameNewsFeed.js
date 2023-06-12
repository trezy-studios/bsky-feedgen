// Module imports
import { database } from '@trezystudios/bsky-common'
import { Feed } from '@trezystudios/bsky-common'





export const GameNewsFeed = new class extends Feed {
	/****************************************************************************\
	 * Private instance methods
	\****************************************************************************/

	/**
	 * Fired when a new skeet is created.
	 *
	 * @param {import('@trezystudios/bsky-lib').AppBskyFeedPostEvent} skeet The newly created skeet.
	 * @returns {Promise<void>}
	 */
	async #handleSkeetCreate(skeet) {
		const feeds = [this.rkey]

		if (/#nogamenews/giu.test(skeet.text)) {
			return
		}

		if (!/#gamenews/giu.test(skeet.text)) {
			return
		}

		await database.createSkeet({
			cid: skeet.cid.toString(),
			feeds,
			replyParent: skeet.replyParent,
			replyRoot: skeet.replyRoot,
			uri: skeet.uri,
		})
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	bindFirehoseEvents(firehose) {
		firehose.on('app.bsky.feed.post::create', skeet => this.#handleSkeetCreate(skeet))
	}

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





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	get rkey() {
		return 'game-news'
	}
}
