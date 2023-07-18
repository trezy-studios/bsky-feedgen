// Module imports
import { collectDefaultMetrics } from 'prom-client'





// Local imports
import { api } from './api.js'
import { initialiseCIDParser } from '@trezystudios/bsky-lib'
import * as sieve from './sieve.js'





// Ensure bsky CIDs can be decoded.
initialiseCIDParser()

// Start the sieve
sieve.start()

// Start the sieve API
api.start()

collectDefaultMetrics({
	labels: { job: 'sieve' },
})
