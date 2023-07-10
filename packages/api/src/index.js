// Module imports
import { API } from '@trezystudios/koa-api'
import body from 'koa-body'
import compress from 'koa-compress'
import cors from '@koa/cors'
import noTrailingSlash from 'koa-no-trailing-slash'





// Local imports
import { route as describeFeedGeneratorRoute } from './routes/xrpc/app.bsky.feed.describeFeedGenerator.js'
import { route as didJSONRoute } from './routes/.well-known/did.json.js'
import { route as getFeedSkeletonRoute } from './routes/xrpc/app.bsky.feed.getFeedSkeleton.js'
import { route as healthCheckRoute } from './routes/health.js'
import { logger } from './helpers/logger.js'
import { loggerMiddleware } from './middleware/loggerMiddleware.js'
import { metricsMiddleware } from './middleware/metricsMiddleware.js'
import { route as metricsRoute } from './routes/metrics.js'
import { statusCodeGenerator } from './middleware/statusCodeGenerator.js'





// Start the web server
const api = new API({
	enableMetrics: true,
	logger,
	metricsPrefix: process.env.METRICS_PREFIX,
	middleware: [
		metricsMiddleware,
		noTrailingSlash(),
		compress(),
		loggerMiddleware,
		cors(),
		body(),
		statusCodeGenerator,
	],
	routes: [
		describeFeedGeneratorRoute,
		didJSONRoute,
		getFeedSkeletonRoute,
		healthCheckRoute,
		metricsRoute,
	],
})

api.start()
