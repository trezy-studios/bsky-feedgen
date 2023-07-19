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
		if (/#(?:nofeed|noscreenshotsaturday|private)/giu.test(skeet.text)) {
			return false
		}

		return /screenshot\s?saturday/giu.test(skeet.text)
	}
}

export const ScreenshotSaturdayFeed = new ScreenshotSaturdayFeedClass({
	description: `
		Every Saturday, game devs post screenshots of their games. Check 'em out and let the devs know how excited you are!

		Opt in with #ScreenshotSaturday
		Opt out with #Private, #NoFeed, or #NoScreenshotSaturday.

		Discuss at https://trezy.studio/discord.
		Support the feed at https://ko-fi.com/trezycodes.
	`
		.split('\n')
		.map(string => string.trim())
		.join('\n'),
	image: 'ScreenshotSaturdayFeed.png',
	name: 'Screenshot Saturday',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'screenshot-sat',
})
