// Module imports
import Koa from 'koa'
import KoaRouter from 'koa-router'
import { promClient } from '@trezystudios/bsky-common'





/**
 * @typedef {object} APIConfig
 * @property {boolean} [enableMetrics] Whether to enable collection of default metrics.
 * @property {object} [logger] A Winston-compatible logger.
 * @property {string} [metricsPrefix] A string to prefix all metrics names with.
 * @property {Function[]} [middleware] Default middleware to be run for every route.
 * @property {import('./Route.js').Route[]} [routes] Routes to be mounted.
 * @property {number} [port] The port to bind the server to.
 */





/**
 * An instance of the REST API.
 */
export class API {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	#client = new Koa

	#config

	#router = new KoaRouter





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new API.
	 *
	 * @param {APIConfig} [config] API configuration.
	 */
	constructor(config = {}) {
		const {
			enableMetrics = false,
			logger,
			middleware = [],
			port,
			routes = [],
		} = config

		this.#config = {
			enableMetrics,
			logger,
			middleware,
			port,
			routes,
		}

		this.#mountMiddleware()
		this.#mountRoutes()
		this.#mountRouter()
	}





	/****************************************************************************\
	 * Private instance methods
	\****************************************************************************/

	/**
	 * Connects middleware to the Koa server.
	 */
	#mountMiddleware() {
		this.#config.middleware.forEach(middleware => {
			// @ts-ignore
			this.#client.use(middleware)
		})
	}

	/**
	 * Connects routes to the Koa router.
	 */
	#mountRoutes() {
		this.#config.routes.forEach(route => route.mount(this.#router))
	}

	/**
	 * Connects the Koa router to the Koa server.
	 */
	#mountRouter() {
		this.#client.use(this.#router.routes())
		this.#client.use(this.#router.allowedMethods())
	}





	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Starts the Koa server.
	 */
	start() {
		const {
			enableMetrics,
			logger,
			metricsPrefix,
			port = process.env.PORT ?? 3000,
		} = this.#config

		if (enableMetrics) {
			promClient.collectDefaultMetrics({
				prefix: metricsPrefix ?? '',
			})
		}

		this.#client.listen(port)

		logger.info(`API is ready; listening on port ${port}.`)
	}
}
