// Module imports
import { addExtension } from 'cbor-x'
import { CID } from 'multiformats'





/**
 * Adds CID encoder/decoders.
 */
export function initialiseCIDParser() {
	addExtension({
		Class: CID,
		tag: 42,
		// eslint-disable-next-line jsdoc/require-jsdoc
		encode: () => {
			throw new Error('cannot encode cids')
		},
		// eslint-disable-next-line jsdoc/require-jsdoc
		decode: bytes => {
			if (bytes[0] !== 0) {
				throw new Error('invalid cid for cbor tag 42')
			}
			return CID.decode(bytes.subarray(1)) // ignore leading 0x00
		},
	})
}
