/** @typedef {import('multiformats').CID} CID */
/** @typedef {import('./RawFirehoseMessageOp.js').RawFirehoseMessageOp} RawFirehoseMessageOp */

/**
 * @typedef RawFirehoseMessage A firehose #commit message.
 * @property {Array} blobs Any blobs connected to the operation.
 * @property {Uint8Array} blocks A CAR file conatining the blocks that make up the operation.
 * @property {CID} commit The identifier for the commit.
 * @property {string} did The dID of the user which performed this operation.
 * @property {string} name The name of the info message.
 * @property {string} handle The handle of the user which performed this operation.
 * @property {string} migrateTo TODO: Figure out wtf this is.
 * @property {CID} prev A cursor that points to the preceding message.
 * @property {RawFirehoseMessageOp[]} ops All included operations.
 * @property {boolean} rebase Whether this operation requires rebasing.
 * @property {string} repo The dID of the user which performed this operation.
 * @property {number} seq The sequence number.
 * @property {string} time The time at which the operations occured.
 * @property {boolean} tooBig Whether this operation is too big.
 */
