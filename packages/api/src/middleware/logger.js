// Local imports
import { logger } from '../helpers/logger.js'





/**
 * Log every request.
 *
 * @param {import('koa').Context} context The request context.
 * @param {Function} next The function to be executed when this middleware is ready to run the next middleware.
 */
export async function loggerMiddleware(context, next) {
	logger.debug({
		message: 'Received request',
		headers: context.headers,
		method: context.method,
		query: context.query,
		url: context.url,
	})

	await next()

	logger.debug({
		message: 'Sending response',
		body: context.response.body,
		headers: context.response.headers,
		status: `${context.response.status} ${context.response.message}`,
	})
}
