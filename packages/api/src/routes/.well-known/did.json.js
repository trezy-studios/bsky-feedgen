// Local imports
import { Route } from '@trezystudios/koa-api'





export const route = new Route({
	/**
	 * Handles this route when it's accessed.
	 *
	 * @param {import('koa').Context} context The request context.
	 */
	handler(context) {
		context.body = {
			'@context': ['https://www.w3.org/ns/did/v1'],
			id: process.env.FEEDGEN_SERVICE_DID,
			service: [
				{
					id: '#bsky_fg',
					type: 'BskyFeedGenerator',
					serviceEndpoint: `https://${process.env.FEEDGEN_HOSTNAME}`,
				},
			],
		}
	},

	route: '/.well-known/did.json',
})
