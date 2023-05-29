import {
	FirehoseSubscriptionBase,
	getOpsByType,
} from './SubscriptionBase.js'
import { database } from '@trezystudios/bsky-lib'





// Local imports
import { filterSkeets } from './filterSkeets.js'
import { isCommit } from './isCommit.js'





export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(event) {
    if (!isCommit(event)) {
      return
    }

    const ops = await getOpsByType(event)

    const skeetsToDelete = ops.posts.deletes.map(skeet => skeet.uri)
    const skeetsToCreate = filterSkeets(ops.posts.creates)

    if (skeetsToDelete.length > 0) {
      await database.deleteSkeets(skeetsToDelete)
    }

    if (skeetsToCreate.length > 0) {
      await database.createSkeets(skeetsToCreate)
    }
  }
}
