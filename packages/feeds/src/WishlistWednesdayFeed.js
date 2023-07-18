// Module imports
import { Feed } from '@trezystudios/bsky-common'





/**
 * Handler for the game dev feed.
 */
class WishlistWednesdayFeedClass extends Feed {
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

		return /wishlist\s?wednesday/giu.test(skeet.text)
	}
}

export const WishlistWednesdayFeed = new WishlistWednesdayFeedClass({
	description: 'Every Wednesday, game devs the world over post links to their games\' store pages! Wishlisting is a great way to support the games you\'re excited about, so hit that wishlist button liberally!',
	image: 'WishlistWednesdayFeed.png',
	name: 'Wishlist Wednesday',
	ownerDID: 'did:web:bsky-feeds.trezy.studio',
	rkey: 'wishlist-wed',
})
