import {
	FirehoseSubscriptionBase,
	getOpsByType,
} from './SubscriptionBase.js'
import { database } from '@trezystudios/bsky-lib'





// Local imports
import { isCommit } from './isCommit.js'





export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(event) {
    if (!isCommit(event)) {
      return
    }

    const ops = await getOpsByType(event)

    const skeetsToDelete = ops.posts.deletes.map(skeet => skeet.uri)
    const skeetsToCreate = ops.posts.creates//.filter(skeet => /games?\s?(?:dev|design)/giu.test(skeet.record.text))

    if (skeetsToDelete.length > 0) {
      await database.deleteSkeets(skeetsToDelete)
			console.log({skeetsToDelete})
    }

    if (skeetsToCreate.length > 0) {
      skeetsToCreate.forEach(skeet => {
        console.log(skeet.record.text)
      })
      // await database.createSkeets(skeetsToCreate)
    }
  }
}
