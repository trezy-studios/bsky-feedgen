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
		if (/#(?:nofeed|nogamejobsfeed|private)/giu.test(skeet.text)) {
			return false
		}

		// eslint-disable-next-line security/detect-unsafe-regex
		return /#games?(?:animation|art|audio|design|dev(?:elopment)?|engine|jam|lighting|music|narr?ative|writing)?(?:jobs?|careers?)/giu.test(skeet.text)
			|| (/games?dev/giu.test(skeet.text) && /#(?:(?:now)?hiring|lookingforwork|lfw)/giu.test(skeet.text))
	}
}

export const GameJobsFeed = new GameJobsFeedClass({
	description: `
		Hiring and looking for work posts from the games industry!

		Opt in with...
		- #GameJobs
		- #GameCareers
		- #GameDev + #Hiring, #LookingForWork, or #LFW

		Opt out with #Private, #NoFeed, or #NoGameJobsFeed.

		Discuss at https://trezy.studio/discord.
		Support the feed at https://ko-fi.com/trezycodes.
	`
		.split('\n')
		.map(string => string.trim())
		.join('\n'),
	image: 'GameJobsFeed.png',
	name: 'Game Jobs & Careers',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'game-jobs',
})
