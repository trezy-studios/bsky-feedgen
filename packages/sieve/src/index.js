// Module imports
import { database } from '@trezystudios/bsky-common'
import { Firehose } from '@trezystudios/bsky-lib'





// Local imports
import { filterSkeet } from './filterSkeets.js'
import { logger } from './logger.js'





function parseSkeetForTerminal(text) {
	const parsedText = text
		.split('\n')
		.join('\n\t')

	return `\n\t${parsedText}\n`
}

function handleFirehoseError(error) {
	logger.error(error)
}

function handleFirehoseOpen(...args) {
	console.log('firehose::open', ...args)
}

async function handleSkeetCreate(skeet) {
	if (filterSkeet(skeet)) {
		logger.info(`🟩 Adding skeet to feed: ${parseSkeetForTerminal(skeet.text)}`)
		await database.createSkeet({
			cid: skeet.cid.toString(),
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

const firehose = new Firehose

firehose.on('open', handleFirehoseOpen)
firehose.on('error', handleFirehoseError)
firehose.on('app.bsky.feed.post::create', handleSkeetCreate)
firehose.on('app.bsky.feed.post::delete', handleSkeetDelete)

firehose.connect()
