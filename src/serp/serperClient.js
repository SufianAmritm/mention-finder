const axios = require("axios");
const config = require("../config");
const cache = require("../store/cache");
const budget = require("./budget");

let budgetWarningLogged = false;

async function search(query, { tbs = "qdr:m", num = 10, gl = "us", hl = "en" } = {}) {
	const cached = cache.get(query, tbs);
	if (cached) return { ...cached, fromCache: true };

	if (!budget.hasBudget()) {
		if (!budgetWarningLogged) {
			console.warn(
				`[serper] daily budget of ${config.serpDailyBudget} searches exhausted — remaining queries this run will be skipped`,
			);
			budgetWarningLogged = true;
		}
		return { organic: [], peopleAlsoAsk: [], relatedSearches: [], budgetExhausted: true };
	}

	// Explicit US/English targeting - without this Serper falls back to undocumented
	// defaults, which is why reported positions drifted from US-geotargeted tools like KWFinder.
	const body = { q: query, num, gl, hl };
	if (tbs) body.tbs = tbs;

	const response = await axios.post("https://google.serper.dev/search", body, {
		headers: { "X-API-KEY": config.serperApiKey, "Content-Type": "application/json" },
	});

	budget.consume();

	const data = {
		organic: response.data.organic || [],
		peopleAlsoAsk: response.data.peopleAlsoAsk || [],
		relatedSearches: response.data.relatedSearches || [],
	};

	cache.set(query, tbs, data);
	return data;
}

module.exports = { search };
