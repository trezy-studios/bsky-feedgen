// Local imports
import { register } from 'prom-client'
import { Route } from '@trezystudios/koa-api'





export const route = new Route({
	/**
	 * Handles this route when it's accessed.
	 *
	 * @param {import('koa').Context} context The request context.
	 */
	async handler(context) {
		const metrics = await register.metrics()

		context.headers['Content-Type'] = register.contentType
		context.body = metrics
	},
	middlewares: [],
	route: '/metrics',
})
