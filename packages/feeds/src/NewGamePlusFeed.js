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
		if (/#(?:nofeed|nonewgameplus)/giu.test(skeet.text)) {
			return false
		}

		// eslint-disable-next-line optimize-regex/optimize-regex, no-misleading-character-class
		return /🆕[🎮🕹️👾]/giu.test(skeet.text)
	}
}

export const NewGamePlusFeed = new NewGamePlusFeedClass({
	description: 'Video game release and pre-release announcements!\n\nOpt in with 🆕🎮, 🆕🕹️, or 🆕👾.\nOpt out with #NoFeed or #NoNewGamePlus.\n\nDiscuss at https://trezy.studio/discord.\nSupport the feed at https://ko-fi.com/trezycodes.',
	image: 'NewGamePlusFeed.png',
	name: 'New Game +',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'new-game-plus',
})
