// Module imports
import {
	Counter,
	Histogram,
} from 'prom-client'





/** @returns {Function} The metrics middleware. */
export function metricsMiddleware() {
	const requestCounter = new Counter({
		name: `${process.env.METRICS_PREFIX}request_count`,
		help: 'The number of requests that have been made received.',
	})
	const responseTimer = new Histogram({
		name: `${process.env.METRICS_PREFIX}response_timer`,
		help: 'The length of time required to generate a response.',
	})

	/**
	 * Collects metrics for every request.
	 *
	 * @param {import('koa').Context} context The request context.
	 * @param {Function} next The function to be executed when this middleware is ready to run the next middleware.
	 */
	return async(context, next) => {
		const now = performance.now()

		const endResponseTimer = responseTimer.startTimer()
		requestCounter.inc()

		await next()

		// eslint-disable-next-line require-atomic-updates
		context.res.setHeader('x-response-generation-time', `${Math.round(performance.now() - now)}ms`)

		endResponseTimer()
	}
}
