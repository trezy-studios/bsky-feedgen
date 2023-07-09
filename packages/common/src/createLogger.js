// Module imports
import LokiTransport from 'winston-loki'
import winston from 'winston'





// Constants
const formatters = [
	winston.format.timestamp(),
	winston.format.json(),
]

if (Number(process.env.PRETTY_LOGS)) {
	formatters.push(winston.format.prettyPrint({ colorize: true }))
}

/**
 * Creates a new logger.
 *
 * @param {string} origin The name of the logger's origin label.
 * @returns {winston.Logger} The new logger.
 */
export function createLogger(origin) {
	const transports = [
		new winston.transports.Console({
			format: winston.format.combine(...formatters),
		}),
	]

	if (process.env.GRAFANA_HOST) {
		// @ts-ignore
		transports.push(new LokiTransport({
			basicAuth: `${process.env.GRAFANA_USERNAME}:${process.env.GRAFANA_PASSWORD}`,
			format: winston.format.combine(...formatters),
			host: process.env.GRAFANA_HOST,
		}))
	}

	return winston.createLogger({
		defaultMeta: {
			labels: {
				job: origin,
			},
		},
		level: process.env.LOG_LEVEL ?? 'info',
		transports,
	})
}
