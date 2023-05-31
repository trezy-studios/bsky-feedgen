/**
 * Determines whether a skeet is related to game dev.
 *
 * @param {object} skeet The skeet to be tested.
 * @returns {boolean} Whether to store the skeet.
 */
export function isGameDevSkeet(skeet) {
	return /games?\s?(?:dev|design)/giu.test(skeet.text)
}
