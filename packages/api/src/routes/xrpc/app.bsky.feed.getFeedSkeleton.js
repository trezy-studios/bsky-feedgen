// Module imports
import {
	Counter,
	Histogram,
	Summary,
} from 'prom-client'
import { parseATURL } from '@trezystudios/bsky-lib'
import { Route } from '@trezystudios/koa-api'
import * as feedMap from '@trezystudios/bsky-feeds'





// Constants
const feedPageSizeSummary = new Summary({
	help: 'Tracks size of pages being requested.',
	labelNames: ['rkey'],
	name: `${process.env.METRICS_PREFIX}feedgen_page_size`,
})
const feedLoadCounter = new Counter({
	help: 'Each time a feed is loaded.',
	labelNames: ['rkey'],
	name: `${process.env.METRICS_PREFIX}feedgen_loaded`,
})
const feedScrollCounter = new Counter({
	help: 'Each time a feed is scrolled.',
	labelNames: ['rkey'],
	name: `${process.env.METRICS_PREFIX}feedgen_scrolled`,
})
const feedgenTimer = new Histogram({
	help: 'The time required to generate the feed response.',
	labelNames: ['rkey'],
	name: `${process.env.METRICS_PREFIX}feedgen_timer`,
})

const feeds = Object.values(feedMap)
const feedKeys = feeds.map(({ rkey }) => rkey)





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

		/** @type {QueryParams} */
		const {
			cursor,
			limit,
			feed,
		} = paramsToParse.reduce((accumulator, param) => {
			if (param in context.query) {
				/** @type {string | string[] | number} */
				let value = context.query[param]

				if (Array.isArray(value)) {
					value = value.at(-1)
				}

				if ((typeof value !== 'undefined') && !isNaN(Number(value))) {
					value = Number(value)
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
		} else {
			if (parsedATURL.nsid !== 'app.bsky.feed.generator') {
				errors.push(`Invalid namespace: ${parsedATURL.nsid}`)
			}

			if (parsedATURL.did !== process.env.OWNER_DID) {
				errors.push(`Invalid DID: ${parsedATURL.did}`)
			}

			if (!feedKeys.includes(parsedATURL.rkey)) {
				errors.push(`Invalid feed record: ${parsedATURL.rkey}`)
			}
		}

		if (errors.length) {
			context.status = 400
			context.body = { errors }
			return context
		}

		if (cursor) {
			feedScrollCounter.inc({ rkey: parsedATURL.rkey })
		} else {
			feedLoadCounter.inc({ rkey: parsedATURL.rkey })
		}

		if (limit) {
			feedPageSizeSummary.observe({ rkey: parsedATURL.rkey }, limit)
		}

		const feedController = feeds.find(({ rkey }) => rkey === parsedATURL.rkey)

		const endFeedgenTimer = feedgenTimer.startTimer({ rkey: parsedATURL.rkey })

		// eslint-disable-next-line require-atomic-updates
		context.body = await feedController.generateFeed(cursor, limit)

		endFeedgenTimer()
	},

	route: '/xrpc/app.bsky.feed.getFeedSkeleton',
})
