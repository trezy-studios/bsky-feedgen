// Module imports
import {
	database,
	FEED_RECORDS_BY_ENUM,
} from '@trezystudios/bsky-common'
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
	if (isGameDevSkeet(skeet) && !isOptOutSkeet(skeet, ['nogamedev', 'idontwantto(?:be|get)fired'])) {
		logger.info(`🟩 Adding skeet to feed: ${parseSkeetForTerminal(skeet.text)}`)
		await database.createSkeet({
			cid: skeet.cid.toString(),
			feedRecord: FEED_RECORDS_BY_ENUM.GAME_DEV.enum,
			replyParent: skeet.replyParent,
			replyRoot: skeet.replyRoot,
			uri: skeet.uri,
		})
	} else if (isGameNewsSkeet(skeet) && !isOptOutSkeet(skeet, ['nogamenews'])) {
		logger.info(`🟩 Adding skeet to feed: ${parseSkeetForTerminal(skeet.text)}`)
		await database.createSkeet({
			cid: skeet.cid.toString(),
			feedRecord: FEED_RECORDS_BY_ENUM.GAME_NEWS.enum,
			replyParent: skeet.replyParent,
			replyRoot: skeet.replyRoot,
			uri: skeet.uri,
		})
	}
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
