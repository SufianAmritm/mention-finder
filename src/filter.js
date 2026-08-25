const config = require("./config");
const domains = require("../config/domains.json");
const subreddits = require("../config/subreddits.json");

const allowedSubreddits = new Set(subreddits.map((s) => s.toLowerCase()));

function ageDays(createdUtc) {
	if (!createdUtc) return null;
	return (Date.now() / 1000 - createdUtc) / (60 * 60 * 24);
}

function isAllowedDomain(url) {
	return domains.some((domain) => url.includes(domain));
}

// Track B (Google keyword search) only checks domain, not subreddit - unlike Track A,
// which is already scoped to config/subreddits.json. Without this, any reddit.com thread
// that happens to rank well for an expanded keyword gets in, however off-topic
// (e.g. r/PokemonPocket posts ranking for a generic phrase).
function isAllowedRedditPost(url) {
	if (!url.includes("reddit.com")) return true;
	const match = url.match(/reddit\.com\/r\/([^/]+)/i);
	return !!match && allowedSubreddits.has(match[1].toLowerCase());
}

function passesFilter(candidate) {
	if (!candidate.url || !isAllowedDomain(candidate.url)) return false;
	if (!isAllowedRedditPost(candidate.url)) return false;
	if (!candidate.position || candidate.position > config.minPosition) return false;

	const age = ageDays(candidate.createdUtc);
	if (age !== null && (age < config.minAgeDays || age > config.maxAgeDays)) return false;

	if (candidate.numComments !== null && candidate.numComments !== undefined) {
		if (candidate.numComments >= config.maxComments) return false;
	}

	return true;
}

function filterAll(candidates) {
	return candidates.filter(passesFilter).map((c) => ({ ...c, ageDays: ageDays(c.createdUtc) }));
}

module.exports = { filterAll, ageDays, isAllowedDomain };
