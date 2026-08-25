const axios = require("axios");

async function fetchCategoryTopics(baseUrl, categorySlug, categoryId) {
	const url = `${baseUrl}/c/${categorySlug}/${categoryId}.json`;
	const response = await axios.get(url);
	return response.data.topic_list.topics;
}

async function fetchLatestTopics(baseUrl) {
	const response = await axios.get(`${baseUrl}/latest.json`);
	return response.data.topic_list.topics;
}

function toCandidate(baseUrl, topic) {
	return {
		source: "discourse",
		title: topic.title,
		url: `${baseUrl}/t/${topic.slug}/${topic.id}`,
		createdUtc: new Date(topic.created_at).getTime() / 1000,
		numComments: Math.max(0, (topic.posts_count || 1) - 1),
		score: topic.like_count || 0,
	};
}

async function fetchSite(site) {
	const candidates = [];
	const categories = site.categories || [];

	try {
		if (categories.length === 0) {
			const topics = await fetchLatestTopics(site.baseUrl);
			candidates.push(...topics.map((t) => toCandidate(site.baseUrl, t)));
		} else {
			for (const category of categories) {
				const topics = await fetchCategoryTopics(site.baseUrl, category.slug, category.id);
				candidates.push(...topics.map((t) => toCandidate(site.baseUrl, t)));
			}
		}
	} catch (err) {
		console.error(`[discourse] failed to fetch ${site.name}: ${err.message}`);
	}

	return candidates;
}

async function fetchAll(sites) {
	const results = [];
	for (const site of sites) {
		results.push(...(await fetchSite(site)));
	}
	return results;
}

module.exports = { fetchAll };
