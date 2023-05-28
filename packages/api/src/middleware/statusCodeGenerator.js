/**
 * Contextually attaches a status code to the response.
 *
 * @param {import('koa').Context} context The request context.
 * @param {Function} next The function to be executed when this middleware is ready to run the next middleware.
 */
export async function statusCodeGenerator(context, next) {
	await next()

	if (!context.status || (context.status === 200)) {
		if (context.body) {
			context.status = 200
		} else if (context.body.errors) {
			context.status = 500
		} else {
			context.status = 204
		}
	}
}
