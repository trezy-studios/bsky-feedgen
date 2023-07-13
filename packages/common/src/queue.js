// Module imports
import amqp from 'amqplib'





// Constants
const queueName = 'events'





// Variables
export const state = {
	channel: null,
	connection: null,
}





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
			state.connection = await amqp.connect(process.env.MQ_URL)

			// eslint-disable-next-line require-atomic-updates
			state.channel = await state.connection.createChannel()

			await state.channel.assertQueue(queueName)

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
	return state.channel.sendToQueue(queueName, data)
}
