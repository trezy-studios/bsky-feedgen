// Module imports
import body from 'koa-body'
import compress from 'koa-compress'
import cors from '@koa/cors'
import Koa from 'koa'
import KoaRouter from 'koa-router'
import noTrailingSlash from 'koa-no-trailing-slash'
import { promClient } from '@trezystudios/bsky-common'





// Local imports
import { route as describeFeedGeneratorRoute } from '../routes/xrpc/app.bsky.feed.describeFeedGenerator.js'
import { route as didJSONRoute } from '../routes/.well-known/did.json.js'
import { route as getFeedSkeletonRoute } from '../routes/xrpc/app.bsky.feed.getFeedSkeleton.js'
import { route as healthCheckRoute } from '../routes/health.js'
import { logger } from '../helpers/logger.js'
import { loggerMiddleware } from '../middleware/loggerMiddleware.js'
import { metricsMiddleware } from '../middleware/metricsMiddleware.js'
import { route as metricsRoute } from '../routes/metrics.js'
import { statusCodeGenerator } from '../middleware/statusCodeGenerator.js'





/**
 * An instance of the REST API.
 */
class APIClass {
	/****************************************************************************\
	 * Private instance properties
	\****************************************************************************/

	#client = new Koa

	#port = process.env.PORT || 3000

	#router = new KoaRouter





	/****************************************************************************\
	 * Constructor
	\****************************************************************************/

	/**
	 * Creates a new API.
	 */
	constructor() {
		promClient.collectDefaultMetrics({
			prefix: process.env.METRICS_PREFIX,
		})
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
		this.#client.use(metricsMiddleware)
		this.#client.use(noTrailingSlash())
		this.#client.use(compress())
		this.#client.use(loggerMiddleware)
		this.#client.use(cors())
		this.#client.use(body())
		this.#client.use(statusCodeGenerator)
	}

	/**
	 * Connects routes to the Koa router.
	 */
	#mountRoutes() {
		describeFeedGeneratorRoute.mount(this.#router)
		didJSONRoute.mount(this.#router)
		getFeedSkeletonRoute.mount(this.#router)
		healthCheckRoute.mount(this.#router)
		metricsRoute.mount(this.#router)
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
		this.#client.listen(this.#port)
		logger.info(`API is ready; listening on port ${this.#port}.`)
	}
}


export const API = new APIClass
