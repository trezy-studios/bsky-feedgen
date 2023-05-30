// Module imports
import winston from 'winston'





export const logger = winston.createLogger({
	level: 'info',
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
