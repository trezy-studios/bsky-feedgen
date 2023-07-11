// Module imports
import { parseATURL } from '@trezystudios/bsky-lib'
import { PrismaClient } from '@prisma/client'





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
 *	replyParent: string,
 *	replyRoot: string,
 *	uri: string,
 * }} skeet The skeet to be created.
 * @returns {Promise<object>} The newly created skeet.
 */
export function createSkeet(skeet) {
	const feeds = { connect: skeet.feeds.map(rkey => ({ rkey })) }
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
			...skeet,
			did: parseATURL(skeet.uri).did,
			feeds,
			feedSkeet,
		},
		update: { feeds },
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
export async function getCursor() {
	const result = await prisma.firehoseCursor.findFirst()
	return result?.seq
}

/**
 * Gets a page of a feed.
 *
 * @param {string} rkey The record key of the feed.
 * @param {{
 * 	cursor: null | string,
 * 	limit: null | number,
 * }} options Pagination options.
 * @returns {Promise<{ skeets: { uri: string }[] }>} The skeets in the page.
 */
export async function getFeed(rkey, options) {
	const {
		cursor,
		limit = 30,
	} = options ?? {}

	const realLimit = Math.max(Math.min(Number(limit), 100), 1)

	let query = null

	if (cursor) {
		const cursorURI = Buffer.from(cursor, 'base64').toString('ascii')
		query = prisma.$queryRaw`
			SELECT uri, indexedAt
			FROM FeedSkeet
			LEFT JOIN Skeet
			ON Skeet.uri = FeedSkeet.skeetURI
			WHERE
				feedRkey = ${rkey}
				AND Skeet.indexedAt <= (select Skeet.indexedAt from Skeet where Skeet.uri = ${cursorURI})
			ORDER BY indexedAt
			LIMIT 1, ${Number(realLimit)};
		`
	} else {
		query = prisma.$queryRaw`
			SELECT uri, indexedAt
			FROM FeedSkeet
			LEFT JOIN Skeet
			ON Skeet.uri = FeedSkeet.skeetURI
			WHERE feedRkey = ${rkey}
			ORDER BY indexedAt desc
			LIMIT ${Number(realLimit)};
		`
	}

	const skeets = /** @type {{ uri: string }[]} */ (await query)

	return { skeets }
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
 * @param {number} seq The most recent `seq` field from a message.
 * @returns {Promise<object>} The updagted cursor.
 */
export function updateCursor(seq) {
	return prisma.$transaction([
		prisma.firehoseCursor.deleteMany(),
		prisma.firehoseCursor.create({
			data: { seq },
		}),
	])
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
