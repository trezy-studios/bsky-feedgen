/**
 * Wraps functionality for an API route.
 */
export class Route {
	defaultOptions = {
		methods: ['get'],
	}

	/**
	 * Creates a new route.
	 *
	 * @param {object} options All options.
	 * @param {Function} options.handler The function to be executed when this route is accessed.
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
			route,
		} = this.options

		let { methods } = this.options

		if (!Array.isArray(methods)) {
			methods = [methods]
		}

		methods.forEach(method => {
			router[method](route, handler)
		})
	}
}
