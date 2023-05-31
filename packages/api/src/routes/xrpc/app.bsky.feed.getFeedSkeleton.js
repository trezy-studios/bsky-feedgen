// Module imports
import { database } from '@trezystudios/bsky-common'





// Local imports
import { Route } from '../../structures/Route.js'





export const route = new Route({
	/**
	 * Handles this route when it's accessed.
	 *
	 * @param {import('koa').Context} context The request context.
	 */
	async handler(context) {
		const { limit } = context.query
		let { cursor } = context.query

		const query = {
			where: {
				feedRecord: 'GAME_DEV',
			},
			orderBy: {
				indexedAt: 'desc',
			},
			take: Number(limit ?? 20),
		}

		if (cursor) {
			if (Array.isArray(cursor)) {
				cursor = cursor.at(-1)
			}

			query.cursor = {
				uri: Buffer.from(cursor, 'base64').toString('ascii')
			}
			query.skip = 1
		}

		const skeets = await database.getSkeets(query)

		const body = {
			feed: skeets.map(skeet => ({ post: skeet.uri })),
		}

		if (skeets.length) {
			body.cursor = Buffer.from(skeets.at(-1).uri).toString('base64')
		}

		context.body = body
	},

	route: '/xrpc/app.bsky.feed.getFeedSkeleton',
})
