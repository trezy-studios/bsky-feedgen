// Module imports
import { collectDefaultMetrics } from 'prom-client'





// Local imports
import { api } from './api.js'
import * as sieve from './sieve.js'





// Start the sieve
sieve.start()

// Start the sieve API
api.start()

collectDefaultMetrics({
	labels: { job: 'sieve' },
})
