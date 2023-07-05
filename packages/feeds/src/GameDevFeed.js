// Module imports
import {
	database,
	Feed,
} from '@trezystudios/bsky-common'





// Constants
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

		if (/games?\s?(?:art|audio|design|dev|jam|lighting|music|narr?ative|writing)|indie\s?dev\s?hour|screenshot\s?saturday|trailer\s?tuesday|unity\s?1\s?week|wishlist\s?wednesday/giu.test(skeet.text)) {
			return true
		}

		return rootSkeets.includes(skeet.replyParent)
	}





	/****************************************************************************\
	 * Public instance getters/setters
	\****************************************************************************/

	/** @returns {string} The description of the feed. */
	get description() {
		return 'Skeets about game development and design. Opt out with #nofeed or #nogamedev. Discuss at https://trezy.studio/discord.'
	}

	/** @returns {string} The display name of the feed. */
	get name() {
		return 'Game Dev'
	}

	/** @returns {string} The DID of the feed's owner. */
	get ownerDID() {
		return 'did:plc:4jrld6fwpnwqehtce56qshzv'
	}

	/** @returns {string} The record key of the feed. */
	get rkey() {
		return 'game-dev'
	}
}

export const GameDevFeed = new GameDevFeedClass
