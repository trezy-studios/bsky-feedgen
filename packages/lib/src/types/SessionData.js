/** @typedef {import('@atproto/api').AtpSessionData} AtpSessionData */

/**
 * Data for an authenticated session.
 *
 * @implements {AtpSessionData}
 */
export class SessionData {
	/** @type {string} The access JWT. */
	accessJwt

	/** @type {string} The user's dID. */
	did

	/** @type {string} The user's handle. */
	handle

	/** @type {string} The refresh JWT. */
	refreshJwt
}
