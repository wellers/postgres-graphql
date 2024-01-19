export function mapKeyResolver(key: string) {
	return function (parent) {
		return parent[key];
	}
}