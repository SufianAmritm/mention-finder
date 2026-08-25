const axios = require("axios");
const reddit = require("../trackA/reddit");

function extractRedditId(url) {
	const match = url.match(/comments\/([a-z0-9]+)/i);
	return match ? match[1] : null;
}

async function enrichReddit(candidate) {
	const id = extractRedditId(candidate.url);
	if (!id) return candidate;

	try {
		const post = await reddit.fetchPostById(id);
		if (!post) return candidate;

		return {
			...candidate,
			createdUtc: post.created_utc,
			numComments: post.num_comments,
			score: post.score,
			subreddit: post.subreddit,
		};
	} catch (err) {
		console.error(`[enrich:reddit] failed for ${candidate.url}: ${err.message}`);
		return candidate;
	}
}

function isDiscourseTopicUrl(url) {
	return /\/t\/[^/]+\/\d+/.test(url);
}

async function enrichDiscourse(candidate) {
	if (!isDiscourseTopicUrl(candidate.url)) return candidate;

	try {
		const response = await axios.get(`${candidate.url}.json`);
		const topic = response.data;
		return {
			...candidate,
			createdUtc: new Date(topic.created_at).getTime() / 1000,
			numComments: Math.max(0, (topic.posts_count || 1) - 1),
			score: topic.like_count || 0,
		};
	} catch (err) {
		console.error(`[enrich:discourse] failed for ${candidate.url}: ${err.message}`);
		return candidate;
	}
}

async function enrichOne(candidate) {
	if (candidate.createdUtc !== undefined && candidate.createdUtc !== null) return candidate;

	if (candidate.url.includes("reddit.com")) return enrichReddit(candidate);
	if (candidate.url.includes("community.shopify.com") || candidate.url.includes("webflow.com")) {
		return enrichDiscourse(candidate);
	}

	return { ...candidate, createdUtc: null, numComments: null, score: null };
}

async function enrichAll(candidates) {
	const enriched = [];
	for (const candidate of candidates) {
		enriched.push(await enrichOne(candidate));
	}
	return enriched;
}

module.exports = { enrichAll };
