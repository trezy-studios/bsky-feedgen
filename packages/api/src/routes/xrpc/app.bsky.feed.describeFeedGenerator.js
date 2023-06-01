// Module imports
import { database } from '@trezystudios/bsky-common'





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
	async handler(context) {
		const feeds = await database.listFeeds()

		context.body = {
			did: process.env.FEEDGEN_SERVICE_DID,
			feeds: feeds.map(feed => ({ uri: `${baseURI}/${feed.rkey}` })),
			// links: {
			// 	privacyPolicy: '',
			// 	termsOfService: '',
			// },
		}
	},

	route: '/xrpc/app.bsky.feed.describeFeedGenerator',
})
