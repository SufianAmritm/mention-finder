const autocomplete = require("./autocomplete");
const config = require("../config");

async function expand(seeds) {
	let frontier = Array.from(new Set(seeds.map((s) => s.toLowerCase().trim())));
	const expanded = new Set(frontier);

	for (let depth = 0; depth < config.expansionDepth; depth++) {
		const nextFrontier = new Set();

		for (const seed of frontier) {
			const suggestions = await autocomplete.fetchSuggestions(seed);
			for (const suggestion of suggestions) {
				const clean = suggestion.toLowerCase().trim();
				if (!expanded.has(clean)) {
					expanded.add(clean);
					nextFrontier.add(clean);
				}
			}
		}

		frontier = Array.from(nextFrontier);
	}

	return Array.from(expanded).slice(0, config.maxKeywordsPerDay);
}

module.exports = { expand };
