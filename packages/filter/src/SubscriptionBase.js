// Module imports
import { Subscription } from '@atproto/xrpc-server'
import { cborToLexRecord, readCar } from '@atproto/repo'
import { BlobRef } from '@atproto/lexicon'





// Local imports
import {
	ids,
	lexicons,
} from './lexicons.js'





export class FirehoseSubscriptionBase {
	/** @type {Subscription} */
	sub

	/**
	 * Create a new firehose subscription.
	 *
	 * @param {string} service
	 */
	constructor(service) {
		this.sub = new Subscription({
			service: service,
			method: ids.ComAtprotoSyncSubscribeRepos,
			getParams: () => ({}),
			validate: value => {
				try {
					return lexicons.assertValidXrpcMessage(
						ids.ComAtprotoSyncSubscribeRepos,
						value,
					)
				} catch (err) {
					console.error('repo subscription skipped invalid message', err)
				}
			},
		})
	}

	/**
	 * Handler for firehose events.
	 *
	 * @param {object} event
	 * @returns {Promise<void>}
	 */
	handleEvent(event) {
		return Promise.resolve()
	}

	async run() {
		for await (const event of this.sub) {
			try {
				await this.handleEvent(event)
			} catch (err) {
				console.error('repo subscription could not handle message', err)
			}
		}
	}
}

/**
 * Retrieves operations from an event, sorted based on their types.
 *
 * @param {object} event
 * @returns {Promise<object>}
 */
export const getOpsByType = async (event) => {
	const car = await readCar(event.blocks)
	const opsByType = {
		posts: { creates: [], deletes: [] },
		reposts: { creates: [], deletes: [] },
		likes: { creates: [], deletes: [] },
		follows: { creates: [], deletes: [] },
	}

	for (const op of event.ops) {
		const uri = `at://${event.repo}/${op.path}`
		const [collection] = op.path.split('/')

		if (op.action === 'update') continue // updates not supported yet

		if (op.action === 'create') {
			if (!op.cid) continue
			const recordBytes = car.blocks.get(op.cid)
			if (!recordBytes) continue
			const record = cborToLexRecord(recordBytes)
			const create = { uri, cid: op.cid.toString(), author: event.repo }
			if (collection === ids.AppBskyFeedPost && isPost(record)) {
				opsByType.posts.creates.push({ record, ...create })
			} else if (collection === ids.AppBskyFeedRepost && isRepost(record)) {
				opsByType.reposts.creates.push({ record, ...create })
			} else if (collection === ids.AppBskyFeedLike && isLike(record)) {
				opsByType.likes.creates.push({ record, ...create })
			} else if (collection === ids.AppBskyGraphFollow && isFollow(record)) {
				opsByType.follows.creates.push({ record, ...create })
			}
		}

		if (op.action === 'delete') {
			if (collection === ids.AppBskyFeedPost) {
				opsByType.posts.deletes.push({ uri })
			} else if (collection === ids.AppBskyFeedRepost) {
				opsByType.reposts.deletes.push({ uri })
			} else if (collection === ids.AppBskyFeedLike) {
				opsByType.likes.deletes.push({ uri })
			} else if (collection === ids.AppBskyGraphFollow) {
				opsByType.follows.deletes.push({ uri })
			}
		}
	}

	return opsByType
}

export const isPost = object => isType(object, ids.AppBskyFeedPost)

export const isRepost = object => isType(object, ids.AppBskyFeedRepost)

export const isLike = object => isType(object, ids.AppBskyFeedLike)

export const isFollow = object => isType(object, ids.AppBskyGraphFollow)

const isType = (obj, nsid) => {
	try {
		lexicons.assertValidRecord(nsid, fixBlobRefs(obj))
		return true
	} catch (err) {
		return false
	}
}

// @TODO right now record validation fails on BlobRefs
// simply because multiple packages have their own copy
// of the BlobRef class, causing instanceof checks to fail.
// This is a temporary solution.
const fixBlobRefs = object => {
	if (Array.isArray(object)) {
		return object.map(fixBlobRefs)
	}

	if (object && typeof object === 'object') {
		if (object.constructor.name === 'BlobRef') {
			return new BlobRef(object.ref, object.mimeType, object.size, object.original)
		}

		return Object.entries(object)
			.reduce((acc, [key, val]) => {
				return Object.assign(acc, { [key]: fixBlobRefs(val) })
			}, {})
	}
	return object
}
