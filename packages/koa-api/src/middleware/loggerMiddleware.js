/**
 * @param {object} logger A Winston-compatible logger.
 * @returns {Function} The logger middleware.
 */
export function loggerMiddleware(logger) {
	/**
	 * Logs every request.
	 *
	 * @param {import('koa').Context} context The request context.
	 * @param {Function} next The function to be executed when this middleware is ready to run the next middleware.
	 */
	return async(context, next) => {
		const now = performance.now()

		logger.debug({
			message: 'Received request',
			headers: context.headers,
			method: context.method,
			query: context.query,
			url: context.url,
		})

		await next()

		logger.debug({
			message: 'response time',
			value: performance.now() - now,
		})

		logger.debug({
			message: 'Sending response',
			body: context.response.body,
			headers: Object.entries(context.response.headers).reduce((accumulator, [key, value]) => {
				if (key.toLowerCase() === 'authorization') {
					accumulator[key] = 'Bearer **********'
				} else {
					accumulator[key] = value
				}

				return accumulator
			}, {}),
			status: `${context.response.status} ${context.response.message}`,
		})
	}
}
