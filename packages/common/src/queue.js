// Module imports
import amqp from 'amqplib'





// Constants
const queueName = 'events'





// Variables
let mqConnection = null
let queue = null





/**
 * Polls the message queue until either it makes a connection, or it times out.
 *
 * @returns {Promise<boolean>} Whether a connection has been made successfully.
 */
export async function assertMQ() {
	const mqTimeout = Number(process.env.MQ_TIMEOUT ?? 15000)
	const startedAt = performance.now()

	let isConnected = false
	let isTimedOut = false

	while (!isConnected && !isTimedOut) {
		try {
			mqConnection = await amqp.connect(process.env.MQ_URL)
			queue = await mqConnection.createChannel()
			await queue.assertQueue(queueName)
			isConnected = true
		} catch (error) {
			const now = performance.now()
			const timeSinceStart = now - startedAt

			if (timeSinceStart > mqTimeout) {
				isTimedOut = true
			}
		}
	}

	return isConnected
}

/**
 * Sends an event to the queue.
 *
 * @param {Buffer} data The data to be sent to the queue.
 * @returns {boolean} Whether the data was sent successfully.
 */
export function send(data) {
	return queue.sendToQueue(queueName, data)
}
