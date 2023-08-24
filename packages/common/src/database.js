// Module imports
import { parseATURL } from '@trezystudios/bsky-lib'
import { PrismaClient } from '@prisma/client'





// Types
/**
 * @typedef {object} Cursor
 * @property {string} id The ID of the cursor.
 * @property {number} seq The sequential ID of the most recent message parsed by this cursor's worker.
 * @property {Date} updatedAt The timestamp at which this cursor was last updated.
 */





// Constants
export const prisma = new PrismaClient({
	log: [
		{
			emit: 'event',
			level: 'query',
		},
		{
			emit: 'event',
			level: 'error',
		},
		{
			emit: 'event',
			level: 'info',
		},
		{
			emit: 'event',
			level: 'warn',
		},
	],
})





/**
 * Finds derelict cursors in the database and removes them.
 *
 * @returns {Promise<number>} The number of cursors that were deleted.
 */
export function cleanupCursors() {
	return prisma.$executeRaw`
		DELETE FROM FirehoseCursor
		WHERE updatedAt < (NOW() - INTERVAL 1 MINUTE);
	`
}

/**
 * Saves a block in the database.
 *
 * @param {{
 * 	listOwner: string,
 * 	rkey: string,
 * 	subject: string,
 * }} listItem The list item to be saved.
 * @returns {Promise<object>} The newly created block.
 */
export function createBlock(listItem) {
	return prisma.block.create({
		data: {
			did: listItem.subject,
			listOwnerDID: listItem.listOwner,
			rkey: listItem.rkey,
		},
	})
}

/**
 * Creates a new cursor.
 *
 * @param {number} seq The most recent `seq` field from a message.
 * @returns {Promise<Cursor>} The updated cursor.
 */
export function createCursor(seq) {
	return prisma.firehoseCursor.create({
		data: { seq },
	})
}

/**
 * Creates a new opt-out.
 *
 * @param {string} did The dID of the user that is opting out.
 * @returns {Promise<object>} The newly created opt-out.
 */
export function createOptOut(did) {
	return prisma.optOut.create({
		data: { did },
	})
}

/**
 * Creates a new skeet.
 *
 * @param {{
 *	cid: string,
 *	feeds: string[],
 *	indexedAt: string,
 *	replyParent: string,
 *	replyRoot: string,
 *	uri: string,
 * }} skeet The skeet to be created.
 * @returns {Promise<object>} The newly created skeet.
 */
export function createSkeet(skeet) {
	const feedSkeet = {
		connectOrCreate: skeet.feeds.map(rkey => ({
			create: {
				feed: {
					connect: { rkey },
				},
			},
			where: {
				// eslint-disable-next-line camelcase
				feedRkey_skeetURI: {
					feedRkey: rkey,
					skeetURI: skeet.uri,
				},
			},
		})),
	}

	return prisma.skeet.upsert({
		where: {
			uri: skeet.uri,
		},
		create: {
			cid: skeet.cid,
			did: parseATURL(skeet.uri).did,
			feedSkeet,
			indexedAt: skeet.indexedAt,
			replyParent: skeet.replyParent,
			replyRoot: skeet.replyRoot,
			uri: skeet.uri,
		},
		update: { feedSkeet },
	})
}

/**
 * Deletes a block from the database.
 *
 * @param {import('@trezystudios/bsky-lib').AppBskyGraphListItemEvent} listItem The list item to be saved.
 * @returns {Promise<{ count: number }>} The newly created block.
 */
export function deleteBlock(listItem) {
	return prisma.block.deleteMany({
		where: {
			listOwnerDID: listItem.listOwner,
			rkey: listItem.rkey,
		},
	})
}

/**
 * Deletes a skeet from the database.
 *
 * @param {string} skeetURI The URI of the skeet.
 * @returns {Promise<object>} The deleted skeet.
 */
export function deleteSkeet(skeetURI) {
	return prisma.skeet.delete({
		where: {
			uri: skeetURI,
		},
	})
}

/**
 * Retrieves the most recent firehose cursor fro mthe database.
 *
 * @returns {Promise<null | number>} The cursor.
 */
export async function getOldestCursor() {
	/** @type {null | { seq: number }} */
	const result = await prisma.$queryRaw`
		SELECT seq
		FROM FirehoseCursor
		ORDER BY seq asc
		LIMIT 1;
	`

	return result?.seq
}

/**
 * Retrieves skeets using an arbitrary query.
 *
 * @param {object} query The query to be used.
 * @returns {Promise<object[]>} The results.
 */
export function getSkeets(query) {
	return prisma.skeet.findMany(query)
}

/**
 * Creates or updates a feed in the database.
 *
 * @param {object} feed The feed data to be saved.
 * @returns {Promise<object>} The updated feed.
 */
export function saveFeed(feed) {
	const feedData = {
		description: feed.description,
		name: feed.name,
		ownerDID: feed.ownerDID,
		rkey: feed.rkey,
	}

	return prisma.feed.upsert({
		where: {
			rkey: feed.rkey,
		},
		create: feedData,
		update: feedData,
	})
}

/**
 * Updates the cursor in the database.
 *
 * @param {string} id The ID of the cursor for this worker.
 * @param {number} seq The most recent `seq` field from a message.
 * @returns {Promise<Cursor>} The updated cursor.
 */
export function updateCursor(id, seq) {
	return /** @type {Promise<*>} */ (prisma.$executeRaw`
		UPDATE FirehoseCursor
		SET seq = ${seq}, updatedAt = NOW()
		WHERE id = ${id};
	`)
}

/**
 * Updates data for a skeet that's already in the database.
 *
 * @param {object} skeet The updated skeet data.
 * @returns {Promise<object>} The updated skeet.
 */
export function updateSkeet(skeet) {
	return prisma.skeet.updateMany({
		data: skeet,
		where: {
			uri: skeet.uri,
		},
	})
}
