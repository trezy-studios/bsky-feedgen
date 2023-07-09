// Module imports
import {
	Counter,
	Histogram,
} from 'prom-client'





// Constants
const requestCounter = new Counter({
	name: `${process.env.METRICS_PREFIX}request_count`,
	help: 'The number of requests that have been made received.',
})
const responseTimer = new Histogram({
	name: `${process.env.METRICS_PREFIX}response_timer`,
	help: 'The length of time required to generate a response.',
})





/**
 * Log every request.
 *
 * @param {import('koa').Context} context The request context.
 * @param {Function} next The function to be executed when this middleware is ready to run the next middleware.
 */
export async function metricsMiddleware(context, next) {
	const now = performance.now()

	const endResponseTimer = responseTimer.startTimer()
	requestCounter.inc()

	await next()

	// eslint-disable-next-line require-atomic-updates
	context.res.setHeader('x-response-generation-time', `${Math.round(performance.now() - now)}ms`)

	endResponseTimer()
}
