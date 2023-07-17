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
 * Adds a consumer to handle events from the queue.
 *
 * @param {Function} consumer A function to be called for each event that is consumed.
 */
export function addConsumer(consumer) {
	const { channel } = state

	channel.consume(queueName, consumer)
}

/**
 * Polls the message queue until either it makes a connection, or it times out.
 *
 * @param {number} [prefetch] The number of messages that will be dispatched at any time.
 * @returns {Promise<boolean>} Whether a connection has been made successfully.
 */
export async function assertMQ(prefetch) {
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

			if (typeof prefetch !== 'undefined') {
				state.channel.prefetch(prefetch)
			}

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
	const { channel } = state

	return channel.sendToQueue(queueName, data)
}
