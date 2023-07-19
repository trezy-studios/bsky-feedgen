// Module imports
import { Feed } from '@trezystudios/bsky-common'





/**
 * @typedef {object} FeedObject
 * @property {string} [cursor] Pagination cursor.
 * @property {FeedObjectSkeet[]} feed Pagination cursor.
 */

/**
 * @typedef {object} FeedObjectSkeet
 * @property {string} post The URI of the skeet.
 */





// Constants
const feedItems = [
	'at://did:plc:g6asx7scljsgdu3vqwtyfszj/app.bsky.feed.post/3jziwknkaib27',
	'at://did:plc:zssnuuj53xltnpbynke4dk7k/app.bsky.feed.post/3k2dyqucxs62y',
	'at://did:plc:pdbljy6r5xannyn2ksdgqcj5/app.bsky.feed.post/3jz5xuyx6yi26',
	'at://did:plc:3nodfbwjlsd77ckgrodawvpv/app.bsky.feed.post/3jzxbkqezhi2i',
	'at://did:plc:qiknc4t5rq7yngvz7g4aezq7/app.bsky.feed.post/3k2ap226mbu2q',
	'at://did:plc:vc7f4oafdgxsihk4cry2xpze/app.bsky.feed.post/3k2nmibmif72i',
	'at://did:plc:4jrld6fwpnwqehtce56qshzv/post/app.bsky.feed.3jz5rcfphlu2r',
	'at://did:plc:3t5wkfoer7ru73364zkqxnwa/app.bsky.feed.post/3k2nwedhjlz2i',
	'at://did:plc:p2mstbfhxxd4koa6q465aeww/app.bsky.feed.post/3jxz26vjd322l',
	'at://did:plc:64mdicpo7sq4k5bx2z3m2jo6/app.bsky.feed.post/3jz64aycfil2r',
]





/**
 * Handler for the game dev feed.
 */
class GettingStartedFeedClass extends Feed {
	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Generate the feed.
	 *
	 * @param {string} [cursor] A cursor for pagination.
	 * @param {number} [limit] The number of skeets per page. Min 1, max 100.
	 * @returns {FeedObject} The generated feed.
	 */
	generateFeed(cursor, limit = 30) {
		const realLimit = Math.max(Math.min(Number(limit), 100), 1)
		let startingIndex = 0

		if (cursor) {
			const cursorURI = Buffer
				.from(cursor, 'base64')
				.toString('ascii')

			startingIndex = feedItems.indexOf(cursorURI) + 1
		}

		const result = {
			feed: feedItems
				.slice(startingIndex, realLimit)
				.map(uri => ({ post: uri })),
		}

		const lastSkeet = result.feed.at(-1)

		if (lastSkeet.post !== feedItems.at(-1)) {
			result.cursor = Buffer
				.from(lastSkeet.post)
				.toString('base64')
		}

		return result
	}

	/**
	 * Tests a skeet to verify whether it's relevant for this feed.
	 *
	 * @returns {false} Whether the skeet is relevant.
	 */
	testSkeet() {
		return false
	}
}

export const GettingStartedFeed = new GettingStartedFeedClass({
	description: `
		Posts to help you get started with bsky. All posts are curated. Poke @trezy.codes or @jessbepuzzled.bsky.social to suggest posts to be added.

		Discuss at https://trezy.studio/discord.
		Support the feed at https://ko-fi.com/trezycodes.
	`
		.split('\n')
		.map(string => string.trim())
		.join('\n'),
	image: 'GettingStartedFeed.png',
	name: 'Getting Started',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'get-started',
})
