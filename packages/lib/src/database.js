// Module imports
import { PrismaClient } from '@prisma/client'





// Local imports
import { parseSkeet } from './parseSkeet.js'





// Constants
const prisma = new PrismaClient()





export function createSkeet(skeet) {
	return prisma.skeet.create({ data: parseSkeet(skeet) })
}

export async function createSkeets(skeets) {
	console.log(`Adding ${skeets.length} skeets to feed:`)

	skeets.forEach(skeet => {
		console.log(`↳ ${skeet.record.text}`)
	})

	const result = await prisma.skeet.createMany({
		data: skeets.map(parseSkeet),
		skipDuplicates: true,
	})

	console.log('Done.')

	return result
}

export async function deleteSkeets(skeetURIs) {
	console.log(`Deleting ${skeetURIs.length} skeets from feed...`)

	const result = await prisma.skeet.deleteMany({
		where: {
			uri: {
				in: skeetURIs,
			},
		},
	})

	console.log('Done.')

	return result
}

export function getSkeets(query) {
	return prisma.skeet.findMany(query)
}
