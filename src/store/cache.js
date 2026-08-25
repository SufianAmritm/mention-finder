const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("../config");

const cacheDir = path.join(__dirname, "..", "..", "data", "cache");

function ensureCacheDir() {
	if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
}

function keyFor(query, tbs) {
	return crypto
		.createHash("sha1")
		.update(`${query.toLowerCase().trim()}|${tbs || ""}`)
		.digest("hex");
}

function get(query, tbs) {
	ensureCacheDir();
	const filePath = path.join(cacheDir, `${keyFor(query, tbs)}.json`);
	if (!fs.existsSync(filePath)) return null;

	const entry = JSON.parse(fs.readFileSync(filePath, "utf8"));
	const ageHours = (Date.now() - entry.cachedAt) / (1000 * 60 * 60);
	if (ageHours > config.cacheTtlHours) return null;

	return entry.data;
}

function set(query, tbs, data) {
	ensureCacheDir();
	const filePath = path.join(cacheDir, `${keyFor(query, tbs)}.json`);
	fs.writeFileSync(filePath, JSON.stringify({ query, tbs, cachedAt: Date.now(), data }, null, 2));
}

module.exports = { get, set };
