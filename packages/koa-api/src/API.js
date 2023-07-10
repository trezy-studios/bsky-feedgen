// Module imports
import Koa from 'koa'
import KoaRouter from 'koa-router'





/**
 * @typedef {object} APIConfig
 * @property {object} [logger] A Winston-compatible logger.
 * @property {Function[]} [middleware] Default middleware to be run for every route.
 * @property {Function} [onStart] A function to be called when the API has been started.
 * @property {number} [port] The port to bind the server to.
 * @property {import('./Route.js').Route[]} [routes] Routes to be mounted.
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
			logger,
			middleware = [],
			onStart,
			port,
			routes = [],
		} = config

		this.#config = {
			logger,
			middleware,
			onStart,
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
	async start() {
		const {
			logger,
			onStart,
			port = process.env.PORT ?? 3000,
		} = this.#config

		this.#client.listen(port)

		if (onStart) {
			await onStart(this)
		}

		logger.info(`API is ready; listening on port ${port}.`)
	}
}
