const serperClient = require("./serp/serperClient");

function hostnameOf(url) {
	try {
		return new URL(url).hostname;
	} catch (_) {
		return null;
	}
}

function subredditOf(url) {
	const match = url.match(/reddit\.com\/r\/([^/]+)/i);
	return match ? match[1].toLowerCase() : null;
}

async function verify(candidate) {
	if (candidate.position) return candidate;

	const result = await serperClient.search(candidate.title);
	if (result.budgetExhausted) return { ...candidate, position: null };

	const exact = result.organic.find((o) => o.link === candidate.url);
	if (exact) return { ...candidate, position: exact.position };

	const host = hostnameOf(candidate.url);
	const candidateSubreddit = subredditOf(candidate.url);
	// Same-domain fallback: for reddit.com this must also be the same subreddit, otherwise
	// it can attribute an unrelated thread's position to this candidate (reddit.com alone
	// matches every subreddit).
	const sameDomain = result.organic.find((o) => {
		if (hostnameOf(o.link) !== host) return false;
		if (candidateSubreddit) return subredditOf(o.link) === candidateSubreddit;
		return true;
	});
	if (sameDomain) return { ...candidate, position: sameDomain.position };

	return { ...candidate, position: null };
}

async function verifyAll(candidates) {
	const verified = [];
	for (const candidate of candidates) {
		verified.push(await verify(candidate));
	}
	return verified;
}

module.exports = { verifyAll };
