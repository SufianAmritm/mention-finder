function pickBetter(a, b) {
	const aHasPos = Boolean(a.position);
	const bHasPos = Boolean(b.position);

	if (aHasPos && !bHasPos) return a;
	if (bHasPos && !aHasPos) return b;
	if (aHasPos && bHasPos) return a.position <= b.position ? a : b;

	return a;
}

function dedupeByUrl(candidates) {
	const byUrl = new Map();

	for (const candidate of candidates) {
		if (!candidate.url) continue;
		const existing = byUrl.get(candidate.url);
		byUrl.set(candidate.url, existing ? pickBetter(existing, candidate) : candidate);
	}

	return Array.from(byUrl.values());
}

module.exports = { dedupeByUrl };
