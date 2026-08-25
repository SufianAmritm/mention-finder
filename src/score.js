const config = require("./config");

function scoreOf(candidate) {
	const comments =
		candidate.numComments !== null && candidate.numComments !== undefined
			? candidate.numComments
			: config.maxComments / 2;

	return (6 - candidate.position) * 2 + (30 - comments) / 10;
}

function sortByScore(candidates) {
	return candidates
		.map((c) => ({ ...c, matchScore: scoreOf(c) }))
		.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { scoreOf, sortByScore };
