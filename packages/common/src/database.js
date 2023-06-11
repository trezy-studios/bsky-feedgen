// Module imports
import { PrismaClient } from '@prisma/client'





// Constants
const prisma = new PrismaClient()





export function createSkeet(skeet) {
	return prisma.skeet.create({
		data: {
			...skeet,
			feeds: {
				connect: skeet.feeds.map(rkey => ({ rkey })),
			},
		},
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

export function listFeeds() {
	return prisma.feed.findMany()
}

export function getSkeets(query) {
	return prisma.skeet.findMany(query)
}
