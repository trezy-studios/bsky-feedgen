// Module imports
import {
	Firehose,
	parseATURL,
} from '@trezystudios/bsky-lib'
import { database } from '@trezystudios/bsky-common'
import fs from 'node:fs/promises'
import path from 'node:path'
import * as feedsMap from '@trezystudios/bsky-feeds'





// Local imports
import {
	allBlockLists,
	blockListOwners,
	blockListsMap,
} from './data/blockLists.js'
import { createEventLogger } from './createEventLogger.js'
import { logger } from './logger.js'





// Constants
const feeds = Object.values(feedsMap)
const firehose = new Firehose





// Variables
let cursor = 0
let cursorUpdateIntervalID = null
let hasPublishedFeeds = false
let isPublishingFeeds = false
let reconnectionTimerID = null





/** @typedef {import('@trezystudios/bsky-lib').AppBskyFeedPostEvent} AppBskyFeedPostEvent */
/** @typedef {import('@trezystudios/bsky-lib').AppBskyGraphListItemEvent} AppBskyGraphListItemEvent */
/** @typedef {import('@trezystudios/bsky-lib').FirehoseMessage} FirehoseMessage */





/**
 * Attempts to establish a connection to the firehose.
 */
async function connectFirehose() {
	const createEventLog = createEventLogger('connect firehose')

	let dbCursor = null

	try {
		dbCursor = await database.getCursor()
		logger.info(createEventLog({ message: 'connection established' }))
	} catch (error) {
		logger.error(createEventLog({
			message: 'failed to retrieve cursor',
			error,
		}))
		setTimeout(connectFirehose, 10000)
		return
	}

	if (dbCursor) {
		cursor = dbCursor
	}

	await firehose.connect({
		cursor,
		password: process.env.BSKY_APP_PASSWORD,
		username: process.env.BSKY_USERNAME,
	})
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
			message: 'blocking user from feeds',
			did: event.subject,
		}))

		try {
			await database.createBlock(event)
		} catch (error) {
			if (error.code === 'P2002') {
				logger.silly(createEventLog({
					message: 'failed to create block; block may already exist',
				}))
			} else {
				console.error(error)
			}
		}
	} else {
		logger.debug(createEventLog({ message: 'list item is irrelevant' }))
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
				message: 'block deleted',
				listOwner: event.listOwner,
				listItemRkey: event.rkey,
			}))
		}
	} catch (error) {
		if (error.code === 'P2025') {
			logger.debug(createEventLog({
				message: 'failed to delete block; it may have already been deleted',
			}))
		}
	}
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

	if (!isPublishingFeeds && !hasPublishedFeeds) {
		isPublishingFeeds = true
		publishFeeds()
	}
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
		message: 'skeet received',
		uri: skeet.uri,
	}))

	logger.silly(createEventLog({
		message: 'skeet text',
		text: skeet.text,
	}))

	const relevantFeeds = []

	let feedIndex = 0

	while (feedIndex < feeds.length) {
		const feed = feeds[feedIndex]
		const isRelevantSkeet = await feed.testSkeet(skeet)

		if (isRelevantSkeet) {
			relevantFeeds.push(feed.rkey)
		}

		feedIndex += 1
	}

	if (!relevantFeeds.length) {
		logger.debug(createEventLog({ message: 'skeet is irrelevant' }))
	} else {
		logger.debug(createEventLog({
			feeds: relevantFeeds,
			message: 'skeet is relevant',
		}))
	}

	try {
		await database.createSkeet({
			cid: skeet.cid.toString(),
			feeds: relevantFeeds,
			replyParent: skeet.replyParent,
			replyRoot: skeet.replyRoot,
			uri: skeet.uri,
		})
	} catch (error) {
		logger.debug(createEventLog({
			error,
			message: 'error saving skeet',
		}))
	}
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
		message: 'skeet text',
		text: skeet.text,
	}))

	try {
		await database.deleteSkeet(skeet.uri)
	} catch (error) {
		if (error.code === 'P2025') {
			logger.debug(createEventLog({
				message: 'failed to delete skeet; it may have already been deleted',
			}))
		}
	}
}

/**
 * Loops over feeds and publishes them.
 */
async function publishFeeds() {
	const bskyAgent = firehose.api.agent

	let feedIndex = 0

	try {
		while (feedIndex < feeds.length) {
			const feed = feeds[feedIndex]
			const feedImagePath = path.resolve('../', 'feeds', 'images', feed.image)

			let encoding

			if (feedImagePath.endsWith('png')) {
				encoding = 'image/png'
			} else if (feedImagePath.endsWith('jpg') || feedImagePath.endsWith('jpeg')) {
				encoding = 'image/jpeg'
			} else {
				throw new Error('expected png or jpeg')
			}

			// eslint-disable-next-line security/detect-non-literal-fs-filename
			const image = await fs.readFile(feedImagePath)
			const blobRes = await bskyAgent.api.com.atproto.repo.uploadBlob(image, { encoding })
			const avatarRef = blobRes.data.blob

			await bskyAgent.api.com.atproto.repo.putRecord({
				repo: bskyAgent.session?.did ?? '',
				collection: 'app.bsky.feed.generator',
				rkey: feed.rkey,
				record: {
					avatar: avatarRef,
					createdAt: (new Date).toISOString(),
					description: feed.description,
					did: feed.ownerDID,
					displayName: feed.name,
				},
			})

			await database.saveFeed(feed)

			feedIndex += 1
		}

		hasPublishedFeeds = true
	} catch (error) {
		console.log(error)
	}

	isPublishingFeeds = false
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

		logger.info(createEventLog({ message: 'resetting connection' }))

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

		logger.debug(createEventLog({
			message: 'syncing block lists',
			owner: blockListOwner,
			lists: blockLists,
		}))

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
							did: record.value.subject,
							message: 'create block',
						}))

						await database.createBlock({
							subject: record.value.subject,
							listOwner: parsedATURL.did,
							rkey: parsedATURL.rkey,
						})
					} catch (error) {
						if (error.code === 'P2002') {
							logger.silly(createEventLog({
								message: 'failed to create block; block may already exist',
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

/**
 * Starts the firehose consumer.
 */
export function start() {
	firehose.on('connection::opened', handleFirehoseOpen)
	firehose.on('connection::error', handleFirehoseError)
	firehose.on('message::raw', resetTimer)
	firehose.on('message::parsed', handleParsedMessage)
	firehose.on('app.bsky.feed.post::create', handleSkeetCreate)
	firehose.on('app.bsky.feed.post::delete', handleSkeetDelete)
	firehose.on('app.bsky.graph.listitem::create', handleListItemCreate)
	firehose.on('app.bsky.graph.listitem::delete', handleListItemDelete)

	connectFirehose()
}
