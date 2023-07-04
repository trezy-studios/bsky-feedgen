// Module imports
import { parseATURL } from '@trezystudios/bsky-lib'
import * as feedMap from '@trezystudios/bsky-feeds'





// Local imports
import { logger } from '../../helpers/logger.js'
import { Route } from '../../structures/Route.js'





/**
 * @typedef {object} QueryParams
 * @property {string} [cursor] The cursor to start from requesting paginated data.
 * @property {string} feed The AT URI of the feed being requested.
 * @property {number} limit The maximum number of items to return.
 */





export const route = new Route({
	// eslint-disable-next-line jsdoc/require-returns
	/**
	 * Handles this route when it's accessed.
	 *
	 * @param {import('koa').Context} context The request context.
	 */
	async handler(context) {
		const paramsToParse = [
			'cursor',
			'feed',
			'limit',
		]

		logger.debug(JSON.stringify({
			headers: context.headers,
			query: context.query,
			url: context.url,
		}))

		/** @type {QueryParams} */
		const {
			cursor,
			limit,
			feed,
		} = paramsToParse.reduce((accumulator, param) => {
			if (param in context.query) {
				let value = context.query[param]

				if (Array.isArray(value)) {
					value = value.at(-1)
				}

				accumulator[param] = value
			}

			return accumulator
		}, {
			cursor: null,
			feed: null,
			limit: null,
		})

		const parsedATURL = parseATURL(feed)
		const errors = []

		if (!parsedATURL) {
			errors.push(`Unprocessable feed URI: ${feed}`)
		}

		if (parsedATURL.nsid !== 'app.bsky.feed.generator') {
			errors.push(`Invalid namespace: ${parsedATURL.nsid}`)
		}

		if (parsedATURL.did !== process.env.OWNER_DID) {
			errors.push(`Invalid DID: ${parsedATURL.did}`)
		}

		const feeds = Object.values(feedMap)
		const feedKeys = feeds.map(({ rkey }) => rkey)

		if (!feedKeys.includes(parsedATURL.rkey)) {
			errors.push(`Invalid feed record: ${parsedATURL.rkey}`)
		}

		if (errors.length) {
			context.status = 400
			context.body = { errors }
			return context
		}

		const feedController = feeds.find(({ rkey }) => rkey === parsedATURL.rkey)

		// eslint-disable-next-line require-atomic-updates
		context.body = await feedController.generateFeed(cursor, limit)
	},

	route: '/xrpc/app.bsky.feed.getFeedSkeleton',
})
