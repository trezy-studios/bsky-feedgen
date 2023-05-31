/**
 * Determines whether a skeet should be stored in the database or not.
 *
 * @param {object} skeet
 * @returns {boolean} Whether to store the skeet.
 */
export function filterSkeet(skeet) {
	const { text } = skeet

	if (!/games?\s?(?:dev|design)/giu.test(text)) {
		return false
	}

	if (/#(?:nofeed|nogamedev|idontwanttogetfired)/giu.test(text)) {
		return false
	}

	return true
}
