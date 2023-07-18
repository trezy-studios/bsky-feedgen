// Module imports
import { Feed } from '@trezystudios/bsky-common'





/**
 * Handler for the Game Jobs feed.
 */
class GameJobsFeedClass extends Feed {
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
		if (/#(?:nofeed|private)/giu.test(skeet.text)) {
			return false
		}

		return /#games?(?:jobs?|careers?)/giu.test(skeet.text)
			|| (/games?dev/giu.test(skeet.text) && /#(?:(?:now)?hiring|lookingforwork|lfw)/giu.test(skeet.text))
	}
}

export const GameJobsFeed = new GameJobsFeedClass({
	description: 'Hiring and Looking For Work posts from the games industry! Opt in with...\n- #GameJobs\n- #GameCareers\n- #GameDev + #Hiring\n- #GameDev + #NowHiring\n- #GameDev + #LookingForWork\n- #GameDev + #LFW\n\nOpt out with #NoFeed or #Private.\nDiscuss at https://trezy.studio/discord.\nSupport the feed at https://ko-fi.com/trezycodes.',
	image: 'GameJobsFeed.png',
	name: 'Game Jobs & Careers',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'game-jobs',
})
