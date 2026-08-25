const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "..", "data");
const seenPath = path.join(dataDir, "seen.json");
const keywordsPath = path.join(dataDir, "discovered_keywords.json");

function ensureDataDir() {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readJson(filePath, fallback) {
	ensureDataDir();
	if (!fs.existsSync(filePath)) return fallback;
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
	ensureDataDir();
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadSeen() {
	return readJson(seenPath, {});
}

function saveSeen(seen) {
	writeJson(seenPath, seen);
}

function isSeen(seen, url) {
	return Boolean(seen[url]);
}

function markSeen(seen, url) {
	seen[url] = new Date().toISOString();
}

function loadDiscoveredKeywords() {
	return readJson(keywordsPath, []);
}

function saveDiscoveredKeywords(keywords) {
	writeJson(keywordsPath, keywords);
}

function addDiscoveredKeywords(existing, newKeywords) {
	const set = new Set(existing);
	for (const k of newKeywords) {
		const trimmed = k.trim().toLowerCase();
		if (trimmed) set.add(trimmed);
	}
	return Array.from(set);
}

module.exports = {
	dataDir,
	loadSeen,
	saveSeen,
	isSeen,
	markSeen,
	loadDiscoveredKeywords,
	saveDiscoveredKeywords,
	addDiscoveredKeywords,
};
