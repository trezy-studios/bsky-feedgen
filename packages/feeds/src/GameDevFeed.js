// Module imports
import { database } from '@trezystudios/bsky-common'
import { Feed } from '@trezystudios/bsky-common'





// Constants
const rootSkeets = [
	// Trezy's intros thread
	'at://did:plc:4jrld6fwpnwqehtce56qshzv/app.bsky.feed.post/3ju2fo5erfr2a',

	// Rami's intros thread
	'at://did:plc:jye22xkea3jqsabskhfec347/app.bsky.feed.post/3jufcwqil7q2t',
]





export const GameDevFeed = new class extends Feed {
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
		if (/#(?:nofeed|nogamedev|idontwantto(?:be|get)fired)/giu.test(skeet.text)) {
			return false
		}

		if (/(?:games?\s?(?:art|audio|design|dev|jam|lighting|music|narr?ative|writing)|screenshot\s?saturday)/giu.test(skeet.text)) {
			return true
		}

		return rootSkeets.includes(skeet.replyParent)
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	get rkey() {
		return 'game-dev'
	}
}
