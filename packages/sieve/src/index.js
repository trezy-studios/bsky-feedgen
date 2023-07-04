// Module imports
import {
	Firehose,
	parseATURL,
} from '@trezystudios/bsky-lib'
import { database } from '@trezystudios/bsky-common'
import * as feeds from '@trezystudios/bsky-feeds'





// Local imports
import { createEventLogger } from './createEventLogger.js'
import { logger } from './logger.js'





// Constants
/** @type {{ [key: string]: string[] }} */
const blockListsMap = {
	'trezy.studio': [
		// Game Feed Bans
		'at://did:plc:pwsrgzcv426k7viyjl3ljdvb/app.bsky.graph.list/3jzcrcrh5b52h',
	],

	'skywatch.bsky.social': [
		// Auto-Followers & Growth Hackers
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwchzmvjok25',

		// Bots
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwduuvw35s25',

		// Enlightened Centrists, Reply Trolls, Bigot Defenders
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwch3raivv2a',

		// Far-Right Actors
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwch7xsmsu22',

		// Hard Block
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwch67e2be22',

		// Transphobes & TERFs
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwchbcv63v2j',
	],
}
const allBlockLists = Object.values(blockListsMap).flat()
const blockListOwners = Object.keys(blockListsMap)
const firehose = new Firehose





// Variables
let cursor = 0
let cursorUpdateIntervalID = null
let reconnectionTimerID = null





/** @typedef {import('@trezystudios/bsky-lib').AppBskyFeedPostEvent} AppBskyFeedPostEvent */
/** @typedef {import('@trezystudios/bsky-lib').AppBskyGraphListItemEvent} AppBskyGraphListItemEvent */
/** @typedef {import('@trezystudios/bsky-lib').FirehoseMessage} FirehoseMessage */





/**
 * Binds events for each feed.
 *
 * @param {import('@trezystudios/bsky-common').Feed} feed
 */
function bindFeed(feed) {
	feed.bindFirehoseEvents(firehose)
}

/**
 * Checks if mute list updates are in a list we're watching, then updates the
 * database accordingly.
 *
 * @param {AppBskyGraphListItemEvent} event The list item create event.
 */
async function handleListItemCreate(event) {
	const createEventLog = createEventLogger('list item created')

	if (allBlockLists.includes(event.list)) {
		logger.debug(createEventLog({
			eventSubType: 'blocking user from feeds',
			did: event.subject,
		}))

		try {
			await database.createBlock(event)
		} catch (error) {
			if (error.code === 'P2002') {
				logger.silly(createEventLog({
					eventSubType: 'failed to create block',
					message: 'block may already exist',
				}))
			} else {
				console.error(error)
			}
		}
	} else {
		logger.debug(createEventLog({ eventSubType: 'list item is irrelevant' }))
	}
}

/**
 * Handles a user being removed from a list.
 *
 * @param {AppBskyGraphListItemEvent} event The list item create event.
 */
async function handleListItemDelete(event) {
	const createEventLog = createEventLogger('list item deleted')

	try {
		const { count } = await database.deleteBlock(event)

		if (count > 0) {
			logger.debug(createEventLog({
				eventSubType: 'block deleted',
				listOwner: event.listOwner,
				listItemRkey: event.rkey,
			}))
		}
	} catch (error) {
		if (error.code === 'P2025') {
			logger.debug(createEventLog({
				eventSubType: 'failed to delete block',
				message: 'it may have already been deleted',
			}))
		}
	}
}

/**
 * Attempts to establish a connection to the firehose.
 */
async function connectFirehose() {
	const createEventLog = createEventLogger('connect firehose')

	let dbCursor = null

	try {
		dbCursor = await database.getCursor()
		logger.info(createEventLog({ eventSubType: 'connection established' }))
	} catch (error) {
		logger.error(createEventLog({
			eventSubType: 'failed to retrieve cursor',
			error,
		}))
		setTimeout(connectFirehose, 10000)
		return
	}

	if (dbCursor) {
		cursor = dbCursor.seq
	}

	await firehose.connect({
		cursor,
		password: process.env.BSKY_APP_PASSWORD,
		username: process.env.BSKY_USERNAME,
	})
}

/**
 * Fired when the firehose emits an error.
 *
 * @param {Error} error The error emitted by the firehose.
 */
function handleFirehoseError(error) {
	const createEventLog = createEventLogger('firehose error')

	logger.error(createEventLog({ error }))

	resetTimer()
	connectFirehose()
}

/**
 * Fired when the firehose connection is opened successfully.
 */
function handleFirehoseOpen() {
	const createEventLog = createEventLogger('firehose connection')

	logger.info(createEventLog({ eventSubType: 'firehose open' }))

	updateBlockLists()
	resetTimer()

	cursorUpdateIntervalID = setInterval(async() => {
		await database.updateCursor(cursor)
	}, 30000)
}

/**
 * Fired when a parsed message is emitted from the firehose.
 *
 * @param {FirehoseMessage} message The parsed message.
 */
function handleParsedMessage(message) {
	if (message.sequentialID) {
		cursor = message.sequentialID
	}
}

/**
 * Fired when a new skeet is created.
 *
 * @param {AppBskyFeedPostEvent} skeet The newly created skeet.
 * @returns {Promise<void>}
 */
async function handleSkeetCreate(skeet) {
	const createEventLog = createEventLogger('skeet created')

	logger.debug(createEventLog({
		eventSubType: 'skeet received',
		uri: skeet.uri,
	}))

	logger.silly(createEventLog({
		eventSubType: 'skeet text',
		text: skeet.text,
	}))

	const feedsArray = Object.values(feeds)
	const relevantFeeds = []

	let feedIndex = 0

	while (feedIndex < feedsArray.length) {
		const feed = feedsArray[feedIndex]
		const isRelevantSkeet = await feed.testSkeet(skeet)

		if (isRelevantSkeet) {
			relevantFeeds.push(feed.rkey)
		}

		feedIndex += 1
	}

	if (!relevantFeeds.length) {
		logger.debug(createEventLog({ eventSubType: 'skeet is irrelevant' }))
	} else {
		logger.debug(createEventLog({ eventSubType: `skeet is relevant to feeds: ${relevantFeeds.join(', ')}` }))
	}

	await database.createSkeet({
		cid: skeet.cid.toString(),
		feeds: relevantFeeds,
		replyParent: skeet.replyParent,
		replyRoot: skeet.replyRoot,
		uri: skeet.uri,
	})
}

/**
 * Fired when a skeet is deleted.
 *
 * @param {AppBskyFeedPostEvent} skeet The skeet being deleted.
 */
async function handleSkeetDelete(skeet) {
	const createEventLog = createEventLogger('skeet deleted')

	logger.debug(createEventLog({ uri: skeet.uri }))

	logger.silly(createEventLog({
		eventSubType: 'skeet text',
		text: skeet.text,
	}))

	try {
		await database.deleteSkeet(skeet.uri)
	} catch (error) {
		if (error.code === 'P2025') {
			logger.debug(createEventLog({
				eventSubType: 'failed to delete skeet',
				message: 'it may have already been deleted',
			}))
		}
	}
}

/**
 * Resets the reconnection timer.
 */
function resetTimer() {
	if (reconnectionTimerID) {
		clearTimeout(reconnectionTimerID)
	}

	reconnectionTimerID = setTimeout(() => {
		const createEventLog = createEventLogger('firehose connection')

		logger.info(createEventLog({ eventSubType: 'resetting connection' }))

		clearInterval(cursorUpdateIntervalID)
		connectFirehose()
	}, 10000)
}

/**
 * Updates the block lists.
 */
async function updateBlockLists() {
	const createEventLog = createEventLogger('sync block lists')

	let blockListOwnersIndex = 0

	while (blockListOwnersIndex < blockListOwners.length) {
		const blockListOwner = blockListOwners[blockListOwnersIndex]
		const blockLists = blockListsMap[blockListOwner]

		logger.debug(createEventLog({ eventSubType: `syncing block lists from ${blockListOwner}` }))

		let blockListCursor = null
		let shouldContinue = true

		while (shouldContinue) {
			const query = {
				collection: 'app.bsky.graph.listitem',
				limit: 100,
				repo: blockListOwner,
			}

			if (blockListCursor) {
				query.cursor = blockListCursor
			}

			const result = await firehose.api.agent.com.atproto.repo.listRecords(query)

			if (result.data.cursor) {
				blockListCursor = result.data.cursor
			} else {
				shouldContinue = false
			}

			let recordIndex = 0

			while (recordIndex < result.data.records.length) {
				/**
				 * Override the type from the @atproto/api because the `value` isn't fleshed out.
				 *
				 * @type {{
				 * 	uri: string,
				 * 	value: {
				 * 		list: string,
				 * 		subject: string,
				 * 	},
				 * }}
				 */
				const record = /** @type {*} */ (result.data.records[recordIndex])

				if (blockLists.includes(record.value.list)) {
					const parsedATURL = parseATURL(record.uri)

					try {
						logger.debug(createEventLog({
							eventSubType: 'create block',
							did: record.value.subject,
						}))

						await database.createBlock({
							subject: record.value.subject,
							listOwner: parsedATURL.did,
							rkey: parsedATURL.rkey,
						})
					} catch (error) {
						if (error.code === 'P2002') {
							logger.silly(createEventLog({
								eventSubType: 'failed to create block',
								message: 'block may already exist',
							}))
						} else {
							console.error(error)
						}
					}
				}

				recordIndex += 1
			}
		}

		blockListOwnersIndex += 1
	}
}

firehose.on('connection::opened', handleFirehoseOpen)
firehose.on('connection::error', handleFirehoseError)
firehose.on('message::raw', resetTimer)
firehose.on('message::parsed', handleParsedMessage)
firehose.on('app.bsky.feed.post::create', handleSkeetCreate)
firehose.on('app.bsky.feed.post::delete', handleSkeetDelete)
firehose.on('app.bsky.graph.listitem::create', handleListItemCreate)
firehose.on('app.bsky.graph.listitem::delete', handleListItemDelete)

Object.values(feeds).forEach(bindFeed)

connectFirehose()
