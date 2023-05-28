// Local imports
import { bodyBuilder } from '../middleware/bodyBuilder.js'
import { Route } from '../structures/Route.js'





export const route = new Route({
	/**
	 * Handles this route when it's accessed.
	 *
	 * @param {import('koa').Context} context The request context.
	 */
	handler(context) {
		context.data = {
			status: 'healthy',
		}
	},
	middlewares: [bodyBuilder],
	route: '/health',
})
