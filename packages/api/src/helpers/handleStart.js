// Module imports
import {
	collectDefaultMetrics,
	Counter,
	Histogram,
} from 'prom-client'
import { database } from '@trezystudios/bsky-common'
import { logger } from './logger.js'





// Constants
const errorCounter = new Counter({
	help: 'The number of errors triggered by failed queries.',
	labelNames: ['duration', 'params', 'query'],
	name: `${process.env.METRICS_PREFIX}query_error_counter`,
})
const queryCounter = new Counter({
	help: 'The number of queries being performed.',
	labelNames: ['duration', 'params', 'query'],
	name: `${process.env.METRICS_PREFIX}query_counter`,
})
const queryTimer = new Histogram({
	help: 'The duration of a query.',
	labelNames: ['duration', 'params', 'query'],
	name: `${process.env.METRICS_PREFIX}query_timer`,
})





/**
 * Starts metrics collection.
 */
export function handleStart() {
	// @ts-ignore
	database.prisma.$on('query', event => {
		const dataObject = {
			// @ts-ignore
			duration: event.duration,
			// @ts-ignore
			params: event.params,
			// @ts-ignore
			query: event.query,
		}

		logger.debug(dataObject)

		// @ts-ignore
		queryTimer.observe(dataObject, event.duration)
		queryCounter.inc(dataObject)
	})

	// @ts-ignore
	database.prisma.$on('error', event => {
		const dataObject = {
			// @ts-ignore
			duration: event.duration,
			// @ts-ignore
			params: event.params,
			// @ts-ignore
			query: event.query,
		}

		logger.error(dataObject)
		errorCounter.inc(dataObject)
	})

	collectDefaultMetrics({ prefix: process.env.METRICS_PREFIX })
}
