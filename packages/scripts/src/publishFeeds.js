// Module imports
import { API } from '@trezystudios/bsky-lib'
import { database } from '@trezystudios/bsky-common'
import fs from 'node:fs/promises'
import path from 'node:path'
import * as feedsMap from '@trezystudios/bsky-feeds'





const feeds = Object.values(feedsMap)

const api = new API
await api.login(process.env.BSKY_USERNAME, process.env.BSKY_APP_PASSWORD)

const bskyAgent = api.agent

let feedIndex = 0

while (feedIndex < feeds.length) {
	try {
		const feed = feeds[feedIndex]
		const feedImagePath = path.resolve('../', 'feeds', 'images', feed.image)

		console.log('Publishing feed...')
		console.log(`\t${feed.name} (${feed.rkey})`)
		console.log(`\t${feed.description.replace(/\n/gu, '\n\t')}`)

		let encoding

		if (feedImagePath.endsWith('png')) {
			encoding = 'image/png'
		} else if (feedImagePath.endsWith('jpg') || feedImagePath.endsWith('jpeg')) {
			encoding = 'image/jpeg'
		} else {
			throw new Error('expected png or jpeg')
		}

		let image = null
		let blobRes = null
		let avatarRef = null

		try {
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			image = await fs.readFile(feedImagePath)
		} catch (error) {
			throw new Error('Failed to load image.')
		}

		try {
			blobRes = await bskyAgent.api.com.atproto.repo.uploadBlob(image, { encoding })
			avatarRef = blobRes.data.blob
		} catch (error) {
			throw new Error('Failed to upload image to bsky.')
		}

		try {
			await bskyAgent.api.com.atproto.repo.putRecord({
				repo: bskyAgent.session?.did ?? '',
				collection: 'app.bsky.feed.generator',
				rkey: feed.rkey,
				record: {
					avatar: avatarRef,
					createdAt: (new Date).toISOString(),
					description: feed.description,
					did: feed.ownerDID,
					displayName: feed.name,
				},
			})
		} catch (error) {
			throw new Error('Failed to push feed to bsky.')
		}

		try {
			await database.saveFeed(feed)
		} catch (error) {
			throw new Error('Failed to save feed to the database.')
		}

		console.log('Done.')

		feedIndex += 1
	} catch (error) {
		console.log(error)
	}
}
