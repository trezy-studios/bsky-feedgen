/**
 * @typedef {object} FeedRecord
 * @property {string} enum The feed record enum.
 * @property {string} rkey The feed record record key.
 */

/** @type {FeedRecord[]} */
export const FEED_RECORDS = [
	{
		enum: 'GAME_DEV',
		rkey: 'game-dev',
	},
	{
		enum: 'GAME_NEWS',
		rkey: 'game-news',
	},
]

/** @type {Object<string, FeedRecord>} */
export const FEED_RECORDS_BY_ENUM = FEED_RECORDS.reduce((accumulator, feedRecord) => {
	accumulator[feedRecord.enum] = feedRecord
	return accumulator
}, {})

/** @type {Object<string, FeedRecord>} */
export const FEED_RECORDS_BY_RKEY = FEED_RECORDS.reduce((accumulator, feedRecord) => {
	accumulator[feedRecord.rkey] = feedRecord
	return accumulator
}, {})
