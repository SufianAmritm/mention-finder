const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "..", "data", "output");

function toCsvRow(fields) {
	return fields.map((f) => `"${String(f ?? "").replace(/"/g, '""')}"`).join(",");
}

function write(candidates) {
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

	const date = new Date().toISOString().slice(0, 10);
	const csvPath = path.join(outputDir, `${date}.csv`);
	const jsonPath = path.join(outputDir, `${date}.json`);

	const header = ["source", "keyword", "title", "url", "position", "ageDays", "numComments", "matchScore"];
	const rows = candidates.map((c) =>
		toCsvRow([
			c.source,
			c.keyword || "",
			c.title,
			c.url,
			c.position,
			c.ageDays !== null && c.ageDays !== undefined ? c.ageDays.toFixed(1) : "",
			c.numComments ?? "",
			c.matchScore.toFixed(2),
		]),
	);

	fs.writeFileSync(csvPath, [toCsvRow(header), ...rows].join("\n"));
	fs.writeFileSync(jsonPath, JSON.stringify(candidates, null, 2));

	return csvPath;
}

module.exports = { write, outputDir };
