// Module imports
import { Feed } from '@trezystudios/bsky-common'





// Constants
const rootSkeets = [
	// Trezy's intros thread
	'at://did:plc:4jrld6fwpnwqehtce56qshzv/app.bsky.feed.post/3ju2fo5erfr2a',

	// Rami's intros thread
	'at://did:plc:jye22xkea3jqsabskhfec347/app.bsky.feed.post/3jufcwqil7q2t',
]





/**
 * Handler for the game dev feed.
 */
class GameDevFeedClass extends Feed {
	/****************************************************************************\
	 * Public instance methods
	\****************************************************************************/

	/**
	 * Tests a skeet to verify whether it's relevant for this feed.
	 *
	 * @param {{
	 * 	text: string,
	 * 	replyParent: string,
	 * }} skeet The skeet to test.
	 * @returns {boolean} Whether the skeet is relevant.
	 */
	testSkeet(skeet) {
		if (/#(?:nofeed|nogamedev|private)/giu.test(skeet.text)) {
			return false
		}

		if (/games?\s?(?:animation|art|audio|design|dev|jam|lighting|music|narr?ative|writing)|indie\s?dev\s?hour|screenshot\s?saturday|trailer\s?tuesday|unity\s?1\s?week|wishlist\s?wednesday/giu.test(skeet.text)) {
			return true
		}

		return rootSkeets.includes(skeet.replyParent)
	}
}

export const GameDevFeed = new GameDevFeedClass({
	description: `
		Posts about all aspects of game development.

		Opt in with "game", followed by animation, art, audio, design, dev, jam, lighting, music, narrative, or writing.
		Opt out with #Private, #NoFeed, or #NoGameDev.

		Discuss at https://trezy.studio/discord.
		Support the feed at https://ko-fi.com/trezycodes.
	`
		.split('\n')
		.map(string => string.trim())
		.join('\n'),
	image: 'GameDevFeed.png',
	name: 'Game Dev',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'game-dev',
})
