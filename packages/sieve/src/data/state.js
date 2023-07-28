// Module imports
import bsky from '@atproto/api'





export const state = {
	bskyAgent: new bsky.BskyAgent({ service: `https://${process.env.BSKY_SERVICE_URL}` }),
	cursorID: null,
	sequentialID: null,
}
