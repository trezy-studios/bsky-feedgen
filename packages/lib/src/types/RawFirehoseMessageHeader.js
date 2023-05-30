/** @typedef {import('./MessageType.js').MessageType} MessageType */

/**
 * @typedef RawFirehoseMessageHeader The headers for a decoded message from the firehose.
 * @property {MessageType} t The message type.
 * @property {number} op The operation type.
 */
