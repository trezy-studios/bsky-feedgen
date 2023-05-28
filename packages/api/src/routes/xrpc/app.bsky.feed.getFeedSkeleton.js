// Module imports
import { database } from '@trezystudios/bsky-lib'





// Local imports
import { Route } from '../../structures/Route.js'





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
			take: Number(limit ?? 20),
		}

		if (cursor) {
			query.cursor = { cid: cursor }
			query.skip = 1
		}

		const feed = await database.getSkeets(query)

		const body = { feed }

		if (feed.length) {
			body.cursor = feed.at(-1)?.cid
		}

		context.body = body
	},

	route: '/xrpc/app.bsky.feed.getFeedSkeleton',
})
