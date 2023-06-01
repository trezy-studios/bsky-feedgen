// Module imports
import {
	database,
	FEED_RECORDS,
	FEED_RECORDS_BY_RKEY,
} from '@trezystudios/bsky-common'
import { parseATURL } from '@trezystudios/bsky-lib'





// Local imports
import { Route } from '../../structures/Route.js'





/**
 * @typedef {object} QueryParams
 * @property {string} [cursor] The cursor to start from requesting paginated data.
 * @property {string} feed The AT URI of the feed being requested.
 * @property {number} limit The maximum number of items to return.
 */





export const route = new Route({
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

		if (!FEED_RECORDS.map(feedRecord => feedRecord.rkey).includes(parsedATURL.rkey)) {
			errors.push(`Invalid feed record: ${parsedATURL.rkey}`)
		}

		if (errors.length) {
			context.status = 400
			context.body = { errors }
			return context
		}

		const { skeets } = await database.getFeed(parsedATURL.rkey, {
			cursor,
			limit,
		})

		const body = {
			feed: skeets.map(skeet => ({ post: skeet.uri })),
		}

		if (skeets.length) {
			body.cursor = Buffer.from(skeets.at(-1).uri).toString('base64')
		}

		context.body = body
	},

	route: '/xrpc/app.bsky.feed.getFeedSkeleton',
})
