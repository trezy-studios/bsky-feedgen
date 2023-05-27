export function parseSkeet(data) {
	const {
		cid,
		record,
		uri,
	} = data

	const replyParent = record?.reply?.parent.uri ?? null
	const replyRoot = record?.reply?.root.uri ?? null

	return {
		cid,
		replyParent,
		replyRoot,
		uri,
	}
}
