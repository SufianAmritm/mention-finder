const trackA = require("./trackA");
const trackB = require("./trackB");
const verifyPosition = require("./verifyPosition");
const enrich = require("./enrich");
const filter = require("./filter");
const score = require("./score");
const localStore = require("./store/localStore");
const report = require("./output/report");
const budget = require("./serp/budget");
const dedupeCandidates = require("./dedupeCandidates");

async function run() {
	const seen = localStore.loadSeen();
	const discoveredKeywords = localStore.loadDiscoveredKeywords();

	console.log(`[pipeline] serp budget remaining today: ${budget.remaining()}`);

	const trackACandidates = await trackA.collect();
	console.log(`[pipeline] track A raw candidates: ${trackACandidates.length}`);

	const { candidates: trackBCandidates, newDiscoveredKeywords } =
		await trackB.collect(discoveredKeywords);
	console.log(`[pipeline] track B raw candidates: ${trackBCandidates.length}`);

	const rawTotal = trackACandidates.length + trackBCandidates.length;
	const deduped = dedupeCandidates.dedupeByUrl([...trackACandidates, ...trackBCandidates]);
	const unseen = deduped.filter((c) => c.url && !localStore.isSeen(seen, c.url));
	console.log(
		`[pipeline] deduped ${rawTotal} raw candidates to ${deduped.length} unique URLs, ${unseen.length} not seen before`,
	);

	const needsVerify = unseen.filter((c) => !c.position);
	const alreadyRanked = unseen.filter((c) => c.position);
	const verified = await verifyPosition.verifyAll(needsVerify);

	const enriched = await enrich.enrichAll([...alreadyRanked, ...verified]);
	const filtered = filter.filterAll(enriched);
	const scored = score.sortByScore(filtered);

	for (const candidate of scored) localStore.markSeen(seen, candidate.url);
	localStore.saveSeen(seen);

	const updatedKeywords = localStore.addDiscoveredKeywords(discoveredKeywords, newDiscoveredKeywords);
	localStore.saveDiscoveredKeywords(updatedKeywords);

	const reportPath = report.write(scored);
	console.log(`[pipeline] ${scored.length} opportunities written to ${reportPath}`);

	return scored;
}

module.exports = { run };
