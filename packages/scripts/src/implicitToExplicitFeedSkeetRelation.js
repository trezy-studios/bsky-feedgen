// Module imports
import { database } from '@trezystudios/bsky-common'
// import { parseATURL } from '@trezystudios/bsky-lib'





// Constants
const { prisma } = database





console.log('Retrieving feeds...')
const feeds = (await prisma.feed.findMany({
	select: {
		rkey: true,
	},
})).map(({ rkey }) => rkey)
console.log(`Retrieved ${feeds.length} feeds.`)

let feedIndex = 0

while (feedIndex < feeds.length) {
	const rkey = feeds[feedIndex]

	console.log(`Processing skeets for ${rkey} feeds...`)

	const joins = /** @type {object[]} */ (await prisma.$queryRaw`SELECT * FROM _FeedToSkeet WHERE A = ${rkey};`)

	console.log(`Found ${joins.length} skeets for the ${rkey} feed.`)

	let joinIndex = 0

	while (joinIndex < joins.length) {
		const join = joins[joinIndex]
		console.log(`Processing skeet ${joinIndex} for ${rkey} feed...`)

		try {
			await prisma.feedSkeet.create({
				data: {
					feed: {
						connect: {
							rkey: join.A,
						},
					},
					skeet: {
						connect: {
							uri: join.B,
						},
					},
				},
			})
		} catch (error) {
			if (error.code !== 'P2002') {
				console.log(error)
			}
		}

		joinIndex += 1
	}

	console.log(`Processed ${joins.length} skeets for ${rkey} feed.`)

	feedIndex += 1
}

console.log('Done.')
