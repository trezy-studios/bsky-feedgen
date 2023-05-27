/**
 * Builds a JSON-API compliant response body.
 *
 * @param {import('koa').Context} context The request context.
 * @param {Function} next The function to be executed when this middleware is ready to run the next middleware.
 */
export async function bodyBuilder(context, next) {
	const meta = {
		startMS: Date.now(),
	}
	let body = {}

	context.errors = []

	await next()

	if (context.errors.length) {
		body.errors = context.errors.map(error => {
			if (error instanceof Error) {
				return error.message
			}

			return error
		})
	} else if (context.data) {
		body = {
			...body,
			data: context.data,
			jsonapi: {
				version: '1.0',
			},
			meta: context.data.meta || {},
		}

		if (context.included) {
			body.included = context.included
		}

		if (Array.isArray(body.data)) {
			body.meta.count = body.data.length
		}
	}

	meta.endMS = Date.now()
	meta.responseMS = (meta.endMS - meta.startMS)

	body.meta = {
		...meta,
		...body.meta,
	}

	context.body = body
}
