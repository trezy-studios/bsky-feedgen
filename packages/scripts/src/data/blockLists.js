/** @type {{ [key: string]: string[] }} */
export const blockListsMap = {
	'estrogenempress.gay': [
		// The Shadow Realm
		'at://did:plc:uraielgolztbeqrrv5c7qbce/app.bsky.graph.list/3jxrx4pgy6h2p',

		// Transphobes Who Should Leave Dr. Han's Office, NOW
		'at://did:plc:uraielgolztbeqrrv5c7qbce/app.bsky.graph.list/3jxlfb5rt3w2e',

		// Guys Who Will Not See Valhalla
		'at://did:plc:uraielgolztbeqrrv5c7qbce/app.bsky.graph.list/3jxkgdumfox23',
	],

	'trezy.studio': [
		// Game Feed Bans
		'at://did:plc:pwsrgzcv426k7viyjl3ljdvb/app.bsky.graph.list/3jzcrcrh5b52h',
	],

	'skywatch.bsky.social': [
		// Auto-Followers & Growth Hackers
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwchzmvjok25',

		// Bots
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwduuvw35s25',

		// Enlightened Centrists, Reply Trolls, Bigot Defenders
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwch3raivv2a',

		// Far-Right Actors
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwch7xsmsu22',

		// Hard Block
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwch67e2be22',

		// Transphobes & TERFs
		'at://did:plc:6gvzbq76altrlx2bvzgrh2l5/app.bsky.graph.list/3jwchbcv63v2j',
	],
}

export const allBlockLists = Object.values(blockListsMap).flat()
export const blockListOwners = Object.keys(blockListsMap)
