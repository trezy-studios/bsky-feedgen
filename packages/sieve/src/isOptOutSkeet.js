/**
 * Determines whether a skeet should be stored in the database or not.
 *
 * @param {object} skeet The skeet to be tested.
 * @param {string[]} additionalOptOutTags Additional tags to be used for opting this skeet out of a feed.
 * @returns {boolean} Whether to store the skeet.
 */
export function isOptOutSkeet(skeet, additionalOptOutTags) {
	const regex = new RegExp(`#(?:nofeed|${additionalOptOutTags.join('|')})`, 'giu')
	return regex.test(skeet.text)
}
