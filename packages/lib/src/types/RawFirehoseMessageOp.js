/**
 * @typedef RawFirehoseMessageOp A firehose #repoOp message.
 * @property {import('./OperationAction.js').OperationAction} action The type of repo action.
 * @property {string} path TODO: Figure out wtf this is.
 * @property {import('multiformats').CID | null} cid The cID of the operation.
 */
