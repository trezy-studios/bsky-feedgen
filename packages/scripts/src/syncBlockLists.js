// Module imports
import {
	API as BskyAPI,
	parseATURL,
} from '@trezystudios/bsky-lib'
import { database } from '@trezystudios/bsky-common'





// Local imports
import {
	blockListOwners,
	blockListsMap,
} from './data/blockLists.js'





const api = new BskyAPI
await api.login(process.env.BSKY_USERNAME, process.env.BSKY_APP_PASSWORD)

let blockListOwnersIndex = 0

while (blockListOwnersIndex < blockListOwners.length) {
	const blockListOwner = blockListOwners[blockListOwnersIndex]
	const blockLists = blockListsMap[blockListOwner]

	console.log('syncing block lists', {
		owner: blockListOwner,
		lists: blockLists,
	})

	let blockListCursor = null
	let shouldContinue = true

	while (shouldContinue) {
		const query = {
			collection: 'app.bsky.graph.listitem',
			limit: 100,
			repo: blockListOwner,
		}

		if (blockListCursor) {
			query.cursor = blockListCursor
		}

		const result = await api.agent.com.atproto.repo.listRecords(query)

		if (result.data.cursor) {
			blockListCursor = result.data.cursor
		} else {
			shouldContinue = false
		}

		let recordIndex = 0

		while (recordIndex < result.data.records.length) {
			/**
			 * Override the type from the @atproto/api because the `value` isn't fleshed out.
			 *
			 * @type {{
			 * 	uri: string,
			 * 	value: {
			 * 		list: string,
			 * 		subject: string,
			 * 	},
			 * }}
			 */
			const record = /** @type {*} */ (result.data.records[recordIndex])

			if (blockLists.includes(record.value.list)) {
				const parsedATURL = parseATURL(record.uri)

				try {
					console.log({
						did: record.value.subject,
						message: 'create block',
					})

					await database.createBlock({
						subject: record.value.subject,
						listOwner: parsedATURL.did,
						rkey: parsedATURL.rkey,
					})
				} catch (error) {
					if (error.code === 'P2002') {
						console.log({
							message: 'failed to create block; block may already exist',
						})
					} else {
						console.error(error)
					}
				}
			}

			recordIndex += 1
		}
	}

	blockListOwnersIndex += 1
}
