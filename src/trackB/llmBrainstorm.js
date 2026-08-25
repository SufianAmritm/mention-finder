const axios = require("axios");
const config = require("../config");

async function brainstorm(topics, verticals) {
	if (!config.enableLlmBrainstorm || !config.anthropicApiKey) return [];

	const prompt = `Given these topics: ${topics.join(", ")}\nand these verticals/industries: ${verticals.join(", ")}\nGenerate 30 realistic long-tail search questions a real person in one of these verticals might type into Google or ask on Reddit/Quora, combining a topic with a vertical. One per line, no numbering, no extra text.`;

	const response = await axios.post(
		"https://api.anthropic.com/v1/messages",
		{
			model: "claude-sonnet-5",
			max_tokens: 1024,
			messages: [{ role: "user", content: prompt }],
		},
		{
			headers: {
				"x-api-key": config.anthropicApiKey,
				"anthropic-version": "2023-06-01",
				"content-type": "application/json",
			},
		},
	);

	const text = response.data.content?.[0]?.text || "";
	return text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

module.exports = { brainstorm };
