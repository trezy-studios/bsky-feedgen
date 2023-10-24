// Module imports
import { Feed } from '@trezystudios/bsky-common'





/**
 * Handler for the game dev feed.
 */
class NewGamePlusFeedClass extends Feed {
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
		if (/#(?:nofeed|nonewgameplus|private)/giu.test(skeet.text)) {
			return false
		}

		// eslint-disable-next-line optimize-regex/optimize-regex, no-misleading-character-class
		return /🆕(?:🎮|🕹️|👾)/giu.test(skeet.text)
	}
}

export const NewGamePlusFeed = new NewGamePlusFeedClass({
	description: `
		Video game release and pre-release announcements!

		Opt in with 🆕🎮, 🆕🕹️, or 🆕👾.
		Opt out with #Private, #NoFeed or #NoNewGamePlus.

		Discuss at https://trezy.studio/discord.
		Support the feed at https://ko-fi.com/trezycodes.
	`
		.split('\n')
		.map(string => string.trim())
		.join('\n'),
	image: 'NewGamePlusFeed.png',
	name: 'New Game +',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'new-game-plus',
})
