// Local imports
import { logger } from '../helpers/logger.js'





/**
 * Log every request.
 *
 * @param {import('koa').Context} context The request context.
 * @param {Function} next The function to be executed when this middleware is ready to run the next middleware.
 */
export async function loggerMiddleware(context, next) {
	logger.debug(`Received request: ${JSON.stringify({
		headers: context.headers,
		method: context.method,
		query: context.query,
		url: context.url,
	})}`)

	await next()

	logger.debug(`Sending response: ${JSON.stringify({
		body: context.response.body,
		headers: context.response.headers,
		message: context.response.message,
		status: context.response.status,
	})}`)
}
