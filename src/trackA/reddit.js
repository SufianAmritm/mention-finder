const axios = require("axios");
const config = require("../config");

const client = axios.create({
	baseURL: config.redditScraperServiceUrl,
	headers: { Authorization: `Bearer ${config.redditScraperServiceApiKey}` },
	timeout: 20000,
});

async function fetchNewPosts(subreddit, limit = 25) {
	const response = await client.get(`/subreddit/${subreddit}/new`, { params: { limit } });
	return response.data.posts;
}

async function fetchAllowlistedSubreddits(subreddits) {
	const results = [];
	for (const subreddit of subreddits) {
		try {
			results.push(...(await fetchNewPosts(subreddit)));
		} catch (err) {
			console.error(`[reddit] failed to fetch r/${subreddit}: ${err.message}`);
		}
	}
	return results;
}

async function fetchPostById(id) {
	try {
		const response = await client.get(`/post/${id}`);
		return response.data.post;
	} catch (err) {
		if (err.response && err.response.status === 404) return null;
		throw err;
	}
}

module.exports = { fetchNewPosts, fetchAllowlistedSubreddits, fetchPostById };
