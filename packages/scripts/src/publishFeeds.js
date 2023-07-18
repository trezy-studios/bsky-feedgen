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

try {
	while (feedIndex < feeds.length) {
		const feed = feeds[feedIndex]
		const feedImagePath = path.resolve('../', 'feeds', 'images', feed.image)

		let encoding

		if (feedImagePath.endsWith('png')) {
			encoding = 'image/png'
		} else if (feedImagePath.endsWith('jpg') || feedImagePath.endsWith('jpeg')) {
			encoding = 'image/jpeg'
		} else {
			throw new Error('expected png or jpeg')
		}

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const image = await fs.readFile(feedImagePath)
		const blobRes = await bskyAgent.api.com.atproto.repo.uploadBlob(image, { encoding })
		const avatarRef = blobRes.data.blob

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

		await database.saveFeed(feed)

		feedIndex += 1
	}
} catch (error) {
	console.log(error)
}
