// Local imports
import { Route } from '../../../structures/Route.js'





// Constants
const uri = `at://${process.env.FEEDGEN_SERVICE_DID}/app.bsky.feed.generator/${process.env.FEED_RECORD_NAME}`





export const route = new Route({
	/**
	 * Handles this route when it's accessed.
	 *
	 * @param {import('koa').Context} context The request context.
	 */
	async handler(context) {
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
			did: null,
			feeds: [
				{ uri },
			],
		}
	},

	route: '/v1/xrpc/app.bsky.feed.describeFeedGenerator',
})
