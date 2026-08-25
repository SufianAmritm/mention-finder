const axios = require("axios");
const xml2js = require("xml2js");

async function fetchFeed(feedUrl) {
	const response = await axios.get(feedUrl);
	const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });
	const items = parsed.rss?.channel?.item || [];
	const list = Array.isArray(items) ? items : [items];

	return list.map((item) => ({
		source: "wordpress-forum",
		title: item.title,
		url: item.link,
		createdUtc: new Date(item.pubDate).getTime() / 1000,
		numComments: null,
		score: null,
	}));
}

async function fetchAll(feedUrls) {
	const results = [];
	for (const feedUrl of feedUrls) {
		try {
			results.push(...(await fetchFeed(feedUrl)));
		} catch (err) {
			console.error(`[bbpress] failed to fetch ${feedUrl}: ${err.message}`);
		}
	}
	return results;
}

module.exports = { fetchAll };
