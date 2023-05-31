// Module imports
import { FEED_RECORDS } from '@trezystudios/bsky-common'





// Local imports
import { Route } from '../../structures/Route.js'





// Constants
const baseURI = `at://${process.env.FEEDGEN_SERVICE_DID}/app.bsky.feed.generator`





export const route = new Route({
	/**
	 * Handles this route when it's accessed.
	 *
	 * @param {import('koa').Context} context The request context.
	 */
	handler(context) {
		const {
			cursor,
			limit,
		} = context.query

		const query = {
			orderBy: {
				indexedAt: 'desc',
			},
			take: limit,
		}

		if (cursor) {
			query.cursor = { cid: cursor }
			query.skip = 1
		}

		context.body = {
			did: process.env.FEEDGEN_SERVICE_DID,
			feeds: FEED_RECORDS.map(feedRecord => ({ uri: `${baseURI}/${feedRecord.rkey}` })),
			// links: {
			// 	privacyPolicy: '',
			// 	termsOfService: '',
			// },
		}
	},

	route: '/xrpc/app.bsky.feed.describeFeedGenerator',
})
