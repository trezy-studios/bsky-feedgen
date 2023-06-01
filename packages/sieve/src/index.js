// Module imports
import { database } from '@trezystudios/bsky-common'
import { Firehose } from '@trezystudios/bsky-lib'





// Local imports
import { isGameDevSkeet } from './isGameDevSkeet.js'
import { isGameNewsSkeet } from './isGameNewsSkeet.js'
import { isOptOutSkeet } from './isOptOutSkeet.js'
import { logger } from './logger.js'





// Constants
const firehose = new Firehose





function parseSkeetForTerminal(text) {
	const parsedText = text
		.split('\n')
		.join('\n\t')

	return `\n\t${parsedText}\n`
}

function handleFirehoseError(error) {
	logger.warn('encountered an error:')
	logger.warn(error)
	logger.warn('reconnecting...')
	firehose.connect()
}

function handleFirehoseOpen(...args) {
	console.log('firehose::open', ...args)
}

async function handleSkeetCreate(skeet) {
	const relevantFeeds = []

	if (isGameDevSkeet(skeet) && !isOptOutSkeet(skeet, ['nogamedev', 'idontwantto(?:be|get)fired'])) {
		relevantFeeds.push('game-dev')
	} else if (isGameNewsSkeet(skeet) && !isOptOutSkeet(skeet, ['nogamenews'])) {
		relevantFeeds.push('game-news')
	}

	if (!relevantFeeds.length) {
		return
	}

	logger.info(`🟩 Adding skeet to feeds (${relevantFeeds.join(', ')}): ${parseSkeetForTerminal(skeet.text)}`)

	await database.createSkeet({
		cid: skeet.cid.toString(),
		feeds: {
			connect: relevantFeeds.map(feedRkey => ({ rkey: feedRkey })),
		},
		replyParent: skeet.replyParent,
		replyRoot: skeet.replyRoot,
		uri: skeet.uri,
	})
}

function handleSkeetDelete(skeet) {
	console.log(`🟥 Deleting skeet from feed: ${parseSkeetForTerminal(skeet.text)}`)
	database.deleteSkeet(skeet.uri)
}

firehose.on('open', handleFirehoseOpen)
firehose.on('error', handleFirehoseError)
firehose.on('app.bsky.feed.post::create', handleSkeetCreate)
firehose.on('app.bsky.feed.post::delete', handleSkeetDelete)

firehose.connect()
