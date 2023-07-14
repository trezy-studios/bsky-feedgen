// Module imports
import { API } from '@trezystudios/koa-api'
import body from 'koa-body'
import compress from 'koa-compress'
import cors from '@koa/cors'
import noTrailingSlash from 'koa-no-trailing-slash'





// Local imports
import { route as healthRoute } from './apiRoutes/health.js'
import { logger } from './logger.js'
import { route as metricsRoute } from './apiRoutes/metrics.js'





export const api = new API({
	logger,
	middleware: [
		noTrailingSlash(),
		compress(),
		cors(),
		body(),
	],
	routes: [
		healthRoute,
		metricsRoute,
	],
})
