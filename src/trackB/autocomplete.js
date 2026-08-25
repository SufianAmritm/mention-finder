const axios = require("axios");

async function fetchSuggestions(query) {
	try {
		const response = await axios.get("https://suggestqueries.google.com/complete/search", {
			params: { client: "firefox", q: query, gl: "us", hl: "en" },
		});
		return response.data[1] || [];
	} catch (err) {
		console.error(`[autocomplete] failed for "${query}": ${err.message}`);
		return [];
	}
}

module.exports = { fetchSuggestions };
