const expandKeywords = require("./expandKeywords");
const llmBrainstorm = require("./llmBrainstorm");
const serperClient = require("../serp/serperClient");
const topics = require("../../config/topics.json");
const verticals = require("../../config/verticals.json");

async function harvestKeywordIdeas() {
	const newDiscoveredKeywords = [];

	for (const topic of topics) {
		const result = await serperClient.search(topic, { tbs: null });
		if (result.budgetExhausted) break;

		for (const paa of result.peopleAlsoAsk) newDiscoveredKeywords.push(paa.question);
		for (const related of result.relatedSearches) newDiscoveredKeywords.push(related.query);
	}

	return newDiscoveredKeywords;
}

async function collect(discoveredKeywords) {
	const seeds = [...topics, ...discoveredKeywords];
	const llmKeywords = await llmBrainstorm.brainstorm(topics, verticals);
	const expanded = await expandKeywords.expand([...seeds, ...llmKeywords]);

	const candidates = [];

	for (const keyword of expanded) {
		const result = await serperClient.search(keyword);
		if (result.budgetExhausted) break;

		for (const organic of result.organic) {
			candidates.push({
				source: "serp",
				keyword,
				title: organic.title,
				url: organic.link,
				position: organic.position,
			});
		}
	}

	const newDiscoveredKeywords = await harvestKeywordIdeas();

	return { candidates, newDiscoveredKeywords };
}

module.exports = { collect };
