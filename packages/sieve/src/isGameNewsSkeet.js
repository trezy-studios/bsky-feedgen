/**
 * Determines whether a skeet is related to game dev.
 *
 * @param {object} skeet The skeet to be tested.
 * @returns {boolean} Whether the skeet is related to game news.
 */
export function isGameNewsSkeet(skeet) {
	return /#gamenews/giu.test(skeet.text)
}
