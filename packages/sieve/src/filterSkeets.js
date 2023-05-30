export function filterSkeet(skeet) {
	return /games?\s?(?:dev|design)/giu.test(skeet.text)
}
