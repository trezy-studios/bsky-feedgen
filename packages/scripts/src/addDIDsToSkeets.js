// Module imports
import { database } from '@trezystudios/bsky-common'
import { parseATURL } from '@trezystudios/bsky-lib'





const skeets = await database.getSkeets({
	where: {
		did: {
			isEmpty: true,
		},
	},
})

let skeetIndex = 0

while (skeetIndex < skeets.length) {
	const skeet = skeets[skeetIndex]
	const parsedATURL = parseATURL(skeet.uri)

	if (parsedATURL) {
		skeet.did = parsedATURL.did
	}

	await database.updateSkeet(skeet)

	skeetIndex += 1
}
