// Module imports
import * as feedMap from '@trezystudios/bsky-feeds'





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
		const feeds = Object.values(feedMap)
			.map(feed => ({ uri: `${baseURI}/${feed.rkey}` }))

		context.body = {
			did: process.env.FEEDGEN_SERVICE_DID,
			feeds,
			// links: {
			// 	privacyPolicy: '',
			// 	termsOfService: '',
			// },
		}
	},

	route: '/xrpc/app.bsky.feed.describeFeedGenerator',
})
