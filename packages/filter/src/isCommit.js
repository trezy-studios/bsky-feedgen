export function isCommit(v) {
  return (
		(typeof v === 'object') &&
		(v !== null) &&
    ('$type' in v) &&
    (v.$type === 'com.atproto.sync.subscribeRepos#commit')
  )
}
