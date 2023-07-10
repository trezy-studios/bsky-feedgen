/**
 * Wraps functionality for an API route.
 */
export class Route {
	defaultOptions = {
		methods: ['get'],
		middlewares: [],
	}

	/**
	 * Creates a new route.
	 *
	 * @param {object} options All options.
	 * @param {Function} options.handler The function to be executed when this route is accessed.
	 * @param {Function[]} [options.middlewares] Additional middlewares.
	 * @param {string} options.route The path at which this route will be mounted.
	 */
	constructor(options) {
		const allOptions = {
			...this.defaultOptions,
			...options,
		}
		this.options = allOptions

		const {
			handler,
			route,
		} = allOptions

		if (!route) {
			throw new Error('route is required')
		}

		if (!handler) {
			throw new Error('handler is required')
		}
	}

	/**
	 * Attaches this route to a router.
	 *
	 * @param {import('koa-router')} router The router to which this route will be attached.
	 */
	mount(router) {
		const {
			handler,
			middlewares,
			route,
		} = this.options

		let { methods } = this.options

		if (!Array.isArray(methods)) {
			methods = [methods]
		}

		methods.forEach(method => {
			router[method](route, ...middlewares, handler)
		})
	}
}
