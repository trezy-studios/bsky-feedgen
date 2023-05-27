// Local imports
import { FirehoseSubscription } from './Subscription.js'





const subscription = new FirehoseSubscription(process.env.FEEDGEN_SUBSCRIPTION_ENDPOINT)
subscription.run()
