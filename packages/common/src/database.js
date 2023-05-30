// Module imports
import { PrismaClient } from '@prisma/client'





// Constants
const prisma = new PrismaClient()





export function createSkeet(skeet) {
	return prisma.skeet.create({ data: skeet })
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

export function getSkeets(query) {
	return prisma.skeet.findMany(query)
}
