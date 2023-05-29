export function filterSkeet(skeet) {
	return /games?\s?(?:dev|design)/giu.test(skeet.record.text)
}

export function filterSkeets(skeets) {
	return skeets.filter(filterSkeet)
}
