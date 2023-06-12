// Module imports
import { PrismaClient } from '@prisma/client'





// Constants
const prisma = new PrismaClient()





export function createSkeet(skeet) {
	const feeds = { connect: skeet.feeds.map(rkey => ({ rkey })) }

	return prisma.skeet.upsert({
		where: {
			uri: skeet.uri,
		},
		create: {
			...skeet,
			feeds,
		},
		update: { feeds },
	})
}

export async function createSkeets(skeets) {
	return prisma.skeet.createMany({
		data: skeets,
		skipDuplicates: true,
	})
}

export function deleteSkeet(skeetURI) {
	return prisma.skeet.delete({
		where: {
			uri: skeetURI,
		},
	})
}

export function deleteSkeets(skeetURIs) {
	return prisma.skeet.deleteMany({
		where: {
			uri: {
				in: skeetURIs,
			},
		},
	})
}

export function getCursor() {
	return prisma.firehoseCursor.findFirst()
}

export function getFeed(rkey, options = {}) {
	const {
		cursor,
		limit = 30
	} = options

	const query = {
		/** @type {import('@prisma/client').Prisma.SkeetOrderByWithRelationInput} */
		orderBy: {
			indexedAt: 'desc',
		},
		take: Number(limit),
	}

	if (cursor) {
		query.cursor = {
			uri: Buffer.from(cursor, 'base64').toString('ascii')
		}
		query.skip = 1
	}

	return prisma.feed
		.findUnique({
			select: {
				skeets: query,
			},
			where: { rkey },
		})
}

export function getSkeets(query) {
	return prisma.skeet.findMany(query)
}

export async function updateCursor(seq) {
	return prisma.$transaction([
		prisma.firehoseCursor.deleteMany(),
		prisma.firehoseCursor.create({
			data: { seq },
		}),
	])
}
