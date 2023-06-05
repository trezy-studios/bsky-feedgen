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





// Variables
let cursor = null
let timer = null





function connectFirehose() {
	const options = {}

	if (cursor) {
		options.cursor = cursor
	}

	firehose.connect(options)
}

function parseSkeetForTerminal(text) {
	const parsedText = text
		.split('\n')
		.join('\n\t')

	return `\n\t${parsedText}\n`
}

function handleFirehoseError(error) {
	logger.error('Firehose connection encountered an error:')
	logger.error(error)
	logger.error('Attempting to reconnect...')
	resetTimer()
	connectFirehose()
}

function handleFirehoseOpen() {
	logger.info('🟩 Firehose connection established.')
	resetTimer()
}

function handleParsedMessage(message) {
	cursor = message.sequentialID
}

async function handleSkeetCreate(skeet) {
	logger.verbose('🟦 Received skeet...')
	logger.silly(`Skeet content: ${parseSkeetForTerminal(skeet.text)}`)

	const relevantFeeds = []

	if (isGameDevSkeet(skeet) && !isOptOutSkeet(skeet, ['nogamedev', 'idontwantto(?:be|get)fired'])) {
		relevantFeeds.push('game-dev')
	}

	if (isGameNewsSkeet(skeet) && !isOptOutSkeet(skeet, ['nogamenews'])) {
		relevantFeeds.push('game-news')
	}

	if (!relevantFeeds.length) {
		logger.verbose('Skeet is irrelevant; skipping.')
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
	logger.info(`🟥 Deleting skeet from feed: ${parseSkeetForTerminal(skeet.text)}`)
	database.deleteSkeet(skeet.uri)
}

function resetTimer() {
	if (timer) {
		clearTimeout(timer)
	}

	timer = setTimeout(() => {
		logger.info('🟨 Firehose hasn\'t sent any messages recently; re-establishing connection...')
		connectFirehose()
	}, 60 * 1000)
}

firehose.on('connection::opened', handleFirehoseOpen)
firehose.on('connection::error', handleFirehoseError)
firehose.on('message::raw', resetTimer)
firehose.on('message::parsed', handleParsedMessage)
firehose.on('app.bsky.feed.post::create', handleSkeetCreate)
firehose.on('app.bsky.feed.post::delete', handleSkeetDelete)

connectFirehose()
