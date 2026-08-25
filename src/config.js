require("dotenv").config();

function int(name, fallback) {
	const v = process.env[name];
	return v ? parseInt(v, 10) : fallback;
}

function bool(name, fallback) {
	const v = process.env[name];
	return v === undefined ? fallback : v === "true";
}

module.exports = {
	serperApiKey: process.env.SERPER_API_KEY,

	redditScraperServiceUrl: process.env.REDDIT_SCRAPER_SERVICE_URL || "http://localhost:4100",
	redditScraperServiceApiKey: process.env.REDDIT_SCRAPER_SERVICE_API_KEY,

	serpDailyBudget: int("SERP_DAILY_BUDGET", 400),
	expansionDepth: int("EXPANSION_DEPTH", 2),
	maxKeywordsPerDay: int("MAX_KEYWORDS_PER_DAY", 500),
	cacheTtlHours: int("CACHE_TTL_HOURS", 24),

	minPosition: int("MIN_POSITION", 10),
	minAgeDays: int("MIN_AGE_DAYS", 3),
	maxAgeDays: int("MAX_AGE_DAYS", 45),
	maxComments: int("MAX_COMMENTS", 30),

	enableLlmBrainstorm: bool("ENABLE_LLM_BRAINSTORM", false),
	anthropicApiKey: process.env.ANTHROPIC_API_KEY,

	cronSchedule: process.env.CRON_SCHEDULE || "0 6 * * *",
};
