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
	 * @param {import('@trezystudios/bsky-lib').AppBskyFeedPostEvent} skeet The skeet to test.
	 * @returns {boolean} Whether the skeet is relevant.
	 */
	testSkeet(skeet) {
		let parsedSkeet = skeet.text

		// Ignore replise from @gamedevlist.bsky.social
		if ((skeet.skeet.did === 'did:plc:g4h5n5dl6jaed2m6ufekxe45') && skeet.replyRoot) {
			return false
		}

		if (Array.isArray(skeet.skeet.facets)) {
			const facets = [...skeet.skeet.facets].reverse()

			facets.forEach(facet => {
				if (facet.features[0]['$type'] !== 'app.bsky.richtext.facet#mention') {
					return
				}

				const characterArray = parsedSkeet.split('')
				characterArray.splice(facet.index.byteStart, facet.index.byteEnd)
				parsedSkeet = characterArray.join('')
			})
		}

		if (/#(?:nofeed|nogamedev|private)/giu.test(parsedSkeet)) {
			return false
		}

		if (/games?\s?(?:animation|art|audio|design|dev|engine|jam|lighting|music|narr?ative|writing)|indie\s?dev\s?hour|screenshot\s?saturday|trailer\s?tuesday|unity\s?1\s?week|wishlist\s?wednesday/giu.test(parsedSkeet)) {
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
