/**
 * @typedef {object} ParsedATURL
 * @property {string} did The decentralised ID.
 * @property {string} nsid The namespace ID.
 * @property {string} rkey The record key.
 */

/**
 * Parses an at:// URL and returns the important segments.
 *
 * @param {string} url The AT protocol URL to be parsed.
 * @returns {ParsedATURL | null} The segments that have been parsed from the URL.
 */
export function parseATURL(url) {
	const regex = /^at:\/\/(?<did>did:\w+:\w+)\/(?<nsid>[\w.]+)\/(?<rkey>.+)$/giu

	const {
		did,
		nsid,
		rkey,
	} = (regex.exec(url)?.groups ?? {})

	if (!did || !nsid || !rkey) {
		return null
	}

	return {
		did,
		nsid,
		rkey,
	}
}
