// Module imports
import LokiTransport from 'winston-loki'
import winston from 'winston'





/**
 * Creates a new logger.
 *
 * @param {string} origin The name of the logger's origin label.
 * @returns {winston.Logger} The new logger.
 */
export function createLogger(origin) {
	const transports = [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.align(),
				winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
			),
		}),
	]

	if (process.env.GRAFANA_HOST) {
		// @ts-ignore
		transports.push(new LokiTransport({
			basicAuth: `${process.env.GRAFANA_USERNAME}:${process.env.GRAFANA_PASSWORD}`,
			host: process.env.GRAFANA_HOST,
		}))
	}

	return winston.createLogger({
		defaultMeta: {
			labels: { origin },
		},
		level: process.env.LOG_LEVEL ?? 'info',
		transports,
	})
}
