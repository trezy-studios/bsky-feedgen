/**
 * Parses an at:// URL and returns the important segments.
 *
 * @param {string} url The AT protocol URL to be parsed.
 * @returns {object} The segments that have been parsed from the URL.
 */
export function parseATURL(url) {
	const regex = /^at:\/\/(?<did>did:\w+:\w+)\/[\w.]+\/(?<rkey>\w+)$/giu
	const result = regex.exec(url)

	return result.groups
}
