// Module imports
import winston from 'winston'





export const logger = winston.createLogger({
	level: process.env.LOG_LEVEL ?? 'info',
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.align(),
				winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
			),
		}),
	],
})
