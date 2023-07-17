// Module imports
import { database } from '@trezystudios/bsky-common'





// Local imports
import { state } from '../data/state.js'





/**
 * Updates the cursor every so often.
 */
export async function cursorUpdateTimer() {
	if (state.sequentialID) {
		if (!state.cursorID) {
			const cursor = await database.createCursor(state.sequentialID)
			// eslint-disable-next-line require-atomic-updates
			state.cursorID = cursor.id
		} else {
			await database.updateCursor(state.cursorID, state.sequentialID)
		}
	}

	setTimeout(cursorUpdateTimer, 1000)
}
