// Module imports
import { PrismaClient } from '@prisma/client'





// Local imports
import { parseSkeet } from './parseSkeet.js'





// Constants
const prisma = new PrismaClient()





export function createSkeet(data) {
	return prisma.skeet.create({ data: parseSkeet(data) })
}

export function createSkeets(dataArray) {
	return prisma.skeet.createMany({ data: dataArray.map(parseSkeet) })
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
