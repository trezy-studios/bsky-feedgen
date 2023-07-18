// Module imports
import { Feed } from '@trezystudios/bsky-common'





/**
 * Handler for the game dev feed.
 */
class ScreenshotSaturdayFeedClass extends Feed {
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
		if (/#nofeed/giu.test(skeet.text)) {
			return false
		}

		return /screenshot\s?saturday/giu.test(skeet.text)
	}
}

export const ScreenshotSaturdayFeed = new ScreenshotSaturdayFeedClass({
	description: 'Every Saturday, game devs the world over post screenshots of their games! Give feedback and let them know how excited you are about them!',
	image: 'ScreenshotSaturdayFeed.png',
	name: 'Screenshot Saturday',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'screenshot-sat',
})
