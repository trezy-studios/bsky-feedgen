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
		if (/#(?:nofeed|nogamedev|idontwantto(?:be|get)fired)/giu.test(skeet.text)) {
			return false
		}

		// eslint-disable-next-line optimize-regex/optimize-regex, no-misleading-character-class
		return /🆕[🎮🕹️👾]/giu.test(skeet.text)
	}
}

export const NewGamePlusFeed = new NewGamePlusFeedClass({
	description: 'Video game release and pre-release announcements! Opt out with #NoFeed or #NoNewGamePlus. Discuss at https://trezy.studio/discord.',
	image: 'NewGamePlusFeed.png',
	name: 'New Game +',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'new-game-plus',
})
