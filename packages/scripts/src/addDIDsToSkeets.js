// Module imports
import { database } from '@trezystudios/bsky-common'
import { parseATURL } from '@trezystudios/bsky-lib'





console.log('Retrieving skeets...')
const skeets = await database.getSkeets({
	where: {
		did: {
			equals: null,
		},
	},
})
console.log(`Got ${skeets.length} skeets.`)

let skeetIndex = 0

while (skeetIndex < skeets.length) {
	const skeet = skeets[skeetIndex]
	const parsedATURL = parseATURL(skeet.uri)

	if (parsedATURL) {
		skeet.did = parsedATURL.did
	}

	console.log(`Updating skeet #${skeetIndex}.`)

	await database.updateSkeet(skeet)

	skeetIndex += 1
}
